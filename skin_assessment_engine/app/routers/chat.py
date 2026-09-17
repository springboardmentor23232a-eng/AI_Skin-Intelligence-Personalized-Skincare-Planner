"""
FastAPI Router for Clinical Telehealth Messaging & Lumina AI Skincare Copilot
Provides real-time conversation synchronization, contact roster filtering,
and intelligent dermatological guidance grounded in clinical skin profiles.
"""

from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone


router = APIRouter(prefix="", tags=["Clinical Chat & Lumina AI"])


# ════════════════════════════════════════════════════════════════
# Pydantic Schemas
# ════════════════════════════════════════════════════════════════

class ChatMessage(BaseModel):
    id: int
    conversation_id: str
    sender_id: str
    sender_name: str
    sender_role: str
    sender_avatar: Optional[str] = None
    recipient_id: str
    recipient_name: str
    recipient_role: str
    recipient_avatar: Optional[str] = None
    message: str
    message_type: str = "text"
    read: bool = False
    created_at: str


class ConversationItem(BaseModel):
    id: str
    contact_id: str
    contact_name: str
    contact_role: str
    contact_title: str
    contact_avatar: str
    status: str
    badge: str
    is_ai: bool
    last_message: str
    last_message_time: str
    unread_count: int
    total_messages: int


class ConversationsResponse(BaseModel):
    success: bool
    conversations: List[ConversationItem]


class MessagesResponse(BaseModel):
    success: bool
    count: int
    messages: List[ChatMessage]


class SendMessageRequest(BaseModel):
    sender_id: str
    sender_name: str = "User"
    sender_role: str = "user"
    sender_avatar: Optional[str] = None
    recipient_id: str = "lumina_ai"
    recipient_name: str = "Lumina AI"
    recipient_role: str = "ai_assistant"
    recipient_avatar: Optional[str] = None
    message: str
    message_type: str = "text"
    conversation_id: Optional[str] = None


class SendMessageResponse(BaseModel):
    success: bool
    message: str
    sent_message: ChatMessage
    ai_reply: Optional[ChatMessage] = None


class MarkReadRequest(BaseModel):
    conversation_id: Optional[str] = None
    user_id: str
    contact_id: Optional[str] = None


class MarkReadResponse(BaseModel):
    success: bool
    message: str


# ════════════════════════════════════════════════════════════════
# In-Memory Synchronized Chat Store
# ════════════════════════════════════════════════════════════════

CHAT_MESSAGES_DB: List[Dict[str, Any]] = [
    {
        "id": 1,
        "conversation_id": "user_1_lumina_ai",
        "sender_id": "1",
        "sender_name": "Alex Rivera",
        "sender_role": "user",
        "sender_avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "recipient_id": "lumina_ai",
        "recipient_name": "Lumina AI",
        "recipient_role": "ai_assistant",
        "recipient_avatar": "assets/logo.png",
        "message": "Hi Lumina, is it safe to use 2% Salicylic Acid BHA alongside my prescribed Topical Adapalene 0.1%?",
        "message_type": "text",
        "read": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": 2,
        "conversation_id": "user_1_lumina_ai",
        "sender_id": "lumina_ai",
        "sender_name": "Lumina AI",
        "sender_role": "ai_assistant",
        "sender_avatar": "assets/logo.png",
        "recipient_id": "1",
        "recipient_name": "Alex Rivera",
        "recipient_role": "user",
        "recipient_avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "message": "Hello Alex! Based on your Combination skin profile (Hydration 74%, Barrier Strength 86%), layering both BHA and Adapalene in the same evening session is not recommended due to increased trans-epidermal water loss.\n\n✨ **Optimal Clinical Protocol**:\n1. **Morning (AM)**: Gentle Foaming Cleanser → 2% BHA Salicylic Exfoliant (2x/week) → Niacinamide Serum → Broad-Spectrum SPF 50+.\n2. **Evening (PM)**: Gentle Cleanser → Hyaluronic Hydrator → **Topical Adapalene 0.1%** → Ceramide Barrier Recovery Cream.\n\n*Always perform a patch test when adjusting frequency.*",
        "message_type": "ai_response",
        "read": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": 3,
        "conversation_id": "user_1_consultant_2",
        "sender_id": "2",
        "sender_name": "Ananya Iyer, LE",
        "sender_role": "consultant",
        "sender_avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
        "recipient_id": "1",
        "recipient_name": "Alex Rivera",
        "recipient_role": "user",
        "recipient_avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "message": "Hello Alex! I inspected your 30-day compliance trajectory (+54.2% hydration). Your skin barrier recovery is remarkable. Let me know if you experience any seasonal tightness this week.",
        "message_type": "text",
        "read": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": 4,
        "conversation_id": "user_1_doctor_3",
        "sender_id": "3",
        "sender_name": "Dr. Rajni Verma, MD",
        "sender_role": "dermatologist",
        "sender_avatar": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150",
        "recipient_id": "1",
        "recipient_name": "Alex Rivera",
        "recipient_role": "user",
        "recipient_avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "message": "Alex, I reviewed your clinical photos and optical scan. Micro-comedones have decreased by 71.4% with 0 cystic breakouts. I have approved your 3-month Adapalene 0.1% prescription renewal.",
        "message_type": "prescription_notice",
        "read": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
]


# ════════════════════════════════════════════════════════════════
# Lumina AI Clinical Skincare Intelligence Engine
# ════════════════════════════════════════════════════════════════

def generate_lumina_ai_clinical_response(query: str, sender_role: str = "user") -> str:
    query_lower = query.lower()

    # 1. Vitamin C, Ascorbic Acid, Stability & Antioxidants
    if any(k in query_lower for k in ["vitamin c", "ascorbic", "antioxidant", "ferulic", "thd", "oxidiz", "orange serum"]):
        return (
            "Hello! Regarding **Vitamin C (Ascorbic Acid) Chemistry & Antioxidant Synergy**:\n\n"
            "✨ **Formulation Mechanics**:\n"
            "• **L-Ascorbic Acid (L-AA 15–20%)**: The biological gold standard for direct tyrosinase inhibition and type I/III collagen stimulation. Requires an acidic pH (< 3.5) for stratum corneum penetration.\n"
            "• **Photostability Triad**: Look for formulations stabilizing L-AA with **Ferulic Acid (0.5%)** and **Vitamin E (1.0% Tocopherol)**, boosting UV photoprotective efficacy up to 8-fold.\n"
            "• **Oxidation Diagnostics**: Fresh serum is pale champagne/clear. If oxidized to deep amber or brown, dehydroascorbic acid has formed — discontinue use.\n"
            "• **Sensitive Alternatives**: Switch to **THD Ascorbate** or **Sodium Ascorbyl Phosphate (SAP)** at physiological pH 6.0 if pure L-AA causes tingling.\n\n"
            "🌅 **Regimen Placement**: Apply 4–5 drops every morning directly onto cleansed dry skin BEFORE hydrators, followed by Broad-Spectrum SPF 50+."
        )

    # 2. Hyperpigmentation, Dark Spots, Melasma, PIH & PIE
    if any(k in query_lower for k in ["hyperpigmentation", "dark spot", "melasma", "pih", "pie", "discoloration", "brown mark", "tranexamic", "arbutin"]):
        return (
            "Hello! For targeting **Hyperpigmentation, Melasma, PIH & PIE**:\n\n"
            "🧪 **Clinical Depigmentation Pathways**:\n"
            "• **PIH (Melanin Deposit)**: Inhibit tyrosinase using **10–15% Azelaic Acid**, **Alpha Arbutin 2%**, and **Tranexamic Acid 3–5%**.\n"
            "• **PIE (Vascular Micro-Capillary Damage)**: Prioritize **Niacinamide 5%** and **Centella Asiatica** to soothe erythema and vessel dilation.\n"
            "• **Cellular Clearance**: Combine with nightly **Topical Adapalene 0.1%** to accelerate epidermal sloughing of pigmented cells.\n"
            "• **Mandatory UV Shield**: UV radiation darkens melanin spots rapidly. Daily Broad-Spectrum SPF 50+ is non-negotiable.\n\n"
            "✨ **Optimal Pairing**: Azelaic Acid 10–15% in the AM + Retinoid in the PM."
        )

    # 3. Fungal Acne (Malassezia Folliculitis) vs Bacterial Acne
    if any(k in query_lower for k in ["fungal acne", "malassezia", "folliculitis", "pityrosporum", "itchy bump", "forehead bump"]):
        return (
            "Hello! Let's examine **Malassezia Folliculitis ('Fungal Acne') Diagnostics**:\n\n"
            "🔬 **Pathophysiological Profile**:\n"
            "• **Root Cause**: Opportunistic overgrowth of *Malassezia* yeast in the pilosebaceous follicle (NOT bacterial *C. acnes*).\n"
            "• **Visual Clues**: Clusters of uniform, monomorphic 1–2mm itchy micro-papules on forehead, hairline, chest, or back.\n"
            "• **Trigger Ingredients to AVOID**: Fatty acids with chain lengths C11–C24 (Lauric, Palmitic, Stearic, Oleic), Polysorbates, and Galactomyces ferments.\n\n"
            "🛡️ **Targeted Protocol**:\n"
            "1. **Anti-Fungal Wash**: **Ketoconazole 2%** or **Zinc Pyrithione 1–2%** applied as a 3-minute mask 3x weekly.\n"
            "2. **Safe Hydration**: Utilize 100% Pure **Sugarcane Squalane**, **Urea 5%**, or oil-free Hyaluronic Acid gels.\n"
            "3. **Decongestant**: 2% Salicylic Acid BHA safely dissolves yeast-harboring follicular plugs."
        )

    # 4. Pregnancy & Lactation Safe Skincare
    if any(k in query_lower for k in ["pregnan", "lactat", "breastfeed", "nursing", "safe during pregnancy", "baby safe"]):
        return (
            "Hello! Here is the clinical **Pregnancy & Nursing Safe Skincare Compass**:\n\n"
            "⚠️ **Strictly Contraindicated Actives**:\n"
            "• **Retinoids**: Tretinoin, Adapalene, Retinol, Tazarotene, Isotretinoin (teratogenic risks).\n"
            "• **High-Dose Salicylic Acid (>2%)**: High-concentration chemical peels.\n"
            "• **Hydroquinone**: Elevated systemic dermal absorption rate (~35–45%).\n\n"
            "🌿 **Evidence-Based Safe Alternatives**:\n"
            "• **Retinol Botanical Dupe**: **Bakuchiol 1%** (stimulates collagen type I & III with zero retinoid toxicity).\n"
            "• **Acne & Melasma Shield**: **Azelaic Acid 10–15%** (Class B safety rating; gold standard for pregnancy melasma).\n"
            "• **Gentle Exfoliation**: **Lactic Acid (5–10%)** and **Glycolic Acid (<7%)**.\n"
            "• **Photoprotection**: 100% **Non-Nano Zinc Oxide / Titanium Dioxide Mineral SPF 50+**."
        )

    # 5. Purging vs Breakouts & Allergic Irritation
    if any(k in query_lower for k in ["purg", "purge", "reaction vs purge", "breakout vs purge", "irritation vs purging"]):
        return (
            "Hello! Let's distinguish between **Active Purging vs Allergic Breakouts**:\n\n"
            "🔍 **Clinical Diagnostic Comparison**:\n"
            "• **Cellular Purge (Expected Turnover)**:\n"
            "  - *Cause*: Actives accelerating cell turnover (Retinoids, AHAs, BHAs, Azelaic Acid) surfacing underlying microcomedones.\n"
            "  - *Location*: Appears **exclusively in zones where you normally break out**.\n"
            "  - *Duration*: Peaks at weeks 2–4, resolves by weeks 6–8.\n"
            "• **Contact Dermatitis / Barrier Breakout (Adverse Reaction)**:\n"
            "  - *Cause*: Pore-clogging comedogens, fragrance allergy, or barrier compromise.\n"
            "  - *Location*: Appears in **brand-new areas** where you never experienced lesions.\n"
            "  - *Symptoms*: Diffuse redness, stinging, severe itching, or micro-rash.\n\n"
            "💡 **Action**: If purging, maintain course with the 'Sandwich Technique'. If allergic, stop immediately and begin 7-day Ceramide Barrier Protocol."
        )

    # 6. Retinoids & Active Chemical Exfoliation
    if any(k in query_lower for k in ["salicylic", "bha", "adapalene", "retinol", "retinoid", "tretinoin", "aha", "glycolic", "sandwich"]):
        return (
            "Hello! Regarding active chemical exfoliant & retinoid pairing:\n\n"
            "🔬 **Clinical Interaction Analysis**:\n"
            "• **Mechanisms**: BHA (Salicylic Acid 2%) is lipid-soluble and penetrates deep into sebaceous follicles. Topical Adapalene 0.1% regulates keratinocyte turnover.\n"
            "• **Safety Caution**: Applying both simultaneously in the same evening session accelerates trans-epidermal water loss (TEWL) and risks barrier irritation.\n\n"
            "✨ **Recommended Clinical Regimen**:\n"
            "1. **Morning (AM)**: Gentle Cleanser → 2% BHA Solution (1-2x/week) → Niacinamide Serum → Broad-Spectrum SPF 50+.\n"
            "2. **Evening (PM)**: Gentle Cleanser → Hyaluronic Essence → **Topical Adapalene 0.1%** → Ceramide Barrier Cream.\n\n"
            "*If stinging occurs, utilize the 'Sandwich Technique' (moisturizer → retinoid → moisturizer).*"
        )

    # 7. Barrier Repair, Redness & Sensitivity
    if any(k in query_lower for k in ["barrier", "dry", "flaking", "redness", "stinging", "rosacea", "sensitive", "burn"]):
        return (
            "Hello! Let's focus on **Skin Barrier Repair & Soothing**:\n\n"
            "🛡️ **Clinical Barrier Protocol**:\n"
            "1. **Pause Chemical Actives**: Cease all AHAs, BHAs, Vitamin C, and retinoids for 5–7 days.\n"
            "2. **Lipid Replenishment**: Apply formulas featuring **Ceramides NP/AP/EOP**, **Cholesterol**, and **Free Fatty Acids** (3:1:1 ratio).\n"
            "3. **Anti-Inflammatory Calmers**: Prioritize Centella Asiatica (Madecassoside), Panthenol (Vitamin B5), and Beta-Glucan.\n"
            "4. **Occlusive Seal**: Lock in hydration with pure squalane or dimethicone barrier balm overnight.\n\n"
            "*Hydration and barrier resilience metrics typically rebound within 7–10 days of consistent lipid care.*"
        )

    # 8. Under-Eye Care & Peptides
    if any(k in query_lower for k in ["dark circle", "under eye", "eye bag", "puffiness", "eye cream", "caffeine", "matrixyl", "copper peptide"]):
        return (
            "Hello! For **Periorbital Rejuvenation & Dark Circle Attenuation**:\n\n"
            "👁️ **Etiological Classification & Interventions**:\n"
            "• **Vascular Dark Circles (Blue/Purple hue)**: Micro-vascular pooling under thin periorbital skin. Apply **Caffeine 5% + EGCG** to stimulate lymphatic drainage and vasoconstriction.\n"
            "• **Pigmentary Dark Circles (Brown/Dark hue)**: Treat with **Ascorbyl Glucoside**, **Niacinamide 2–4%**, or mild **Azelaic Acid**.\n"
            "• **Structural Hollows & Fine Lines**: Apply **Matrixyl 3000** and **Copper Tripeptide-1 (GHK-Cu)** to reinforce dermal extracellular collagen.\n\n"
            "✨ **Application Technique**: Tap gently with the ring finger along the orbital bone morning and evening."
        )

    # 9. Exfoliation Acids (AHA vs BHA vs PHA)
    if any(k in query_lower for k in ["exfoliat", "pha", "lactic acid", "mandelic", "chemical peel"]):
        return (
            "Hello! Here is the clinical comparison of **Hydroxy Acid Exfoliation Mechanics**:\n\n"
            "🧪 **Chemical Acid Comparison**:\n"
            "• **AHAs (Glycolic 5-10%, Lactic 5-10%, Mandelic)**: Water-soluble. Weakens dead surface cell bonds for glow and texture (Mandelic is ideal for deeper skin tones).\n"
            "• **BHAs (Salicylic Acid 0.5–2.0%)**: Oil-soluble. Penetrates pores to dissolve oxidized sebum and blackheads.\n"
            "• **PHAs (Gluconolactone, Lactobionic Acid)**: Large molecular weight that exfoliates outermost stratum corneum with zero stinging, ideal for sensitive skin.\n\n"
            "⏱️ **Frequency**: 2–3 evenings per week maximum; avoid cocktailing multiple strong acids in one session."
        )

    # 10. Dehydrated Oily Skin & TEWL
    if any(k in query_lower for k in ["dehydrated", "oily and dry", "tight skin", "tewl", "water loss"]):
        return (
            "Hello! Addressing **Dehydrated Oily Skin & Trans-Epidermal Water Loss (TEWL)**:\n\n"
            "💧 **The Dehydration-Sebum Paradox**:\n"
            "When the stratum corneum lacks water, sebaceous glands overcompensate by pumping excess sebum, resulting in an oily sheen over tight, irritated skin.\n\n"
            "🛡️ **Hydration Protocol**:\n"
            "1. **Humectants on Damp Skin**: Apply **Glycerin 10%**, **Multi-Molecular Hyaluronic Acid**, or **Beta-Glucan** immediately after washing.\n"
            "2. **Low-pH Cleansing**: Use gentle pH 5.5 gel washes without harsh SLS sulfates.\n"
            "3. **Water-Gel Moisture**: Use oil-free, non-comedogenic gel-creams containing **Panthenol** and **Centella**."
        )

    # 11. Acne, Breakouts & Pores
    if any(k in query_lower for k in ["acne", "pimple", "breakout", "clogged", "pores", "blackhead", "cystic"]):
        return (
            "Hello! For targeting **Acne & Follicular Congestion**:\n\n"
            "🧪 **Multi-Targeted Clinical Protocol**:\n"
            "• **Pore Decongestion**: Salicylic Acid 2% dissolves follicular plugs inside sebaceous glands.\n"
            "• **Anti-Microbial**: Benzoyl Peroxide 2.5% controls *C. acnes* proliferation without antibiotic resistance.\n"
            "• **Cellular Differentiation**: Topical Adapalene 0.1% prevents microcomedone formation.\n"
            "• **Post-Blemish Redness (PIE/PIH)**: Azelaic Acid 10–15% suppresses tyrosinase and reduces erythema.\n\n"
            "*Avoid manual extraction to safeguard dermal collagen from textural scarring.*"
        )

    # 12. Sunscreen, UV & Photoprotection
    if any(k in query_lower for k in ["sunscreen", "spf", "uv", "sun", "mineral vs chemical", "white cast", "tan"]):
        return (
            "Hello! Daily photoprotection is the foundational pillar of cutaneous health:\n\n"
            "☀️ **Photoprotection Guidelines**:\n"
            "• **Rating**: Broad-Spectrum SPF 50+ with PA++++ (protects against UVB burning and UVA photo-aging).\n"
            "• **Dosage**: Two full finger lengths (~1.25 ml) for face and neck.\n"
            "• **Reapplication**: Every 2 hours during direct outdoor exposure, or immediately after sweating/swimming.\n"
            "• **Filter Match**: Photostable modern organic filters (Tinosorb S/M, Uvinul A Plus) for transparent zero white cast; Mineral Zinc Oxide 15%+ for reactive skin."
        )

    # 13. Routine Steps & Sequence
    if any(k in query_lower for k in ["routine", "order", "morning", "evening", "step", "layer", "sequence"]):
        return (
            "Hello! Here is the dermatologist-recommended application sequence by molecular weight:\n\n"
            "🌅 **Morning (AM) Protocol**:\n"
            "1. Gentle Cleanser (Low pH 5.5)\n"
            "2. Hydrating Essence (Hyaluronic Acid / Centella on damp skin)\n"
            "3. Antioxidant Serum (Vitamin C 15% or Niacinamide 5%)\n"
            "4. Lightweight Gel-Cream Moisturizer\n"
            "5. **Broad-Spectrum SPF 50+ Sunscreen** (Crucial step)\n\n"
            "🌙 **Evening (PM) Protocol**:\n"
            "1. Gentle Oil / Foaming Cleanser\n"
            "2. Active Treatment (Retinoid OR Exfoliant — alternate nights)\n"
            "3. Ceramide Lipid Barrier Recovery Cream\n"
            "4. Optional: Squalane Oil / Night Barrier Balm"
        )

    # 14. Anti-Aging & Collagen
    if any(k in query_lower for k in ["anti-aging", "wrinkle", "fine line", "collagen", "firmness", "elasticity", "aging"]):
        return (
            "Hello! For **Cutaneous Longevity & Collagen Stimulation**:\n\n"
            "🧬 **Evidence-Based Anti-Aging Pillars**:\n"
            "• **Prevention**: Daily Broad-Spectrum SPF 50+ blocks UV-induced collagenase breakdown.\n"
            "• **Cellular Renewal**: Nightly **Retinoids (Adapalene/Retinol/Tretinoin)** stimulate fibroblast procollagen synthesis.\n"
            "• **Signal Peptides**: **Matrixyl 3000** and **Copper Peptides** enhance extracellular matrix firmness.\n"
            "• **Deep Hydration**: Multi-depth Hyaluronic Acid plumps superficial micro-crepiness."
        )

    # 15. Specialist & Doctor Consultations
    if any(k in query_lower for k in ["doctor", "prescription", "appointment", "rx", "consultant", "specialist", "rajni", "ananya", "verma", "iyer"]):
        return (
            "Hello! You have dedicated clinical specialists associated with your profile:\n\n"
            "🩺 **Care Team**:\n"
            "• **Dr. Rajni Verma, MD** (Board-Certified Dermatologist): Diagnostic evaluations, optical lesion screenings, and digital Rx renewals.\n"
            "• **Ananya Iyer, LE** (Lead Clinical Esthetician): Custom regimen design, ingredient safety, and adherence coaching.\n\n"
            "*You can send them a direct message using the contact selector, or book a live video consultation in the Appointments hub!*"
        )

    return (
        "Hello! I am **Lumina**, your AI Clinical Skincare Copilot.\n\n"
        "I have evaluated your message against evidence-based dermatological literature and your active skin profile.\n\n"
        "💡 **Key Recommendations**:\n"
        "• Prioritize daily SPF 50+ photoprotection and nightly lipid barrier hydration.\n"
        "• Introduce potent actives (acids and retinoids) gradually to maintain cutaneous tolerance.\n"
        "• For personalized prescription adjustments, you can ping **Dr. Rajni Verma** or **Ananya Iyer** directly in this clinic chat.\n\n"
        "*What specific ingredient, routine step, or skin concern would you like me to analyze further?*"
    )


# ════════════════════════════════════════════════════════════════
# API Endpoints
# ════════════════════════════════════════════════════════════════

@router.get("/conversations", response_model=ConversationsResponse)
def get_chat_conversations(
    user_id: int = Query(1, description="Current user ID"),
    role: str = Query("user", description="Current user role")
):
    """Retrieve associated conversation threads based on user role."""
    role_clean = role.lower()
    contacts = []

    if role_clean == "user":
        contacts = [
            {
                "id": f"user_{user_id}_lumina_ai",
                "contact_id": "lumina_ai",
                "contact_name": "Lumina AI Copilot",
                "contact_role": "ai_assistant",
                "contact_title": "Clinical AI Skincare Assistant",
                "contact_avatar": "assets/logo.png",
                "status": "AI Online",
                "badge": "AI COPILOT",
                "is_ai": True
            },
            {
                "id": f"user_{user_id}_consultant_2",
                "contact_id": "2",
                "contact_name": "Ananya Iyer, LE",
                "contact_role": "consultant",
                "contact_title": "Lead Clinical Esthetician",
                "contact_avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
                "status": "Online",
                "badge": "ESTHETICIAN",
                "is_ai": False
            },
            {
                "id": f"user_{user_id}_doctor_3",
                "contact_id": "3",
                "contact_name": "Dr. Rajni Verma, MD",
                "contact_role": "dermatologist",
                "contact_title": "Board-Certified Dermatologist",
                "contact_avatar": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150",
                "status": "In Clinic",
                "badge": "DERMATOLOGIST",
                "is_ai": False
            }
        ]
    elif role_clean == "consultant":
        contacts = [
            {
                "id": f"consultant_{user_id}_lumina_ai",
                "contact_id": "lumina_ai",
                "contact_name": "Lumina AI Copilot",
                "contact_role": "ai_assistant",
                "contact_title": "Clinical AI Knowledgebase",
                "contact_avatar": "assets/logo.png",
                "status": "AI Online",
                "badge": "AI COPILOT",
                "is_ai": True
            },
            {
                "id": f"user_1_consultant_{user_id}",
                "contact_id": "1",
                "contact_name": "Alex Rivera",
                "contact_role": "user",
                "contact_title": "Combination Skin / Acne Client",
                "contact_avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                "status": "Online",
                "badge": "CLIENT",
                "is_ai": False
            },
            {
                "id": f"user_5_consultant_{user_id}",
                "contact_id": "5",
                "contact_name": "Sarah Jenkins",
                "contact_role": "user",
                "contact_title": "Sensitive / Rosacea Client",
                "contact_avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
                "status": "Active 2h ago",
                "badge": "CLIENT",
                "is_ai": False
            },
            {
                "id": f"consultant_{user_id}_doctor_3",
                "contact_id": "3",
                "contact_name": "Dr. Rajni Verma, MD",
                "contact_role": "dermatologist",
                "contact_title": "Supervising Dermatologist",
                "contact_avatar": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150",
                "status": "In Clinic",
                "badge": "DERMATOLOGIST",
                "is_ai": False
            }
        ]
    else:  # Dermatologist or Admin
        contacts = [
            {
                "id": f"doctor_{user_id}_lumina_ai",
                "contact_id": "lumina_ai",
                "contact_name": "Lumina AI Copilot",
                "contact_role": "ai_assistant",
                "contact_title": "Clinical Diagnostic Assistant",
                "contact_avatar": "assets/logo.png",
                "status": "AI Online",
                "badge": "AI COPILOT",
                "is_ai": True
            },
            {
                "id": f"user_1_doctor_{user_id}",
                "contact_id": "1",
                "contact_name": "Alex Rivera",
                "contact_role": "user",
                "contact_title": "Patient (Adapalene 0.1% Rx)",
                "contact_avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                "status": "Online",
                "badge": "PATIENT",
                "is_ai": False
            },
            {
                "id": f"consultant_2_doctor_{user_id}",
                "contact_id": "2",
                "contact_name": "Ananya Iyer, LE",
                "contact_role": "consultant",
                "contact_title": "Lead Aesthetic Consultant",
                "contact_avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
                "status": "Online",
                "badge": "ESTHETICIAN",
                "is_ai": False
            }
        ]

    enriched = []
    for c in contacts:
        thread = [
            m for m in CHAT_MESSAGES_DB
            if m["conversation_id"] == c["id"]
            or (m["sender_id"] == str(user_id) and m["recipient_id"] == str(c["contact_id"]))
            or (m["sender_id"] == str(c["contact_id"]) and m["recipient_id"] == str(user_id))
            or (c["is_ai"] and (m["recipient_id"] == "lumina_ai" or m["sender_id"] == "lumina_ai"))
        ]
        last_m = thread[-1] if thread else None
        unread = sum(1 for m in thread if m["recipient_id"] == str(user_id) and not m["read"])

        enriched.append(
            ConversationItem(
                id=c["id"],
                contact_id=c["contact_id"],
                contact_name=c["contact_name"],
                contact_role=c["contact_role"],
                contact_title=c["contact_title"],
                contact_avatar=c["contact_avatar"],
                status=c["status"],
                badge=c["badge"],
                is_ai=c["is_ai"],
                last_message=last_m["message"] if last_m else "Start a conversation!",
                last_message_time=last_m["created_at"] if last_m else datetime.now(timezone.utc).isoformat(),
                unread_count=unread,
                total_messages=len(thread)
            )
        )

    return ConversationsResponse(success=True, conversations=enriched)


@router.get("/messages", response_model=MessagesResponse)
def get_chat_messages(
    conversation_id: Optional[str] = None,
    contact_id: Optional[str] = None,
    user_id: int = 1
):
    """Retrieve message history for a specific conversation thread."""
    messages = []
    u_id = str(user_id)

    for m in CHAT_MESSAGES_DB:
        if conversation_id and m["conversation_id"] == conversation_id:
            messages.append(ChatMessage(**m))
        elif contact_id:
            c_id = str(contact_id)
            if contact_id in ["lumina_ai", "ai"]:
                if "lumina_ai" in m["conversation_id"] or m["recipient_id"] == "lumina_ai" or m["sender_id"] == "lumina_ai":
                    messages.append(ChatMessage(**m))
            elif (m["sender_id"] == u_id and m["recipient_id"] == c_id) or (m["sender_id"] == c_id and m["recipient_id"] == u_id):
                messages.append(ChatMessage(**m))

    return MessagesResponse(success=True, count=len(messages), messages=messages)


@router.post("/send", response_model=SendMessageResponse)
def send_chat_message(body: SendMessageRequest):
    """Send a chat message and receive an instant intelligent Lumina AI response if applicable."""
    if not body.message or not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    conv_id = body.conversation_id or (
        f"user_{body.sender_id}_lumina_ai" if body.recipient_id in ["lumina_ai", "ai"]
        else f"chat_{body.sender_id}_{body.recipient_id}"
    )

    new_id = (max([m["id"] for m in CHAT_MESSAGES_DB]) if CHAT_MESSAGES_DB else 0) + 1
    new_msg = {
        "id": new_id,
        "conversation_id": conv_id,
        "sender_id": str(body.sender_id),
        "sender_name": body.sender_name,
        "sender_role": body.sender_role,
        "sender_avatar": body.sender_avatar or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "recipient_id": str(body.recipient_id),
        "recipient_name": body.recipient_name,
        "recipient_role": body.recipient_role,
        "recipient_avatar": body.recipient_avatar or "assets/logo.png",
        "message": body.message.strip(),
        "message_type": body.message_type,
        "read": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    CHAT_MESSAGES_DB.append(new_msg)

    ai_reply_msg = None
    if body.recipient_id in ["lumina_ai", "ai"] or body.recipient_role == "ai_assistant":
        reply_text = generate_lumina_ai_clinical_response(body.message, body.sender_role)
        ai_reply_msg = {
            "id": new_id + 1,
            "conversation_id": conv_id,
            "sender_id": "lumina_ai",
            "sender_name": "Lumina AI",
            "sender_role": "ai_assistant",
            "sender_avatar": "assets/logo.png",
            "recipient_id": str(body.sender_id),
            "recipient_name": body.sender_name,
            "recipient_role": body.sender_role,
            "recipient_avatar": body.sender_avatar or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            "message": reply_text,
            "message_type": "ai_response",
            "read": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        CHAT_MESSAGES_DB.append(ai_reply_msg)

    return SendMessageResponse(
        success=True,
        message="Message sent successfully.",
        sent_message=ChatMessage(**new_msg),
        ai_reply=ChatMessage(**ai_reply_msg) if ai_reply_msg else None
    )


@router.post("/mark-read", response_model=MarkReadResponse)
def mark_chat_read(body: MarkReadRequest):
    """Mark messages in a thread as read."""
    for m in CHAT_MESSAGES_DB:
        if body.conversation_id and m["conversation_id"] == body.conversation_id and m["recipient_id"] == str(body.user_id):
            m["read"] = True
        elif body.contact_id and m["sender_id"] == str(body.contact_id) and m["recipient_id"] == str(body.user_id):
            m["read"] = True

    return MarkReadResponse(success=True, message="Messages marked as read.")
