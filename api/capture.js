// /api/capture.js — Vercel Serverless Function
// Receives Pulse data → saves to Google Sheet → sends email with results
// Fully automated. Zero manual intervention.

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const data = req.body;
    const { name, email, profile, secondary, tagline, scores, results_url } = data;

    if (!email || !profile) return res.status(400).json({ error: "Missing data" });

    // ═══ 1. SAVE TO GOOGLE SHEET ═══
    const SHEET_WEBHOOK = process.env.GOOGLE_SHEET_WEBHOOK;
    if (SHEET_WEBHOOK) {
      fetch(SHEET_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(data),
      }).catch(() => {});
    }

    // ═══ 2. PUSH TO KAJABI VIA ZAPIER ═══
    const ZAPIER_WEBHOOK = process.env.ZAPIER_WEBHOOK;
    if (ZAPIER_WEBHOOK) {
      fetch(ZAPIER_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, profile, secondary, tagline,
          results_url,
          alertness: scores?.alertness,
          sensitivity: scores?.sensitivity,
          vitality: scores?.vitality,
          connection: scores?.connection,
          performance: scores?.performance,
          aliveness: scores?.aliveness,
        }),
      }).catch(() => {});
    }

    // ═══ 3. SEND EMAIL VIA RESEND ═══
    const RESEND_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL || "ELIA <hello@yourdomain.com>";

    if (RESEND_KEY) {
      const emailHtml = buildEmail(name, profile, secondary, tagline, scores, results_url);

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: email,
          subject: `Your ANSR Pulse: ${profile}`,
          html: emailHtml,
        }),
      });
    }

    return res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

// ═══ BEAUTIFUL HTML EMAIL ═══
function buildEmail(name, profile, secondary, tagline, scores, results_url) {
  const paidUrl = process.env.PAID_PROFILE_URL || "#";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#1A1714;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#1A1714;">
<tr><td align="center" style="padding:40px 20px;">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

  <!-- ELIA HEADER -->
  <tr><td align="center" style="padding:0 0 30px;">
    <p style="font-family:Georgia,serif;font-size:22px;color:#F0E8DC;letter-spacing:0.3em;margin:0;">ELIA</p>
  </td></tr>

  <!-- PROFILE NAME -->
  <tr><td align="center" style="padding:0 0 8px;">
    <p style="font-family:Georgia,serif;font-size:13px;color:#C4896A;letter-spacing:0.12em;margin:0;">Your ANSR Pulse Signature</p>
  </td></tr>
  <tr><td align="center" style="padding:0 0 12px;">
    <h1 style="font-family:Georgia,serif;font-size:36px;font-weight:normal;color:#F0E8DC;margin:0;letter-spacing:0.04em;">${profile}</h1>
  </td></tr>
  <tr><td align="center" style="padding:0 0 30px;">
    <p style="font-family:Georgia,serif;font-size:16px;color:rgba(240,232,220,0.7);font-style:italic;margin:0;">${tagline || ""}</p>
  </td></tr>

  <!-- DIVIDER -->
  <tr><td align="center" style="padding:0 0 30px;">
    <div style="width:40px;height:1px;background:#C4896A;opacity:0.4;margin:0 auto;"></div>
  </td></tr>

  <!-- MESSAGE -->
  <tr><td style="padding:0 0 20px;">
    <p style="font-family:Georgia,serif;font-size:16px;color:#B0A494;line-height:1.8;margin:0;">
      ${name || ""},
    </p>
  </td></tr>
  <tr><td style="padding:0 0 20px;">
    <p style="font-family:Georgia,serif;font-size:16px;color:#B0A494;line-height:1.8;margin:0;">
      You just took the ANSR Pulse. Your nervous system revealed a pattern &mdash; one that has been running without your permission, keeping you performing while something essential was being turned off inside you.
    </p>
  </td></tr>
  <tr><td style="padding:0 0 20px;">
    <p style="font-family:Georgia,serif;font-size:16px;color:#B0A494;line-height:1.8;margin:0;">
      Your full results &mdash; your ANSR Map, your six dimensions, your first practice, and the ${secondary ? secondary + " undertone running underneath" : "secondary pattern underneath"} &mdash; are here:
    </p>
  </td></tr>

  <!-- VIEW RESULTS BUTTON -->
  <tr><td align="center" style="padding:20px 0 30px;">
    <a href="${results_url}" style="display:inline-block;font-family:Georgia,serif;font-size:14px;letter-spacing:0.15em;background:#C4896A;color:#1A1714;padding:14px 36px;text-decoration:none;border-radius:2px;">VIEW YOUR RESULTS</a>
  </td></tr>

  <tr><td style="padding:0 0 20px;">
    <p style="font-family:Georgia,serif;font-size:15px;color:#7A7068;line-height:1.7;margin:0;">
      Save this link. Come back to it when it's quiet. Share it with the woman who comes to mind.
    </p>
  </td></tr>

  <!-- SIGNATURE -->
  <tr><td style="padding:20px 0 30px;">
    <p style="font-family:Georgia,serif;font-size:15px;color:#B0A494;margin:0;">&mdash; Alexandre Olive</p>
    <p style="font-family:Georgia,serif;font-size:13px;color:#7A7068;margin:4px 0 0;">ELIA &mdash; Beauty That Heals</p>
  </td></tr>

  <!-- DIVIDER -->
  <tr><td align="center" style="padding:0 0 30px;">
    <div style="width:40px;height:1px;background:#C4896A;opacity:0.4;margin:0 auto;"></div>
  </td></tr>

  <!-- PAID CTA -->
  <tr><td style="padding:0 0 15px;">
    <p style="font-family:Georgia,serif;font-size:14px;color:#7A7068;line-height:1.7;margin:0;">
      <em>P.S. &mdash; Your Pulse shows the shape. Your full ANSR Profile tells the story. 42 questions. Your complete dual-profile analysis. Sensory regulation mapping. Practices matched to your nervous system. A PDF report &mdash; yours to keep.</em>
    </p>
  </td></tr>
  <tr><td align="center" style="padding:10px 0 10px;">
    <a href="${paidUrl}" style="display:inline-block;font-family:Georgia,serif;font-size:13px;letter-spacing:0.1em;border:1px solid #C4896A;color:#C4896A;padding:12px 30px;text-decoration:none;border-radius:2px;">GET YOUR FULL ANSR PROFILE &mdash; &euro;97</a>
  </td></tr>
  <tr><td align="center" style="padding:0 0 30px;">
    <p style="font-family:Georgia,serif;font-size:11px;color:#7A7068;margin:0;">Founding price &middot; Instant PDF &middot; 12 minutes</p>
  </td></tr>

  <!-- FOOTER -->
  <tr><td align="center" style="padding:20px 0 0;border-top:1px solid rgba(255,255,255,0.08);">
    <p style="font-family:Georgia,serif;font-size:9px;color:rgba(255,255,255,0.2);line-height:1.8;margin:0;">
      ANSR&trade; &mdash; Aesthetic Nervous System Regulation<br>
      &copy; ELIA / Uskale SA &middot; All rights reserved<br>
      This assessment is for personal development purposes and does not constitute medical diagnosis.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
