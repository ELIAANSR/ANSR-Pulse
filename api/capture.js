// ═══════════════════════════════════════════
// ANSR PULSE — Capture API (Vercel Serverless)
// Saves to Google Sheets + Sends results email via Resend
// ═══════════════════════════════════════════

// ── Profile Data for Email ──
const PROFILE_EMAIL_DATA = {
  "Sunfire": {
    color: "#D4845A",
    tagline: "Burning bright — and burning through.",
    descriptionP1: "Everything about you burns bright. Your energy, your pace, your capacity to hold a room, carry a team, close a deal, solve a crisis — it's extraordinary. People look at you and see someone who has it all figured out. They marvel at what you carry.",
    descriptionP2: "What they don't see: you can't stop. Not because you don't want to — because your system doesn't know another speed. Your nervous system has been running in activation mode for so long that intensity is the only state it trusts. Rest feels like failure. Stillness feels dangerous.",
    hope: "The fact that you're reading this means something in you paused. Even for a moment. That pause — that tiny interruption in the relentless forward motion — is more significant than you think.",
  },
  "Velvet Blade": {
    color: "#9B7A8F",
    tagline: "Elegant and dangerous. The danger is to yourself.",
    descriptionP1: "You've built something remarkable: a version of you that is composed, graceful under pressure, impeccable in every visible way. People admire your control. They trust your steadiness. They have no idea what it costs.",
    descriptionP2: "Because the elegance became the armour. The composure became the cage. Somewhere along the way, the polished exterior stopped being a choice and became the only version of you that exists.",
    hope: "Nobody in your world says this to you because you look like you don't need it: the composure is real — but so is the woman underneath it. She's not weak. She's the strongest part of you.",
  },
  "Eclipse": {
    color: "#6B7A8B",
    tagline: "The light didn't leave. Something moved in front of it.",
    descriptionP1: "Something bright has been covered over. Not destroyed — blocked. You're still there. Your intelligence, your depth, your capacity — all of it exists. But there's something between you and the world. A veil. A distance.",
    descriptionP2: "You function. You deliver. You show up. But the experience of being alive has gone flat. Food doesn't taste the way it used to. Weekends feel the same as weekdays. You're not sad, exactly. You're not anything, exactly. That's the problem.",
    hope: "The fact that you took this assessment — that you clicked, that you answered honestly, that you're reading these words right now — means the eclipse is already shifting. You didn't come here because you've given up.",
  },
  "Summer Storm": {
    color: "#8B6B5C",
    tagline: "You feel everything. That's not the problem.",
    descriptionP1: "You feel everything. You walk into a room and absorb it — the tension, the beauty, the unspoken things, the energy. You always have. It's your gift. It's also what's overwhelming you.",
    descriptionP2: "Sensitivity without support is not a superpower. It's a flood. Your system takes in more than it can process. Emotions hit hard and fast. Other people's pain lands in your body. Beauty reaches you — sometimes so intensely it aches.",
    hope: "You need to hear this: your sensitivity is not your problem. It never was. The world told you it was too much.",
  },
  "Heartwood": {
    color: "#7A8B5B",
    tagline: "The one who holds everything up. The one nobody thinks to check on.",
    descriptionP1: "The innermost part of the tree. The densest, strongest wood — the part that holds everything up. Nobody sees it. Nobody thinks to check on it. But without it, the whole structure falls.",
    descriptionP2: "That's you. In your family. In your company. In your friendships. You're the one who holds. Who organises, carries, shows up, remembers, takes care of. You make beautiful spaces for others. Beautiful experiences for others.",
    hope: "You have given so much to so many people. And you did it with grace, without complaint, without asking for anything in return. I want you to know that I see that.",
  },
  "New Moon": {
    color: "#5B7A7A",
    tagline: "Invisible — but already pulling the tide.",
    descriptionP1: "Something shifted in you — maybe recently, maybe it's been building. You can feel it. Not a dramatic change. More like a direction. A quiet knowing that the way you've been living isn't the way you want to keep living.",
    descriptionP2: "You're not healed. You're not \"there.\" But you're aware in a way you weren't before. You've started asking questions you'd stopped asking: what do I want? Who am I outside of what I do?",
    hope: "You are at the beginning of something and you can feel it. That feeling — that restless, tender, uncertain stirring — is not confusion. It's your nervous system waking up.",
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

function getBandLabel(score) {
  if (score <= 2.5) return "Contracted";
  if (score <= 5.0) return "Compressed";
  if (score <= 7.5) return "Emerging";
  return "Open";
}

// ── Build the HTML email ──
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
  const profileUrl = process.env.PAID_PROFILE_URL || "https://beauty.eliaheals.com/elia-ansr-profile";
  const pulseUrl = "https://ansr-pulse.vercel.app";

  // Build dimension rows — show top 4, hide bottom 2
  let dimensionRows = "";
  if (data.scores && typeof data.scores === "object") {
    const dims = Object.entries(data.scores)
      .map(([key, score]) => ({ key, label: DIMENSION_LABELS[key] || key, score: parseFloat(score) }))
      .sort((a, b) => b.score - a.score);

    const shown = dims.slice(0, 4);
    const hidden = dims.slice(4);

    shown.forEach(d => {
      const band = getBandLabel(d.score);
      dimensionRows += `
      <tr><td style="padding:6px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-family:Georgia,serif;font-size:13px;color:#F0E8DC;letter-spacing:0.06em;text-transform:uppercase;">${d.label}</td>
          <td align="right" style="font-family:Georgia,serif;font-size:12px;color:#7A7068;">${d.score}/10 · ${band}</td>
        </tr>
        </table>
      </td></tr>`;
    });

    hidden.forEach(d => {
      dimensionRows += `
      <tr><td style="padding:6px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-family:Georgia,serif;font-size:13px;color:rgba(240,232,220,0.35);letter-spacing:0.06em;text-transform:uppercase;">${d.label}</td>
          <td align="right" style="font-family:Georgia,serif;font-size:12px;color:rgba(122,112,104,0.5);font-style:italic;">In your full Profile</td>
        </tr>
        </table>
      </td></tr>`;
    });
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your ANSR Pulse — ${profileName}</title>
</head>
<body style="margin:0;padding:0;background-color:#1A1714;font-family:Georgia,'Times New Roman',serif;">

<!-- Outer wrapper -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1A1714;">
<tr><td align="center" style="padding:0;">

<!-- Inner container -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;">

<!-- Top spacing -->
<tr><td style="height:48px;"></td></tr>

<!-- ELIA Header -->
<tr><td align="center" style="padding:0 24px;">
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:normal;color:#F0E8DC;letter-spacing:0.35em;margin:0;">ELIA</p>
</td></tr>

<!-- Divider line -->
<tr><td align="center" style="padding:24px 24px 32px;">
  <div style="width:40px;height:1px;background-color:#C4896A;opacity:0.5;"></div>
</td></tr>

<!-- Signature label -->
<tr><td align="center" style="padding:0 24px;">
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:11px;color:#C4896A;letter-spacing:0.15em;margin:0 0 24px 0;text-transform:uppercase;">Your ANSR Pulse Signature</p>
</td></tr>

<!-- Profile Name -->
<tr><td align="center" style="padding:0 24px;">
  <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:38px;font-weight:normal;color:#F0E8DC;letter-spacing:0.04em;margin:0 0 12px 0;">${profileName}</h1>
</td></tr>

<!-- Tagline -->
<tr><td align="center" style="padding:0 32px;">
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:17px;color:rgba(240,232,220,0.75);font-style:italic;line-height:1.6;margin:0 0 8px 0;">${tagline}</p>
</td></tr>

${secondaryName ? `
<!-- Secondary undertone -->
<tr><td align="center" style="padding:0 32px;">
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:13px;color:#7A7068;margin:0;">with <span style="color:#B0A494;">${secondaryName}</span> undertone</p>
</td></tr>
` : ""}

<!-- Spacing -->
<tr><td style="height:36px;"></td></tr>

<!-- Profile color bar -->
<tr><td align="center" style="padding:0 48px;">
  <div style="width:100%;height:2px;background:linear-gradient(90deg,transparent,${profileColor},transparent);"></div>
</td></tr>

<!-- Spacing -->
<tr><td style="height:36px;"></td></tr>

<!-- Personal greeting -->
<tr><td style="padding:0 32px;">
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#B0A494;line-height:1.8;margin:0 0 20px 0;">${firstName},</p>
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#B0A494;line-height:1.8;margin:0 0 8px 0;">You took the ANSR Pulse. Your nervous system answered.</p>
</td></tr>

<!-- Spacing -->
<tr><td style="height:24px;"></td></tr>

<!-- Description — 2 paragraphs only -->
<tr><td style="padding:0 32px;">
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#B0A494;line-height:1.85;margin:0 0 16px 0;">${descP1}</p>
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#B0A494;line-height:1.85;margin:0 0 24px 0;">${descP2}</p>
</td></tr>

<!-- Hope quote — 3 sentences, emotional core -->
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

<!-- Spacing -->
<tr><td style="height:36px;"></td></tr>

<!-- Dimension divider -->
<tr><td align="center" style="padding:0 48px;">
  <div style="width:100%;height:1px;background-color:rgba(255,255,255,0.06);"></div>
</td></tr>

<!-- Spacing -->
<tr><td style="height:28px;"></td></tr>

<!-- Dimensions — top 4 shown, bottom 2 hidden -->
<tr><td style="padding:0 32px;">
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:11px;color:#C4896A;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 16px 0;">Your Six Dimensions</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${dimensionRows}
  </table>
</td></tr>

<!-- Spacing -->
<tr><td style="height:36px;"></td></tr>

<!-- Divider -->
<tr><td align="center" style="padding:0 48px;">
  <div style="width:100%;height:1px;background-color:rgba(255,255,255,0.06);"></div>
</td></tr>

<!-- Spacing -->
<tr><td style="height:32px;"></td></tr>

<!-- Bridge to Profile — gap, not spec sheet -->
<tr><td align="center" style="padding:0 32px;">
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:17px;color:#F0E8DC;line-height:1.7;margin:0 0 8px 0;">Your Pulse named the pattern.</p>
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:17px;color:#C4896A;line-height:1.7;margin:0 0 24px 0;">Your Profile maps what's ready to shift.</p>
</td></tr>

<!-- CTA Button — bright rose gold #D4976F, white text -->
<tr><td align="center" style="padding:0 32px;">
  <table role="presentation" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="background-color:#D4976F;border-radius:2px;">
      <a href="${profileUrl}" target="_blank" style="display:inline-block;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;font-weight:normal;letter-spacing:0.14em;text-transform:uppercase;color:#FFFFFF;text-decoration:none;padding:15px 36px;">See what's ready to shift &mdash; &euro;97</a>
    </td>
  </tr>
  </table>
  <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:10px;color:#7A7068;margin:12px 0 0 0;letter-spacing:0.05em;">Founding price · Instant PDF · 12 minutes</p>
</td></tr>

<!-- Spacing -->
<tr><td style="height:16px;"></td></tr>

<!-- Credibility -->
<tr><td align="center" style="padding:0 32px;">
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:10px;color:#7A7068;line-height:1.6;margin:0;">Built on peer-reviewed research from Stanford, University College London,<br>the Max Planck Institute, and the Polyvagal Institute.</p>
</td></tr>

<!-- Spacing -->
<tr><td style="height:48px;"></td></tr>

<!-- Divider -->
<tr><td align="center" style="padding:0 48px;">
  <div style="width:100%;height:1px;background-color:rgba(255,255,255,0.06);"></div>
</td></tr>

<!-- Spacing -->
<tr><td style="height:32px;"></td></tr>

<!-- Signature -->
<tr><td style="padding:0 32px;">
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#B0A494;margin:0 0 4px 0;">&mdash; Alexandre</p>
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#7A7068;font-style:italic;margin:0;">ELIA &mdash; Beauty That Heals</p>
</td></tr>

<!-- Spacing -->
<tr><td style="height:36px;"></td></tr>

<!-- P.S. Share -->
<tr><td style="padding:0 32px;">
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#7A7068;line-height:1.7;margin:0;">Know a woman who needs to see her pattern? The Pulse is free: <a href="${pulseUrl}" style="color:#C4896A;text-decoration:underline;text-underline-offset:3px;">${pulseUrl}</a></p>
</td></tr>

<!-- Bottom spacing -->
<tr><td style="height:48px;"></td></tr>

<!-- Footer -->
<tr><td align="center" style="padding:0 32px 48px;border-top:1px solid rgba(255,255,255,0.05);">
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:normal;color:#F0E8DC;letter-spacing:0.15em;margin:24px 0 4px 0;">ELIA</p>
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:10px;color:#7A7068;font-style:italic;letter-spacing:0.08em;margin:0 0 16px 0;">Beauty That Heals</p>
  <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:9px;color:#5A544E;line-height:1.7;margin:0;">ANSR™ — Aesthetic Nervous System Regulation<br>© ELIA / Uskale SA · All rights reserved</p>
</td></tr>

</table>
<!-- /Inner container -->

</td></tr>
</table>
<!-- /Outer wrapper -->

</body>
</html>`;
}

// ── Main handler ──
export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const data = req.body;
  if (!data || !data.email) return res.status(400).json({ error: "Missing email" });

  const results = { sheet: false, email: false };

  // ═══ 1. SAVE TO GOOGLE SHEET ═══
  const SHEET_WEBHOOK = process.env.GOOGLE_SHEET_WEBHOOK;
  if (SHEET_WEBHOOK) {
    try {
      await fetch(SHEET_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(data),
      });
      results.sheet = true;
    } catch (e) {
      console.error("Sheet error:", e);
    }
  }

  // ═══ 2. SEND RESULTS EMAIL VIA RESEND ═══
  const RESEND_KEY = process.env.RESEND_API_KEY;
  const FROM = process.env.FROM_EMAIL || "ELIA <hello@eliaheals.com>";

  if (RESEND_KEY) {
    try {
      const profileName = data.profile || "Your Profile";
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
          subject: `Your ANSR Pulse: ${profileName}`,
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
