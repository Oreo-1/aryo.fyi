// functions/api/contact.js
//
// Cloudflare Pages Function — handles POST /api/contact and relays
// the message to Resend's email API.
//
// Requires a RESEND_API_KEY secret, set in:
// Cloudflare dashboard > Workers & Pages > your Pages project >
// Settings > Variables and Secrets > Add (type: Secret)

const TO_EMAIL = 'send-mail@aryo.fyi';        // where you want messages delivered
const FROM_EMAIL = 'contact@yourdomain.com';  // must be on a domain verified in Resend

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body.' }, 400);
  }

  const { name, email, message } = body;

  if (!name || !email || !message) {
    return jsonResponse({ error: 'Name, email, and message are all required.' }, 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ error: "That email address doesn't look valid." }, 400);
  }

  if (message.length > 5000) {
    return jsonResponse({ error: 'Message is too long.' }, 400);
  }

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      reply_to: email,
      subject: `Portfolio contact from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    }),
  });

  if (!resendResponse.ok) {
    const errorDetail = await resendResponse.text();
    console.error('Resend API error:', errorDetail);
    return jsonResponse({ error: 'Could not send the message. Try again in a bit.' }, 502);
  }

  return jsonResponse({ success: true });
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}