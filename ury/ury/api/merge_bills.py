import frappe
from frappe import _
import json
from datetime import datetime

no_cache = 1


@frappe.whitelist()
def get_draft_invoices():
    """
    Fetch all draft POS invoices that can be merged.
    Returns invoices with their basic details including items.
    """
    try:
        # Get all draft POS invoices
        draft_invoices = frappe.get_all(
            "POS Invoice",
            filters={
                "docstatus": 0,  # Draft status
                "is_return": 0   # Not return invoices
            },
            fields=[
                "name",
                "customer",
                "grand_total",
                "posting_date",
                "posting_time",
                "creation"
            ],
            order_by="creation desc"
        )
        frappe.msgprint(str(draft_invoices))
        
        # Get items for each invoice
        for invoice in draft_invoices:
            items = frappe.get_all(
                "POS Invoice Item",
                filters={"parent": invoice.name},
                fields=[
                    "item_code",
                    "item_name", 
                    "qty",
                    "rate",
                    "amount",
                    "description"
                ]
            )
            invoice["items"] = items
            
        return draft_invoices
        
    except Exception as e:
        frappe.log_error(message=str(e), title="Get Draft Invoices Failed")
        frappe.throw(_("Failed to fetch draft invoices: {0}").format(str(e)))


@frappe.whitelist()
def merge_draft_invoices(invoice_names):
    """
    Merge multiple draft invoices into a single POS invoice.
    
    Args:
        invoice_names: JSON string or list of invoice names to merge
    
    Returns:
        dict: Contains the new merged invoice name and details
    """
    try:
        # Parse invoice names if it's a JSON string
        if isinstance(invoice_names, str):
            invoice_names = json.loads(invoice_names)
            
        if not isinstance(invoice_names, list) or len(invoice_names) < 2:
            frappe.throw(_("At least 2 invoices are required for merging"))
            
        # Fetch all the draft invoices to merge
        invoices_to_merge = []
        total_amount = 0
        merged_items = {}
        primary_customer = None
        
        for invoice_name in invoice_names:
            invoice_doc = frappe.get_doc("POS Invoice", invoice_name)
            
            # Validate that invoice is draft
            if invoice_doc.docstatus != 0:
                frappe.throw(_("Invoice {0} is not in draft status and cannot be merged").format(invoice_name))
                
            invoices_to_merge.append(invoice_doc)
            total_amount += invoice_doc.grand_total
            
            # Use the first invoice's customer as primary
            if primary_customer is None:
                primary_customer = invoice_doc.customer
                
            # Collect and merge items
            for item in invoice_doc.items:
                item_key = f"{item.item_code}_{item.rate}"  # Group by item code and rate
                
                if item_key in merged_items:
                    # Add quantities if same item with same rate
                    merged_items[item_key]["qty"] += item.qty
                    merged_items[item_key]["amount"] += item.amount
                else:
                    # Add new item
                    merged_items[item_key] = {
                        "item_code": item.item_code,
                        "item_name": item.item_name,
                        "qty": item.qty,
                        "rate": item.rate,
                        "amount": item.amount,
                        "description": item.description or item.item_name,
                        "income_account": item.income_account,
                        "expense_account": item.expense_account,
                        "cost_center": item.cost_center,
                        "warehouse": item.warehouse
                    }
        
        # Create new merged POS invoice
        merged_invoice = frappe.new_doc("POS Invoice")
        
        # Copy basic details from the first invoice
        first_invoice = invoices_to_merge[0]
        merged_invoice.customer = primary_customer
        merged_invoice.pos_profile = first_invoice.pos_profile
        merged_invoice.company = first_invoice.company
        merged_invoice.posting_date = frappe.utils.today()
        merged_invoice.posting_time = frappe.utils.nowtime()
        merged_invoice.set_posting_time = 1
        merged_invoice.is_pos = 1
        merged_invoice.currency = first_invoice.currency
        merged_invoice.selling_price_list = first_invoice.selling_price_list
        merged_invoice.price_list_currency = first_invoice.price_list_currency
        merged_invoice.plc_conversion_rate = first_invoice.plc_conversion_rate
        merged_invoice.conversion_rate = first_invoice.conversion_rate
        merged_invoice.territory = first_invoice.territory
        merged_invoice.customer_group = first_invoice.customer_group
        
        # Copy other relevant fields
        if hasattr(first_invoice, 'restaurant_table'):
            merged_invoice.restaurant_table = first_invoice.restaurant_table
        if hasattr(first_invoice, 'waiter'):
            merged_invoice.waiter = first_invoice.waiter
        if hasattr(first_invoice, 'cashier'):
            merged_invoice.cashier = first_invoice.cashier
            
        # Add merged items to the new invoice
        for item_data in merged_items.values():
            merged_invoice.append("items", {
                "item_code": item_data["item_code"],
                "item_name": item_data["item_name"],
                "qty": item_data["qty"],
                "rate": item_data["rate"],
                "amount": item_data["amount"],
                "description": item_data["description"],
                "income_account": item_data.get("income_account"),
                "expense_account": item_data.get("expense_account"),
                "cost_center": item_data.get("cost_center"),
                "warehouse": item_data.get("warehouse")
            })
            
        # Copy payment details from first invoice if any
        if first_invoice.payments:
            for payment in first_invoice.payments:
                merged_invoice.append("payments", {
                    "mode_of_payment": payment.mode_of_payment,
                    "account": payment.account,
                    "amount": payment.amount,
                    "default": payment.default
                })
        
        # Save the merged invoice as draft
        merged_invoice.insert()
        
        # Add a comment to track the merge
        merged_invoice.add_comment(
            "Comment",
            f"Merged from invoices: {', '.join(invoice_names)}"
        )
        
        return {
            "name": merged_invoice.name,
            "customer": merged_invoice.customer,
            "grand_total": merged_invoice.grand_total,
            "merged_from": invoice_names,
            "message": f"Successfully merged {len(invoice_names)} invoices into {merged_invoice.name}"
        }
        
    except Exception as e:
        frappe.log_error(message=str(e), title="Merge Invoices Failed")
        frappe.throw(_("Failed to merge invoices: {0}").format(str(e)))


@frappe.whitelist()
def delete_draft_invoice(invoice_name):
    """
    Delete a draft POS invoice.
    
    Args:
        invoice_name: Name of the invoice to delete
    
    Returns:
        dict: Success status
    """
    try:
        # Check if invoice exists and is draft
        invoice_doc = frappe.get_doc("POS Invoice", invoice_name)
        
        if invoice_doc.docstatus != 0:
            frappe.throw(_("Cannot delete submitted invoice {0}").format(invoice_name))
            
        # Delete the invoice
        frappe.delete_doc("POS Invoice", invoice_name)
        frappe.db.commit()
        
        return {
            "status": "success",
            "message": f"Invoice {invoice_name} deleted successfully"
        }
        
    except Exception as e:
        frappe.log_error(message=str(e), title="Delete Invoice Failed")
        frappe.throw(_("Failed to delete invoice {0}: {1}").format(invoice_name, str(e)))


@frappe.whitelist()
def get_invoice_details(invoice_name):
    """
    Get detailed information about a specific invoice.
    
    Args:
        invoice_name: Name of the invoice
    
    Returns:
        dict: Invoice details with items
    """
    try:
        invoice_doc = frappe.get_doc("POS Invoice", invoice_name)
        
        return {
            "name": invoice_doc.name,
            "customer": invoice_doc.customer,
            "grand_total": invoice_doc.grand_total,
            "posting_date": invoice_doc.posting_date,
            "posting_time": invoice_doc.posting_time,
            "docstatus": invoice_doc.docstatus,
            "items": [
                {
                    "item_code": item.item_code,
                    "item_name": item.item_name,
                    "qty": item.qty,
                    "rate": item.rate,
                    "amount": item.amount,
                    "description": item.description
                }
                for item in invoice_doc.items
            ]
        }
        
    except Exception as e:
        frappe.log_error(message=str(e), title="Get Invoice Details Failed")
        frappe.throw(_("Failed to get invoice details: {0}").format(str(e)))
