// ═══════════════════════════════════════════
// ANSR PULSE — Capture API (Vercel Serverless)
// Saves to Google Sheets + Sends results email via Resend
// ═══════════════════════════════════════════

// ── Profile Data for Email ──
const PROFILE_EMAIL_DATA = {
  "Sunfire": {
    color: "#D4845A",
    tagline: "Burning bright — and burning through.",
    hope: "The fact that you're reading this means something in you paused. Even for a moment. That pause — that tiny interruption in the relentless forward motion — is more significant than you think. You have an extraordinary engine. What you need isn't to be fixed. You need to discover that the same intensity that drives your success can be turned toward beauty, toward feeling, toward the life that's been waiting on the other side of the pushing.",
  },
  "Velvet Blade": {
    color: "#9B7A8F",
    tagline: "Elegant and dangerous. The danger is to yourself.",
    hope: "I want you to hear something that nobody in your world says to you because you look like you don't need it: you are allowed to be soft. The composure that everyone admires is real — but so is the woman underneath it. She's not weak. She's the strongest part of you. And when she's finally safe enough to come forward, everything changes.",
  },
  "Eclipse": {
    color: "#6B7A8B",
    tagline: "The light didn't leave. Something moved in front of it.",
    hope: "The fact that you took this assessment — that you clicked, that you answered honestly, that you're reading these words right now — means the eclipse is already shifting. You didn't come here because you've given up. You came because something in you is still looking. Still hoping. Still reaching for something that makes sense of the flatness.",
  },
  "Summer Storm": {
    color: "#8B6B5C",
    tagline: "You feel everything. That's not the problem.",
    hope: "Your sensitivity is not your problem. It never was. The world told you it was too much. Your career punished you for it. So you tried to turn it down. But here's what nobody else will tell you — your sensitivity is the rarest thing in any room you walk into. What you need isn't less feeling. You need a world that deserves what you feel.",
  },
  "Heartwood": {
    color: "#7A8B5B",
    tagline: "The one who holds everything up. The one nobody thinks to check on.",
    hope: "You have given so much to so many people. And you did it with grace, without complaint, without asking for anything in return. I want you to know that I see that. That what you've carried is extraordinary. And that the generosity that defines you is not something you need to lose — it's something you need to finally turn inward.",
  },
  "New Moon": {
    color: "#5B7A7A",
    tagline: "Invisible — but already pulling the tide.",
    hope: "You are at the beginning of something and you can feel it. That feeling — that restless, tender, uncertain stirring — is not confusion. It's your nervous system waking up. It's your body remembering that there's more available to you than what you've been settling for. Most people never get here. You stopped. You listened. You let a question in.",
  },
};

// ── Build the HTML email ──
function buildEmail(data) {
  const profileData = PROFILE_EMAIL_DATA[data.profile] || PROFILE_EMAIL_DATA["New Moon"];
  const profileColor = profileData.color;
  const firstName = data.name || "";
  const profileName = data.profile || "Your Profile";
  const secondaryName = data.secondary || "";
  const tagline = profileData.tagline;
  const hope = profileData.hope;
  const profileUrl = process.env.PAID_PROFILE_URL || "https://beauty.eliaheals.com/elia-ansr-profile";
  const pulseUrl = "https://ansr-pulse.vercel.app";

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
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:13px;color:#7A7068;margin:0 0 0 0;">with <span style="color:#B0A494;">${secondaryName}</span> undertone</p>
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
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#B0A494;line-height:1.8;margin:0 0 24px 0;">You took the ANSR Pulse. Your nervous system answered. Here is what it said.</p>
</td></tr>

<!-- Hope quote — the emotional core -->
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
<tr><td style="height:40px;"></td></tr>

<!-- Bridge to Profile -->
<tr><td style="padding:0 32px;">
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#B0A494;line-height:1.8;margin:0 0 8px 0;">This is your shape. Your full ANSR Profile tells the story.</p>
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#7A7068;line-height:1.7;margin:0;">42 questions. Your complete ${profileName}${secondaryName ? "–" + secondaryName : ""} dual-profile analysis. Sensory regulation mapping. Practices matched to your nervous system. A 14-page PDF — yours to keep.</p>
</td></tr>

<!-- Spacing -->
<tr><td style="height:32px;"></td></tr>

<!-- CTA Button -->
<tr><td align="center" style="padding:0 32px;">
  <table role="presentation" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="background-color:#C4896A;border-radius:2px;">
      <a href="${profileUrl}" target="_blank" style="display:inline-block;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;font-weight:normal;letter-spacing:0.14em;text-transform:uppercase;color:#1A1714;text-decoration:none;padding:15px 36px;">Get Your Full ANSR Profile &mdash; &euro;97</a>
    </td>
  </tr>
  </table>
  <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:10px;color:#7A7068;margin:12px 0 0 0;letter-spacing:0.05em;">Founding price · Instant PDF · 12 minutes</p>
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
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#B0A494;margin:0 0 4px 0;">&mdash; Alexandre Olive</p>
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#7A7068;font-style:italic;margin:0;">ELIA &mdash; Beauty That Heals</p>
</td></tr>

<!-- Spacing -->
<tr><td style="height:36px;"></td></tr>

<!-- P.S. Share -->
<tr><td style="padding:0 32px;">
  <p style="font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#7A7068;line-height:1.7;margin:0;">P.S. &mdash; If you know a woman who needs to see her pattern, the Pulse is free: <a href="${pulseUrl}" style="color:#C4896A;text-decoration:underline;text-underline-offset:3px;">${pulseUrl}</a></p>
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
