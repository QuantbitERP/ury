async function test() {
  const url = `http://127.0.0.1:8000/api/resource/Purchase%20Order?filters=${encodeURIComponent(JSON.stringify([['docstatus', '=', '1']]))}&fields=${encodeURIComponent(JSON.stringify(['name', 'supplier', 'supplier_name', 'grand_total', 'account_currency']))}&limit=5`;
  const res = await fetch(url, { headers: { 'Authorization': 'token 123:456' } });
  console.log(await res.text());
}
test();
