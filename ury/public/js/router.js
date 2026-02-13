frappe.router.render = function () {
    if (this.current_route[0]) {
        this.render_page();
    } else {
        // Change 'homepage' to your actual route if needed
        frappe.set_route(['homepage']);
    }
};
