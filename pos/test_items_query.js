const fetch = require('node-fetch');
async function test() {
  const url = `http://127.0.0.1:8000/api/resource/Item?filters=${encodeURIComponent(JSON.stringify([['is_stock_item', '=', '1']]))}&fields=${encodeURIComponent(JSON.stringify(['name', 'item_code', 'item_name', 'valuation_rate']))}&limit=5`;
  const res = await fetch(url, { headers: { 'Authorization': 'token 123:456' } });
  console.log(await res.text());
}
test();
