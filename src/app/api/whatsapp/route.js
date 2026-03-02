// WhatsApp Webhook — Meta Cloud API
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WA_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return Response.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(request) {
  const body = await request.json();
  console.log('[WA Webhook]', JSON.stringify(body, null, 2));

  // Process incoming messages
  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const messages = changes?.value?.messages;

  if (messages) {
    for (const msg of messages) {
      console.log('[WA Message]', msg.from, msg.text?.body || msg.type);
      // TODO: Route to AI chatbot, order system, etc.
    }
  }

  return Response.json({ status: 'received' });
}
