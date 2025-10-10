import frappe
from frappe import _
import json
import os

from pypdf import PdfWriter

no_cache = 1

base_template_path = "www/printview.html"
standard_format = "templates/print_formats/standard.html"

from frappe.www.printview import validate_print_permission


@frappe.whitelist()
def network_printing(
    doctype,
    name,
    printer_setting,
    print_format=None,
    doc=None,
    no_letterhead=0,
    file_path=None,
):
    try:
        print_settings = frappe("Network Printer Settings", printer_setting)

        try:
            import cups
        except ImportError:
            return "Failed to import cups"

        try:
            cups.setServer(print_settings.server_ip)
            cups.setPort(print_settings.port)
            conn = cups.Connection()
        except Exception as e:
            return f"Failed to connect to the printer: {str(e)}"

        try:
            output = PdfWriter()
            output = frappe.get_print(
                doctype,
                name,
                print_format,
                doc=doc,
                no_letterhead=no_letterhead,
                as_pdf=True,
                output=output,
            )
            if not file_path:
                file_path = os.path.join(
                    "/", "tmp", f"frappe-pdf-{frappe.generate_hash()}.pdf"
                )
            output.write(open(file_path, "wb"))
            conn.printFile(print_settings.printer_name, file_path, name, {})

            restaurant_table, invoice_printed, name = frappe.db.get_value(
                "POS Invoice", name, ["restaurant_table", "invoice_printed", "name"]
            )

            if restaurant_table and invoice_printed == 0:
                frappe.db.set_value("POS Invoice", name, "invoice_printed", 1)
                frappe.db.set_value(
                    "URY Table",
                    restaurant_table,
                    {"occupied": 0, "latest_invoice_time": None},
                )
            else:
                frappe.db.set_value("POS Invoice", name, "invoice_printed", 1)

            return "Success"
        except Exception as e:
            return f"Failed to print: {str(e)}"
    except Exception as e:
        import traceback

        traceback.print_exc()  # Print the full traceback for debugging
        return f"An error occurred: {str(e)}"


@frappe.whitelist()
def select_network_printer(pos_profile, invoice_id):
    table = frappe.db.get_value("POS Invoice", invoice_id, "restaurant_table")
    print_format = frappe.db.get_value("POS Profile", pos_profile, "print_format")

    if table:
        room = frappe.db.get_value("URY Table", table, "restaurant_room")
        room_bill_printer = frappe.db.get_value(
            "URY Printer Settings", {"parent": room, "bill": 1}, "printer"
        )
        if room_bill_printer:
            print = network_printing(
                "POS Invoice", invoice_id, room_bill_printer, print_format
            )
            return print

    else:
        pos_bill_printer = frappe.db.get_value(
            "URY Printer Settings", {"parent": pos_profile, "bill": 1}, "printer"
        )
        if pos_bill_printer:
            print = network_printing(
                "POS Invoice", invoice_id, pos_bill_printer, print_format
            )
            return print


@frappe.whitelist()
def qz_print_update(invoice):
    try:
        table = frappe.db.get_value("POS Invoice", invoice, "restaurant_table")
        
        if table == None or table == "":
            # Update invoice_printed
            frappe.db.set_value(
                "POS Invoice", invoice, "invoice_printed", 1, update_modified=False
            )
            
            # Validate the update
            new_invoice_printed = frappe.db.get_value("POS Invoice", invoice, "invoice_printed")
            if new_invoice_printed != 1:
                return {"status": "Failure"}                
        else:
            invoice_printed = frappe.db.get_value("POS Invoice", invoice, "invoice_printed")

            if invoice_printed == 0:
                # Update invoice_printed
                frappe.db.set_value(
                    "POS Invoice", invoice, "invoice_printed", 1, update_modified=False
                )
                
                # Update table status
                frappe.db.set_value(
                    "URY Table", table, {"occupied": 0, "latest_invoice_time": None}
                )
                
                # Validate both updates
                new_invoice_printed = frappe.db.get_value("POS Invoice", invoice, "invoice_printed")
                new_table_status = frappe.db.get_value("URY Table", table, "occupied")
                
                if new_invoice_printed != 1 or new_table_status != 0:
                    return {"status": "Failure"}
        
        return {"status": "Success"}
        
    except Exception as e:
        frappe.log_error(message=e, title="Print Fail")
        frappe.throw(_("Error while printing order",e))                   
        return {"status": "Failure"}


@frappe.whitelist()
def print_pos_page(doctype, name, print_format):
    data = {"name": name, "doctype": doctype, "print_format": print_format}

    restaurant_table, branch, name = frappe.db.get_value(
        "POS Invoice", name, ["restaurant_table", "branch", "name"]
    )
    print_channel = "{}_{}".format("print", branch)
    frappe.publish_realtime(print_channel, {"data": data})

    invoice_printed = frappe.db.get_value("POS Invoice", name, "invoice_printed")

    if invoice_printed == 0:
        frappe.db.set_value("POS Invoice", name, "invoice_printed", 1)

        if restaurant_table:
            frappe.db.set_value(
                "URY Table",
                restaurant_table,
                {"occupied": 0, "latest_invoice_time": None},
            )


@frappe.whitelist()
def qz_certificate():
    site_config = frappe.get_site_config()
    qz_key_value = site_config.get("qz_cert")

    return qz_key_value


@frappe.whitelist()
def signature_promise():
    site_config = frappe.get_site_config()
    key_value = site_config.get("qz_private_key")

    return key_value


#===================Vaibhav


@frappe.whitelist()
def get_all_pos_users():
    """
    Fetches a unique list of all users from the 'Applicable for Users' child table
    across all enabled POS Profile documents.
    """
    all_users = set()

    # Get all enabled POS Profiles using the correct field name 'enabled'
    enabled_profiles = frappe.get_all("POS Profile", filters={"disabled": 0}, fields=["name"])

    for profile in enabled_profiles:
        try:
            # Load the full POS Profile document
            profile_doc = frappe.get_doc("POS Profile", profile.name)
            # Loop through the 'applicable_for_users' child table
            for user_entry in profile_doc.get("applicable_for_users", []):
                if user_entry.user:
                    all_users.add(user_entry.user)
        except frappe.DoesNotExistError:
            # Handle cases where a profile might be deleted during the process
            continue

    return sorted(list(all_users))


@frappe.whitelist()
def transfer_multiple_orders(orders_to_transfer, new_waiter):
    """
    Updates the 'waiter' field for a list of POS Invoice documents.
    'orders_to_transfer' should be a JSON string of a list of order names.
    """
    try:
        # The list of orders will come as a JSON string from the frontend
        order_list = json.loads(orders_to_transfer)

        if not isinstance(order_list, list) or not new_waiter:
            frappe.throw(_("Invalid data provided for transfer."))

        for order_name in order_list:
            # Update the waiter for each document
            frappe.db.set_value("POS Invoice", order_name, "waiter", new_waiter)

        return {"status": "success", "message": f"Successfully transferred {len(order_list)} orders to {new_waiter}."}

    except Exception as e:
        frappe.log_error(message=str(e), title="Waiter Transfer Failed")
        frappe.throw(_("An error occurred during the transfer process."))