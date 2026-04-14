exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { 'Content-Type': 'application/json' }, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let collection;
  try {
    collection = JSON.parse(event.body || '{}').collection;
    if (!collection) throw new Error('Missing collection');
  } catch (e) {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid body' }) };
  }

  const SITE_ID = '0f961e16-496e-41e2-a936-2761579b85f9';
  const API_KEY = process.env.WIX_API_KEY;
  const SORT = { Matches: [{ fieldName: 'matchDate', order: 'DESC' }], Players: [{ fieldName: 'goals', order: 'DESC' }] };

  try {
    const r = await fetch('https://www.wixapis.com/wix-data/v2/items/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': API_KEY, 'wix-site-id': SITE_ID },
      body: JSON.stringify({ dataCollectionId: collection, query: { paging: { limit: 100 }, sort: SORT[collection] || [] } })
    });
    const data = await r.json();
    if (!r.ok) return { statusCode: r.status, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: data.message || 'Wix error' }) };
    const items = (data.dataItems || []).map(i => i.data);
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }) };
  } catch (e) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: e.message }) };
  }
};
