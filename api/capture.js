// ═══════════════════════════════════════════
// ANSR PULSE — Capture API (Vercel Serverless)
// Saves to Google Sheets + Sends results email via Resend + Pushes to Kajabi via Zapier
// ═══════════════════════════════════════════

// ── Profile Data for Email ──
const PROFILE_EMAIL_DATA = {
  "Sunfire": {
    color: "#D4845A",
    tagline: "Burning bright — and burning through.",
    descriptionP1: "Everything about you burns bright. Your energy, your pace, your capacity to hold a room, carry a team, close a deal, solve a crisis. It's extraordinary. People look at you and see someone who has it all figured out. They marvel at what you carry.",
    descriptionP2: "What they don't see: you can't stop. It's not that you don't want to. Your system genuinely doesn't know another speed. Your nervous system has been running in activation mode for so long that intensity is the only state it trusts. Rest feels like failure. Stillness feels dangerous.",
    hope: "I want you to know something. The fact that you're reading this means something in you paused. Even for a moment. That pause, that tiny interruption in the relentless forward motion, is more significant than you think. You have an extraordinary engine. What you need isn't to be fixed. You need to discover that the same intensity that drives your success can be turned toward beauty, toward feeling, toward the life that's been waiting on the other side of the pushing.",
  },
  "Velvet Blade": {
    color: "#9B7A8F",
    tagline: "Elegant and dangerous. The danger is to yourself.",
    descriptionP1: "You've built something remarkable: a version of you that is composed, graceful under pressure, impeccable in every visible way. People admire your control. They trust your steadiness. They have no idea what it costs.",
    descriptionP2: "Because the elegance became the armour. The composure became the cage. Somewhere along the way, the polished exterior stopped being a choice and became the only version of you that exists.",
    hope: "Nobody in your world says this to you because you look like you don't need it: the composure is real, but so is the woman underneath it. She isn't weak. She's the strongest part of you. And when she's finally safe enough to come forward, everything changes. Not your competence, that stays. What changes is the depth. The pleasure. The feeling of being alive inside the life you built, instead of performing it beautifully.",
  },
  "Eclipse": {
    color: "#6B7A8B",
    tagline: "The light didn't leave. Something moved in front of it.",
    descriptionP1: "Something bright has been covered over. Not destroyed, but blocked. You're still there. Your intelligence, your depth, your capacity. All of it exists. But there's something between you and the world. A veil. A distance.",
    descriptionP2: "You function. You deliver. You show up. But the experience of being alive has gone flat. Food doesn't taste the way it used to. Weekends feel the same as weekdays. You are not sad, exactly. You are not anything, exactly. That's the problem.",
    hope: "I know this might feel like the hardest profile to receive. But I want to tell you something: the fact that you took this assessment, that you answered honestly, that you're reading these words right now, means the eclipse is already shifting. You didn't come here because you've given up. You came because something in you is still looking. Still reaching for something that makes sense of the flatness.",
  },
  "Summer Storm": {
    color: "#8B6B5C",
    tagline: "You feel everything. That's not the problem.",
    descriptionP1: "You feel everything. You walk into a room and absorb it: the tension, the beauty, the unspoken things, the energy. You always have. It's your gift. It's also what's overwhelming you.",
    descriptionP2: "Sensitivity without a container isn't a superpower. It's a flood. Your system takes in more than it can process. Emotions hit hard and fast. Other people's pain lands in your body. Beauty reaches you, sometimes so intensely it aches.",
    hope: "You need to hear this: your sensitivity is not your problem. It never was. The world told you it was too much. Your career punished you for it. So you tried to turn it down. But what nobody else will tell you is this: your sensitivity is the rarest thing in any room you walk into. It's the reason people trust you without knowing why. It's the reason beauty reaches you when others walk past it.",
  },
  "Heartwood": {
    color: "#7A8B5B",
    tagline: "The one who holds everything up. The one nobody thinks to check on.",
    descriptionP1: "The innermost part of the tree. The densest, strongest wood, the part that holds everything up. Nobody sees it. Nobody checks on it. But without it, the whole structure falls.",
    descriptionP2: "That's you. In your family, in your company, in your friendships. You're the one who holds. Who organises, carries, shows up, remembers, takes care of. You make beautiful spaces for others. Beautiful experiences for others.",
    hope: "You've given so much to so many people. And you did it with grace, without complaint, without asking for anything in return. I want you to know that I see that. That what you've carried is extraordinary. And that the generosity that defines you isn't something you need to lose. It's something you need to finally turn inward.",
  },
  "New Moon": {
    color: "#5B7A7A",
    tagline: "Invisible — but already pulling the tide.",
    descriptionP1: "Something shifted in you, maybe recently, maybe it's been building. You can feel it. Not a dramatic change. More like a direction. A quiet knowing that the way you've been living isn't the way you want to keep living.",
    descriptionP2: "You're not healed. You're not \"there.\" But you're aware in a way you weren't before. You've started asking questions you'd stopped asking: what do I want? Who am I outside of what I do?",
    hope: "You're at the beginning of something and you can feel it. That feeling, that restless, tender, uncertain stirring, isn't confusion. It's your nervous system waking up. It's your body remembering that there's more available to you than what you've been settling for.",
  },
};

// ── Dimension labels ──
const DIMENSION_LABELS = {
  alertness: "Alertness",
  sensitivity: "Sensitivity",
  vitality: "Vitality",
  connection: "Connection",
  performance: "Performance",
  aliveness: "Aliveness",
};

// ── Profile keys map ──
const PROFILE_KEYS = {
  "Sunfire": "sunfire", "Velvet Blade": "velvetblade", "Eclipse": "eclipse",
  "Summer Storm": "summerstorm", "Heartwood": "heartwood", "New Moon": "newmoon"
};

function getBandLabel(score) {
  if (score <= 2.5) return "Contracted";
  if (score <= 5.0) return "Compressed";
  if (score <= 7.5) return "Emerging";
  return "Open";
}

// ── Build the HTML email (dark luxury design) ──
function buildEmail(data) {
  const profileData = PROFILE_EMAIL_DATA[data.profile] || PROFILE_EMAIL_DATA["New Moon"];
  const profileColor = profileData.color;
  const firstName = data.name || "";
  const profileName = data.profile || "Your Profile";
  const secondaryName = data.secondary || "";
  const tagline = profileData.tagline;
  const descP1 = profileData.descriptionP1;
  const descP2 = profileData.descriptionP2;
  const hope = profileData.hope;

  // ── CTA links to Vercel Profile LP with params ──
  const baseProfileUrl = process.env.PAID_PROFILE_URL || "https://ansr-profile.vercel.app";
  const profileKey = PROFILE_KEYS[profileName] || "sunfire";
  const secondaryKey = PROFILE_KEYS[secondaryName] || "";
  const profileUrl = secondaryKey
    ? `${baseProfileUrl}?p=${profileKey}&u=${secondaryKey}`
    : `${baseProfileUrl}?p=${profileKey}`;

  const pulseUrl = "https://ansr-pulse.vercel.app";

  // Build dimension rows
  const ALERT_COLOR = "#C27A5A";
  let dimensionRows = "";
  if (data.scores && typeof data.scores === "object") {
    const dims = Object.entries(data.scores)
      .map(([key, score]) => ({ key, label: DIMENSION_LABELS[key] || key, score: parseFloat(score) }))
      .sort((a, b) => b.score - a.score);

    const shown = dims.slice(0, 4);
    const middle = dims[4];
    const lowest = dims[5];

    shown.forEach(d => {
      const band = getBandLabel(d.score);
      const isLow = d.score < 4.5;
      const labelColor = isLow ? ALERT_COLOR : "#2C2C2C";
      const scoreColor = isLow ? ALERT_COLOR : "#9B9590";
      dimensionRows += `
      <tr><td style="padding:7px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-family:Georgia,serif;font-size:13px;color:${labelColor};letter-spacing:0.06em;text-transform:uppercase;">${d.label}</td>
          <td align="right" style="font-family:Georgia,serif;font-size:12px;color:${scoreColor};">${d.score}/10 · ${band}</td>
        </tr>
        </table>
      </td></tr>`;
    });

    if (middle) {
      dimensionRows += `
      <tr><td style="padding:7px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-family:Georgia,serif;font-size:13px;color:rgba(44,44,44,0.3);letter-spacing:0.06em;text-transform:uppercase;">${middle.label}</td>
          <td align="right" style="font-family:Georgia,serif;font-size:12px;color:rgba(44,44,44,0.3);font-style:italic;">In your full Profile</td>
        </tr>
        </table>
      </td></tr>`;
    }

    if (lowest) {
      const lowestBand = getBandLabel(lowest.score);
      dimensionRows += `
      <tr><td style="padding:14px 0 4px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="border-left:3px solid ${ALERT_COLOR};padding-left:12px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-family:Georgia,serif;font-size:13px;color:${ALERT_COLOR};letter-spacing:0.06em;text-transform:uppercase;font-weight:bold;">${lowest.label}</td>
              <td align="right" style="font-family:Georgia,serif;font-size:12px;color:${ALERT_COLOR};font-weight:bold;">${lowest.score}/10 · ${lowestBand}</td>
            </tr>
            </table>
            <p style="font-family:Georgia,serif;font-size:12px;color:${ALERT_COLOR};font-style:italic;margin:5px 0 0 0;opacity:0.85;">This is where the cost is showing up.</p>
          </td>
        </tr>
        </table>
      </td></tr>`;
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your ANSR Pulse — ${profileName}</title>
</head>
<body style="margin:0;padding:0;background-color:#1A1714;font-family:Georgia,'Times New Roman',serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1A1714;">
<tr><td align="center" style="padding:0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;">
<tr><td style="height:48px;"></td></tr>
<tr><td align="center" style="padding:0 24px;">
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:normal;color:#F0E8DC;letter-spacing:0.35em;margin:0;">ELIA</p>
</td></tr>
<tr><td align="center" style="padding:24px 24px 32px;">
  <div style="width:40px;height:1px;background-color:#C4896A;opacity:0.5;"></div>
</td></tr>
<tr><td align="center" style="padding:0 24px;">
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:11px;color:#C4896A;letter-spacing:0.15em;margin:0 0 24px 0;text-transform:uppercase;">Your ANSR Pulse Signature</p>
</td></tr>
<tr><td align="center" style="padding:0 24px;">
  <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:38px;font-weight:normal;color:#F0E8DC;letter-spacing:0.04em;margin:0 0 12px 0;">${profileName}</h1>
</td></tr>
<tr><td align="center" style="padding:0 32px;">
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:17px;color:rgba(240,232,220,0.75);font-style:italic;line-height:1.6;margin:0 0 8px 0;">${tagline}</p>
</td></tr>
${secondaryName ? `<tr><td align="center" style="padding:0 32px;">
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:13px;color:#7A7068;margin:0;">with <span style="color:#B0A494;">${secondaryName}</span> undertone</p>
</td></tr>` : ""}
<tr><td style="height:36px;"></td></tr>
<tr><td align="center" style="padding:0 48px;">
  <div style="width:100%;height:2px;background:linear-gradient(90deg,transparent,${profileColor},transparent);"></div>
</td></tr>
<tr><td style="height:36px;"></td></tr>
<tr><td style="padding:0 32px;">
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#B0A494;line-height:1.8;margin:0 0 20px 0;">${firstName},</p>
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#B0A494;line-height:1.8;margin:0 0 8px 0;">You took the ANSR Pulse. Your nervous system answered.</p>
</td></tr>
<tr><td style="height:24px;"></td></tr>
<tr><td style="padding:0 32px;">
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#B0A494;line-height:1.85;margin:0 0 16px 0;">${descP1}</p>
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#B0A494;line-height:1.85;margin:0 0 24px 0;">${descP2}</p>
</td></tr>
<tr><td style="padding:0 32px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="width:2px;background-color:${profileColor};"></td>
    <td style="padding:20px 24px;">
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#F0E8DC;line-height:1.9;font-style:italic;margin:0;">${hope}</p>
    </td>
  </tr>
  </table>
</td></tr>
<tr><td style="height:36px;"></td></tr>
<tr><td align="center" style="padding:0 48px;">
  <div style="width:100%;height:1px;background-color:rgba(255,255,255,0.06);"></div>
</td></tr>
<tr><td style="height:28px;"></td></tr>
<!-- Ivory dimensions container -->
<tr><td style="padding:0 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF5EE;border-radius:4px;">
  <tr><td style="padding:28px 24px;">
    <p style="font-family:Georgia,'Times New Roman',serif;font-size:11px;color:#C4896A;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 16px 0;">Your Six Dimensions</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${dimensionRows}
    </table>
  </td></tr>
  </table>
</td></tr>
<tr><td style="height:56px;"></td></tr>
<tr><td align="center" style="padding:0 48px;">
  <div style="width:40px;height:1px;background-color:rgba(255,255,255,0.08);"></div>
</td></tr>
<tr><td style="height:48px;"></td></tr>
<tr><td align="center" style="padding:0 32px;">
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:17px;color:#F0E8DC;line-height:1.7;margin:0 0 8px 0;">The Pulse measured 11 data points. Enough to identify your profile.</p>
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:17px;color:#C4896A;line-height:1.7;margin:0 0 32px 0;">Your full Profile measures 42. That's the complete picture.</p>
</td></tr>
<tr><td align="center" style="padding:0 32px;">
  <table role="presentation" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="background-color:#D4976F;border-radius:2px;">
      <a href="${profileUrl}" target="_blank" style="display:inline-block;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;font-weight:normal;letter-spacing:0.14em;text-transform:uppercase;color:#FFFFFF;text-decoration:none;padding:15px 36px;">See your full Profile &mdash; &euro;97</a>
    </td>
  </tr>
  </table>
  <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:10px;color:#7A7068;margin:12px 0 0 0;letter-spacing:0.05em;">42 questions · 14 pages · Instant PDF</p>
</td></tr>
<tr><td style="height:20px;"></td></tr>
<tr><td align="center" style="padding:0 32px;">
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:10px;color:#7A7068;line-height:1.6;margin:0;">Built on peer-reviewed research from Stanford, University College London,<br>the Max Planck Institute, and the Polyvagal Institute.</p>
</td></tr>
<tr><td style="height:56px;"></td></tr>
<tr><td align="center" style="padding:0 48px;">
  <div style="width:100%;height:1px;background-color:rgba(255,255,255,0.06);"></div>
</td></tr>
<tr><td style="height:36px;"></td></tr>
<tr><td align="center" style="padding:0 32px;">
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#F0E8DC;margin:0 0 4px 0;">&mdash; Alexandre</p>
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#F0E8DC;font-style:italic;margin:0;opacity:0.7;">ELIA &mdash; Beauty That Heals</p>
</td></tr>
<tr><td style="height:40px;"></td></tr>
<tr><td align="center" style="padding:0 32px;">
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#F0E8DC;line-height:1.7;margin:0;opacity:0.7;">Know a woman who needs to see her pattern?<br>The Pulse is free: <a href="${pulseUrl}" style="color:#C4896A;text-decoration:underline;text-underline-offset:3px;">${pulseUrl}</a></p>
</td></tr>
<tr><td style="height:48px;"></td></tr>
<tr><td align="center" style="padding:0 32px 48px;border-top:1px solid rgba(255,255,255,0.05);">
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:normal;color:#F0E8DC;letter-spacing:0.15em;margin:24px 0 4px 0;">ELIA</p>
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:10px;color:#7A7068;font-style:italic;letter-spacing:0.08em;margin:0 0 16px 0;">Beauty That Heals</p>
  <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:9px;color:#5A544E;line-height:1.7;margin:0;">ANSR™ — Aesthetic Nervous System Regulation<br>© ELIA / Uskale SA · All rights reserved</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// ── Main handler ──
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const data = req.body;
  if (!data || !data.email) return res.status(400).json({ error: "Missing email" });

  const results = { sheet: false, email: false, zapier: false };

  // ═══ 1. SAVE TO GOOGLE SHEET ═══
  const SHEET_WEBHOOK = process.env.GOOGLE_SHEET_WEBHOOK;
  if (SHEET_WEBHOOK) {
    try {
      const sheetRes = await fetch(SHEET_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(data),
        redirect: "follow",
      });
      results.sheet = sheetRes.ok;
      console.log("Sheet response status:", sheetRes.status);
    } catch (e) {
      console.error("Sheet error:", e.message);
    }
  }

  // ═══ 2. PUSH TO KAJABI VIA ZAPIER ═══
  const ZAPIER_WEBHOOK = process.env.ZAPIER_WEBHOOK;
  if (ZAPIER_WEBHOOK) {
    try {
      const zapRes = await fetch(ZAPIER_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name || "",
          email: data.email || "",
          profile: data.profile || "",
          secondary: data.secondary || "",
          scores: data.scores || {},
        }),
      });
      results.zapier = zapRes.ok;
      console.log("Zapier response:", zapRes.status);
    } catch (e) {
      console.error("Zapier error:", e.message);
    }
  }

  // ═══ 3. SEND RESULTS EMAIL VIA RESEND ═══
  const RESEND_KEY = process.env.RESEND_API_KEY;
  const FROM = process.env.FROM_EMAIL || "Alexandre Olive <care@eliaheals.com>";

  if (RESEND_KEY) {
    try {
      const profileName = data.profile || "Your Profile";
      const firstName = data.name ? data.name.split(" ")[0] : "";
      const emailHtml = buildEmail(data);

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_KEY}`,
        },
        body: JSON.stringify({
          from: FROM,
          to: [data.email],
          subject: "Your ANSR Pulse result — ELIA",
          html: emailHtml,
        }),
      });

      if (emailResponse.ok) {
        results.email = true;
      } else {
        const errText = await emailResponse.text();
        console.error("Resend error:", errText);
      }
    } catch (e) {
      console.error("Email error:", e);
    }
  }

  return res.status(200).json({ ok: true, ...results });
}
