async function check() {
    try {
        const filters1 = encodeURIComponent(JSON.stringify([['docstatus', '=', 1], ['is_return', '=', 0]]));
        const res1 = await fetch(`http://localhost:8000/api/resource/Purchase%20Invoice?fields=["name","status","is_return"]&filters=${filters1}`);
        const data1 = await res1.json();
        console.log("PIs is_return=0:", data1.data);

        const filters2 = encodeURIComponent(JSON.stringify([['docstatus', '=', 1], ['is_return', '=', 1]]));
        const res2 = await fetch(`http://localhost:8000/api/resource/Purchase%20Invoice?fields=["name","status","is_return"]&filters=${filters2}`);
        const data2 = await res2.json();
        console.log("PIs is_return=1:", data2.data);
        
        const res3 = await fetch(`http://localhost:8000/api/resource/Purchase%20Invoice?fields=["name","status","is_return"]`);
        const data3 = await res3.json();
        console.log("All PIs:", data3.data);
    } catch (e) {
        console.error(e);
    }
}
check();
