const fetch = require('node-fetch');

async function check() {
    const filters1 = encodeURIComponent(JSON.stringify([
        ['is_return', '=', 1]
    ]));
    const res1 = await fetch(`http://localhost:8000/api/resource/Purchase%20Invoice?fields=["name","status","is_return"]&filters=${filters1}`, {
        headers: { 'Authorization': 'token b11202513f592af:a2f64319fb7b6d1' } // wait, I don't have token. I can use Administrator token or hit it from localhost? 
    });
    // ...
}
check();
