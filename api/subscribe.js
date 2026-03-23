export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, lastName, email, phone } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const results = { slack: null, activecampaign: null };

  // --- SLACK ---
  const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
  if (SLACK_WEBHOOK_URL) {
    try {
      const slackRes = await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocks: [
            {
              type: 'header',
              text: { type: 'plain_text', text: 'Nieuwe Webinar Aanmelding!' }
            },
            {
              type: 'section',
              fields: [
                { type: 'mrkdwn', text: `*Naam:*\n${name} ${lastName || ''}` },
                { type: 'mrkdwn', text: `*Email:*\n${email}` },
                { type: 'mrkdwn', text: `*Telefoon:*\n${phone || 'Niet opgegeven'}` },
                { type: 'mrkdwn', text: `*Bron:*\nVSL Landing Page` }
              ]
            },
            {
              type: 'context',
              elements: [
                { type: 'mrkdwn', text: `Aangemeld op ${new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })}` }
              ]
            }
          ]
        })
      });
      results.slack = slackRes.ok ? 'ok' : 'failed';
    } catch (e) {
      results.slack = 'error';
      console.error('Slack error:', e.message);
    }
  }

  // --- ACTIVECAMPAIGN ---
  const AC_URL = process.env.ACTIVECAMPAIGN_URL;
  const AC_KEY = process.env.ACTIVECAMPAIGN_API_KEY;
  const AC_LIST = process.env.ACTIVECAMPAIGN_LIST_ID || '1';

  if (AC_URL && AC_KEY) {
    try {
      const contactRes = await fetch(`${AC_URL}/api/3/contact/sync`, {
        method: 'POST',
        headers: {
          'Api-Token': AC_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contact: {
            email,
            firstName: name,
            lastName: lastName || '',
            phone: phone || ''
          }
        })
      });

      if (contactRes.ok) {
        const contactData = await contactRes.json();
        const contactId = contactData.contact.id;

        await fetch(`${AC_URL}/api/3/contactLists`, {
          method: 'POST',
          headers: {
            'Api-Token': AC_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contactList: {
              list: AC_LIST,
              contact: contactId,
              status: 1
            }
          })
        });
        results.activecampaign = 'ok';
      } else {
        results.activecampaign = 'failed';
      }
    } catch (e) {
      results.activecampaign = 'error';
      console.error('ActiveCampaign error:', e.message);
    }
  }

  return res.status(200).json({ success: true, results });
}
