// ============================================
//   STADIUMAI — GenAI ENGINE
//   Simulates LLM responses for all modules
//   Interface contract compatible with:
//   - Google Gemini Pro API
//   - OpenAI GPT-4o API
//   To swap to real AI: replace generateResponse()
//   and streamResponse() internals only.
// ============================================

'use strict';

/**
 * @namespace AI
 * @description Core AI engine for StadiumAI. Provides intent detection,
 * response generation, streaming, and data generation for all platform modules.
 * Implements the same interface contract as Google Gemini Pro or OpenAI GPT-4o APIs.
 */
const AI = (function () {

  // ── LANGUAGE RESPONSES ──────────────────────
  const LANG_GREETINGS = {
    en: "Hello! I'm ARIA, your AI stadium assistant for FIFA World Cup 2026.",
    es: "¡Hola! Soy ARIA, tu asistente de IA para el estadio de la FIFA Copa del Mundo 2026.",
    fr: "Bonjour! Je suis ARIA, votre assistante IA pour la Coupe du Monde FIFA 2026.",
    ar: "مرحباً! أنا ARIA، مساعدتك الذكية في الملعب لكأس العالم FIFA 2026.",
    pt: "Olá! Sou ARIA, sua assistente de IA no estádio da Copa do Mundo FIFA 2026.",
    de: "Hallo! Ich bin ARIA, Ihr KI-Stadionassistent für die FIFA-Weltmeisterschaft 2026.",
    zh: "你好！我是ARIA，您的FIFA 2026世界杯AI球场助手。",
    ja: "こんにちは！私はARIA、FIFA 2026ワールドカップのAIスタジアムアシスタントです。",
    ko: "안녕하세요! 저는 ARIA, FIFA 2026 월드컵 AI 스타디움 어시스턴트입니다.",
    hi: "नमस्ते! मैं ARIA हूँ, FIFA विश्व कप 2026 के लिए आपकी AI स्टेडियम सहायक।",
    ru: "Привет! Я ARIA, ваш ИИ-помощник на стадионе FIFA Чемпионат Мира 2026.",
    it: "Ciao! Sono ARIA, la tua assistente AI per lo Stadio della Coppa del Mondo FIFA 2026.",
  };

  // ── INTENT CATEGORIES ───────────────────────
  const INTENTS = {
    navigation: ['where', 'how to get', 'find', 'located', 'gate', 'entrance', 'exit', 'section', 'seat', 'bathroom', 'restroom', 'toilet', 'food', 'concession', 'shop', 'store', 'atm', 'medical', 'first aid', 'parking', 'way to'],
    transport: ['transport', 'metro', 'subway', 'bus', 'taxi', 'uber', 'ride', 'park', 'train', 'shuttle', 'arrive', 'leave', 'depart', 'travel'],
    crowd: ['crowd', 'busy', 'full', 'capacity', 'congestion', 'wait', 'queue', 'line', 'density', 'people'],
    accessibility: ['wheelchair', 'disability', 'accessible', 'elevator', 'lift', 'sign language', 'hearing', 'visual', 'blind', 'deaf', 'special needs'],
    match: ['match', 'game', 'score', 'team', 'player', 'kick off', 'halftime', 'result', 'who is playing', 'schedule', 'fixture'],
    emergency: ['emergency', 'help', 'danger', 'lost', 'missing', 'sick', 'injury', 'fire', 'evacuation', 'security', 'police'],
    sustainability: ['recycle', 'green', 'eco', 'waste', 'carbon', 'environment', 'sustainable', 'energy'],
    general: ['hello', 'hi', 'hey', 'thanks', 'thank you', 'help', 'what can', 'how are you']
  };

  // ── RESPONSE TEMPLATES ───────────────────────
  const RESPONSES = {
    navigation: [
      "Based on your seat in **{section}**, here's the optimal route:\n\n🚪 **Recommended Gate:** Gate {gate}\n🗺️ **Path:** Enter at Gate {gate} → Follow the Blue Lane → Take elevator to Level {level} → Section {section} is on your left\n\n⏱️ **Estimated time:** {time} minutes from main entrance\n\n💡 **Tip:** Zones C and D are currently less congested. I recommend using the east corridor for a smoother experience.",
      "I've analyzed the current crowd flow and found you the best route! 🗺️\n\n**Your Journey:**\n- Start at the **Main Entrance (North)**\n- Take the **Yellow Corridor** (currently clear)\n- Pass **Food Court 2** on your right\n- Section {section} will be marked in blue\n\n🔵 Accessibility route available via elevator near Gate {gate}.\n\n📍 You are approximately **{distance}m** from your destination.",
      "Let me find the quickest path for you!\n\n🎯 **Destination:** Section {section}, Row {row}\n\n**Step-by-step:**\n1. Head to **Gate {gate}** (east side of stadium)\n2. Show e-ticket at scanner kiosk\n3. Follow the **Green Arrow** signs to Level {level}\n4. Turn right past the merchandise store\n5. Your seat is **Row {row}, Seat {seat}**\n\n⚠️ Note: The North corridor is currently at 78% capacity. Consider using the South route via Gate {altGate}."
    ],
    transport: [
      "🚇 **Smart Transport Recommendations for You:**\n\n**Best Option — Metro Line 3 (Blue)**\n- Depart from: City Center Station\n- Travel time: 22 minutes\n- Frequency: Every 8 minutes\n- Crowd level: 🟡 Moderate\n\n**Alternative — Stadium Shuttle**\n- Pickup: Fan Zone Hub B\n- Departs: Every 15 minutes\n- Carbon Impact: 🌱 Zero emissions (electric)\n\n⚡ **AI Prediction:** Post-match congestion expected between 22:00–23:30. Consider departing 20 minutes early or staying for the post-match celebration event.",
      "Based on current traffic and crowd data, here are my transport recommendations:\n\n🏆 **Top Pick: Free Fan Shuttle**\n- Route: City Center ↔ Stadium\n- Next departure: 18 minutes\n- Carbon neutral ✅\n\n🚌 **Bus Route 47-X**\n- Stop: West Gate\n- Journey: 31 mins\n- Crowd: Low 🟢\n\n🚗 **Park & Ride Zone A**\n- Current capacity: 67% full\n- Walking distance: 8 minutes\n\n💡 My AI model predicts Zone A will fill to 95% by match time. I recommend arriving in the next 40 minutes.",
      "Great question! Here's your personalized travel plan:\n\n**Pre-Match (Recommended):**\n🚇 Metro: Platform 4, Blue Line → Stadium Station\nDeparture in: 12 minutes | Journey: 19 mins\n\n**Post-Match Exit Strategy:**\nAI analysis shows Gate D and Gate F will have shortest exit queues.\nStay for 15 extra minutes and avoid peak exodus (saves ~35 mins).\n\n**Ride-share pickup zone:** East Parking Plaza B\n**Taxi rank:** Gate 7, North Side"
    ],
    crowd: [
      "📊 **Current Crowd Status at {stadium}:**\n\n| Zone | Occupancy | Status |\n|------|-----------|--------|\n| North Stand | 89% | 🔴 High |\n| South Stand | 71% | 🟡 Moderate |\n| East Wing | 45% | 🟢 Clear |\n| West Wing | 93% | 🔴 Critical |\n| Concourses | 67% | 🟡 Moderate |\n\n**AI Recommendation:** The **East Wing concourse** is your best bet right now — 55% less crowded than average. Food stalls in Zone E also have shorter queues (avg 3 min wait).",
      "Here's the real-time crowd intelligence I'm seeing:\n\n🟢 **Clear zones:** East Concourse, Gate 12 area, Food Court 4\n🟡 **Moderate:** Main Plaza, North Stands\n🔴 **Busy:** West Entrance, VIP Lounge area\n\n⚡ **AI Prediction (next 30 min):** North Stand will ease as fans settle in. West Entrance congestion expected to resolve within 15 minutes as gates fully open.\n\n💡 **Smart tip:** Head to Gate 9 — my sensors show it has 40% shorter queue times right now.",
      "Current stadium capacity: **{capacity}%** occupied\n\nMy crowd flow AI has detected:\n- Peak arrival window: **{peakTime}**\n- Recommended entry gate: **Gate {bestGate}** (shortest queue: {queueTime} min)\n- Concession wait times: 3–8 min at East kiosks, 12–18 min at Main Plaza\n\nPost-match exodus prediction:\n- Lowest congestion exit: Gate 6 (South)\n- Recommended departure: 5 min before final whistle\n- Expected full clearance: 47 minutes post-match"
    ],
    accessibility: [
      "♿ **Accessibility Services at Your Fingertips:**\n\n**Wheelchair Access:**\n- Dedicated entrance: Gate 2A (North) & Gate 8A (South)\n- Elevator locations: Near Gates 2, 5, 8, 11\n- Reserved wheelchair spaces: Sections WC-1 through WC-8\n\n**Visual Assistance:**\n- Audio description headsets available at Gate 2A & Gate 8A Info desk\n- Guide dog relief area: North Plaza (marked with 🐕 signs)\n\n**Hearing Support:**\n- Hearing loop installed in all concourse areas\n- Sign language interpreters: Available on request at Info Kiosks\n\n📞 **Accessibility Hotline:** Text HELP to 2026 for immediate assistance. A dedicated team member will reach you within 5 minutes.",
      "I'm here to make sure everyone has an incredible experience! Here's what's available:\n\n✅ **Mobility:** Wheelchair ramps at all gates, motorized transport carts (free)\n✅ **Visual:** Live audio commentary via FM 94.7, tactile maps at info points\n✅ **Hearing:** BSL/ASL interpreters, subtitled video boards in Sections H1–H4\n✅ **Sensory:** Quiet rooms available at Gates 3 & 9 for sensory sensitivities\n\n🆘 Need immediate help? I can dispatch a stadium accessibility volunteer to your location in under 3 minutes. Just say 'Request assistance'.",
      "Of course! Accessibility is our priority at FIFA World Cup 2026.\n\n**Your accessibility map:**\n- Nearest accessible restroom: 45m to your left (Section {section})\n- Elevator: Gate {gate} Level G → Level 2 (operational 09:00–02:00)\n- Medical bay with accessibility support: Level 1, North Concourse\n\n**Today's special services:**\n🎙️ Audio described match commentary starts at 18:30\n👋 Sign language interpretation at Section 112 viewing area\n🦮 Assistance animal facilities near Gate 4 plaza"
    ],
    match: [
      "⚽ **Match Information:**\n\n🏟️ **Today's Fixture:**\nBrazil 🇧🇷 vs France 🇫🇷\n\n📅 Kick-off: 20:00 local time\n🏟️ Venue: SoFi Stadium, Inglewood\n👥 Attendance: 68,714 fans\n\n**Match Status:** 🔴 LIVE — 67' minute\n**Score:** Brazil 2 – 1 France\n\n**Recent events:**\n⚽ 64' — Vinicius Jr. (Brazil)\n🟨 60' — Camavinga (France)\n⚽ 43' — Mbappé (France)\n\n**AI Prediction:** Based on possession stats and historical data, Brazil has a **73% probability** of maintaining their lead.",
      "Let me get you the latest match info!\n\n🔥 **LIVE MATCH UPDATE:**\n\n🇧🇷 Brazil 2 — 1 France 🇫🇷\n⏱️ **67th minute**\n\n📊 **Live Stats:**\n- Possession: BRA 58% | FRA 42%\n- Shots on target: BRA 7 | FRA 4\n- Corners: BRA 5 | FRA 3\n\n**AI Analysis:** France needs to score within next 20 minutes statistically. Mbappé has a 34% shot accuracy tonight — watch the right flank!\n\nWant me to set up goal alerts for you?",
      "📋 **World Cup 2026 — Group Stage Fixtures:**\n\n**Today:**\n- 16:00 — Argentina 🇦🇷 vs Morocco 🇲🇦 [Group D]\n- 20:00 — Brazil 🇧🇷 vs France 🇫🇷 [Group A] ← You're here!\n\n**Tomorrow:**\n- 14:00 — England 🏴󠁧󠁢󠁥󠁮󠁧󠁿 vs Germany 🇩🇪\n- 20:00 — Spain 🇪🇸 vs Portugal 🇵🇹\n\n🎟️ Tickets for tomorrow's matches available at Fan Zone kiosk C7."
    ],
    emergency: [
      "🚨 **EMERGENCY ASSISTANCE ACTIVATED**\n\nI'm alerting stadium security and medical staff to your location immediately.\n\n**Your reference code: #EM-2026-{code}**\n\n**Nearest help:**\n🏥 Medical Station: 80m — North Concourse, Level 1\n🛡️ Security Post: 45m — Gate 7 checkpoint\n📞 Stadium emergency: Call **2026** (free internal call)\n\n**Please stay calm and remain at your current location.** A trained responder will reach you within **3 minutes**.\n\nIs this a medical emergency, security concern, or do you need evacuation assistance?",
      "I'm here and I'm getting you help right now! 🚨\n\n**Emergency services dispatched to your area.**\n\nWhile you wait:\n- If medical emergency: Do NOT move the person unless in immediate danger\n- If security threat: Move to nearest shelter zone (marked with 🔵 signs)\n- If lost child: Go to Family Meeting Point near Gate 5 or Gate 10\n\nYou can also contact staff directly:\n- 📱 Text 'HELP [your location]' to 2026\n- 🔴 Press any red emergency button on stadium pillars\n- 🗣️ Find any volunteer in orange vest\n\n**Stay on this chat — I'm monitoring your situation.**"
    ],
    sustainability: [
      "🌱 **Stadium Sustainability Status — Match Day:**\n\n**Carbon Footprint Today:**\n- Total: 847 tonnes CO₂\n- Per fan: 12.4 kg (31% below 2022 average)\n- Offset: 623 tonnes via renewable credits\n\n**Energy:**\n- Solar panels generating: 2.4 MW\n- Grid draw: 1.8 MW\n- 57% renewable energy share\n\n**Waste:**\n- Recycled: 73%\n- Composted: 18%\n- Landfill: 9% (target: <5%)\n\n♻️ **Your Green Action:** Using a reusable cup saves 240g of plastic per match! Swap station at Food Court 2. 🏆 Green Score: 8.4/10",
      "Great interest in our green efforts! Here's the eco-scoop:\n\n🌍 **FIFA 2026 Sustainability Dashboard:**\n- Zero single-use plastics at all food outlets ✅\n- 100% renewable electricity in stadium ✅\n- Water recycling system: 89% efficiency ✅\n- Local food sourcing: 68% of menu items\n\n**Fan Impact Today:**\n- 14,200 fans chose public transport (saves 67 tonnes CO₂)\n- 8,900 reusable cups distributed\n- 340 kg food waste composted\n\n🏆 Join the **Green Fan Challenge** — earn points for eco-friendly actions and win merchandise!"
    ],
    general: [
      "Hello! 👋 I'm **ARIA** — your AI Stadium Intelligence Assistant for FIFA World Cup 2026!\n\nI can help you with:\n🗺️ **Navigation** — Find any location in the stadium\n🚇 **Transport** — Best routes to/from the venue\n📊 **Crowd Info** — Find the least busy areas\n♿ **Accessibility** — Services for all fans\n⚽ **Match Updates** — Live scores and stats\n🌱 **Sustainability** — Green initiatives\n🚨 **Emergency** — Immediate assistance\n\nWhat can I help you with today? Ask me anything in any language!",
      "Hi there! 😊 Great to meet you! I'm ARIA, powered by GenAI technology to make your World Cup experience unforgettable.\n\nI'm monitoring all stadium systems in real-time:\n- ✅ All gates operational\n- ✅ Food courts open\n- ✅ Medical stations staffed\n- 🟡 West concourse: moderate crowd\n\nHow can I make your day amazing? Feel free to ask about anything!",
      "Thanks! You're very welcome! 🙏\n\nIs there anything else I can help you with today? I'm here 24/7 and can assist with:\n- Finding your seat or any facility\n- Real-time crowd and transport updates\n- Match information and predictions\n- Special needs and accessibility services\n- Emergency assistance\n\nEnjoy the match! ⚽🏆"
    ]
  };

  // ── DETECT INTENT ────────────────────────────
  function detectIntent(text) {
    const lower = text.toLowerCase();
    for (const [intent, keywords] of Object.entries(INTENTS)) {
      if (keywords.some(kw => lower.includes(kw))) {
        return intent;
      }
    }
    return 'general';
  }

  // ── FILL TEMPLATE ────────────────────────────
  function fillTemplate(template) {
    const sections = ['A1', 'B3', 'C7', 'D12', 'E4', 'F9', 'G2'];
    const gates = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    return template
      .replace(/{section}/g, sections[Math.floor(Math.random() * sections.length)])
      .replace(/{gate}/g, gates[Math.floor(Math.random() * gates.length)])
      .replace(/{altGate}/g, gates[Math.floor(Math.random() * gates.length)])
      .replace(/{bestGate}/g, gates[Math.floor(Math.random() * gates.length)])
      .replace(/{level}/g, Math.floor(Math.random() * 3) + 1)
      .replace(/{row}/g, Math.floor(Math.random() * 40) + 1)
      .replace(/{seat}/g, Math.floor(Math.random() * 30) + 1)
      .replace(/{time}/g, Math.floor(Math.random() * 8) + 2)
      .replace(/{distance}/g, Math.floor(Math.random() * 200) + 50)
      .replace(/{stadium}/g, 'SoFi Stadium, Inglewood')
      .replace(/{capacity}/g, Math.floor(Math.random() * 20) + 75)
      .replace(/{peakTime}/g, '19:00–20:00')
      .replace(/{queueTime}/g, Math.floor(Math.random() * 5) + 1)
      .replace(/{code}/g, Math.floor(Math.random() * 9000) + 1000);
  }

  // ── GENERATE RESPONSE ────────────────────────
  function generateResponse(userMessage, language = 'en') {
    const intent = detectIntent(userMessage);
    const responses = RESPONSES[intent] || RESPONSES.general;
    const template = responses[Math.floor(Math.random() * responses.length)];
    return fillTemplate(template);
  }

  // ── STREAM RESPONSE ──────────────────────────
  async function streamResponse(text, onChunk, onComplete) {
    const words = text.split('');
    let index = 0;
    const CHUNK_SIZE = 3;
    const DELAY_MS = 12;

    return new Promise(resolve => {
      function next() {
        if (index >= words.length) {
          if (onComplete) onComplete();
          resolve();
          return;
        }
        const chunk = words.slice(index, index + CHUNK_SIZE).join('');
        if (onChunk) onChunk(chunk);
        index += CHUNK_SIZE;
        setTimeout(next, DELAY_MS);
      }
      next();
    });
  }

  // ── TRANSLATE TEXT ───────────────────────────
  const TRANSLATIONS = {
    'Where is my seat?': {
      es: '¿Dónde está mi asiento?', fr: 'Où est mon siège?', ar: 'أين مقعدي؟',
      de: 'Wo ist mein Sitzplatz?', zh: '我的座位在哪里？', pt: 'Onde está meu assento?',
      ja: '私の席はどこですか？', ko: '내 자리는 어디에 있나요?', hi: 'मेरी सीट कहाँ है?',
      ru: 'Где моё место?', it: 'Dove è il mio posto?'
    },
    'How can I help you today?': {
      es: '¿Cómo puedo ayudarte hoy?', fr: 'Comment puis-je vous aider aujourd\'hui?',
      ar: 'كيف يمكنني مساعدتك اليوم؟', de: 'Wie kann ich Ihnen heute helfen?',
      zh: '今天我能为您提供什么帮助？', pt: 'Como posso ajudá-lo hoje?',
      ja: '今日はどのようにお手伝いできますか？', ko: '오늘 어떻게 도와드릴까요?',
      hi: 'आज मैं आपकी कैसे मदद कर सकती हूँ?', ru: 'Как я могу вам помочь сегодня?',
      it: 'Come posso aiutarti oggi?'
    }
  };

  function getGreeting(lang) {
    return LANG_GREETINGS[lang] || LANG_GREETINGS.en;
  }

  // ── CROWD DATA GENERATOR ─────────────────────
  function generateCrowdData() {
    const zones = ['North Stand', 'South Stand', 'East Wing', 'West Wing', 'Main Plaza', 'Food Courts', 'VIP Area', 'Concourses'];
    return zones.map(zone => ({
      name: zone,
      capacity: Math.floor(Math.random() * 35) + 55,
      trend: Math.random() > 0.5 ? 'up' : 'down',
      change: Math.floor(Math.random() * 8) + 1,
      alert: Math.random() > 0.85
    }));
  }

  // ── TRANSPORT DATA ───────────────────────────
  function generateTransportData() {
    return [
      { icon: '🚇', name: 'Metro Line 3 — Blue', via: 'City Center → Stadium Station', eta: `${Math.floor(Math.random() * 8) + 18} min`, crowd: 'Moderate', color: '#1565C0', eco: true },
      { icon: '🚌', name: 'Fan Shuttle Bus', via: 'Fan Zone Hub B → Gate 7', eta: `${Math.floor(Math.random() * 6) + 12} min`, crowd: 'Low', color: '#2E7D32', eco: true },
      { icon: '🚗', name: 'Park & Ride Zone A', via: '8 min walk from lot', eta: `${Math.floor(Math.random() * 10) + 20} min`, crowd: 'Low', color: '#7B2FBE', eco: false },
      { icon: '🛺', name: 'Rideshare (Uber/Lyft)', via: 'Pickup: East Plaza B', eta: `${Math.floor(Math.random() * 12) + 8} min`, crowd: 'High', color: '#FF6B35', eco: false },
      { icon: '🚲', name: 'Bike Share Station', via: 'Fan Zone → Bike Lane D', eta: `${Math.floor(Math.random() * 5) + 15} min`, crowd: 'Clear', color: '#00E676', eco: true },
    ];
  }

  // ── OPERATIONS ALERTS ────────────────────────
  function generateAlerts() {
    return [
      { type: 'critical', icon: '🚨', title: 'West Entrance Overcrowding', desc: 'Zone W7 at 97% capacity. AI recommends redirecting fans to Gate 3 (North). Estimated resolution: 12 min.', time: '2 min ago', ai: true },
      { type: 'warning',  icon: '⚠️', title: 'Food Court 3 — Long Queues', desc: 'Average wait time exceeded 18 minutes. Activate secondary service counters B4–B7.', time: '8 min ago', ai: true },
      { type: 'info',     icon: '🌧️', title: 'Weather Advisory', desc: 'Light rain expected at 21:30. Pre-positioning rain gear distribution at Gates 1, 5, 9.', time: '15 min ago', ai: false },
      { type: 'warning',  icon: '🔧', title: 'Elevator #4 Maintenance', desc: 'North concourse elevator offline for 20 minutes. Fans redirected to Gates 2 and 6 lifts.', time: '22 min ago', ai: false },
      { type: 'info',     icon: '♿', title: 'Accessibility Request Resolved', desc: 'Fan in Section C12 requested wheelchair transport. Volunteer dispatched, ETA 3 min.', time: '31 min ago', ai: true },
      { type: 'resolved', icon: '✅', title: 'Medical Incident — Resolved', desc: 'Minor heat exhaustion incident in South Stand handled by medical team. Fan transported to cooling station.', time: '45 min ago', ai: false },
    ];
  }

  // ── SUSTAINABILITY DATA ──────────────────────
  function getSustainabilityData() {
    return {
      carbonTotal: 847,
      carbonPerFan: 12.4,
      carbonOffset: 623,
      renewableEnergy: 57,
      solarOutput: 2.4,
      wasteRecycled: 73,
      wasteComposted: 18,
      wasteLandfill: 9,
      waterRecycled: 89,
      publicTransportFans: 14200,
      reusableCups: 8900,
      greenScore: 8.4
    };
  }

  // ── PUBLIC API ───────────────────────────────
  return {
    detectIntent,
    generateResponse,
    streamResponse,
    getGreeting,
    generateCrowdData,
    generateTransportData,
    generateAlerts,
    getSustainabilityData,
    LANG_GREETINGS,
    fillTemplate
  };

})();
