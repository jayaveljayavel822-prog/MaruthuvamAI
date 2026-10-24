import re
from typing import Dict, Any, List, Optional
from app.schemas.triage import EmergencyContact

# Indian Emergency Helplines
INDIAN_EMERGENCY_CONTACTS = [
    EmergencyContact(name="All-India Emergency", number="112", description="National Unified Helpline"),
    EmergencyContact(name="Ambulance Service", number="108", description="24/7 Emergency Medical Response"),
    EmergencyContact(name="Mother & Child Care", number="102", description="Maternal & Infant Transport"),
    EmergencyContact(name="Medical Consultation Helpline", number="104", description="State Health Advice"),
    EmergencyContact(name="Tele-MANAS", number="14416", description="National Mental Health & Distress Helpline"),
    EmergencyContact(name="National Poison Helpline", number="1800116117", description="Tox-Info Specialist Guidance"),
]

# Clinical Rule Matrix: (Category, Symptom Name, Urgency Level [2=Emergency, 1=Urgent, 0=Routine], First Aid, Regex Pattern)
TRIAGE_RULES = [
    # Heart & Breathing
    ("❤️ Heart & breathing", "Chest pain, pressure or tightness", 2, "Stop all physical activity and sit upright. Loosen tight clothing. Call 108 immediately.", r"chest\W*(pain|pressure|tight)|nenju\s*vali|நெஞ்சு\s*வலி|heart\s*attack"),
    ("❤️ Heart & breathing", "Severe breathing difficulty, unable to speak full sentences", 2, "Sit upright. Use prescribed inhaler if available. Seek urgent emergency care.", r"(difficulty|trouble|short(ness)?( of)?)\W*breath|moochu\s*(thinaral|vaanga)|மூச்சு\s*(திணறல்|விட)"),
    ("❤️ Heart & breathing", "Blue or grey lips, tongue, or face (Cyanosis)", 2, "Treat as high-urgency oxygen deprivation. Call 108 now.", r"blue\s*(lips|face)|cyanosis"),
    ("❤️ Heart & breathing", "Wheezing or breathlessness on mild exertion", 1, "Rest upright and use prescribed bronchodilator. Consult doctor today.", r"wheez|asthma|illupu"),
    ("❤️ Heart & breathing", "Racing heartbeat or palpitations at rest", 1, "Sit quietly and hydrate. Obtain an ECG check today.", r"palpitation|racing\s*heart|nenju\s*padapadappu"),
    
    # Brain & Nerves
    ("🧠 Brain & nerves", "Fainting, collapse, or unresponsive state", 2, "Lay person on back with legs elevated unless vomiting. If not breathing, start CPR.", r"faint|unconscious|collapsed|not\s*responding|mayakkam|மயக்கம்"),
    ("🧠 Brain & nerves", "Face drooping, arm weakness, or slurred speech (FAST Stroke)", 2, "Note symptom onset time precisely. Give NO food or water. Call 108 now.", r"face.*(droop|weak)|slurred|can'?t\s*move\s*(arm|leg)|paralysis|stroke|வாய்\s*கோணல்"),
    ("🧠 Brain & nerves", "Seizure or fits", 2, "Place on side in recovery position. Clear hard items. Put NOTHING in the mouth.", r"seizure|convulsion|\bfits?\b|valippu|வலிப்பு"),
    ("🧠 Brain & nerves", "Sudden worst-ever headache (Thunderclap) or after head trauma", 2, "Lie still in a quiet environment. Do not administer aspirin without scan.", r"worst\s*headache|thunderclap|head\s*injury|hit\s*(my|his)\s*head"),
    ("🧠 Brain & nerves", "New confusion or sudden partial/total vision loss", 2, "Do not leave patient unassisted. Transfer to emergency department.", r"confus|sudden(ly)?\s*(blind|vision)"),
    ("🧠 Brain & nerves", "Active thoughts of self-harm or suicide", 2, "You are valued and not alone. Call Tele-MANAS (14416) or 112 immediately.", r"suicid|kill\s*myself|end\s*my\s*life|self[- ]harm|want\s*to\s*die|thatkolai|தற்கொலை"),

    # Bleeding & Injury
    ("🩸 Bleeding & injury", "Heavy uncontrollable arterial or venous bleeding", 2, "Apply continuous direct pressure using clean cloth. Elevate wound if possible.", r"bleeding.*(won'?t|not)\s*stop|heavy\s*bleeding|ratham\s*kottuthu"),
    ("🩸 Bleeding & injury", "Severe burn, chemical burn, or burns over face/hands", 2, "Cool with clean running tap water for 20 minutes. Do not apply toothpaste, oil, or ice.", r"severe\s*burn|burns?\s*(on|over)\s*(face|large)"),
    ("🩸 Bleeding & injury", "Suspected poisoning, toxic ingestion, or snake bite", 2, "Do not induce vomiting. Immobilize bitten limb. Call Poison Helpline: 1800-116-117.", r"poison|overdose|snake\s*bite|paambu|பாம்பு|swallowed\s*chemical"),
    ("🩸 Bleeding & injury", "Severe anaphylaxis: swollen throat/tongue with breathing difficulty", 2, "Use adrenaline (epinephrine) auto-injector if prescribed. Call 108 now.", r"anaphyla|throat\s*(swell|closing)|face\s*swell|swollen\s*(lips|tongue)"),
    ("🩸 Bleeding & injury", "Deep laceration, suspected bone fracture, or inability to bear weight", 1, "Immobilize limb using rigid support. Seek orthopedic/emergency assessment.", r"fracture|broken\s*bone|deep\s*cut|stitch|elumbu\s*muri"),
    ("🩸 Bleeding & injury", "Dog, cat, or wild animal bite", 1, "Wash wound thoroughly with soap and running water for 15 minutes. Get anti-rabies vaccine today.", r"dog\s*bite|animal\s*bite|naai\s*kadi|rabies"),

    # Stomach & Abdomen
    ("🤢 Stomach & others", "Vomiting blood or black coffee-ground tarry stools", 2, "Do not take food or painkillers. Transfer to emergency hospital.", r"vomit(ing)?\s*blood|black\s*(tarry\s*)?stool|blood\s*in\s*vomit"),
    ("🤢 Stomach & others", "Pregnancy with heavy vaginal bleeding or severe abdominal cramps", 2, "Lie on left side. Call 108 or 102 immediately for obstetric emergency unit.", r"pregnan.*(bleed|pain)|reduced\s*(baby|fetal)\s*movement"),
    ("🤢 Stomach & others", "Severe acute abdominal pain (possible appendicitis/perforation)", 1, "Avoid painkillers that mask symptoms. Consult emergency or surgeon today.", r"severe\s*(stomach|abdom\w*)\s*pain|vayiru\s*vali\s*(romba|athigam)"),
    ("🤢 Stomach & others", "Severe diarrhea/vomiting with signs of dehydration", 1, "Sip Oral Rehydration Salt (ORS) frequently in small amounts.", r"dehydrat|loose\s*motion.*(urine|dizzy)|dry\s*mouth"),
    ("🤢 Stomach & others", "Mild acidity, heartburn, or indigestion", 0, "Eat light, non-spicy meals. Drink warm water and avoid lying down immediately after meals.", r"acidity|\bgas\b|indigestion|heartburn|ethukkithu"),

    # Fever & Infection
    ("🌡️ Fever & infection", "Fever with stiff neck, purpuric rash, or extreme lethargy", 2, "Possible meningitis or severe sepsis. Emergency hospital evaluation needed.", r"stiff\s*neck|neck\s*stiff|rash.*fever|fever.*unconscious"),
    ("🌡️ Fever & infection", "Fever in infant under 3 months, or child refusing fluids", 2, "Do not administer adult medications. Go directly to a pediatric hospital.", r"baby.*(fever|not\s*feeding)|infant.*fever"),
    ("🌡️ Fever & infection", "High fever above 102°F or fever continuing over 3 days", 1, "Rest, stay hydrated, take cool sponge bath. Doctor check for dengue/typhoid needed.", r"high\s*fever|fever.*(3|three|4|5)\s*days"),
    ("🌡️ Fever & infection", "Mild seasonal cold, sore throat, or mild fever (<100°F)", 0, "Warm fluids, saline gargles, steam inhalation, and adequate rest.", r"mild\s*fever|kaichal|காய்ச்சல்|cold|cough|sore\s*throat|irumal|சளி"),

    # Common & Mild
    ("🙂 Common & mild", "Mild tension headache or tired eyes", 0, "Rest in a quiet shaded room, drink water, and sleep well.", r"mild\s*headache|eye\s*strain"),
    ("🙂 Common & mild", "Mild itching or dry skin rash without swelling", 0, "Moisturize, avoid scratching, and use mild soap.", r"mild\s*rash|itch|namachal"),
]


class TriageService:
    def assess_symptoms(
        self,
        symptom_text: Optional[str] = "",
        selected_ids: Optional[List[int]] = None,
        severity: str = "mild",
        is_worsening: bool = False,
    ) -> Dict[str, Any]:
        matched_rules = []
        text = (symptom_text or "").strip()
        selected_ids = selected_ids or []

        # Check explicit checkbox selections
        for idx in selected_ids:
            if 0 <= idx < len(TRIAGE_RULES):
                matched_rules.append((TRIAGE_RULES[idx], "User selected symptom"))

        # Check regex matches against free-text input
        if text:
            for i, rule in enumerate(TRIAGE_RULES):
                if i not in selected_ids and re.search(rule[4], text, re.IGNORECASE):
                    matched_rules.append((rule, "Detected in your description"))

        # Determine highest urgency level
        level_code = 0
        if matched_rules:
            level_code = max(r[0][2] for r in matched_rules)

        reasons = []
        first_aid_notes = []

        # Modifiers: severity and worsening
        if severity == "severe" and level_code < 1:
            level_code = 1
            reasons.append("Symptom severity marked as severe/unbearable.")
        if is_worsening and level_code < 1:
            level_code = 1
            reasons.append("Symptoms are reported as worsening rapidly.")

        for rule, source in matched_rules:
            reasons.append(f"{rule[1]} ({source})")
            if rule[3] and rule[2] == level_code:
                first_aid_notes.append(rule[3])

        if not matched_rules and not text:
            urgency_level = "routine"
            title = "🟢 ROUTINE WELLNESS GUIDANCE"
            action = "Please describe your symptoms or select from the checklist above for personalized safety guidance."
        elif level_code == 2:
            urgency_level = "emergency"
            title = "🔴 EMERGENCY CARE NEEDED"
            action = (
                "Call 108 (Ambulance) or 112 NOW. Do not drive yourself. Stay accompanied. "
                "These symptoms indicate a potential high-risk emergency requiring immediate clinical attention."
            )
        elif level_code == 1:
            urgency_level = "urgent"
            title = "🟠 URGENT MEDICAL ASSESSMENT RECOMMENDED"
            action = (
                "Consult a doctor today (within 24 hours). If symptoms worsen rapidly or you develop chest pain, "
                "breathlessness, or confusion, treat immediately as an emergency."
            )
        else:
            urgency_level = "routine"
            title = "🟢 ROUTINE MEDICAL CONSULTATION / SELF-CARE"
            action = (
                "Mild symptoms can generally be managed with supportive self-care, hydration, and rest. "
                "Schedule a routine clinic consultation if there is no improvement within 2 to 3 days."
            )

        return {
            "urgency_level": urgency_level,
            "level_code": level_code,
            "title": title,
            "action_guidance": action,
            "matched_reasons": reasons,
            "first_aid_advice": " | ".join(dict.fromkeys(first_aid_notes)) if first_aid_notes else None,
            "emergency_contacts": INDIAN_EMERGENCY_CONTACTS,
            "disclaimer": (
                "IMPORTANT: This symptom triage engine provides urgency guidance only, NOT a diagnosis. "
                "It does not replace professional clinical evaluation by a certified physician. "
                "If you feel that something is seriously wrong, trust your instinct and seek medical help."
            ),
        }


triage_service = TriageService()
