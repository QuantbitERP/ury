const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 8000,
  path: `/api/resource/Item?filters=${encodeURIComponent(JSON.stringify([['is_stock_item', '=', '1']]))}&fields=${encodeURIComponent(JSON.stringify(['name', 'item_code', 'item_name', 'valuation_rate']))}&limit=5`,
  method: 'GET',
  headers: {
    'Authorization': 'token fc6d860d5fbcda2:59dcfc7784ec881'
  }
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => { console.log(data); });
});

req.on('error', error => { console.error(error); });
req.end();
