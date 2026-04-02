import { useState, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════
   ANSR PULSE — Free Version
   ELIA · Beauty That Heals
   ═══════════════════════════════════════════
   
   FINAL LOCKED VERSION — March 27, 2026
   
   Changes from v2:
   - Results page: LIGHT THEME (warm ivory bg, charcoal text)
   - Single CTA only (Profile €97). Debrief sold via personal email.
   - Profile price: €97 (not €47)
   - Locked dims opacity raised to 0.45 for readability on light bg
   - All other screens (intro, settle, questions, breathing, email): 
     UNCHANGED — dark theme stays for assessment experience
   - Scoring algorithm: UNCHANGED — DO NOT MODIFY
   ═══════════════════════════════════════════ */

// ── Design Tokens ──
const T = {
  bg: "#1A1714",
  bgCard: "rgba(255,255,255,0.03)",
  bgCardHover: "rgba(255,255,255,0.06)",
  accent: "#C4896A",
  accentBright: "#D4976F",
  accentSoft: "rgba(196,137,106,0.18)",
  accentGlow: "rgba(196,137,106,0.08)",
  text: "#F2EDE7",
  textMuted: "#C4BAA8",
  textDim: "#C4BAA8",
  klein: "#4A6FA5",
  kleinLight: "rgba(74,111,165,0.3)",
  border: "rgba(255,255,255,0.08)",
  borderHover: "rgba(196,137,106,0.4)",
  warmWhite: "#FAF5EE",
  warmCharcoal: "#3A3530",
  fonts: {
    display: "'Cormorant Garamond', serif",
    body: "'EB Garamond', serif",
    ui: "'DM Sans', sans-serif",
  },
};

// ── Results Page Light Theme Tokens ──
const R = {
  bg: "#FAF5EE",              // Warm ivory — Assouline / Aman
  bgAlt: "#F3EDE4",           // Slightly deeper for cards
  text: "#2C2C2C",            // Charcoal — high contrast
  textMuted: "#6B6560",       // Warm grey — readable
  textDim: "#9B9590",         // Soft — for tertiary info
  accent: "#B07D62",          // Rose gold — slightly deeper for light bg
  accentBright: "#C4896A",    // Rose gold — buttons
  accentSoft: "rgba(176,125,98,0.12)",
  accentGlow: "rgba(176,125,98,0.06)",
  border: "rgba(44,44,44,0.10)",
  borderAccent: "rgba(176,125,98,0.25)",
};

// ── Dimension Definitions ──
const DIMENSIONS = [
  { key: "alertness", label: "Alertness", desc: "Is your system stuck in survival mode?" },
  { key: "sensitivity", label: "Sensitivity", desc: "How much can you still feel?" },
  { key: "vitality", label: "Vitality", desc: "Does your body actually recover?" },
  { key: "connection", label: "Connection", desc: "How present are you in your relationships?" },
  { key: "performance", label: "Performance", desc: "What is your work costing you?" },
  { key: "aliveness", label: "Aliveness", desc: "Are you still connected to who you are?" },
];

// ── Score Bands ──
function getBand(score) {
  if (score <= 2.5) return { label: "Contracted", color: "#8B5E4B", colorLight: "#A0674F" };
  if (score <= 5.0) return { label: "Compressed", color: "#A07850", colorLight: "#B08A5E" };
  if (score <= 7.5) return { label: "Emerging", color: "#7A8B6B", colorLight: "#6B8B5C" };
  return { label: "Open", color: "#5B8B6A", colorLight: "#4A7D5A" };
}

// ── Dimension Insights ──
const INSIGHTS = {
  alertness: {
    Contracted: "Your nervous system is locked in high alert. It doesn't know the emergency is over.",
    Compressed: "You're bracing more than you realize. Your body is holding tension your mind has normalized.",
    Emerging: "Your system can still calm down — but it takes effort and the right conditions.",
    Open: "You have genuine capacity to shift between activation and calm. This is rare and valuable.",
  },
  sensitivity: {
    Contracted: "Your senses have been turned down. Beauty exists around you but it's not reaching your body.",
    Compressed: "You recognize beauty intellectually but the embodied feeling — the catch in the breath — has gone quiet.",
    Emerging: "Your sensitivity is flickering back. Beauty reaches you in moments — hold onto those.",
    Open: "You feel the world richly. This is your greatest asset — and the doorway to everything ANSR offers.",
  },
  vitality: {
    Contracted: "Your body isn't recovering. You rest without restoring. The debt is compounding.",
    Compressed: "You're managing on a depleted tank. Sleep helps but doesn't fully repair.",
    Emerging: "Your body is starting to remember how to recover — but it needs more support than it's getting.",
    Open: "Your restorative system is working. Your body knows how to rebuild after pressure.",
  },
  connection: {
    Contracted: "You've withdrawn — from others and from yourself. Your system is conserving by closing the doors.",
    Compressed: "You're present enough to function but not enough to feel nourished by your relationships.",
    Emerging: "Connection is still available to you — but it requires conditions your current life rarely provides.",
    Open: "You can receive, be seen, and stay present. This capacity is the foundation for deep change.",
  },
  performance: {
    Contracted: "Your work has consumed your identity. The success is real but the woman inside it has gone quiet.",
    Compressed: "You're still performing but the fuel has changed — from purpose to habit or fear.",
    Emerging: "You can still feel glimpses of why you started. That thread is worth following.",
    Open: "Your work reflects who you are. You lead from alignment, not survival.",
  },
  aliveness: {
    Contracted: "You've lost contact with purpose, desire, and the feeling that your life is yours.",
    Compressed: "Something is missing and you can feel its absence — even if you can't name it yet.",
    Emerging: "Something is stirring. A question, a hunger, a moment where beauty reached you. Pay attention to it.",
    Open: "You're connected to who you are, what you want, and why it matters. Beauty is part of your life, not separate from it.",
  },
};

// ── Questions (UNCHANGED) ──
const QUESTIONS = [
  { dim: "alertness", text: "It's Sunday evening. What happens in your body?", options: [
    { text: "I start mentally preparing for the week — I can't help it", type: "S" },
    { text: "I feel flat — weekends and weekdays feel the same", type: "D" },
    { text: "A low hum of anxiety — I can't fully let go even when there's no reason", type: "S" },
    { text: "I settle in — my body knows the week can wait", type: "V" },
  ]},
  { dim: "alertness", text: "Do you know how to stop — not just pause between tasks, but actually stop?", options: [
    { text: "I stop when I collapse — but that's not the same thing, is it", type: "D" },
    { text: "Yes — I can be still and it feels natural", type: "V" },
    { text: "I fill every gap — if I'm not doing something productive I feel guilty or anxious", type: "S" },
    { text: "I've built my entire identity around being in motion — stopping feels like disappearing", type: "S" },
  ]},
  { dim: "sensitivity", text: "When was the last time something beautiful stopped you — not just caught your eye, but moved something in your body?", options: [
    { text: "I notice beauty but it stays in my head — I think \"that's beautiful\" without feeling it", type: "M" },
    { text: "I can't remember — I see beautiful things but nothing moves inside", type: "D" },
    { text: "This week — beauty still reaches me physically", type: "V" },
    { text: "Only in rare, unexpected moments — and it almost hurts when it does", type: "D" },
  ]},
  { dim: "sensitivity", text: "There's a version of you that used to feel everything — people, places, beauty, energy. Is she still there?", options: [
    { text: "I think I buried her to get through the last few years", type: "D" },
    { text: "She's there but quieter — I feel her in rare moments", type: "M" },
    { text: "Yes — she's fully here, maybe even stronger than before", type: "V" },
    { text: "I'm not sure she existed — or I've forgotten what that felt like", type: "D" },
  ]},
  { dim: "vitality", text: "If your body could talk, what would it ask you for right now?", options: [
    { text: "To be heard — it's been sending signals and I keep ignoring them", type: "S" },
    { text: "Rest — real rest, not just stopping", type: "D" },
    { text: "I don't know — we haven't been in conversation for a long time", type: "D" },
    { text: "Pleasure — touch, warmth, beauty, slowness", type: "V" },
  ]},
  { dim: "vitality", text: "What restores you more — a full night of sleep or an hour in a place you find beautiful?", options: [
    { text: "Honestly? Beauty. An hour by the sea or in a place I love does more than sleep sometimes", type: "V" },
    { text: "Sleep — always sleep, I'm just so tired", type: "D" },
    { text: "Neither really works anymore", type: "D" },
    { text: "I've never thought about beauty as something that restores — but now that you ask, maybe", type: "M" },
  ]},
  { dim: "alertness", text: "Right now, as you read this — where is your body holding? Not injury. Not pain. The tension that lives there even when nothing is wrong.", options: [
    { text: "Jaw — I clench without noticing, my face carries everything", type: "S" },
    { text: "Shoulders and neck — the weight sits there, always", type: "S" },
    { text: "Stomach or solar plexus — a tightness that never fully releases", type: "S" },
    { text: "I feel relatively at ease — my body isn't bracing right now", type: "V" },
  ]},
  { dim: "connection", text: "Be honest — when you're with the people you love most, how much of you is actually in the room?", options: [
    { text: "I perform presence — I say the right things, I smile, but inside I'm far away", type: "M" },
    { text: "I've noticed them stopping to try to reach me — and that scares me more than I admit", type: "D" },
    { text: "My body is there but my mind is somewhere else — work, plans, the next thing", type: "S" },
    { text: "Most of me — I'm present, I feel them, I'm there", type: "V" },
  ]},
  { dim: "connection", text: "If you're honest with yourself right now — do you know what you need?", options: [
    { text: "Yes — I feel it clearly, even if I can't always get it", type: "V" },
    { text: "I used to — now I organize my life around what others need from me", type: "S" },
    { text: "No — I've been so focused on functioning that I've lost track of my own needs entirely", type: "D" },
    { text: "I know what I need to do — but that's different from knowing what I need to feel", type: "M" },
  ]},
  { dim: "performance", text: "How do you feel about your success right now?", options: [
    { text: "Proud but tired — I earned this but the price keeps going up", type: "M" },
    { text: "Proud and grounded — it reflects something real in me", type: "V" },
    { text: "Trapped — my success has become a cage I built myself", type: "S" },
    { text: "Empty — I achieved what I set out to achieve and it doesn't feel like I thought it would", type: "D" },
  ]},
  { dim: "aliveness", text: "When you encounter something truly beautiful — not just pleasant, but beautiful in a way that feels almost sacred — does it give you hope?", options: [
    { text: "I feel a flash of something but it turns to sadness quickly — like seeing a window I can't open", type: "M" },
    { text: "I don't encounter things that feel sacred anymore — my world has become very functional", type: "D" },
    { text: "Yes — beauty reminds me that there's something larger than my daily life", type: "V" },
    { text: "It used to — now beauty feels like it belongs to a world I've been locked out of", type: "D" },
  ]},
];

// ── Score Calculation (UNCHANGED) ──
const SCORE_MAP = { V: 3, M: 1.5, S: 1, D: 0.5 };

function calcScores(answers) {
  const raw = {};
  const questionCount = {};
  DIMENSIONS.forEach((d) => { raw[d.key] = 0; questionCount[d.key] = 0; });
  answers.forEach((a, i) => {
    const dim = QUESTIONS[i].dim;
    raw[dim] += SCORE_MAP[a.type];
    questionCount[dim]++;
  });
  const scores = {};
  DIMENSIONS.forEach((d) => {
    const maxPossible = questionCount[d.key] * 3;
    scores[d.key] = maxPossible > 0 ? Math.round((raw[d.key] / maxPossible) * 100) / 10 : 5;
  });
  return scores;
}

// ── Profile Definitions (descriptions trimmed to 2 paragraphs for results page) ──
const PROFILES = {
  sunfire: { key: "sunfire", name: "Sunfire", tagline: "Burning bright — and burning through.",
    description: "Everything about you burns bright. Your energy, your pace, your capacity to hold a room, carry a team, close a deal, solve a crisis. It's extraordinary. People look at you and see someone who has it all figured out. They marvel at what you carry.\n\nWhat they don't see: you can't stop. It's not that you don't want to. Your system genuinely doesn't know another speed. Your nervous system has been running in activation mode for so long that intensity is the only state it trusts.",
    hope: "The fact that you're reading this means something in you paused. Even for a moment. That pause matters more than you think. What your body is actually asking for, and why stillness feels dangerous instead of restful, is what the six dimensions underneath this pattern reveal.",
    color: "#D4845A" },
  velvetblade: { key: "velvetblade", name: "Velvet Blade", tagline: "Elegant and dangerous. The danger is to yourself.",
    description: "You've built something remarkable: a version of you that is composed, graceful under pressure, impeccable in every visible way. People admire your control. They trust your steadiness. They have no idea what it costs.\n\nBecause the elegance became the armour. The composure became the cage. Somewhere along the way, the polished exterior stopped being a choice and became the only version of you that exists.",
    hope: "Nobody in your world says this to you because you look like you don't need it: the composure is real, but so is the woman underneath it. What the composure is actually costing you, and where your system is paying the price, is mapped across six dimensions that this Pulse can only point toward.",
    color: "#9B7A8F" },
  eclipse: { key: "eclipse", name: "Eclipse", tagline: "The light didn't leave. Something moved in front of it.",
    description: "Something bright has been covered over. Not destroyed, but blocked. You're still there. Your intelligence, your depth, your capacity. All of it exists. But there's something between you and the world. A veil. A distance.\n\nYou function. You deliver. You show up. But the experience of being alive has gone flat. Food doesn't taste the way it used to. Weekends feel the same as weekdays. You are not sad, exactly. You are not anything, exactly. That's the problem.",
    hope: "The fact that you took this assessment means the eclipse is already shifting. You didn't come here because you've given up. You came because something in you is still looking. What your system turned off, and in what order, is the map that changes what you do next.",
    color: "#6B7A8B" },
  summerstorm: { key: "summerstorm", name: "Summer Storm", tagline: "You feel everything. That's not the problem.",
    description: "You feel everything. You walk into a room and absorb it: the tension, the beauty, the unspoken things, the energy. You always have. It's your gift. It's also what's overwhelming you.\n\nSensitivity without a container isn't a superpower. It's a flood. Your system takes in more than it can process. Emotions hit hard and fast. Other people's pain lands in your body. Beauty reaches you, sometimes so intensely it aches.",
    hope: "You need to hear this: your sensitivity is not your problem. It never was. But sensitivity without a container will keep flooding you. What kind of container YOUR specific system needs is what the full Profile maps.",
    color: "#8B6B5C" },
  heartwood: { key: "heartwood", name: "Heartwood", tagline: "The one who holds everything up. The one nobody thinks to check on.",
    description: "The innermost part of the tree. The densest, strongest wood, the part that holds everything up. Nobody sees it. Nobody checks on it. But without it, the whole structure falls.\n\nThat's you. In your family, in your company, in your friendships. You're the one who holds. Who organises, carries, shows up, remembers, takes care of. You make beautiful spaces for others. Beautiful experiences for others.",
    hope: "You've given so much to so many people. I want you to know that I see that. What I also see, and what this Pulse can only begin to show, is where the giving is drawing from and what it's costing underneath.",
    color: "#7A8B5B" },
  newmoon: { key: "newmoon", name: "New Moon", tagline: "Invisible — but already pulling the tide.",
    taglineHigh: "You are what most women in leadership are searching for.",
    description: "Something shifted in you, maybe recently, maybe it's been building. You can feel it. Not a dramatic change. More like a direction. A quiet knowing that the way you've been living isn't the way you want to keep living.\n\nYou're not healed. You're not \"there.\" But you're aware in a way you weren't before. You've started asking questions you'd stopped asking: what do I want? Who am I outside of what I do?",
    descriptionHigh: "Your results are rare. Genuinely rare.\n\nMcKinsey data shows that 61% of women in management and executive positions report operating under sustained pressure that compromises their health and relationships. Most of your peers are operating in survival mode — bracing, pushing, performing, depleting. You're not.",
    hope: "You're at the beginning of something and you can feel it. That stirring isn't confusion. It's your nervous system waking up. What it's waking up toward, and how to protect it while it's still fragile, is what the six dimensions reveal.",
    hopeHigh: "I want you to hear this clearly: what you have is not normal. Not among the women I work with. Not among the leaders I've sat across from for the past decade. Most of them are magnificent and depleted. You're magnificent and present. That's a different thing entirely.",
    color: "#5B7A7A" },
};

// ── Profile Assignment (UNCHANGED — DO NOT MODIFY) ──
function assignProfile(scores) {
  const dims = DIMENSIONS.map((d) => ({ key: d.key, score: scores[d.key] }));
  const sorted = [...dims].sort((a, b) => a.score - b.score);
  const lowest = sorted[0];
  const highest = sorted[5];
  const avg = dims.reduce((s, d) => s + d.score, 0) / dims.length;
  const variance = dims.reduce((sum, d) => sum + Math.pow(d.score - avg, 2), 0) / dims.length;
  const spread = Math.sqrt(variance);
  const range = highest.score - lowest.score;
  const contracted = dims.filter((d) => d.score <= 2.5).length;
  const emerging = dims.filter((d) => d.score > 5 && d.score <= 7.5).length;
  const open = dims.filter((d) => d.score > 7.5).length;
  const hasSpike = highest.score >= 7;
  const anyLow = dims.some((d) => d.score <= 5);

  if (range < 1.0) {
    if (avg >= 7) return PROFILES.newmoon;
    if (avg <= 4) return PROFILES.eclipse;
    return PROFILES.velvetblade;
  }
  if (avg >= 8 && range < 5.5) return PROFILES.newmoon;
  if (avg <= 2.5) {
    if (scores.performance >= avg + 2) return PROFILES.sunfire;
    if (scores.sensitivity >= 6) return PROFILES.summerstorm;
    return PROFILES.eclipse;
  }
  if (contracted >= 4 && !hasSpike) return PROFILES.eclipse;

  const isEclipse = ((scores.sensitivity <= 3 && scores.vitality <= 3.5 && scores.performance <= 5 && scores.connection <= 4.5 && !hasSpike) || (avg <= 3.5 && contracted >= 2 && scores.performance <= 5 && !hasSpike && range <= 3));
  const isSummerStorm = (scores.sensitivity >= 7 && scores.sensitivity >= avg + 1.5 && scores.sensitivity === highest.score && anyLow);
  const isSunfire = (scores.alertness <= 3.5 && scores.alertness <= scores.performance && (scores.vitality <= 5 || scores.alertness <= 2.5) && avg <= 5.5);
  const isVelvetBlade = ((scores.sensitivity <= 4.5 && scores.alertness >= 2.5 && scores.sensitivity <= avg && scores.sensitivity <= scores.connection) || (scores.sensitivity <= 2.5 && scores.sensitivity === lowest.score));
  const isHeartwood = ((scores.connection <= 5 && scores.aliveness <= 5 && scores.connection <= scores.sensitivity && !isEclipse) || (scores.connection <= 3.5 && !isEclipse) || (lowest.key === "connection" && scores.connection <= avg - 2 && !isEclipse));
  const isNewMoon = (avg > 5 && avg < 8.5 && spread >= 1.5 && range >= 3.5 && (emerging + open) >= 2);

  if (isEclipse) return PROFILES.eclipse;
  if (isSummerStorm && isHeartwood) { if (scores.sensitivity >= 8) return PROFILES.summerstorm; if (scores.connection <= avg - 3) return PROFILES.heartwood; return PROFILES.summerstorm; }
  if (isSummerStorm) return PROFILES.summerstorm;
  if (isSunfire && isHeartwood) { return scores.performance <= 4 ? PROFILES.sunfire : PROFILES.heartwood; }
  if (isVelvetBlade) return PROFILES.velvetblade;
  if (isHeartwood) return PROFILES.heartwood;
  if (isSunfire) return PROFILES.sunfire;
  if (isNewMoon) return PROFILES.newmoon;

  if (avg <= 5.5) { const fb = {alertness:"sunfire",sensitivity:"velvetblade",connection:"heartwood",vitality:"eclipse",aliveness:"heartwood",performance:"velvetblade"}; return PROFILES[fb[lowest.key] || "newmoon"]; }
  if (avg > 5) { if (lowest.score > 5) return PROFILES.newmoon; const fb = {alertness:"sunfire",sensitivity:"velvetblade",connection:"heartwood",aliveness:"heartwood",vitality:"sunfire",performance:"velvetblade"}; return PROFILES[fb[lowest.key] || "newmoon"]; }
  return PROFILES.newmoon;
}

function getSecondaryProfile(scores, primaryKey) {
  const profileScores = {};
  const avg = Object.values(scores).reduce((s, v) => s + v, 0) / 6;
  profileScores.sunfire = (10 - scores.alertness) * 2 + scores.performance + (10 - scores.vitality);
  profileScores.velvetblade = (10 - scores.sensitivity) * 2 + scores.alertness + (10 - scores.connection);
  profileScores.eclipse = (10 - scores.sensitivity) + (10 - scores.vitality) + (10 - scores.aliveness) + (10 - scores.connection);
  profileScores.summerstorm = scores.sensitivity * 2 + (10 - scores.alertness) + (10 - scores.vitality);
  profileScores.heartwood = (10 - scores.connection) * 2 + (10 - scores.aliveness) + scores.performance * 0.5;
  profileScores.newmoon = Math.abs(avg - 5.5) < 2 ? 15 : 5;
  profileScores.newmoon += scores.sensitivity > 5 ? 5 : 0;
  profileScores.newmoon += scores.aliveness > 5 ? 5 : 0;
  delete profileScores[primaryKey];
  const sorted = Object.entries(profileScores).sort((a, b) => b[1] - a[1]);
  return PROFILES[sorted[0][0]];
}

// ── Radar Chart (LIGHT VERSION for results page) ──
function RadarChart({ scores, size = 260, profileColor, light = false, secondaryColor = null }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const dimKeys = DIMENSIONS.map((d) => d.key);
  const getPoint = (i, val, max = 10) => {
    const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    const dist = (val / max) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  };

  const gridStroke = light ? "rgba(44,44,44,0.10)" : "rgba(255,255,255,0.09)";
  const gridStrokeOuter = light ? "rgba(44,44,44,0.18)" : "rgba(255,255,255,0.2)";
  const labelColor = light ? R.text : T.text;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      {[2.5, 5, 7.5, 10].map((level) => {
        const pts = Array.from({ length: 6 }, (_, i) => getPoint(i, level));
        return (<polygon key={level} points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={level === 10 ? gridStrokeOuter : gridStroke} strokeWidth={level === 10 ? 1.2 : 0.6} />);
      })}
      {Array.from({ length: 6 }, (_, i) => {
        const end = getPoint(i, 10);
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke={gridStroke} strokeWidth={0.6} />;
      })}
      {/* Secondary undertone — subtle dashed shape at average level */}
      {secondaryColor && (() => {
        const avg = dimKeys.reduce((s, k) => s + Math.max(scores[k], 1.2), 0) / 6;
        const undertoneLevel = Math.max(avg * 0.7, 2);
        const pts = Array.from({ length: 6 }, (_, i) => getPoint(i, undertoneLevel));
        return (<polygon points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill={`${secondaryColor}0A`} stroke={secondaryColor} strokeWidth={1} strokeDasharray="4 4" opacity={0.35} />);
      })()}
      <polygon
        points={dimKeys.map((k, i) => { const p = getPoint(i, Math.max(scores[k], 1.2)); return `${p.x},${p.y}`; }).join(" ")}
        fill={`${profileColor}22`} stroke={profileColor} strokeWidth={2.5}
      />
      {dimKeys.map((k, i) => {
        const p = getPoint(i, Math.max(scores[k], 1.2));
        return <circle key={k} cx={p.x} cy={p.y} r={4.5} fill={profileColor} />;
      })}
      {/* Secondary undertone center dot */}
      {secondaryColor && <circle cx={cx} cy={cy} r={4} fill="none" stroke={secondaryColor} strokeWidth={1} strokeDasharray="2 2" opacity={0.4} />}
      {DIMENSIONS.map((d, i) => {
        const p = getPoint(i, 12.5);
        return (<text key={d.key} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 11, fontFamily: T.fonts.ui, fill: labelColor, letterSpacing: "0.06em" }}>{d.label}</text>);
      })}
      <circle cx={cx} cy={cy} r={2.5} fill={profileColor} opacity={0.7} />
    </svg>
  );
}

// ── Fade Wrapper ──
function Fade({ children, dep }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { setVis(false); const t = setTimeout(() => setVis(true), 60); return () => clearTimeout(t); }, [dep]);
  return (<div style={{ opacity: vis ? 1 : 0, transition: "opacity 0.5s ease", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>{children}</div>);
}

// ── Assessment Screens (ALL UNCHANGED — dark theme) ──

function IntroScreen({ onStart }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 50); }, []);
  return (
    <div style={{ opacity: vis ? 1 : 0, transition: "opacity 1.2s ease", textAlign: "center", padding: "80px 24px", maxWidth: 540, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <p style={{ fontFamily: T.fonts.display, fontSize: 28, fontWeight: 400, color: T.text, letterSpacing: "0.35em", marginBottom: 40 }}>ELIA</p>
      <div style={{ width: 40, height: 1, background: T.accent, margin: "0 auto 40px", opacity: 0.6 }} />
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontFamily: T.fonts.display, fontSize: "clamp(34px, 7vw, 50px)", fontWeight: 300, color: T.text, letterSpacing: "0.07em" }}>ANSR</span>
        <span style={{ fontFamily: T.fonts.display, fontSize: "clamp(16px, 2.5vw, 19px)", color: T.accent, letterSpacing: "0.15em", fontWeight: 300, marginLeft: 14, position: "relative", top: -2 }}>PULSE</span>
      </div>
      <p style={{ fontFamily: T.fonts.body, fontSize: 13, color: T.text, opacity: 0.6, letterSpacing: "0.1em", marginBottom: 48 }}>Aesthetic Nervous System Regulation</p>
      <p style={{ fontFamily: T.fonts.body, fontSize: "clamp(17px, 3vw, 20px)", color: T.text, lineHeight: 1.8, marginBottom: 60, fontStyle: "italic", opacity: 0.85 }}>Eleven questions that map what your nervous system<br />has stopped letting you feel.</p>
      <button onClick={onStart} style={{ fontFamily: T.fonts.display, fontSize: 15, letterSpacing: "0.15em", textTransform: "uppercase", background: "transparent", border: `1px solid ${T.accent}`, color: T.accent, padding: "16px 48px", cursor: "pointer", transition: "all 0.4s ease" }}
        onMouseEnter={(e) => { e.target.style.background = T.accent; e.target.style.color = T.bg; }}
        onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.color = T.accent; }}>Begin</button>
      <p style={{ fontFamily: T.fonts.body, fontSize: 12, color: T.textDim, marginTop: 36, letterSpacing: "0.06em" }}>2 minutes · Confidential</p>
    </div>
  );
}

function SettleScreen({ onReady }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 300); }, []);
  return (
    <div style={{ opacity: vis ? 1 : 0, transition: "opacity 1s ease", textAlign: "center", padding: "80px 24px", maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <p style={{ fontFamily: T.fonts.display, fontSize: 28, fontWeight: 400, color: T.text,
        letterSpacing: "0.4em", marginBottom: 12 }}>ELIA</p>
      <div style={{ width: 32, height: 1, background: T.accent, marginBottom: 40, opacity: 0.5 }} />
      <p style={{ fontFamily: T.fonts.body, fontSize: 17, color: T.text, lineHeight: 1.9, marginBottom: 32, fontStyle: "italic" }}>Find a quiet moment.<br />This works best when you're alone.</p>
      <p style={{ fontFamily: T.fonts.body, fontSize: 15, color: T.textMuted, lineHeight: 1.8, marginBottom: 60 }}>Answer from your body, not your mind.<br />There are no right answers. Only honest ones.</p>
      <button onClick={onReady} style={{ fontFamily: T.fonts.display, fontSize: 15, letterSpacing: "0.12em", background: T.warmWhite, border: "none", color: T.warmCharcoal, padding: "16px 48px", cursor: "pointer", transition: "all 0.4s ease" }}
        onMouseEnter={(e) => { e.target.style.background = "#FFFFFF"; }}
        onMouseLeave={(e) => { e.target.style.background = T.warmWhite; }}>I'm ready</button>
    </div>
  );
}

function QuestionScreen({ question, index, total, onAnswer, onBack }) {
  const [selected, setSelected] = useState(null);
  const handleSelect = (opt, i) => { setSelected(i); setTimeout(() => { setSelected(null); onAnswer(opt); }, 500); };
  return (
    <Fade dep={index}>
      <div style={{ padding: "40px 24px", maxWidth: 580, margin: "0 auto", width: "100%" }}>
        <p style={{ fontFamily: T.fonts.display, fontSize: 20, fontWeight: 400, color: T.text,
          letterSpacing: "0.35em", textAlign: "center", marginBottom: 32 }}>ELIA</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {index > 0 && (<button onClick={onBack} style={{ background: "none", border: "none", color: T.textDim, cursor: "pointer", fontFamily: T.fonts.body, fontSize: 13, padding: "4px 0", transition: "color 0.3s ease" }} onMouseEnter={(e) => { e.target.style.color = T.accent; }} onMouseLeave={(e) => { e.target.style.color = T.textDim; }}>←</button>)}
            <span style={{ fontFamily: T.fonts.ui, fontSize: 12, color: T.accent, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 500 }}>{DIMENSIONS.find((d) => d.key === question.dim)?.label}</span>
          </div>
          <span style={{ fontFamily: T.fonts.ui, fontSize: 12, color: T.textDim, letterSpacing: "0.06em" }}>{index + 1} of {total}</span>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 6, justifyContent: "center" }}>
          {Array.from({ length: total }, (_, i) => (<div key={i} style={{ width: i <= index ? 18 : 8, height: 2, background: i <= index ? T.accent : "rgba(255,255,255,0.1)", borderRadius: 1, transition: "all 0.5s ease" }} />))}
        </div>
        <h2 style={{ fontFamily: T.fonts.body, fontSize: "clamp(18px, 3.5vw, 24px)", color: T.text, fontWeight: 400, lineHeight: 1.65, margin: "36px 0 40px", fontStyle: "italic" }}>{question.text}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {question.options.map((opt, i) => (
            <button key={i} onClick={() => handleSelect(opt, i)} style={{ fontFamily: T.fonts.ui, fontSize: 14, color: selected === i ? "#FFFFFF" : T.warmCharcoal, background: selected === i ? T.accent : T.warmWhite, border: `1px solid ${selected === i ? T.accent : "rgba(220,215,200,0.4)"}`, padding: "18px 22px", textAlign: "left", cursor: "pointer", transition: "all 0.3s ease", lineHeight: 1.6, borderRadius: 3 }}
              onMouseEnter={(e) => { if (selected !== i) { e.target.style.borderColor = T.accent + "66"; e.target.style.background = "rgba(255,252,248,1)"; } }}
              onMouseLeave={(e) => { if (selected !== i) { e.target.style.borderColor = "rgba(220,215,200,0.4)"; e.target.style.background = T.warmWhite; } }}>
              {opt.text}
            </button>
          ))}
        </div>
      </div>
    </Fade>
  );
}

function EmailScreen({ onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 200); }, []);
  const inputStyle = { fontFamily: T.fonts.body, fontSize: 15, background: T.warmWhite, border: `1px solid rgba(220,215,200,0.4)`, color: T.warmCharcoal, padding: "15px 16px", width: "100%", outline: "none", boxSizing: "border-box", borderRadius: 3, transition: "border-color 0.3s ease" };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "40px 24px" }}>
      <div style={{ opacity: vis ? 1 : 0, transition: "opacity 0.8s ease", textAlign: "center", padding: "48px 32px", maxWidth: 420, width: "100%" }}>
        <p style={{ fontFamily: T.fonts.display, fontSize: 28, fontWeight: 400, color: T.text,
          letterSpacing: "0.4em", marginBottom: 12 }}>ELIA</p>
        <div style={{ width: 32, height: 1, background: T.accent, margin: "0 auto 32px", opacity: 0.5 }} />
        <p style={{ fontFamily: T.fonts.display, fontSize: 24, fontWeight: 300, color: T.text, letterSpacing: "0.04em", marginBottom: 8 }}>Your ANSR <span style={{ color: T.accent }}>Pulse</span> is ready</p>
        <div style={{ width: 30, height: 1, background: T.accent, margin: "0 auto 24px", opacity: 0.5 }} />
        <p style={{ fontFamily: T.fonts.body, fontSize: 15, color: T.textMuted, fontStyle: "italic", lineHeight: 1.7, marginBottom: 32 }}>Enter your name and email to see your results.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          <input type="text" placeholder="Your first name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} onFocus={(e) => { e.target.style.borderColor = T.accent; }} onBlur={(e) => { e.target.style.borderColor = "rgba(220,215,200,0.4)"; }} />
          <input type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} onFocus={(e) => { e.target.style.borderColor = T.accent; }} onBlur={(e) => { e.target.style.borderColor = "rgba(220,215,200,0.4)"; }} />
        </div>
        <button onClick={() => { if (name.trim() && email.trim()) onSubmit(name.trim(), email.trim()); }} style={{ fontFamily: T.fonts.display, fontSize: 15, letterSpacing: "0.12em", textTransform: "uppercase", background: T.accent, border: "none", color: "#FFFFFF", padding: "15px 40px", cursor: "pointer", transition: "all 0.3s ease", width: "100%", opacity: name.trim() && email.trim() ? 1 : 0.35, borderRadius: 2 }}
          onMouseEnter={(e) => { if (name.trim() && email.trim()) e.target.style.background = T.accentBright; }}
          onMouseLeave={(e) => { e.target.style.background = T.accent; }}>See My Results</button>
        <p style={{ fontFamily: T.fonts.body, fontSize: 12, color: T.textDim, marginTop: 20 }}>Your data is confidential. We don't share it. Ever.</p>
      </div>
    </div>
  );
}

function BreathingScreen({ onComplete }) {
  const [vis, setVis] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [phase, setPhase] = useState(0);
  useEffect(() => { setTimeout(() => setVis(true), 200); setTimeout(() => setPulse(true), 600); setTimeout(() => setPhase(1), 2200); setTimeout(() => onComplete(), 4500); }, [onComplete]);
  return (
    <div style={{ opacity: vis ? 1 : 0, transition: "opacity 1s ease", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(196,137,106,0.16) 0%, transparent 60%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: pulse ? 260 : 130, height: pulse ? 260 : 130, borderRadius: "50%", border: `1px solid ${T.accent}`, opacity: pulse ? 0.45 : 0.6, transition: "all 3.5s ease-in-out" }} />
      <div style={{ width: pulse ? 170 : 85, height: pulse ? 170 : 85, borderRadius: "50%", border: `1.5px solid ${T.accent}`, opacity: pulse ? 0.8 : 0.95, transition: "all 2.5s ease-in-out", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <p style={{ fontFamily: T.fonts.display, fontSize: 28, fontWeight: 400, color: T.text, letterSpacing: "0.35em", margin: 0, position: "absolute" }}>ELIA</p>
      </div>
      <p style={{ fontFamily: T.fonts.body, fontSize: 17, color: T.text, marginTop: 48, fontStyle: "italic", opacity: vis ? 1 : 0, transition: "opacity 0.8s ease", letterSpacing: "0.03em" }}>{phase === 0 ? "Reading your pattern" : "Mapping your dimensions"}</p>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// RESULTS SCREEN — FINAL LOCKED VERSION
// Light theme. Single CTA. Profile €97.
// ══════════════════════════════════════════════════════════════

function ResultsScreen({ scores, profile, secondary, userName }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 300); }, []);

  const dims = DIMENSIONS.map((d) => ({
    ...d, score: scores[d.key], band: getBand(scores[d.key]),
    insight: INSIGHTS[d.key][getBand(scores[d.key]).label],
  }));

  const dimsSorted = [...dims].sort((a, b) => b.score - a.score);
  const topDims = dimsSorted.slice(0, 2);
  const lowestDim = dimsSorted[dimsSorted.length - 1];
  // 3 locked dims = everything except top 2 and lowest
  const lockedDims = dimsSorted.filter(d => !topDims.includes(d) && d.key !== lowestDim.key).slice(0, 3);

  const avg = dims.reduce((s, d) => s + d.score, 0) / dims.length;
  const isHighScorer = profile.key === "newmoon" && avg >= 7.5;

  const displayTagline = isHighScorer && profile.taglineHigh ? profile.taglineHigh : profile.tagline;
  const displayDescription = isHighScorer && profile.descriptionHigh ? profile.descriptionHigh : profile.description;
  const displayHope = isHighScorer && profile.hopeHigh ? profile.hopeHigh : profile.hope;

  const descParagraphs = displayDescription.split("\n\n").slice(0, 2);
  const hopeSentences = displayHope.split('. ');
  const shortHope = hopeSentences.slice(0, 3).join('. ') + (hopeSentences.length > 3 ? '.' : '');

  // ── VIDEO EMBED URLs ──
  const VIDEO_URLS = {
    sunfire: "https://iframe.mediadelivery.net/embed/628520/9044733f-29c2-441a-8213-d5b9f999918e",
    velvetblade: "https://iframe.mediadelivery.net/embed/628520/8d1cfa20-b102-42c1-b476-15ce50fa1421",
    eclipse: "https://iframe.mediadelivery.net/embed/628520/60cc42ef-48a8-4598-9c20-5205258a7f67",
    summerstorm: "https://iframe.mediadelivery.net/embed/628520/1d73c5cc-d20a-4728-ae2e-515894fb3f01",
    heartwood: "https://iframe.mediadelivery.net/embed/628520/79974780-88d0-4ff4-8d87-35d70aaddccd",
    newmoon: "https://iframe.mediadelivery.net/embed/628520/df7df249-c692-4624-8ae6-babf14a3ec46",
  };
  const videoUrl = VIDEO_URLS[profile.key];

  const ctaUrl = `https://ansr-profile.vercel.app?p=${profile.key}${secondary ? '&u=' + secondary.key : ''}`;

  return (
    <div style={{ opacity: vis ? 1 : 0, transition: "opacity 1s ease",
      background: R.bg, minHeight: "100vh",
      padding: "48px 24px 80px", maxWidth: 580, margin: "0 auto" }}>

      {/* ── Profile name + tagline ── */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <p style={{ fontFamily: T.fonts.display, fontSize: 24, fontWeight: 400, color: R.text,
          letterSpacing: "0.3em", marginBottom: 20 }}>ELIA</p>

        <p style={{ fontFamily: T.fonts.ui, fontSize: 11, color: R.accent,
          letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 28 }}>
          Your ANSR Pulse Signature</p>

        <h1 style={{ fontFamily: T.fonts.display, fontSize: "clamp(36px, 8vw, 52px)",
          fontWeight: 300, color: R.text, letterSpacing: "0.04em", marginBottom: 14 }}>
          {profile.name}</h1>

        <p style={{ fontFamily: T.fonts.body, fontSize: 19, color: R.accent,
          fontStyle: "italic", lineHeight: 1.6, marginBottom: 48 }}>
          {displayTagline}</p>

        <div style={{ width: 30, height: 1, background: R.accent, margin: "0 auto 28px", opacity: 0.25 }} />

        <p style={{ fontFamily: T.fonts.ui, fontSize: 11, color: R.textMuted,
          letterSpacing: "0.06em", lineHeight: 1.6 }}>
          Built on research from Stanford, UCL, Max Planck Institute,<br />and the Polyvagal Institute.</p>
      </div>

      {/* ── Video ── */}
      <div style={{ marginBottom: 36 }}>
        {videoUrl ? (
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden",
            borderRadius: 4, border: `1px solid ${R.border}` }}>
            <iframe src={videoUrl} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
              allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title={`ANSR ${profile.name}`} />
          </div>
        ) : (
          <div style={{ aspectRatio: "16/9", background: R.bgAlt, border: `1px solid ${R.border}`,
            borderRadius: 4, display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", border: `2px solid ${R.accent}`,
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 0, height: 0, borderTop: "10px solid transparent",
                borderBottom: "10px solid transparent", borderLeft: `16px solid ${R.accent}`, marginLeft: 4 }} />
            </div>
            <p style={{ fontFamily: T.fonts.body, fontSize: 14, color: R.textMuted,
              fontStyle: "italic" }}>A message from Alexandre about your {profile.name} result</p>
          </div>
        )}
      </div>

      {/* ── Description (2 paragraphs) ── */}
      <div style={{ marginBottom: 32 }}>
        {descParagraphs.map((p, i) => (
          <p key={i} style={{ fontFamily: T.fonts.body, fontSize: 16.5, color: R.text,
            lineHeight: 1.85, marginBottom: 16 }}>{p}</p>
        ))}
      </div>

      {/* ── Hope quote — emotional peak ── */}
      <div style={{ marginBottom: 36, borderLeft: `2px solid ${profile.color}`, paddingLeft: 20 }}>
        <p style={{ fontFamily: T.fonts.body, fontSize: 16, color: R.text,
          lineHeight: 1.9, fontStyle: "italic" }}>{shortHope}</p>
      </div>

      {/* ── SINGLE CTA — Profile €97 ── */}
      <div style={{ background: R.accentGlow, border: `1px solid ${R.borderAccent}`,
        padding: "32px 24px", textAlign: "center", marginBottom: 8, borderRadius: 4 }}>
        <p style={{ fontFamily: T.fonts.display, fontSize: 21, fontWeight: 300,
          color: R.text, marginBottom: 6 }}>Your Pulse named the pattern.</p>
        <p style={{ fontFamily: T.fonts.display, fontSize: 21, fontWeight: 300,
          color: R.accent, marginBottom: 24 }}>Your Profile shows you what it's costing and where to start.</p>
        <a href={ctaUrl} target="_blank" rel="noopener noreferrer" style={{
          display: "inline-block", fontFamily: T.fonts.display, fontSize: 15,
          letterSpacing: "0.12em", textTransform: "uppercase",
          background: R.accentBright, color: "#FFFFFF", padding: "15px 36px",
          textDecoration: "none", cursor: "pointer", transition: "all 0.3s ease",
          borderRadius: 2, boxShadow: "0 2px 12px rgba(176,125,98,0.2)" }}
          onMouseEnter={(e) => { e.target.style.boxShadow = "0 4px 20px rgba(176,125,98,0.3)"; }}
          onMouseLeave={(e) => { e.target.style.boxShadow = "0 2px 12px rgba(176,125,98,0.2)"; }}>
          Your full ANSR Profile — €97
        </a>
        <p style={{ fontFamily: T.fonts.body, fontSize: 12, color: R.textDim,
          marginTop: 12 }}>Instant PDF · 14 pages · Takes 12 minutes</p>
      </div>

      <p style={{ fontFamily: T.fonts.ui, fontSize: 12, color: R.accent,
        textAlign: "center", marginBottom: 40, letterSpacing: "0.06em", lineHeight: 1.7, fontWeight: 500 }}>
        Developed for senior leaders and founders<br />in luxury, finance, art, law, and architecture.</p>

      {/* ── Divider ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 0 40px" }}>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${R.border})` }} />
        <div style={{ width: 4, height: 4, background: R.accent, transform: "rotate(45deg)", opacity: 0.4 }} />
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${R.border}, transparent)` }} />
      </div>

      {/* ── Radar Chart ── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 40 }}>
        <p style={{ fontFamily: T.fonts.ui, fontSize: 11, color: R.accent,
          letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 24, textAlign: "center" }}>
          Your ANSR Map — {userName}</p>
        <RadarChart scores={scores} profileColor={profile.color} light={true} secondaryColor={secondary ? secondary.color : null} />
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: profile.color }} />
            <span style={{ fontFamily: T.fonts.display, fontSize: 16, color: R.text, letterSpacing: "0.04em" }}>{profile.name}</span>
            <span style={{ fontFamily: T.fonts.body, fontSize: 12, color: R.textDim, fontStyle: "italic", marginLeft: 2 }}>primary</span>
          </div>
          {secondary && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "transparent",
                border: `1.5px solid ${secondary.color}`, opacity: 0.6 }} />
              <span style={{ fontFamily: T.fonts.display, fontSize: 14, color: R.textMuted, letterSpacing: "0.04em" }}>{secondary.name}</span>
              <span style={{ fontFamily: T.fonts.body, fontSize: 11, color: R.textDim, fontStyle: "italic", marginLeft: 2 }}>undertone</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Top 2 dimensions — full insight ── */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontFamily: T.fonts.ui, fontSize: 11, color: R.accent,
          letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20 }}>
          Your two strongest dimensions</p>

        {topDims.map((d) => (
          <div key={d.key} style={{ marginBottom: 22, paddingBottom: 22,
            borderBottom: `1px solid ${R.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ fontFamily: T.fonts.ui, fontSize: 12, color: R.text,
                letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>{d.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: T.fonts.ui, fontSize: 12, color: d.band.colorLight || d.band.color, letterSpacing: "0.06em" }}>{d.band.label}</span>
                <span style={{ fontFamily: T.fonts.ui, fontSize: 12, color: R.textDim }}>{d.score}/10</span>
              </div>
            </div>
            <div style={{ width: "100%", height: 4, background: "rgba(44,44,44,0.06)", borderRadius: 2, marginBottom: 8 }}>
              <div style={{ width: `${Math.max(d.score * 10, 5)}%`, height: "100%",
                background: `linear-gradient(90deg, ${(d.band.colorLight || d.band.color)}88, ${d.band.colorLight || d.band.color})`,
                borderRadius: 2, transition: "width 1.2s ease" }} />
            </div>
            <p style={{ fontFamily: T.fonts.body, fontSize: 14.5, color: R.text, lineHeight: 1.7 }}>{d.insight}</p>
          </div>
        ))}
      </div>

      {/* ── Lowest dimension — highlighted, tension ── */}
      <div style={{ marginBottom: 24, padding: "20px 18px",
        border: `1px solid ${R.borderAccent}`, borderRadius: 4, background: R.accentGlow }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <span style={{ fontFamily: T.fonts.ui, fontSize: 12, color: R.accent,
            letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>{lowestDim.label}</span>
          <span style={{ fontFamily: T.fonts.ui, fontSize: 14, color: R.accent, fontWeight: 500 }}>{lowestDim.score}/10</span>
        </div>
        <div style={{ width: "100%", height: 4, background: "rgba(44,44,44,0.06)", borderRadius: 2, marginBottom: 12 }}>
          <div style={{ width: `${Math.max(lowestDim.score * 10, 5)}%`, height: "100%",
            background: `linear-gradient(90deg, ${R.accent}88, ${R.accent})`,
            borderRadius: 2, transition: "width 1.2s ease" }} />
        </div>
        <p style={{ fontFamily: T.fonts.body, fontSize: 14, color: R.accent,
          fontStyle: "italic", lineHeight: 1.7 }}>
          This is where your system is paying the highest price. Your full Profile maps what this score means for your sleep, your relationships, and the decisions sitting in front of you right now.</p>
      </div>

      {/* ── 3 locked dimensions — number + lock only ── */}
      <div style={{ marginBottom: 36, opacity: 0.65 }}>
        {lockedDims.map((d) => (
          <div key={d.key} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${R.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: T.fonts.ui, fontSize: 12, color: R.text,
                letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>{d.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: T.fonts.ui, fontSize: 12, color: R.textDim }}>{d.score}/10</span>
                <svg width="14" height="14" viewBox="0 0 14 14" style={{ opacity: 0.6 }}>
                  <rect x="3" y="6" width="8" height="6" rx="1" fill="none" stroke={R.textDim} strokeWidth="1.2"/>
                  <path d="M5 6V4.5C5 3.12 5.9 2 7 2s2 1.12 2 2.5V6" fill="none" stroke={R.textDim} strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>
        ))}
        <p style={{ fontFamily: T.fonts.body, fontSize: 12, color: R.textDim,
          fontStyle: "italic", marginTop: 8, textAlign: "center" }}>
          What these dimensions reveal about your pattern → full Profile</p>
      </div>

      {/* ── Secondary profile — one line ── */}
      {secondary && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
            <span style={{ fontFamily: T.fonts.display, fontSize: 22, fontWeight: 300, color: R.text }}>{secondary.name}</span>
            <span style={{ fontFamily: T.fonts.body, fontSize: 13, color: R.textMuted, fontStyle: "italic" }}>undertone</span>
          </div>
          <p style={{ fontFamily: T.fonts.body, fontSize: 14, color: R.textMuted, lineHeight: 1.7 }}>
            How your {profile.name} and {secondary.name} interact changes how you crash, how you recover, and what actually restores you. That map is in your full Profile.</p>
        </div>
      )}

      {/* ── Six profiles list ── */}
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontFamily: T.fonts.ui, fontSize: 11, color: R.accent,
          letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>
          The six ANSR profiles</p>
        {(() => {
          const allProfiles = [
            { name: "Sunfire", sig: "Burning bright — and burning through.", color: "#D4845A", key: "sunfire" },
            { name: "Velvet Blade", sig: "Elegant and dangerous. The danger is to yourself.", color: "#9B7A8F", key: "velvetblade" },
            { name: "Eclipse", sig: "The light didn't leave. Something moved in front of it.", color: "#6B7A8B", key: "eclipse" },
            { name: "Summer Storm", sig: "You feel everything. That's not the problem.", color: "#8B6B5C", key: "summerstorm" },
            { name: "Heartwood", sig: "The one who holds everything up. The one nobody thinks to check on.", color: "#7A8B5B", key: "heartwood" },
            { name: "New Moon", sig: "Invisible — but already pulling the tide.", color: "#5B7A7A", key: "newmoon" },
          ];
          const hers = allProfiles.find(p => p.key === profile.key);
          const others = allProfiles.filter(p => p.key !== profile.key);
          return [hers, ...others].map((p) => {
          const isHers = p.key === profile.key;
          return (
            <div key={p.key} style={{ padding: "10px 16px", marginBottom: 4,
              background: isHers ? R.accentGlow : "transparent",
              border: isHers ? `1px solid ${R.borderAccent}` : `1px solid transparent`,
              borderRadius: 3 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontFamily: T.fonts.display, fontSize: 17, fontWeight: 300,
                  color: isHers ? p.color : R.textDim }}>{p.name}</span>
                {isHers && <span style={{ fontFamily: T.fonts.body, fontSize: 12, color: R.accent,
                  fontStyle: "italic" }}>← you</span>}
              </div>
              <p style={{ fontFamily: T.fonts.body, fontSize: 12.5, margin: "2px 0 0",
                color: isHers ? R.textMuted : R.textDim, fontStyle: "italic", lineHeight: 1.5 }}>{p.sig}</p>
            </div>
          );
        })})()}
      </div>

      {/* ── Share ── */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <p style={{ fontFamily: T.fonts.body, fontSize: 15, color: R.textMuted,
          fontStyle: "italic", marginBottom: 12, lineHeight: 1.7 }}>Know someone who needs this?</p>
        <button onClick={() => { navigator.clipboard?.writeText(window.location.href); }}
          style={{ fontFamily: T.fonts.body, fontSize: 13, color: R.accent,
            letterSpacing: "0.06em", background: "transparent",
            border: `1px solid ${R.borderAccent}`, padding: "11px 28px",
            cursor: "pointer", transition: "all 0.3s ease", borderRadius: 2 }}
          onMouseEnter={(e) => { e.target.style.borderColor = R.accent; }}
          onMouseLeave={(e) => { e.target.style.borderColor = R.borderAccent; }}>
          Copy link to send her
        </button>
      </div>

      {/* ── Dark footer section ── */}
      <div style={{ background: T.bg, margin: "0 -24px", padding: "40px 24px 80px", textAlign: "center" }}>
        <p style={{ fontFamily: T.fonts.display, fontSize: 24, fontWeight: 400, color: T.text,
          letterSpacing: "0.25em", marginBottom: 8 }}>ELIA</p>
        <p style={{ fontFamily: T.fonts.body, fontSize: 13, color: T.accent,
          letterSpacing: "0.1em", marginBottom: 24, fontStyle: "italic" }}>Beauty That Heals</p>
        
        <div style={{ width: 40, height: 1, background: T.accent, margin: "0 auto 24px", opacity: 0.3 }} />

        <p style={{ fontFamily: T.fonts.body, fontSize: 12, color: T.textMuted, lineHeight: 1.8, marginBottom: 20 }}>
          ANSR™ — Aesthetic Nervous System Regulation<br />
          Developed for senior leaders and founders in luxury, finance, art, law, and architecture.</p>

        <p style={{ fontFamily: T.fonts.body, fontSize: 11, color: T.textDim, lineHeight: 1.7 }}>
          © ELIA / Uskale SA · All rights reserved<br />
          This assessment is for personal development purposes and does not constitute medical diagnosis.
        </p>
      </div>

      {/* ── Sticky CTA — single ── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0,
        background: `linear-gradient(transparent, ${R.bg}F0 20%, ${R.bg} 40%)`,
        padding: "28px 16px 16px", textAlign: "center", zIndex: 10 }}>
        <a href={ctaUrl} target="_blank" rel="noopener noreferrer" style={{
          display: "inline-block", fontFamily: T.fonts.ui, fontSize: 12,
          letterSpacing: "0.10em", textTransform: "uppercase",
          background: R.accentBright, color: "#FFFFFF", padding: "12px 28px",
          textDecoration: "none", cursor: "pointer", borderRadius: 2,
          transition: "all 0.3s ease", boxShadow: "0 2px 12px rgba(176,125,98,0.2)" }}
          onMouseEnter={(e) => { e.target.style.boxShadow = "0 4px 20px rgba(176,125,98,0.3)"; }}
          onMouseLeave={(e) => { e.target.style.boxShadow = "0 2px 12px rgba(176,125,98,0.2)"; }}>
          Your full ANSR Profile — €97
        </a>
      </div>

      <div style={{ height: 60 }} />
    </div>
  );
}


// ── App ──
export default function ANSRPulse() {
  const [screen, setScreen] = useState("intro");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [scores, setScores] = useState(null);
  const [profile, setProfile] = useState(null);
  const [secondary, setSecondary] = useState(null);
  const [userName, setUserName] = useState("");

  const handleAnswer = useCallback((opt) => {
    const newAnswers = [...answers, opt];
    setAnswers(newAnswers);
    if (qIndex < QUESTIONS.length - 1) { setQIndex(qIndex + 1); } else { setScreen("breathing"); }
  }, [answers, qIndex]);

  const handleBack = useCallback(() => {
    if (qIndex > 0) { setAnswers(answers.slice(0, -1)); setQIndex(qIndex - 1); }
  }, [answers, qIndex]);

  const handleEmail = useCallback((name, email) => {
    setUserName(name);
    try {
      const s = calcScores(answers);
      setScores(s);
      const primary = assignProfile(s);
      setProfile(primary);
      const sec = getSecondaryProfile(s, primary.key);
      setSecondary(sec);
      const resultsUrl = window.location.origin + window.location.pathname;
      fetch("/api/capture", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, profile: primary ? primary.name : "Unknown", secondary: sec ? sec.name : "", tagline: primary ? primary.tagline : "", scores: s, results_url: resultsUrl }),
      }).catch(() => {});
    } catch (err) { console.error("Scoring error:", err); }
    if (typeof fbq === 'function') fbq('track', 'Lead', { content_name: profile ? profile.name : 'Unknown' });
    setScreen("results");
    window.scrollTo(0, 0);
  }, [answers]);

  // The app background switches to light when showing results
  const isResults = screen === "results" && scores && profile;

  return (
    <div style={{ background: isResults ? R.bg : T.bg, minHeight: "100vh", color: isResults ? R.text : T.text, position: "relative", transition: "background 0.8s ease" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=EB+Garamond:ital,wght@0,400;1,400&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap" rel="stylesheet" />

      {/* Background textures — only show on dark screens */}
      {!isResults && (
        <>
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", opacity: 0.025, zIndex: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px" }} />
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse at 30% 40%, rgba(196,137,106,0.04) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(91,122,122,0.03) 0%, transparent 50%)", zIndex: 0 }} />
        </>
      )}

      <div style={{ position: "relative", zIndex: 1 }}>
        {screen === "intro" && <IntroScreen onStart={() => setScreen("settle")} />}
        {screen === "settle" && <SettleScreen onReady={() => setScreen("questions")} />}
        {screen === "questions" && (
          <QuestionScreen question={QUESTIONS[qIndex]} index={qIndex}
            total={QUESTIONS.length} onAnswer={handleAnswer} onBack={handleBack} />
        )}
        {screen === "breathing" && <BreathingScreen onComplete={() => setScreen("email")} />}
        {screen === "email" && <EmailScreen onSubmit={handleEmail} />}
        {isResults && (
          <ResultsScreen scores={scores} profile={profile} secondary={secondary} userName={userName} />
        )}
      </div>
    </div>
  );
}
