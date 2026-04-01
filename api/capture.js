// ═══════════════════════════════════════════
// ANSR PULSE — Capture API (Vercel Serverless)
// Saves to Google Sheets + Sends results email via Resend + Pushes to Kajabi via Zapier
// ═══════════════════════════════════════════

// ── Profile keys map ──
const PROFILE_KEYS = {
  "Sunfire": "sunfire", "Velvet Blade": "velvetblade", "Eclipse": "eclipse",
  "Summer Storm": "summerstorm", "Heartwood": "heartwood", "New Moon": "newmoon"
};

const PROFILE_COLORS = {
  "Sunfire": "#D4845A", "Velvet Blade": "#9B7A8F", "Eclipse": "#6B7A8B",
  "Summer Storm": "#8B6B5C", "Heartwood": "#7A8B5B", "New Moon": "#5B7A7A"
};

// ── Build the HTML email ──
function buildEmail(data) {
  const firstName = data.name || "";
  const profileName = data.profile || "Your Profile";
  const secondaryName = data.secondary || "";
  const profileColor = PROFILE_COLORS[profileName] || "#C4896A";

  // Build Profile LP URL with params
  const baseProfileUrl = process.env.PAID_PROFILE_URL || "https://ansr-profile.vercel.app";
  const profileKey = PROFILE_KEYS[profileName] || "sunfire";
  const secondaryKey = PROFILE_KEYS[secondaryName] || "";
  const profileUrl = secondaryKey
    ? `${baseProfileUrl}?p=${profileKey}&u=${secondaryKey}`
    : `${baseProfileUrl}?p=${profileKey}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#FAF5EE;font-family:Georgia,'Times New Roman',serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF5EE;">
<tr><td align="center" style="padding:0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;">

<tr><td style="height:56px;"></td></tr>

<tr><td align="center">
  <p style="font-family:Georgia,serif;font-size:20px;color:#2C2C2C;letter-spacing:0.35em;margin:0;">ELIA</p>
</td></tr>

<tr><td align="center" style="padding:20px 0 40px;">
  <div style="width:32px;height:1px;background-color:${profileColor};opacity:0.5;"></div>
</td></tr>

<tr><td style="padding:0 32px;">
  <p style="font-family:Georgia,serif;font-size:16px;color:#2C2C2C;line-height:1.8;margin:0 0 24px 0;">${firstName},</p>
  <p style="font-family:Georgia,serif;font-size:16px;color:#2C2C2C;line-height:1.8;margin:0 0 8px 0;">Your ANSR Pulse result: <strong style="color:${profileColor}">${profileName}</strong>${secondaryName ? ` with ${secondaryName} undertone` : ""}.</p>
  <p style="font-family:Georgia,serif;font-size:16px;color:#2C2C2C;line-height:1.8;margin:0 0 32px 0;">The Pulse measured 11 data points. Enough to identify your profile. Your full ANSR Profile measures 42. That's the difference between a sketch and the complete picture.</p>
</td></tr>

<tr><td align="center" style="padding:0 32px 16px;">
  <table role="presentation" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="background-color:${profileColor};border-radius:2px;">
      <a href="${profileUrl}" target="_blank" style="display:inline-block;font-family:Georgia,serif;font-size:14px;letter-spacing:0.12em;text-transform:uppercase;color:#FFFFFF;text-decoration:none;padding:16px 40px;">See your full Profile</a>
    </td>
  </tr>
  </table>
</td></tr>

<tr><td align="center" style="padding:0 32px;">
  <p style="font-family:Georgia,serif;font-size:11px;color:#9B9590;margin:0 0 48px 0;">42 questions · 14 pages · €97</p>
</td></tr>

<tr><td align="center" style="padding:0 48px;">
  <div style="width:100%;height:1px;background-color:rgba(44,44,44,0.08);"></div>
</td></tr>

<tr><td style="padding:32px 32px 0;">
  <p style="font-family:Georgia,serif;font-size:14px;color:#6B6560;margin:0 0 4px 0;">Alexandre Olive</p>
  <p style="font-family:Georgia,serif;font-size:12px;color:#9B9590;font-style:italic;margin:0;">ELIA — Beauty That Heals</p>
</td></tr>

<tr><td style="height:48px;"></td></tr>

</table>
</td></tr>
</table>
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
          subject: `${profileName}, ${data.name ? data.name.split(" ")[0] : ""}`,
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
