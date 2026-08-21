import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ProductRequest {
  assessment?: any;
  userProfile?: any;
  concerns?: any[];
  feedback?: any[];
  routine?: any;
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

    const body: ProductRequest = await req.json();
    const { assessment, userProfile, concerns, feedback, routine } = body;

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiApiKey) {
      return new Response(JSON.stringify({
        products: generateRuleBasedProducts(assessment, userProfile, concerns, feedback, routine),
        source: "rule_based",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = buildProductPrompt(assessment, userProfile, concerns, feedback, routine);

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

    let products;
    try {
      products = JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON from Gemini");
    }

    const validated = validateProducts(products);
    if (!validated) throw new Error("Invalid product structure");

    return new Response(JSON.stringify({ products: validated, source: "gemini" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    let body: ProductRequest = {};
    try { body = await req.json(); } catch {}
    const products = generateRuleBasedProducts(body.assessment, body.userProfile, body.concerns, body.feedback, body.routine);
    return new Response(JSON.stringify({ products, source: "rule_based", error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildProductPrompt(assessment: any, profile: any, concerns: any[], feedback: any[], routine: any): string {
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
    return `Status: ${f.improvement_status || "N/A"}, Effects: ${effects.join(", ") || "none"}, Ingredient: ${f.ingredient_feedback || "N/A"}, Notes: ${f.notes || "N/A"}`;
  }).join("; ") || "No previous feedback";

  const routineSummary = routine ? `
MORNING ROUTINE: ${(routine.morning_routine || []).map((s: any) => `${s.category}: ${s.product_type} (${s.ingredient})`).join(", ")}
EVENING ROUTINE: ${(routine.evening_routine || []).map((s: any) => `${s.category}: ${s.product_type} (${s.ingredient})`).join(", ")}
WEEKLY PLAN: ${(routine.weekly_plan || []).map((s: any) => `${s.day}: ${s.activity} (${s.ingredient})`).join(", ")}
ROUTINE SUMMARY: ${routine.summary || "N/A"}
KEY INGREDIENTS: ${(routine.key_ingredients || []).join(", ")}
` : "No routine available";

  return `You are a skincare product recommendation AI. Based on the user's personalized routine and skin profile, recommend specific products.

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

PERSONALIZED ROUTINE:
${routineSummary}

Generate a JSON array of 6-8 product recommendations. Each product must follow the routine's guidance and avoid allergens. Structure each product as:
{
  "name": "Product name",
  "brand": "Brand name",
  "category": "One of: Cleanser, Serum, Moisturizer, Sunscreen, Treatment, Exfoliant, Night care",
  "key_ingredients": ["ingredient1", "ingredient2"],
  "why_recommended": "Personalized reason based on the user's routine, concerns, and profile",
  "suitable_skin_types": ["types"],
  "suitable_concerns": ["concerns"],
  "how_to_use": "Brief usage instructions",
  "price_range": "₹X-Y",
  "is_popular_pick": true or false
}

Rules:
- Products must align with the routine categories (cleanser, serum, moisturizer, sunscreen, treatment, exfoliant, night care)
- NEVER recommend products containing ingredients the user is allergic to
- If feedback reports irritation from an ingredient, avoid or reduce that ingredient
- Consider sensitivity level — for high sensitivity, recommend gentler formulations
- Mark 2-3 products as is_popular_pick: true
- Include at least one product per major category (cleanser, moisturizer, sunscreen)
- Do not make medical claims
- Return only the JSON array, no other text`;
}

function validateProducts(products: any): any[] | null {
  if (!Array.isArray(products)) return null;
  return products.map((p: any) => ({
    name: p.name || "Unknown Product",
    brand: p.brand || "",
    category: p.category || "Serum",
    key_ingredients: Array.isArray(p.key_ingredients) ? p.key_ingredients : [],
    why_recommended: p.why_recommended || "",
    suitable_skin_types: Array.isArray(p.suitable_skin_types) ? p.suitable_skin_types : [],
    suitable_concerns: Array.isArray(p.suitable_concerns) ? p.suitable_concerns : [],
    how_to_use: p.how_to_use || "",
    price_range: p.price_range || "",
    image_url: p.image_url || "",
    is_popular_pick: Boolean(p.is_popular_pick),
  }));
}

function generateRuleBasedProducts(assessment: any, profile: any, concerns: any[], feedback: any[], routine: any): any[] {
  const skinType = assessment?.skin_type || profile?.skin_type || "Combination";
  const sensitivity = profile?.skin_sensitivity || "Normal";
  const allergies = (profile?.allergies || "").toLowerCase();
  const previousIssues = (profile?.previous_ingredient_issues || "").toLowerCase();

  const hasAllergy = (ing: string) => allergies.includes(ing.toLowerCase());
  const hadIssue = (ing: string) => previousIssues.includes(ing.toLowerCase());

  const hasFeedbackIrritation = feedback?.some((f: any) => f.experienced_irritation || f.experienced_burning);
  const hasFeedbackBreakouts = feedback?.some((f: any) => f.experienced_breakouts);

  const concernNames = (concerns || []).map((c: any) => c.concern_name);
  const hasAcne = concernNames.includes("Acne");
  const hasDryness = concernNames.includes("Dryness");
  const hasOiliness = concernNames.includes("Oiliness");
  const hasPigmentation = concernNames.includes("Pigmentation");
  const hasFineLines = concernNames.includes("Fine Lines");
  const hasSensitivity = concernNames.includes("Sensitivity");

  const products: any[] = [];

  // Cleanser
  if (hasAcne || hasOiliness) {
    products.push({
      name: "La Roche-Posay Effaclar Medicated Gel Cleanser",
      brand: "La Roche-Posay",
      category: "Cleanser",
      key_ingredients: ["Salicylic Acid"],
      why_recommended: `Targets acne and excess oil with salicylic acid${hasFeedbackIrritation ? ". Use every other day if irritation was previously reported." : "."}`,
      suitable_skin_types: ["Oily", "Combination"],
      suitable_concerns: ["Acne", "Oiliness"],
      how_to_use: "Massage onto damp skin morning and evening. Rinse thoroughly with lukewarm water.",
      price_range: "₹1,200-1,600",
      image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80",
      is_popular_pick: true,
    });
  } else {
    products.push({
      name: "CeraVe Hydrating Facial Cleanser",
      brand: "CeraVe",
      category: "Cleanser",
      key_ingredients: ["Ceramides", "Hyaluronic Acid"],
      why_recommended: `Gentle non-foaming cleanser ideal for ${skinType} skin${hasSensitivity ? " with sensitivity concerns" : ""}.`,
      suitable_skin_types: ["Dry", "Sensitive", "Normal"],
      suitable_concerns: ["Dryness", "Sensitivity"],
      how_to_use: "Massage onto damp skin in circular motions. Rinse with lukewarm water.",
      price_range: "₹800-1,200",
      image_url: "https://images.unsplash.com/photo-1608248543803-ba4f208c93cb?w=400&q=80",
      is_popular_pick: true,
    });
  }

  // Serum — Vitamin C or Niacinamide
  if (!hasAllergy("vitamin c") && !(sensitivity === "High" && hasFeedbackIrritation)) {
    products.push({
      name: "Mad Hippie Vitamin C Serum",
      brand: "Mad Hippie",
      category: "Serum",
      key_ingredients: ["Vitamin C"],
      why_recommended: `Antioxidant serum for morning use${hasPigmentation ? " to help with pigmentation" : " to protect against environmental damage"}.`,
      suitable_skin_types: ["Normal", "Mature", "Combination"],
      suitable_concerns: ["Dullness", "Hyperpigmentation"],
      how_to_use: "Apply 3-4 drops to clean, dry skin in the morning before moisturizer.",
      price_range: "₹2,000-2,800",
      image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80",
      is_popular_pick: false,
    });
  }
  if (!hasAllergy("niacinamide") && !hadIssue("niacinamide")) {
    products.push({
      name: "The Ordinary Niacinamide 10% + Zinc 1%",
      brand: "The Ordinary",
      category: "Serum",
      key_ingredients: ["Niacinamide"],
      why_recommended: `Helps regulate oil and minimize pores${hasSensitivity ? " while being gentle on sensitive skin" : ""}.`,
      suitable_skin_types: ["Oily", "Combination", "Sensitive"],
      suitable_concerns: ["Oiliness", "Pores", "Redness"],
      how_to_use: "Apply a thin layer morning and/or evening before heavier creams.",
      price_range: "₹550-750",
      image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80",
      is_popular_pick: true,
    });
  }

  // Treatment — Retinoids or alternative
  if (!hasAllergy("retinoid") && !hadIssue("retinoid") && sensitivity !== "Very High" && !hasFeedbackIrritation) {
    products.push({
      name: "Paula's Choice Clinical 0.3% Retinol Treatment",
      brand: "Paula's Choice",
      category: "Treatment",
      key_ingredients: ["Retinoids"],
      why_recommended: `Anti-aging treatment${hasFineLines ? " targeting fine lines" : ""}. Start slow if new to retinoids.`,
      suitable_skin_types: ["Normal", "Mature"],
      suitable_concerns: ["Aging", "Fine Lines"],
      how_to_use: "Apply a pea-sized amount 2-3 nights per week. Always follow with moisturizer.",
      price_range: "₹2,500-3,200",
      image_url: "https://images.unsplash.com/photo-1591251770167-8c8f8b8d5b8e?w=400&q=80",
      is_popular_pick: false,
    });
  }

  // Exfoliant — only if no irritation feedback
  if (!hasFeedbackIrritation && !hasAllergy("salicylic acid") && !hadIssue("salicylic acid")) {
    products.push({
      name: "Paula's Choice 2% BHA Liquid Exfoliant",
      brand: "Paula's Choice",
      category: "Exfoliant",
      key_ingredients: ["Salicylic Acid"],
      why_recommended: `Gentle BHA exfoliant${hasAcne ? " for acne-prone skin" : " for pore clearing"}. Use 2-3 times per week.`,
      suitable_skin_types: ["Oily", "Combination", "Normal"],
      suitable_concerns: ["Acne", "Blackheads", "Pores"],
      how_to_use: "Apply with a cotton pad after cleansing. Start 2x per week and increase gradually.",
      price_range: "₹1,800-2,500",
      image_url: "https://images.unsplash.com/photo-1556228578-8c89e6adf853?w=400&q=80",
      is_popular_pick: false,
    });
  }

  // Moisturizer
  if (!hasAllergy("ceramides")) {
    products.push({
      name: "CeraVe Moisturizing Cream",
      brand: "CeraVe",
      category: "Moisturizer",
      key_ingredients: ["Ceramides", "Hyaluronic Acid"],
      why_recommended: `Barrier-restoring moisturizer${hasDryness ? " for dry skin" : " for daily hydration"}. Suitable for morning and evening use.`,
      suitable_skin_types: ["Dry", "Sensitive", "Normal", "Combination"],
      suitable_concerns: ["Dryness", "Barrier damage"],
      how_to_use: "Apply evenly to face and neck after serums. Use morning and evening.",
      price_range: "₹1,200-1,800",
      image_url: "https://images.unsplash.com/photo-1608248543803-ba4f208c93cb?w=400&q=80",
      is_popular_pick: true,
    });
  }

  // Sunscreen
  products.push({
    name: "EltaMD UV Clear Broad-Spectrum SPF 46",
    brand: "EltaMD",
    category: "Sunscreen",
    key_ingredients: ["Niacinamide"],
    why_recommended: `Lightweight, non-comedogenic sunscreen${hasAcne ? " suitable for acne-prone skin" : ""}. Essential daily protection.`,
    suitable_skin_types: ["All"],
    suitable_concerns: ["Sun damage"],
    how_to_use: "Apply generously as the last step of your morning routine. Reapply every 2 hours when outdoors.",
    price_range: "₹2,200-3,000",
    image_url: "https://images.unsplash.com/photo-1556228852-80b2e1c3b814?w=400&q=80",
    is_popular_pick: false,
  });

  // Night care
  if (!hasAllergy("hyaluronic acid")) {
    products.push({
      name: "The Ordinary Hyaluronic Acid 2% + B5",
      brand: "The Ordinary",
      category: "Night care",
      key_ingredients: ["Hyaluronic Acid"],
      why_recommended: `Multi-depth hydration${hasDryness ? " for dry skin" : " for plumping fine lines"}. Apply before moisturizer.`,
      suitable_skin_types: ["All"],
      suitable_concerns: ["Dryness", "Dehydration", "Fine Lines"],
      how_to_use: "Apply to damp skin before moisturizer, morning and/or evening.",
      price_range: "₹550-750",
      image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80",
      is_popular_pick: false,
    });
  }

  return products;
}
