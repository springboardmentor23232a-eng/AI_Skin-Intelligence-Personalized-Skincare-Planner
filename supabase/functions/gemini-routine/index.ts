import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RoutineRequest {
  assessment?: any;
  userProfile?: any;
  concerns?: any[];
  feedback?: any[];
  previousAssessments?: any[];
}

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

    const body: RoutineRequest = await req.json();
    const { assessment, userProfile, concerns, feedback, previousAssessments } = body;

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiApiKey) {
      return new Response(JSON.stringify({ routine: generateRuleBasedRoutine(assessment, userProfile, concerns, feedback), source: "rule_based" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = buildRoutinePrompt(assessment, userProfile, concerns, feedback, previousAssessments);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const geminiData = await response.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("Empty Gemini response");

    let routine;
    try {
      routine = JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON from Gemini");
    }

    const validated = validateRoutine(routine);
    if (!validated) throw new Error("Invalid routine structure");

    return new Response(JSON.stringify({ routine: validated, source: "gemini" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const body: RoutineRequest = await req.json().catch(() => ({}));
    const routine = generateRuleBasedRoutine(body.assessment, body.userProfile, body.concerns, body.feedback);
    return new Response(JSON.stringify({ routine, source: "rule_based", error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildRoutinePrompt(assessment: any, profile: any, concerns: any[], feedback: any[], previous: any[]): string {
  const skinType = assessment?.skin_type || profile?.skin_type || "Combination";
  const score = assessment?.skin_health_score || "N/A";
  const sensitivity = profile?.skin_sensitivity || "Normal";
  const allergies = profile?.allergies || "None reported";
  const goals = profile?.skincare_goals || "General skin health";
  const currentProducts = profile?.current_products || "None reported";
  const previousIssues = profile?.previous_ingredient_issues || "None reported";

  const concernList = concerns?.map(c => `${c.concern_name} (${c.severity})`).join(", ") || "None detected";
  const feedbackList = feedback?.map(f => {
    const effects = [];
    if (f.experienced_irritation) effects.push("irritation");
    if (f.experienced_redness) effects.push("redness");
    if (f.experienced_dryness) effects.push("dryness");
    if (f.experienced_burning) effects.push("burning");
    if (f.experienced_breakouts) effects.push("breakouts");
    return `Status: ${f.improvement_status || "N/A"}, Effects: ${effects.join(", ") || "none"}, Notes: ${f.notes || f.ingredient_feedback || "N/A"}`;
  }).join("; ") || "No previous feedback";

  const previousScores = previous?.map(a => a.skin_health_score).filter(Boolean).join(", ") || "None";

  return `You are a skincare AI assistant. Generate a personalized skincare routine as structured JSON.

USER PROFILE:
- Skin type: ${skinType}
- Skin sensitivity: ${sensitivity}
- Skin health score: ${score}/100
- Allergies: ${allergies}
- Skincare goals: ${goals}
- Current products: ${currentProducts}
- Previous ingredient issues: ${previousIssues}

CURRENT CONCERNS: ${concernList}

PREVIOUS FEEDBACK: ${feedbackList}

PREVIOUS ASSESSMENT SCORES: ${previousScores}

LIFESTYLE:
- Water intake: ${profile?.water_intake || "N/A"}
- Sleep: ${profile?.sleep_duration || "N/A"}
- Stress: ${profile?.stress_level || "N/A"}
- Sun exposure: ${profile?.sun_exposure || "N/A"}
- Climate: ${profile?.climate || "N/A"}

Generate a JSON response with this exact structure:
{
  "morning_routine": [
    {"category": "Cleansing", "step": 1, "product_type": "...", "ingredient": "...", "instructions": "..."},
    {"category": "Treatment", "step": 2, "product_type": "...", "ingredient": "...", "instructions": "..."},
    {"category": "Moisturizing", "step": 3, "product_type": "...", "ingredient": "...", "instructions": "..."},
    {"category": "Sun Protection", "step": 4, "product_type": "...", "ingredient": "...", "instructions": "..."}
  ],
  "evening_routine": [
    {"category": "Cleansing", "step": 1, "product_type": "...", "ingredient": "...", "instructions": "..."},
    {"category": "Treatment", "step": 2, "product_type": "...", "ingredient": "...", "instructions": "..."},
    {"category": "Moisturizing", "step": 3, "product_type": "...", "ingredient": "...", "instructions": "..."},
    {"category": "Night Care", "step": 4, "product_type": "...", "ingredient": "...", "instructions": "..."}
  ],
  "weekly_plan": [
    {"day": "Monday", "activity": "...", "ingredient": "...", "reason": "..."},
    {"day": "Wednesday", "activity": "...", "ingredient": "...", "reason": "..."},
    {"day": "Friday", "activity": "...", "ingredient": "...", "reason": "..."}
  ],
  "seasonal_recommendations": [
    {"season": "Summer", "adjustments": "..."},
    {"season": "Winter", "adjustments": "..."},
    {"season": "Monsoon", "adjustments": "..."},
    {"season": "Dry weather", "adjustments": "..."}
  ],
  "summary": "Brief personalized summary of why this routine suits the user",
  "key_ingredients": ["list of key ingredients in this routine"]
}

Rules:
- Include exfoliation only when appropriate for the skin type
- Avoid recommending ingredients the user is allergic to
- Consider previous feedback — if irritation was reported, adjust accordingly
- Consider sensitivity level — for high sensitivity, use gentler ingredients
- Do not make medical claims
- Keep instructions practical and specific`;
}

function validateRoutine(r: any): any | null {
  if (!r) return null;
  if (!Array.isArray(r.morning_routine)) return null;
  if (!Array.isArray(r.evening_routine)) return null;
  if (!Array.isArray(r.weekly_plan)) return null;
  if (!Array.isArray(r.seasonal_recommendations)) return null;
  return {
    morning_routine: r.morning_routine,
    evening_routine: r.evening_routine,
    weekly_plan: r.weekly_plan,
    seasonal_recommendations: r.seasonal_recommendations,
    summary: r.summary || "Personalized routine based on your skin profile.",
    key_ingredients: Array.isArray(r.key_ingredients) ? r.key_ingredients : [],
  };
}

function generateRuleBasedRoutine(assessment: any, profile: any, concerns: any[], feedback: any[]): any {
  const skinType = assessment?.skin_type || profile?.skin_type || "Combination";
  const sensitivity = profile?.skin_sensitivity || "Normal";
  const allergies = (profile?.allergies || "").toLowerCase();
  const goals = (profile?.skincare_goals || "").toLowerCase();
  const previousIssues = (profile?.previous_ingredient_issues || "").toLowerCase();

  const hasAllergy = (ingredient: string) => allergies.includes(ingredient.toLowerCase());
  const hadIssue = (ingredient: string) => previousIssues.includes(ingredient.toLowerCase());

  const hasFeedbackIrritation = feedback?.some(f => f.experienced_irritation || f.experienced_burning);
  const hasFeedbackBreakouts = feedback?.some(f => f.experienced_breakouts);

  const concernNames = (concerns || []).map(c => c.concern_name);
  const hasAcne = concernNames.includes("Acne");
  const hasDryness = concernNames.includes("Dryness");
  const hasOiliness = concernNames.includes("Oiliness");
  const hasPigmentation = concernNames.includes("Pigmentation");
  const hasSensitivity = concernNames.includes("Sensitivity");
  const hasFineLines = concernNames.includes("Fine Lines");

  const morning: any[] = [];
  const evening: any[] = [];

  // Morning Cleansing
  if (skinType === "Oily" || hasAcne) {
    morning.push({ category: "Cleansing", step: 1, product_type: "Foaming cleanser", ingredient: "Salicylic Acid", instructions: "Cleanse with lukewarm water. Use a small amount, massage gently for 30 seconds, rinse thoroughly." });
  } else if (skinType === "Dry" || hasDryness) {
    morning.push({ category: "Cleansing", step: 1, product_type: "Cream or gel cleanser", ingredient: "Hyaluronic Acid", instructions: "Use a gentle, non-foaming cleanser. Massage onto damp skin, rinse with lukewarm water." });
  } else {
    morning.push({ category: "Cleansing", step: 1, product_type: "Gentle gel cleanser", ingredient: "Glycerin", instructions: "Cleanse gently with lukewarm water. Avoid hot water which can strip the skin." });
  }

  // Morning Treatment - Vitamin C (unless allergy or high sensitivity with irritation feedback)
  if (!hasAllergy("vitamin c") && !(sensitivity === "High" && hasFeedbackIrritation)) {
    morning.push({ category: "Treatment", step: 2, product_type: "Antioxidant serum", ingredient: "Vitamin C", instructions: "Apply 3-4 drops to clean, dry skin. Allow to absorb for 30 seconds before moisturizing." });
  } else if (!hasAllergy("niacinamide")) {
    morning.push({ category: "Treatment", step: 2, product_type: "Barrier serum", ingredient: "Niacinamide", instructions: "Apply a thin layer. Niacinamide is gentle and helps with redness and oil control." });
  }

  // Morning Moisturizing
  if (skinType === "Oily") {
    morning.push({ category: "Moisturizing", step: 3, product_type: "Lightweight gel moisturizer", ingredient: "Hyaluronic Acid", instructions: "Apply a thin layer. Gel formulas hydrate without adding oil." });
  } else if (skinType === "Dry") {
    morning.push({ category: "Moisturizing", step: 3, product_type: "Rich moisturizer", ingredient: "Ceramides", instructions: "Apply generously to lock in moisture. Focus on dry areas." });
  } else {
    morning.push({ category: "Moisturizing", step: 3, product_type: "Lightweight moisturizer", ingredient: "Ceramides", instructions: "Apply evenly. Adjust amount based on how dry or oily areas feel." });
  }

  // Morning Sun Protection
  morning.push({ category: "Sun Protection", step: morning.length + 1, product_type: "Broad-spectrum sunscreen", ingredient: "SPF 30+", instructions: "Apply generously 15 minutes before sun exposure. Reapply every 2 hours when outdoors." });

  // Evening Cleansing
  evening.push({ category: "Cleansing", step: 1, product_type: "Cleansing oil or balm + gentle cleanser", ingredient: "Glycerin", instructions: "Double cleanse: start with an oil cleanser to remove sunscreen and sebum, then follow with a gentle water-based cleanser." });

  // Evening Treatment - Retinoids or alternatives
  const canUseRetinoids = !hasAllergy("retinoid") && !hadIssue("retinoid") && sensitivity !== "Very High" && !hasFeedbackIrritation;
  const canUseAcids = !hasAllergy("aha") && !hasAllergy("bha") && !hadIssue("acid") && sensitivity !== "Very High";

  if (hasAcne && canUseAcids && !hasFeedbackIrritation) {
    evening.push({ category: "Treatment", step: 2, product_type: "Exfoliating treatment", ingredient: "Salicylic Acid", instructions: "Apply to clean, dry skin. Start 2-3 times per week. Follow with moisturizer." });
  } else if ((hasFineLines || goals.includes("anti-aging") || goals.includes("anti aging")) && canUseRetinoids) {
    evening.push({ category: "Treatment", step: 2, product_type: "Retinol serum", ingredient: "Retinoids", instructions: "Start with a pea-sized amount 2-3 nights per week. Apply to dry skin. Always follow with moisturizer." });
  } else if (hasPigmentation && !hasAllergy("niacinamide")) {
    evening.push({ category: "Treatment", step: 2, product_type: "Brightening serum", ingredient: "Niacinamide", instructions: "Apply a thin layer to even out skin tone. Well-tolerated by most skin types." });
  } else if (!hasAllergy("niacinamide")) {
    evening.push({ category: "Treatment", step: 2, product_type: "Barrier serum", ingredient: "Niacinamide", instructions: "Apply to support skin barrier and regulate oil production." });
  }

  // Evening Moisturizing
  if (skinType === "Dry" || hasDryness) {
    evening.push({ category: "Moisturizing", step: 3, product_type: "Rich night cream", ingredient: "Ceramides", instructions: "Apply a generous layer. Focus on dry areas. This locks in hydration overnight." });
  } else {
    evening.push({ category: "Moisturizing", step: 3, product_type: "Night moisturizer", ingredient: "Ceramides", instructions: "Apply an even layer to seal in previous products." });
  }

  // Night Care
  if (skinType === "Dry" || hasDryness) {
    evening.push({ category: "Night Care", step: 4, product_type: "Overnight hydrating mask or facial oil", ingredient: "Hyaluronic Acid", instructions: "Apply a thin layer as the final step. Use a humidifier in dry seasons." });
  } else {
    evening.push({ category: "Night Care", step: 4, product_type: "Lightweight sleeping mask", ingredient: "Hyaluronic Acid", instructions: "Apply a thin layer to lock in moisture overnight." });
  }

  // Weekly Plan
  const weekly: any[] = [];
  const exfoliationIngredient = hasAcne ? "Salicylic Acid" : "AHAs/BHAs";
  if (canUseAcids && !hasFeedbackIrritation) {
    weekly.push({ day: "Monday", activity: "Chemical exfoliation", ingredient: exfoliationIngredient, reason: "Removes dead skin cells and uncovers fresher skin. Start with once weekly." });
  }
  if (canUseRetinoids) {
    weekly.push({ day: "Wednesday", activity: "Retinoid treatment", ingredient: "Retinoids", reason: "Promotes cell turnover and collagen production. Use on non-exfoliation nights." });
  }
  if (skinType === "Dry" || hasDryness) {
    weekly.push({ day: "Friday", activity: "Hydrating mask", ingredient: "Hyaluronic Acid", reason: "Deep hydration boost for dry skin. Leave on for 15-20 minutes." });
  } else {
    weekly.push({ day: "Friday", activity: "Clay or purifying mask", ingredient: "Kaolin Clay", reason: "Draws out impurities and controls excess oil. Use on T-zone if combination." });
  }

  // Seasonal Recommendations
  const seasonal = [
    { season: "Summer", adjustments: `Switch to a lighter gel moisturizer. Ensure consistent SPF reapplication. Consider adding vitamin C for extra antioxidant protection. Avoid heavy night creams.` },
    { season: "Winter", adjustments: `Switch to a richer moisturizer with ceramides. Add hyaluronic acid serum under moisturizer. Use a humidifier at night. Reduce exfoliation frequency to avoid barrier damage.` },
    { season: "Monsoon", adjustments: `Keep skin clean with gentle cleansing twice daily. Use lightweight, non-comedogenic products. Increase antioxidant protection. Be cautious with fungal acne-prone areas.` },
    { season: "Dry weather", adjustments: `Layer hydration: apply hyaluronic acid to damp skin, then seal with a ceramide moisturizer. Reduce active ingredient frequency. Avoid hot water when cleansing.` },
  ];

  const keyIngredients = [...new Set([
    ...morning.map(s => s.ingredient),
    ...evening.map(s => s.ingredient),
  ])];

  return {
    morning_routine: morning,
    evening_routine: evening,
    weekly_plan: weekly,
    seasonal_recommendations: seasonal,
    summary: `This routine is tailored for ${skinType} skin${sensitivity !== "Normal" ? ` with ${sensitivity.toLowerCase()} sensitivity` : ""}. It addresses your current concerns while respecting your allergies and previous feedback.`,
    key_ingredients: keyIngredients,
  };
}
