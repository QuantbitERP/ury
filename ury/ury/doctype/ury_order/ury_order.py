# Copyright (c) 2023, Tridz Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

import json
import frappe
from frappe import _
from frappe.model.document import Document
from erpnext.controllers.queries import item_query
from ury.ury_pos.api import getBranch, getBranchRoom
from ury.ury.api.ury_kot_generate import kot_execute
from ury.ury.api.ury_kot_generate import process_items_for_cancel_kot

from frappe import cache


class URYOrder(Document):
    pass


@frappe.whitelist()
def get_order_invoice(table=None, invoiceNo=None, order_type=None, is_payment=None):
    """returns the active invoice linked to the given table"""

    if table:
        if is_payment == "Payments":
            invoice_name = frappe.get_value(
                "POS Invoice", dict(restaurant_table=table, docstatus=0, name=invoiceNo)
            )
            
        else:
            if invoiceNo:
                invoice_name = frappe.get_value(
                    "POS Invoice",
                    dict(restaurant_table=table, docstatus=0, name=invoiceNo),
                )
               
            else:
                invoice_name = frappe.get_value(
                    "POS Invoice",
                    dict(restaurant_table=table, docstatus=0, invoice_printed=0),
                )
                
        # invoice_name = frappe.get_value("POS Invoice", dict(restaurant_table=table, docstatus=0, invoice_printed=0))
        branch, menu_name, restaurant = get_restaurant_and_menu_name(table)

        if invoice_name:
            invoice = frappe.get_doc("POS Invoice", invoice_name)

        else:
            invoice = frappe.new_doc("POS Invoice")

            invoice.naming_series = frappe.db.get_value(
                "URY Restaurant", restaurant, "invoice_series_prefix"
            )

            invoice.is_pos = 1
            invoice.update_stock = 1
            invoice.restaurant = restaurant
            invoice.branch = branch

            is_take_away = frappe.db.get_value("URY Table", table, "is_take_away")
            if is_take_away == 1:
                invoice.order_type = "Take Away"
            else:
                invoice.order_type= "Dine In"

        invoice.taxes_and_charges = frappe.db.get_value(
            "URY Restaurant", restaurant, "default_tax_template"
        )

        invoice.selling_price_list = frappe.db.get_value(
            "Price List", dict(restaurant_menu=menu_name, enabled=1)
        )

    else:

        if is_payment == "Payments":
            invoice_name = frappe.get_value(
                "POS Invoice", dict(restaurant_table=table, docstatus=0, name=invoiceNo)
            )
            
        else:
            invoice_name = frappe.get_value(
                "POS Invoice", dict(docstatus=0, name=invoiceNo)
            )
            
        if invoice_name:
            invoice = frappe.get_doc("POS Invoice", invoice_name)
            

        else:
            invoice = frappe.new_doc("POS Invoice")
            invoice.is_pos = 1
            invoice.update_stock = 1
        
        branch = getBranch()
        restaurant = frappe.db.get_value("URY Restaurant", {"branch": branch}, "name")
   
        menu=get_menu_name(order_type)
 
        if (order_type == "Aggregators" and frappe.db.get_value("Branch", branch, "custom_no_taxes") == 0) or order_type != "Aggregators":
            invoice.taxes_and_charges = frappe.db.get_value("URY Restaurant", restaurant, "default_tax_template")
        
        invoice.selling_price_list = frappe.db.get_value(
            "Price List", dict(restaurant_menu=menu, enabled=1)
        )
        
        

    return invoice


@frappe.whitelist()
def sync_order(
    items,
    cashier,
    owner,
    mode_of_payment,
    customer,
    no_of_pax,
    last_invoice,
    waiter,
    pos_profile,
    last_modified_time=None,
    table=None,
    invoice=None,
    comments=None,
    order_type=None,
    aggregator_id=None,
    room=None
):
    
    user_role = frappe.get_roles()
    posprofile = frappe.get_doc("POS Profile", pos_profile)
    
    billing_user = any(
        role.role in user_role for role in posprofile.role_allowed_for_billing
    )

    # Check if the last invoice was already billed
    if (
        last_invoice
        and frappe.db.get_value("POS Invoice", last_invoice, "invoice_printed") == 1
        and (not billing_user)
    ):
        frappe.msgprint(
            title="Invoice Already Billed",
            indicator="red",
            msg=("This order has already been billed. Please reload the page."),
        )
        return {"status": "Failure"}

    invoice = get_order_invoice(table, invoice,order_type)

    if last_invoice and last_modified_time:
        lastModifiedTime = invoice.modified
        from datetime import datetime

        if isinstance(last_modified_time, str):
            try:
                last_modified_time = datetime.strptime(
                    last_modified_time, "%Y-%m-%d %H:%M:%S.%f"
                )
            except ValueError:
                last_modified_time = datetime.strptime(
                    last_modified_time, "%Y-%m-%d %H:%M:%S"
                )
        if isinstance(lastModifiedTime, str):
            try:
                lastModifiedTime = datetime.strptime(
                    lastModifiedTime, "%Y-%m-%d %H:%M:%S.%f"
                )
            except ValueError:
                lastModifiedTime = datetime.strptime(
                    lastModifiedTime, "%Y-%m-%d %H:%M:%S"
                )
        if lastModifiedTime != last_modified_time:
            frappe.msgprint(
                title="Order has been modified",
                indicator="red",
                msg=(
                    "This order has been modified. Please reload the page to retrieve the latest edits."
                ),
            )
            return {"status": "Failure"}
    else:
        if invoice.name and invoice.invoice_printed == 0 and not billing_user:
            frappe.msgprint(
                title="Table occupied ",
                indicator="red",
                msg=("{0} is already occupied . Please refresh the page.").format(
                    table
                ),
            )
            return {"status": "Failure"}

    if not customer:
        frappe.throw("Please enter valid customer details")
    else:
        invoice.customer = customer

    if order_type:
        invoice.order_type = order_type

    customerdoc = frappe.get_doc("Customer", customer)
    invoice.mobile_number = customerdoc.mobile_number
    if comments:
        invoice.custom_comments = comments
    invoice.no_of_pax = no_of_pax
    invoice.pos_profile = pos_profile
    invoice.cashier = cashier
    invoice.waiter = waiter
    invoice.custom_aggregator_id = aggregator_id
    invoice.custom_restaurant_room =room
    invoice.restaurant_table = table
    
    if order_type == "Aggregators":
        price_list = frappe.db.get_value("Aggregator Settings",{"customer": customer, "parent": invoice.branch, "parenttype": "Branch"},"price_list",)
        
        if not price_list:
            frappe.throw(f"Price list for customer {customer} in branch {invoice.branch} not found in Aggregator Settings.")
    else:
        price_list = invoice.selling_price_list

    # dummy payment
    if invoice.invoice_created == 0:
        invoice.append(
            "payments",
            dict(mode_of_payment=mode_of_payment, amount=invoice.grand_total),
        )
        invoice.invoice_created = 1

    past_item = []
    for item in invoice.items:
        previous_item = {
            "item_code": item.item_code,
            "item_name": item.item_name,
            "qty": item.qty,
            "comments": "",
        }
        past_item.append(previous_item)
        

    # Conditional checking for 'items' type:
    # - 'ury': JSON passed, hence using isinstance
    # - 'ury_pos': Already formatted list, hence using else
    if isinstance(items, str):
        items = json.loads(items)
    invoice.items = []
    
    menu = frappe.db.get_value("URY Menu", {"branch": invoice.branch}, "name")
   
    for d in items:
        
        course = frappe.db.get_value("URY Menu Item", {"item": d.get("item"),"parent":menu}, "course")
        
        item_prices = frappe.db.get_list(
            "Item Price",
            filters={"item_code": d.get("item"), "price_list": price_list},
            fields=["price_list_rate"],
        )

        if not item_prices:
            frappe.throw(_("No item price found for Item: {0} in Price List: {1}. Please check the price list settings.").format(item.item_code, price_list))

        else:
            invoice.append(
                "items",
                dict(
                    item_code=d.get("item"),
                    item_name=d.get("item_name"),
                    qty=d.get("qty"),
                    **({"custom_course": course} if course else {}),
                    comment=d.get("comment"),
                    custom_dish_type=d.get("custom_dish_type"),  # Add this line
                    rate = item_prices[0].price_list_rate,
                    price_list_rate = item_prices[0].price_list_rate,
                    base_price_list_rate = item_prices[0].price_list_rate,
                    cost_center = frappe.db.get_value(
                        "POS Profile", pos_profile, "cost_center"
                        ),
                ),
            )

    try:
        invoice.save()
    except Exception as e:
        frappe.throw(f"Error while updating order: {e}")   


    try:
        kot_execute(invoice.name, customer, table, items, past_item, comments)

    except Exception as e:
        # If an exception occurs (e.g., "kot" app not found), it will be caught here without affect the code execution.
        error_msg = f"KOT Creation Failes {str(e)}"            
        frappe.log_error(error_msg, "KOT Error")

    # table status
    if invoice.invoice_printed == 0:
        frappe.db.set_value(
            "URY Table", table, {"occupied": 1, "latest_invoice_time": invoice.creation}
        )

    invoice.db_set("owner", owner)
    return invoice.as_dict()


@frappe.whitelist()
def item_query_restaurant(
    doctype="Item",
    txt="",
    searchfield="name",
    start=0,
    page_len=20,
    filters=None,
    as_dict=False,
):
    """Return items that are selected in active menu of the restaurant"""
    restaurant, menu = get_restaurant_and_menu_name(filters["table"])
    items = frappe.db.get_all("URY Menu Item", ["item"], dict(parent=menu, disabled=0))
    del filters["table"]
    filters["name"] = ("in", [d.item for d in items])

    return item_query("Item", txt, searchfield, start, page_len, filters, as_dict)


@frappe.whitelist()
def get_restaurant_and_menu_name(table):
    if not table:
        frappe.throw(_("Please select a table"))

    restaurant, branch, room = frappe.get_value(
        "URY Table",
        table,
        ["restaurant", "branch", "restaurant_room"],
    )
    room_wise_menu = frappe.db.get_value(
        "URY Restaurant",
        restaurant,
        "room_wise_menu",
    )

    if not room_wise_menu:
        menu = frappe.db.get_value("URY Restaurant", restaurant, "active_menu")
    else:
        menu = frappe.db.get_value(
            "Menu for Room",
            {"parent": restaurant, "room": room},
            "menu",
        )

    if not menu:
        frappe.throw(
            _("Please set an active menu for Restaurant {0}").format(restaurant)
        )

    return branch, menu, restaurant

@frappe.whitelist()
def get_menu_name(order_type):
    branch = getBranch()
    restaurant = frappe.get_value(
        "URY Restaurant",
        {"branch": branch},
        "name",
    )
    order_type_wise_menu = frappe.db.get_value(
            "URY Restaurant", restaurant, "order_type_wise_menu"
        )
    
    if order_type_wise_menu:
        menu = frappe.db.get_value(
            "Order Type Menu",
            {"parent": restaurant, "order_type": order_type},
            "menu"
        )
        if not menu:
            menu = frappe.db.get_value("URY Restaurant", restaurant, "active_menu")
    else:
        menu = frappe.db.get_value("URY Restaurant", restaurant, "active_menu")   
    return menu  
    

@frappe.whitelist()
def pos_opening_check():
    
    user = frappe.session.user
    # Handle the administrator case differently
    if user == "Administrator":
        return {
            "opening_exists": False,  # Assuming no POS opening entry is needed for Administrator
            "cashier": None,
            "pos_profile": None,
        }
    
    details = getBranchRoom()
    room = details[0].get('name')    # 'Beach'
    branch = details[0].get('branch') # 'Beach'
    
    pos_opening_list = frappe.db.sql("""
        SELECT DISTINCT `tabPOS Opening Entry`.name 
        FROM `tabPOS Opening Entry`
        INNER JOIN `tabMultiple Rooms` 
        ON `tabMultiple Rooms`.parent = `tabPOS Opening Entry`.name
        WHERE `tabPOS Opening Entry`.branch = %s
        AND `tabPOS Opening Entry`.status = 'Open'
        AND `tabPOS Opening Entry`.docstatus = 1
        AND `tabMultiple Rooms`.room = %s
    """, (branch, room), as_dict=True)
    
    
    result = {
        "opening_exists": len(pos_opening_list) > 0,
        "cashier": None,
        "pos_profile": None,
    }

    if result["opening_exists"]:
        # If POS opening entry exists, fetch the cashier from the first entry
        opening_entry = frappe.get_doc("POS Opening Entry", pos_opening_list[0].name)
        result["cashier"] = (
            opening_entry.user
        )  # Fetch values from POS Profile linked to POS Opening Entry
        result["pos_profile"] = opening_entry.pos_profile
        
    return result


@frappe.whitelist()
def table_transfer(table, newTable, invoice):
    current_table = frappe.get_doc("URY Table", table)
    pos_invoice = frappe.get_doc("POS Invoice", invoice)
    new_table = frappe.get_doc("URY Table", newTable)

    if current_table.restaurant_room == new_table.restaurant_room:
        if new_table.occupied == 1:
            frappe.throw(f"Table {new_table.name} is already occupied")

        # Update table status
        frappe.db.set_value(
            "URY Table",
            new_table.name,
            {"occupied": 1, "latest_invoice_time": pos_invoice.creation},
        )
        frappe.db.set_value(
            "URY Table",
            current_table.name,
            {"occupied": 0, "latest_invoice_time": None},
        )

        # Update POS Invoice
        pos_invoice.restaurant_table = new_table.name
        pos_invoice.save()

        try:
            change_table_in_kot(
                    pos_invoice.name, new_table.name, pos_invoice.branch
                )

        except Exception as e:
            # If an exception occurs (e.g., "kot" app not found), it will be caught here without effecting execution
            pass

    else:
        frappe.throw(_("Table transfer between different rooms is restricted."))


@frappe.whitelist()
def captain_transfer(currentCaptain, newCaptain, invoice):
    pos_profile=frappe.get_value("POS Invoice", invoice,"pos_profile")
    multiple_cashier = frappe.db.get_value("POS Profile",pos_profile,"custom_enable_multiple_cashier")
    branch=frappe.get_value("POS Invoice", invoice,"branch")
    if multiple_cashier:
        table=pos_profile=frappe.get_value("POS Invoice", invoice,"restaurant_table")
        current_room = frappe.get_value("URY Table", table,"restaurant_room")
        new_captain_room =  frappe.db.sql("""
                SELECT room
                FROM `tabURY User`
                WHERE parent=%s AND user=%s         
            """,(branch,newCaptain),as_dict=True)
        room_match = any(room['room'] == current_room for room in new_captain_room)
        if not room_match:
            frappe.throw(_("Captain transfer is not allowed between different rooms"))
        else:
            current_captain_doc = frappe.get_doc("User", currentCaptain)
            pos_invoice = frappe.get_doc("POS Invoice", invoice)
            new_captain_doc = frappe.get_doc("User", newCaptain)

            # Update the waiter field of the POS Invoice
            pos_invoice.waiter = new_captain_doc.name
            pos_invoice.save()

    else:
        current_captain_doc = frappe.get_doc("User", currentCaptain)
        pos_invoice = frappe.get_doc("POS Invoice", invoice)
        new_captain_doc = frappe.get_doc("User", newCaptain)

        # Update the waiter field of the POS Invoice
        pos_invoice.waiter = new_captain_doc.name
        pos_invoice.save()


@frappe.whitelist()
def customer_favourite_item(customer_name):
    pos = frappe.db.get_list(
        "POS Invoice", filters={"customer": customer_name}, fields=["name"]
    )

    item_qty = {}

    for invoice in pos:
        pos_invoice = frappe.get_doc("POS Invoice", invoice)
        for item in pos_invoice.items:
            item_name = item.item_name
            item_qty[item_name] = item_qty.get(item_name, 0) + item.qty

    result = [
        {"item_name": item_name, "qty": qty}
        for item_name, qty in item_qty.items()
        if qty > 1
    ]
    result = sorted(result, key=lambda x: x["qty"], reverse=True)[:3]

    return result


@frappe.whitelist()
def cancel_order(invoice_id, reason):
    pos_invoice = frappe.get_doc("POS Invoice", invoice_id)

    # Update table status
    frappe.db.set_value(
        "URY Table",
        pos_invoice.restaurant_table,
        {"occupied": 0, "latest_invoice_time": None},
    )

    try:
        cancel_kot(invoice_id)

    except Exception as e:
        # If an exception occurs (e.g., "kot" app not found), it will be caught here without effecting execution
        pass

    # Update invoice status
    frappe.db.sql("""
        UPDATE `tabPOS Invoice Item`
        SET docstatus = 2
        WHERE parent = %s
    """, (invoice_id,))

    frappe.db.set_value("POS Invoice", invoice_id, "docstatus", 2)
    frappe.db.set_value("POS Invoice", invoice_id, "status", "Cancelled")
    frappe.db.set_value("POS Invoice", invoice_id, "cancel_reason", reason)

# Method for URY POS
@frappe.whitelist()
def make_invoice(customer, payments, cashier, pos_profile, owner, additionalDiscount=None, table=None, invoice=None, redeem_loyalty_points=0, loyalty_amount=0, loyalty_program=None, loyalty_points=0, items=None, is_split_payment=0, original_invoice=None): # Add items parameter
    order_type =  invoice_name = frappe.get_value("POS Invoice",invoice , "order_type")
    invoice_doc = get_order_invoice(table, invoice, order_type, "Payments")
    
    is_split = int(is_split_payment) == 1

    if table:
        restaurant = get_restaurant_and_menu_name(table)
        invoice_doc.restaurant = restaurant

    invoice_doc.customer = customer
    invoice_doc.pos_profile = pos_profile
    invoice_doc.additional_discount_percentage=additionalDiscount
    invoice_doc.redeem_loyalty_points = redeem_loyalty_points
    invoice_doc.loyalty_amount = loyalty_amount
    invoice_doc.loyalty_program = loyalty_program
    invoice_doc.loyalty_points = loyalty_points
    frappe.log_error(f"Invoice loyalty fields before save: redeem_loyalty_points={invoice_doc.redeem_loyalty_points}, loyalty_amount={invoice_doc.loyalty_amount}, loyalty_program={invoice_doc.loyalty_program}, loyalty_points={invoice_doc.loyalty_points}", "INVOICE_LOYALTY_DEBUG")
    
    # Process items if provided (for split payments)
    if items:
        invoice_doc.items = []  # Clear existing items
        for item_data in items:
            invoice_doc.append("items", item_data)

    invoice_doc.calculate_taxes_and_totals()

    for pay in invoice_doc.payments:
        pay.delete(pay.mode_of_payment)

    for d in payments:
        invoice_doc.append(
            "payments", dict(mode_of_payment=d["mode_of_payment"], amount=d["amount"])
        )

    # If this is a split payment, save as draft and mark it
    if is_split:
        # Set custom field to track this is a split payment invoice
        if hasattr(invoice_doc, 'custom_is_split_payment'):
            invoice_doc.custom_is_split_payment = 1
        if hasattr(invoice_doc, 'custom_original_invoice') and original_invoice:
            invoice_doc.custom_original_invoice = original_invoice
        
        # Save as draft first
        invoice_doc.submit()
        
        # Check if payment is complete and submit if so
        total_paid = sum([p.amount for p in invoice_doc.payments])
        if total_paid >= invoice_doc.grand_total:
            try:
                invoice_doc.submit()
                frappe.db.commit()
                
                # Check if all related split invoices are now paid and submit them
                if original_invoice:
                    check_and_submit_split_invoices(original_invoice)
                else:
                    check_and_submit_split_invoices(invoice_doc.name)
                
                return {
                    "status": "success",
                    "message": "Split payment completed and invoice submitted",
                    "invoice_name": invoice_doc.name,
                    "is_draft": False
                }
            except Exception as e:
                frappe.log_error(f"Error submitting split invoice: {e}", "SPLIT_INVOICE_SUBMIT")
                frappe.db.commit()
                return {
                    "status": "success",
                    "message": "Split payment saved as draft",
                    "invoice_name": invoice_doc.name,
                    "is_draft": True
                }
        else:
            frappe.db.commit()
            return {
                "status": "success",
                "message": "Split payment invoice saved as draft",
                "invoice_name": invoice_doc.name,
                "is_draft": True
            }
    else:
        # Normal payment - submit invoice
        invoice_doc.save()
        try:
            invoice_doc.submit()
        except Exception as e:
            frappe.throw(f"Error while settling order: {e}")
    
    

# Cancel KOT Doc Creation
def cancel_kot(invoice_id):

    pos_invoice = frappe.get_doc("POS Invoice", invoice_id)
    pos_profile_id = pos_invoice.pos_profile
    pos_profile = frappe.get_doc("POS Profile", pos_profile_id)
    kot_naming_series = pos_profile.custom_kot_naming_series
    cancel_kot_naming_series = "CNCL-" + kot_naming_series

    items = []
    # Create a list of items for the canceled KOT
    for item in pos_invoice.items:
        order_item = {
            "item_code": item.get("item", item.get("item_code")),
            "qty": item.qty,
            "item_name": item.item_name,
        }
        items.append(order_item)

    if pos_invoice.restaurant_table:
        restaurant_table = pos_invoice.restaurant_table
    else:
        restaurant_table = None

    # Process items for a canceled KOT
    process_items_for_cancel_kot(
        invoice_id,
        pos_invoice.customer,
        restaurant_table,
        items,
        "",
        pos_profile_id,
        cancel_kot_naming_series,
        "Cancelled",
        items,
    )

    # Set the KOTs associated with the invoice as canceled
    kot_list = frappe.db.get_list(
        "URY KOT",
        filters={
            "invoice": invoice_id,
            "type": ("in", ("New Order", "Order Modified")),
            "docstatus": 1,
        },
        fields=("*"),
    )

    for item in kot_list:
        kot_doc = frappe.get_doc("URY KOT", item.name)
        kot_doc.docstatus = 2
        kot_doc.save()


def change_table_in_kot(invoice, new_table, branch):
    # Get a list of KOTs associated with the POS Invoice
    kot_list = frappe.get_all(
        "URY KOT",
        filters={
            "invoice": invoice,
            "docstatus": 1,
            "order_status": "Ready For Prepare",
            "verified": 0,
        },
    )

    # Update each KOT's restaurant_table and send a real-time update
    for kot in kot_list:
        frappe.db.set_value("URY KOT", kot.name, "restaurant_table", new_table)
        production = frappe.db.get_value("URY KOT", kot.name, "production")
        kot_channel = "{}_{}_{}".format("kot_update", branch, production)
        frappe.publish_realtime(kot_channel)

@frappe.whitelist()
def get_loyalty_program_details_with_points(customer, loyalty_program=None, silent=False):
    if not loyalty_program and customer:
        loyalty_program = frappe.db.get_value("Customer", customer, "loyalty_program")

    if not loyalty_program and not silent:
        frappe.throw(_("Loyalty Program not found for this customer"))

    if not loyalty_program:
        return None

    frappe.log_error(f"Fetching loyalty points for customer: {customer}, program: {loyalty_program}", "LOYALTY_DEBUG")
    loyalty_points_result = frappe.db.sql(
        """SELECT SUM(loyalty_points) FROM `tabLoyalty Point Entry` WHERE customer = %s AND loyalty_program = %s""",
        (customer, loyalty_program),
        as_dict=True
    )
    loyalty_points = loyalty_points_result[0]["SUM(loyalty_points)"] if loyalty_points_result and loyalty_points_result[0]["SUM(loyalty_points)"] is not None else 0
    frappe.log_error(f"Loyalty points fetched: {loyalty_points}", "LOYALTY_DEBUG")
    
    conversion_factor = frappe.db.get_value("Loyalty Program", loyalty_program, "conversion_factor")

    return {
        "loyalty_program": loyalty_program,
        "loyalty_points": loyalty_points,
        "conversion_factor": conversion_factor
    }

@frappe.whitelist()
def get_item_dish_variants(item_code):
    """Returns dish variants for a given item."""
    try:
        variants = frappe.get_all(
            "Dish Variants",
            filters={"parenttype": "Item", "parent": item_code},
            fields=["name", "type"],
            order_by="idx asc"
        )
        return variants
    except Exception as e:
        frappe.log_error(f"Error fetching dish variants for item {item_code}: {e}", "DISH_VARIANT_FETCH_ERROR")
        return []


import frappe
from frappe import _
from frappe.utils import now_datetime

@frappe.whitelist()
def check_and_submit_split_invoices(original_invoice):
    """
    Check if all split payment invoices are paid and auto-submit them
    """
    try:
        # Get all invoices related to this split payment (including original)
        split_invoices = frappe.get_all(
            "POS Invoice",
            filters={
                "custom_original_invoice": original_invoice,
                "docstatus": 0
            },
            fields=["name", "grand_total"]
        )
        
        # Also check the original invoice
        original_doc = frappe.get_doc("POS Invoice", original_invoice)
        
        # If original is still draft, include it
        if original_doc.docstatus == 0:
            split_invoices.append({
                "name": original_invoice,
                "grand_total": original_doc.grand_total
            })
        
        # If no draft invoices left, all are paid - submit them all
        if len(split_invoices) == 0:
            return {"status": "success", "message": "All invoices already submitted"}
        
        # Check if this is the last one - if so, submit all
        # For now, we'll submit each invoice as it's paid
        for inv in split_invoices:
            try:
                inv_doc = frappe.get_doc("POS Invoice", inv["name"])
                # Check if payment is complete
                total_paid = sum([p.amount for p in inv_doc.payments])
                if total_paid >= inv_doc.grand_total:
                    inv_doc.submit()
                    frappe.db.commit()
            except Exception as e:
                frappe.log_error(f"Error submitting split invoice {inv['name']}: {e}", "SPLIT_INVOICE_SUBMIT_ERROR")
        
        return {"status": "success", "message": "Split invoices processed"}
    except Exception as e:
        frappe.log_error(f"Error in check_and_submit_split_invoices: {e}", "SPLIT_INVOICE_CHECK_ERROR")
        return {"status": "error", "message": str(e)}

@frappe.whitelist()
def create_order(customer,payments, pos_profile, table=None, cashier=None, owner=None, items=None, original_invoice=None):
    # Standard Frappe imports needed for this function
    from frappe.utils import now_datetime
    from frappe import _ # Assuming _ is imported for translation

    invoice = frappe.new_doc("POS Invoice")
    invoice.customer = customer
    invoice.pos_profile = pos_profile
    # ... (other invoice fields)

    invoice.company = frappe.db.get_value("POS Profile", pos_profile, "company")
    invoice.is_pos = 1
    invoice.set_posting_time = 1
    invoice.posting_date = now_datetime().date()
    invoice.posting_time = now_datetime().time()
    invoice.owner = owner or frappe.session.user

    if cashier:
        invoice.cashier = cashier

    if table:
        invoice.restaurant_table = table
        # Set restaurant if applicable
        try:
            branch, menu, restaurant = get_restaurant_and_menu_name(table)
            invoice.restaurant = restaurant
            invoice.branch = branch
        except:
            pass

    # Link to original invoice if this is a split payment continuation
    if original_invoice and hasattr(invoice, 'custom_original_invoice'):
        invoice.custom_original_invoice = original_invoice
        invoice.custom_is_split_payment = 1

    # 1. Initialize Loyalty Fields to avoid custom validation errors
    # This explicitly sets the fields, satisfying the custom check/log
    invoice.redeem_loyalty_points = 0
    invoice.loyalty_amount = 0
    invoice.loyalty_program = None
    invoice.loyalty_points = 0
    # End of new loyalty field initialization

    # Add items
    # Ensure items is not None before attempting to parse
    items_list = frappe.parse_json(items) if items else []

    for item_data in items_list:
        # Note: Frontend now sends 'item_code' for new items, but the backend accepts 'item' or 'item_name'
        item_code = item_data.get("item_code") or item_data.get("item") or item_data.get("item_name")
        qty = item_data.get("qty") or 1

        if not item_code:
            frappe.throw(_("Missing Item Code for one of the items"))
        if qty <= 0:
            frappe.throw(_("Invalid quantity for item {0}").format(item_code))

        invoice.append("items", {
            "item_code": item_code,
            "item_name": item_data.get("item_name"),
            "qty": qty,
            "rate": item_data.get("rate", 0),
            "description": item_data.get("description"),
            "custom_dish_type": item_data.get("custom_dish_type"),
            "income_account": item_data.get("income_account") or "4110 - Sales - QR",
            "comment": item_data.get("comment"),
            # Ensure uom is included if required by standard POS Invoice
            "uom": item_data.get("uom"), 
        })

    for d in payments:
        invoice.append(
            "payments", dict(mode_of_payment=d["mode_of_payment"], amount=d["amount"])
        )
    # Calculate totals
    invoice.calculate_taxes_and_totals()
    invoice.save(ignore_permissions=True)

    frappe.db.commit()

    frappe.msgprint(_("New POS Invoice created successfully: {0}").format(invoice.name))

    return {
        "status": "success",
        "message": "New POS Invoice created successfully",
        "invoice_name": invoice.name
    }