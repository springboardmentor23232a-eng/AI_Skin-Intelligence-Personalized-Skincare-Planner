import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: req.headers.get("Authorization")! } },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { ingredientName, userProfile, assessment, concerns, feedback, routineIngredients, mode } = body;

    // Interaction analysis mode
    if (mode === "interaction") {
      const { ingredients } = body;
      const result = await analyzeInteractions(supabase, ingredients, userProfile, feedback);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Single ingredient analysis mode
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiApiKey) {
      const result = await generateRuleBasedAnalysis(supabase, ingredientName, userProfile, assessment, concerns, feedback);
      return new Response(JSON.stringify({ ...result, source: "rule_based" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch ingredient from database
    const { data: ingredientData } = await supabase
      .from("ingredients")
      .select("*")
      .eq("name", ingredientName)
      .maybeSingle();

    const prompt = buildIngredientPrompt(ingredientName, ingredientData, userProfile, assessment, concerns, feedback, routineIngredients);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, responseMimeType: "application/json" },
        }),
      }
    );

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

    const geminiData = await response.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty Gemini response");

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON from Gemini");
    }

    const validated = validateIngredientAnalysis(parsed);
    if (!validated) throw new Error("Invalid analysis structure");

    // Always run deterministic allergy check — this overrides Gemini
    const allergyCheck = checkAllergies(ingredientName, userProfile);
    if (allergyCheck.conflict) {
      validated.allergy_conflict = true;
      validated.allergy_conflict_details = allergyCheck.details;
      validated.suitability = "not_recommended";
      validated.score = Math.min(validated.score || 50, 20);
    }

    return new Response(JSON.stringify({ ...validated, source: "gemini" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const body = await req.json().catch(() => ({}));
    if (body.mode === "interaction") {
      const result = await analyzeInteractions(null, body.ingredients, body.userProfile, body.feedback).catch(() => ({
        overall_risk: "low",
        ingredients: body.ingredients || [],
        interactions: [],
        recommended_schedule: "No known interactions. Use as directed.",
        user_specific_warning: "",
        source: "rule_based",
      }));
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const result = await generateRuleBasedAnalysis(null, body.ingredientName, body.userProfile, body.assessment, body.concerns, body.feedback).catch(() => ({
      ingredient: body.ingredientName,
      suitability: "good_match",
      score: 70,
      reason: "Unable to complete full analysis. General suitability assessment applied.",
      benefits_for_user: [],
      cautions_for_user: [],
      recommended_usage: "Use as directed on product packaging.",
      alternative_ingredients: [],
      allergy_conflict: false,
      source: "rule_based",
    }));
    return new Response(JSON.stringify({ ...result, source: "rule_based", error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildIngredientPrompt(name: string, ingredientData: any, profile: any, assessment: any, concerns: any[], feedback: any[], routineIngredients: string[]): string {
  const skinType = assessment?.skin_type || profile?.skin_type || "Combination";
  const sensitivity = profile?.skin_sensitivity || "Normal";
  const allergies = profile?.allergies || "None reported";
  const goals = profile?.skincare_goals || "General skin health";
  const currentProducts = profile?.current_products || "None reported";
  const previousIssues = profile?.previous_ingredient_issues || "None reported";

  const concernList = concerns?.map(c => `${c.concern_name} (${c.severity})`).join(", ") || "None detected";
  const feedbackList = feedback?.map(f => {
    const effects = [];
    if (f.experienced_irritation) effects.push("irritation");
    if (f.experienced_burning) effects.push("burning");
    if (f.experienced_dryness) effects.push("dryness");
    if (f.experienced_redness) effects.push("redness");
    if (f.experienced_breakouts) effects.push("breakouts");
    return `Status: ${f.improvement_status}, Effects: ${effects.join(", ") || "none"}, Notes: ${f.notes || f.ingredient_feedback || "N/A"}`;
  }).join("; ") || "No feedback";

  const routineList = routineIngredients?.join(", ") || "None";

  const ingredientInfo = ingredientData ? `
INGREDIENT DATABASE INFO:
- Category: ${ingredientData.category}
- Description: ${ingredientData.description}
- Benefits: ${(ingredientData.benefits || []).join(", ")}
- Suitable skin types: ${(ingredientData.suitable_skin_types || []).join(", ")}
- Common concerns: ${(ingredientData.common_concerns || []).join(", ")}
- Cautions: ${(ingredientData.cautions || []).join(", ")}
- Known interactions: ${(ingredientData.common_interactions || []).join(", ")}
` : "";

  return `You are a skincare ingredient AI assistant. Analyze the suitability of an ingredient for a specific user and return structured JSON.

INGREDIENT: ${name}
${ingredientInfo}

USER PROFILE:
- Skin type: ${skinType}
- Sensitivity: ${sensitivity}
- Allergies: ${allergies}
- Skincare goals: ${goals}
- Current products: ${currentProducts}
- Previous ingredient issues: ${previousIssues}
- Current concerns: ${concernList}
- Current routine ingredients: ${routineList}
- Previous feedback: ${feedbackList}

Generate JSON with this exact structure:
{
  "ingredient": "${name}",
  "suitability": "excellent_match" | "good_match" | "use_with_caution" | "not_recommended",
  "score": <0-100 integer>,
  "reason": "Brief explanation of why this ingredient is or isn't suitable",
  "benefits_for_user": ["specific benefits for this user's concerns"],
  "cautions_for_user": ["specific cautions based on user's profile"],
  "recommended_usage": "How and when to use this ingredient",
  "alternative_ingredients": ["alternative ingredients if this one isn't ideal"]
}

Rules:
- Consider the user's skin type, sensitivity, allergies, concerns, and goals
- If the user has had previous issues with this ingredient, lower the score
- If the user has high sensitivity, be more cautious
- Do not make medical claims
- Score 80+ = excellent, 60-79 = good, 40-59 = caution, below 40 = not recommended
- Allergy conflicts always override any positive recommendation`;
}

function validateIngredientAnalysis(r: any): any | null {
  if (!r) return null;
  if (!["excellent_match", "good_match", "use_with_caution", "not_recommended"].includes(r.suitability)) return null;
  if (typeof r.score !== "number") r.score = 50;
  return {
    ingredient: r.ingredient,
    suitability: r.suitability,
    score: Math.max(0, Math.min(100, r.score)),
    reason: r.reason || "Analysis complete.",
    benefits_for_user: Array.isArray(r.benefits_for_user) ? r.benefits_for_user : [],
    cautions_for_user: Array.isArray(r.cautions_for_user) ? r.cautions_for_user : [],
    recommended_usage: r.recommended_usage || "Use as directed.",
    alternative_ingredients: Array.isArray(r.alternative_ingredients) ? r.alternative_ingredients : [],
    allergy_conflict: false,
    allergy_conflict_details: "",
  };
}

function checkAllergies(ingredientName: string, profile: any): { conflict: boolean; details: string } {
  const allergies = (profile?.allergies || "").toLowerCase();
  if (!allergies || allergies === "none" || allergies === "none reported") return { conflict: false, details: "" };

  const allergyList = allergies.split(/[,;]/).map(a => a.trim()).filter(Boolean);
  const ingredientLower = ingredientName.toLowerCase();

  for (const allergy of allergyList) {
    if (allergy && ingredientLower.includes(allergy)) {
      return { conflict: true, details: `This ingredient (${ingredientName}) matches your recorded allergy: ${allergy}.` };
    }
  }
  return { conflict: false, details: "" };
}

async function generateRuleBasedAnalysis(supabase: any, ingredientName: string, profile: any, assessment: any, concerns: any[], feedback: any[]): Promise<any> {
  let ingredientData = null;
  if (supabase) {
    const { data } = await supabase.from("ingredients").select("*").eq("name", ingredientName).maybeSingle();
    ingredientData = data;
  }

  const skinType = assessment?.skin_type || profile?.skin_type || "Combination";
  const sensitivity = profile?.skin_sensitivity || "Normal";
  const allergies = (profile?.allergies || "").toLowerCase();
  const previousIssues = (profile?.previous_ingredient_issues || "").toLowerCase();
  const goals = (profile?.skincare_goals || "").toLowerCase();

  // Allergy check — always takes priority
  const allergyCheck = checkAllergies(ingredientName, profile);
  if (allergyCheck.conflict) {
    return {
      ingredient: ingredientName,
      suitability: "not_recommended",
      score: 10,
      reason: allergyCheck.details,
      benefits_for_user: [],
      cautions_for_user: [allergyCheck.details],
      recommended_usage: "Do not use — this ingredient conflicts with your recorded allergies.",
      alternative_ingredients: getAlternatives(ingredientName),
      allergy_conflict: true,
      allergy_conflict_details: allergyCheck.details,
    };
  }

  // Previous issue check
  if (previousIssues.includes(ingredientName.toLowerCase())) {
    return {
      ingredient: ingredientName,
      suitability: "use_with_caution",
      score: 35,
      reason: `You have previously reported issues with ${ingredientName}. Consider alternatives or use with extreme caution.`,
      benefits_for_user: [],
      cautions_for_user: ["Previous irritation reported with this ingredient.", "Consider patch testing or consulting a dermatologist before use."],
      recommended_usage: "If using, start with very low concentration and infrequent application. Discontinue if irritation occurs.",
      alternative_ingredients: getAlternatives(ingredientName),
      allergy_conflict: false,
      allergy_conflict_details: "",
    };
  }

  // Feedback-based check
  const hasIrritationFeedback = feedback?.some(f => {
    const notes = ((f.notes || "") + " " + (f.ingredient_feedback || "")).toLowerCase();
    return notes.includes(ingredientName.toLowerCase()) && (f.experienced_irritation || f.experienced_burning);
  });

  if (hasIrritationFeedback) {
    return {
      ingredient: ingredientName,
      suitability: "use_with_caution",
      score: 40,
      reason: `Previous feedback indicates irritation associated with ${ingredientName}. Consider reducing frequency or seeking gentler alternatives.`,
      benefits_for_user: getBenefits(ingredientName, concerns),
      cautions_for_user: ["Irritation reported in feedback.", "Reduce frequency or discontinue if irritation persists."],
      recommended_usage: "Reduce to once or twice a week. Apply to damp skin and follow with moisturizer.",
      alternative_ingredients: getAlternatives(ingredientName),
      allergy_conflict: false,
      allergy_conflict_details: "",
    };
  }

  let score = 70;
  const benefits: string[] = [];
  const cautions: string[] = [];

  // Skin type matching
  if (ingredientData?.suitable_skin_types) {
    if (ingredientData.suitable_skin_types.includes(skinType)) {
      score += 15;
      benefits.push(`Well-suited for ${skinType} skin`);
    } else {
      score -= 10;
      cautions.push(`May not be ideal for ${skinType} skin`);
    }
  }

  // Sensitivity adjustment
  if (sensitivity === "High" || sensitivity === "Very High") {
    const sensitiveIngredients = ["retinoids", "salicylic acid", "ahas/bhas", "vitamin c"];
    if (sensitiveIngredients.includes(ingredientName.toLowerCase())) {
      score -= 20;
      cautions.push("May cause irritation for sensitive skin. Start with low concentration.");
    } else if (["niacinamide", "hyaluronic acid", "ceramides"].includes(ingredientName.toLowerCase())) {
      score += 5;
      benefits.push("Gentle and well-tolerated by sensitive skin");
    }
  }

  // Concern matching
  const concernNames = (concerns || []).map(c => c.concern_name);
  if (ingredientData?.common_concerns) {
    const matchingConcerns = ingredientData.common_concerns.filter(c => concernNames.some(cn => cn.toLowerCase().includes(c.toLowerCase())));
    if (matchingConcerns.length > 0) {
      score += 10;
      benefits.push(`Targets your concerns: ${matchingConcerns.join(", ")}`);
    }
  }

  // Goal matching
  if (goals.includes("anti-aging") || goals.includes("anti aging")) {
    if (["retinoids", "peptides", "vitamin c"].includes(ingredientName.toLowerCase())) {
      score += 10;
      benefits.push("Supports anti-aging goals");
    }
  }
  if (goals.includes("acne") || goals.includes("clear skin")) {
    if (["salicylic acid", "niacinamide"].includes(ingredientName.toLowerCase())) {
      score += 10;
      benefits.push("Helps with acne management");
    }
  }

  score = Math.max(10, Math.min(100, score));

  let suitability = "good_match";
  if (score >= 80) suitability = "excellent_match";
  else if (score >= 60) suitability = "good_match";
  else if (score >= 40) suitability = "use_with_caution";
  else suitability = "not_recommended";

  // Add ingredient-specific cautions from database
  if (ingredientData?.cautions) {
    cautions.push(...ingredientData.cautions.slice(0, 3));
  }

  return {
    ingredient: ingredientName,
    suitability,
    score,
    reason: `${ingredientName} ${suitability === "excellent_match" ? "is an excellent match" : suitability === "good_match" ? "is a good match" : suitability === "use_with_caution" ? "should be used with caution" : "is not recommended"} for your skin profile.`,
    benefits_for_user: benefits.length > 0 ? benefits : getBenefits(ingredientName, concerns),
    cautions_for_user: cautions,
    recommended_usage: getUsageInstructions(ingredientName),
    alternative_ingredients: getAlternatives(ingredientName),
    allergy_conflict: false,
    allergy_conflict_details: "",
  };
}

function getBenefits(name: string, concerns: any[]): string[] {
  const benefitsMap: Record<string, string[]> = {
    "Retinoids": ["Reduces fine lines", "Improves skin texture", "Helps with acne"],
    "Niacinamide": ["Strengthens skin barrier", "Regulates oil", "Reduces redness"],
    "Vitamin C": ["Brightens skin", "Antioxidant protection", "Fades dark spots"],
    "Hyaluronic Acid": ["Intense hydration", "Plumps fine lines", "Suitable for all skin types"],
    "Salicylic Acid": ["Clears pores", "Reduces acne", "Controls oil"],
    "Ceramides": ["Repairs skin barrier", "Locks in moisture", "Soothes irritation"],
    "Peptides": ["Boosts collagen", "Improves firmness", "Reduces wrinkles"],
    "AHAs/BHAs": ["Exfoliates dead skin", "Improves radiance", "Reduces hyperpigmentation"],
  };
  return benefitsMap[name] || ["Supports general skin health"];
}

function getAlternatives(name: string): string[] {
  const altMap: Record<string, string[]> = {
    "Retinoids": ["Peptides", "Niacinamide"],
    "Salicylic Acid": ["Niacinamide", "AHAs/BHAs"],
    "Vitamin C": ["Niacinamide"],
    "AHAs/BHAs": ["Niacinamide", "Salicylic Acid"],
  };
  return altMap[name] || [];
}

function getUsageInstructions(name: string): string {
  const usageMap: Record<string, string> = {
    "Retinoids": "Apply a pea-sized amount in the evening, 2-3 times per week. Always follow with moisturizer and use SPF during the day.",
    "Niacinamide": "Apply morning and evening after cleansing. Can be used alongside most other ingredients.",
    "Vitamin C": "Apply in the morning before sunscreen. Start with every other day if new to vitamin C.",
    "Hyaluronic Acid": "Apply to damp skin morning and evening. Follow with moisturizer to lock in hydration.",
    "Salicylic Acid": "Start 2-3 times per week in the evening. Apply to clean, dry skin and follow with moisturizer.",
    "Ceramides": "Apply morning and evening as part of your moisturizer step. Safe for all skin types.",
    "Peptides": "Apply morning and evening. Use consistently for best results over several months.",
    "AHAs/BHAs": "Use 1-2 times per week in the evening. Start slowly and never combine with retinoids in the same session.",
  };
  return usageMap[name] || "Use as directed on product packaging.";
}

async function analyzeInteractions(supabase: any, ingredients: string[], profile: any, feedback: any[]): Promise<any> {
  let interactions: any[] = [];

  // Fetch known interactions from database
  if (supabase) {
    const { data: dbInteractions } = await supabase
      .from("ingredient_interactions")
      .select("*")
      .in("ingredient_a", ingredients)
      .in("ingredient_b", ingredients);

    interactions = (dbInteractions || []).map(i => ({
      ingredient_a: i.ingredient_a,
      ingredient_b: i.ingredient_b,
      risk_level: i.risk_level,
      description: i.description,
      recommended_schedule: i.recommended_schedule,
    }));
  }

  // Also check with reversed order (A/B vs B/A)
  if (supabase) {
    const { data: dbInteractionsRev } = await supabase
      .from("ingredient_interactions")
      .select("*")
      .in("ingredient_a", ingredients)
      .in("ingredient_b", ingredients);

    for (const i of (dbInteractionsRev || [])) {
      const exists = interactions.find(x => 
        (x.ingredient_a === i.ingredient_a && x.ingredient_b === i.ingredient_b) ||
        (x.ingredient_a === i.ingredient_b && x.ingredient_b === i.ingredient_a)
      );
      if (!exists) {
        interactions.push({
          ingredient_a: i.ingredient_a,
          ingredient_b: i.ingredient_b,
          risk_level: i.risk_level,
          description: i.description,
          recommended_schedule: i.recommended_schedule,
        });
      }
    }
  }

  // Determine overall risk
  let overallRisk = "low";
  if (interactions.some(i => i.risk_level === "high")) overallRisk = "high";
  else if (interactions.some(i => i.risk_level === "moderate")) overallRisk = "moderate";

  // User-specific warning based on sensitivity and feedback
  let userWarning = "";
  const sensitivity = profile?.skin_sensitivity || "Normal";
  const hasIrritationFeedback = feedback?.some(f => f.experienced_irritation || f.experienced_burning);

  if (overallRisk !== "low" && (sensitivity === "High" || sensitivity === "Very High")) {
    userWarning = "You have high skin sensitivity, which increases the risk of irritation with this combination. Consider separating these ingredients into different days or using gentler alternatives.";
  }
  if (overallRisk !== "low" && hasIrritationFeedback) {
    userWarning += " Previous feedback indicates you have experienced irritation. Extra caution is recommended with this combination.";
  }

  // Recommended schedule
  let schedule = "No known interactions. Use as directed.";
  if (interactions.length > 0) {
    const schedules = interactions.map(i => i.recommended_schedule).filter(Boolean);
    schedule = schedules.join(" ") || "Consider separating these ingredients into different application times.";
  }

  return {
    overall_risk: overallRisk,
    ingredients,
    interactions,
    recommended_schedule: schedule,
    user_specific_warning: userWarning,
    source: "rule_based",
  };
}
