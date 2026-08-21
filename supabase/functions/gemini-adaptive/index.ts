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
    const { previousAssessment, latestAssessment, userProfile, previousConcerns, latestConcerns, feedback } = body;

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiApiKey) {
      const result = generateRuleBasedAdaptive(previousAssessment, latestAssessment, previousConcerns, latestConcerns, feedback);
      return new Response(JSON.stringify({ ...result, source: "rule_based" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = buildAdaptivePrompt(previousAssessment, latestAssessment, userProfile, previousConcerns, latestConcerns, feedback);

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

    const validated = validateAdaptive(parsed);
    if (!validated) throw new Error("Invalid adaptive structure");

    return new Response(JSON.stringify({ ...validated, source: "gemini" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const body = await req.json().catch(() => ({}));
    const result = generateRuleBasedAdaptive(body.previousAssessment, body.latestAssessment, body.previousConcerns, body.latestConcerns, body.feedback);
    return new Response(JSON.stringify({ ...result, source: "rule_based", error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildAdaptivePrompt(prev: any, latest: any, profile: any, prevConcerns: any[], latestConcerns: any[], feedback: any[]): string {
  const prevScore = prev?.skin_health_score || "N/A";
  const latestScore = latest?.skin_health_score || "N/A";
  const skinType = latest?.skin_type || profile?.skin_type || "Combination";
  const sensitivity = profile?.skin_sensitivity || "Normal";
  const allergies = profile?.allergies || "None";
  const previousIssues = profile?.previous_ingredient_issues || "None";

  const prevConcernList = prevConcerns?.map(c => `${c.concern_name} (${c.severity})`).join(", ") || "None";
  const latestConcernList = latestConcerns?.map(c => `${c.concern_name} (${c.severity})`).join(", ") || "None";

  const feedbackList = feedback?.map(f => {
    const effects = [];
    if (f.experienced_irritation) effects.push("irritation");
    if (f.experienced_redness) effects.push("redness");
    if (f.experienced_dryness) effects.push("dryness");
    if (f.experienced_burning) effects.push("burning");
    if (f.experienced_breakouts) effects.push("breakouts");
    return `Status: ${f.improvement_status}, Effects: ${effects.join(", ") || "none"}, Notes: ${f.notes || f.ingredient_feedback || "N/A"}`;
  }).join("; ") || "No feedback";

  return `You are a skincare AI assistant. Analyze the progress between two assessments and generate adaptive routine updates as structured JSON.

PREVIOUS ASSESSMENT:
- Score: ${prevScore}/100
- Skin type: ${prev?.skin_type || "N/A"}
- Concerns: ${prevConcernList}

LATEST ASSESSMENT:
- Score: ${latestScore}/100
- Skin type: ${skinType}
- Concerns: ${latestConcernList}

USER PROFILE:
- Sensitivity: ${sensitivity}
- Allergies: ${allergies}
- Previous ingredient issues: ${previousIssues}

ROUTINE FEEDBACK: ${feedbackList}

Compare the two assessments and generate JSON with this exact structure:
{
  "overall_progress": "Brief summary of overall skin progress",
  "score_trend": "improved" | "declined" | "stable",
  "concern_changes": [
    {"concern": "...", "change": "improved" | "worsened" | "stable" | "resolved" | "new", "detail": "..."}
  ],
  "routine_adjustments": [
    {"category": "...", "change": "...", "reason": "...", "priority": "high" | "medium" | "low"}
  ]
}

Rules:
- Compare scores: if latest > previous by 5+, trend is "improved"; if lower by 5+, "declined"; else "stable"
- For each concern, determine if it improved, worsened, stayed stable, was resolved, or is new
- Generate specific routine adjustments based on the changes
- Consider feedback — if irritation was reported, suggest gentler approaches
- Do not make medical claims`;
}

function validateAdaptive(r: any): any | null {
  if (!r) return null;
  if (!["improved", "declined", "stable"].includes(r.score_trend)) return null;
  if (!Array.isArray(r.concern_changes)) return null;
  if (!Array.isArray(r.routine_adjustments)) return null;
  return {
    overall_progress: r.overall_progress || "Progress analysis complete.",
    score_trend: r.score_trend,
    concern_changes: r.concern_changes,
    routine_adjustments: r.routine_adjustments,
  };
}

function generateRuleBasedAdaptive(prev: any, latest: any, prevConcerns: any[], latestConcerns: any[], feedback: any[]): any {
  const prevScore = prev?.skin_health_score || 0;
  const latestScore = latest?.skin_health_score || 0;
  const diff = latestScore - prevScore;

  let trend = "stable";
  if (diff >= 5) trend = "improved";
  else if (diff <= -5) trend = "declined";

  const prevNames = (prevConcerns || []).map(c => c.concern_name);
  const latestNames = (latestConcerns || []).map(c => c.concern_name);

  const concernChanges: any[] = [];

  prevNames.forEach(name => {
    if (!latestNames.includes(name)) {
      concernChanges.push({ concern: name, change: "resolved", detail: `${name} was present in the previous assessment but not detected in the latest.` });
    }
  });

  latestNames.forEach(name => {
    if (!prevNames.includes(name)) {
      concernChanges.push({ concern: name, change: "new", detail: `${name} is a new concern that was not present in the previous assessment.` });
    }
  });

  const commonNames = prevNames.filter(n => latestNames.includes(n));
  commonNames.forEach(name => {
    const prevC = prevConcerns.find(c => c.concern_name === name);
    const latestC = latestConcerns.find(c => c.concern_name === name);
    const severityOrder = { "Low": 1, "Moderate": 2, "High": 3, "Severe": 4 };
    const prevSev = severityOrder[prevC?.severity] || 0;
    const latestSev = severityOrder[latestC?.severity] || 0;

    if (latestSev < prevSev) {
      concernChanges.push({ concern: name, change: "improved", detail: `${name} severity has decreased from ${prevC?.severity} to ${latestC?.severity}.` });
    } else if (latestSev > prevSev) {
      concernChanges.push({ concern: name, change: "worsened", detail: `${name} severity has increased from ${prevC?.severity} to ${latestC?.severity}.` });
    } else {
      concernChanges.push({ concern: name, change: "stable", detail: `${name} severity remains at ${latestC?.severity}.` });
    }
  });

  const adjustments: any[] = [];

  if (trend === "improved") {
    adjustments.push({ category: "Overall", change: "Continue current routine — your skin is improving.", reason: "Your skin health score has improved, indicating the current routine is working well.", priority: "medium" });
  } else if (trend === "declined") {
    adjustments.push({ category: "Overall", change: "Review and simplify your routine — your skin health score has declined.", reason: "A score decline may indicate the current routine is too harsh or not addressing the right concerns.", priority: "high" });
  }

  concernChanges.forEach(cc => {
    if (cc.change === "new") {
      adjustments.push({ category: "Treatment", change: `Add a targeted treatment for ${cc.concern}.`, reason: cc.detail, priority: "high" });
    } else if (cc.change === "worsened") {
      adjustments.push({ category: "Treatment", change: `Increase focus on ${cc.concern} management.`, reason: cc.detail, priority: "high" });
    } else if (cc.change === "improved") {
      adjustments.push({ category: "Treatment", change: `Reduce frequency of ${cc.concern} treatment as it is improving.`, reason: cc.detail, priority: "low" });
    } else if (cc.change === "resolved") {
      adjustments.push({ category: "Treatment", change: `Consider discontinuing targeted ${cc.concern} treatment.`, reason: cc.detail, priority: "low" });
    }
  });

  const hasIrritation = feedback?.some(f => f.experienced_irritation || f.experienced_burning);
  if (hasIrritation) {
    adjustments.push({ category: "Treatment", change: "Reduce frequency of active ingredients and focus on barrier repair.", reason: "Feedback indicates irritation. Reduce actives and prioritize gentle, barrier-supporting products.", priority: "high" });
  }

  const hasBreakouts = feedback?.some(f => f.experienced_breakouts);
  if (hasBreakouts) {
    adjustments.push({ category: "Cleansing", change: "Ensure thorough double cleansing and consider adding salicylic acid if not already using.", reason: "Feedback indicates breakouts. Enhanced cleansing and pore-clearing ingredients may help.", priority: "medium" });
  }

  return {
    overall_progress: `Your skin health score ${trend === "improved" ? "improved" : trend === "declined" ? "declined" : "remained stable"} from ${prevScore} to ${latestScore}. ${concernChanges.length > 0 ? `${concernChanges.filter(c => c.change === "improved").length} concern(s) improved, ${concernChanges.filter(c => c.change === "worsened").length} worsened, ${concernChanges.filter(c => c.change === "new").length} new, ${concernChanges.filter(c => c.change === "resolved").length} resolved.` : ""}`,
    score_trend: trend,
    concern_changes: concernChanges,
    routine_adjustments: adjustments,
  };
}
