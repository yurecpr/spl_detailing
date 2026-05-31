export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    try {
      const body = await request.json();
      const name = (body?.name || '').trim();
      const email = (body?.email || '').trim();
      const phone = (body?.phone || '').trim();
      const service = (body?.service || '').trim();

      if (!email) {
        return json({ error: 'Missing customer email' }, 400);
      }

      const mailPayload = {
        sender: {
          email: env.SENDER_EMAIL,
          name: 'Speed-Detailing',
        },
        to: [{ email, name: name || email }],
        replyTo: {
          email: env.REPLY_TO_EMAIL,
          name: 'Speed-Detailing',
        },
        subject: 'Ihre Anfrage bei Speed-Detailing',
        htmlContent: buildHtml({ name, phone, service }),
      };

      const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': env.BREVO_API_KEY,
        },
        body: JSON.stringify(mailPayload),
      });

      if (!brevoRes.ok) {
        const details = await brevoRes.text();
        return json({ error: 'Brevo send failed', details }, 502);
      }

      return json({ ok: true }, 200);
    } catch (err) {
      return json({ error: 'Invalid request', details: String(err) }, 400);
    }
  },
};

function json(payload, status) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildHtml({ name, phone, service }) {
  const safeName = esc(name || 'Kundin/Kunde');
  const safePhone = esc(phone || 'Nicht angegeben');
  const safeService = esc(service || 'Allgemeine Anfrage');

  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
    <h2 style="margin:0 0 12px; color:#cc1111;">Vielen Dank fur Ihre Anfrage</h2>
    <p>Hallo ${safeName},</p>
    <p>wir haben Ihre Anfrage bei Speed-Detailing erhalten und melden uns so schnell wie moglich bei Ihnen.</p>
    <p><strong>Ihre Angaben:</strong></p>
    <ul>
      <li><strong>Telefon:</strong> ${safePhone}</li>
      <li><strong>Leistung:</strong> ${safeService}</li>
    </ul>
    <p>Mit freundlichen Grussen<br />Speed-Detailing</p>
  </div>`;
}
