module.exports = async function (req, res) {
  var q = String(req.query.q || '').trim().slice(0, 200);
  if (!q) { res.status(400).json({ error: 'q' }); return; }
  var sort = req.query.sort === 'publication_date:desc' ? 'publication_date:desc' : 'relevance_score:desc';
  var n = parseInt(req.query.years, 10);
  var f = 'authorships.institutions.country_code:DZ';
  if (n > 0 && n <= 50) f += ',from_publication_date:' + (new Date().getFullYear() - n) + '-01-01';
  var u = 'https://api.openalex.org/works?search=' + encodeURIComponent(q) + '&filter=' + f + '&sort=' + sort +
    '&per-page=15&select=id,display_name,publication_year,doi,authorships,primary_location,cited_by_count,type,open_access';
  if (process.env.OPENALEX_API_KEY) u += '&api_key=' + encodeURIComponent(process.env.OPENALEX_API_KEY);
  try {
    var r = await fetch(u);
    var t = await r.text();
    res.setHeader('Content-Type', 'application/json');
    if (r.ok) res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(r.status).send(t);
  } catch (e) {
    res.status(502).json({ error: 'upstream' });
  }
};
