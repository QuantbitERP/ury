"""
Custom Fields for POS Invoice - Split Payment Feature
This script creates the necessary custom fields to support split bill payments
"""

import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields


def create_split_payment_custom_fields():
    """
    Create custom fields for POS Invoice to support split payments
    
    Fields created:
    1. custom_is_split_payment: Marks if invoice is part of split payment
    2. custom_original_invoice: Links split invoices to original invoice
    """
    
    custom_fields = {
        "POS Invoice": [
            {
                "fieldname": "custom_is_split_payment",
                "label": "Is Split Payment",
                "fieldtype": "Check",
                "insert_after": "invoice_printed",
                "default": "0",
                "read_only": 0,
                "hidden": 0,
                "print_hide": 1,
                "description": "Indicates if this invoice is part of a split payment"
            },
            {
                "fieldname": "custom_original_invoice",
                "label": "Original Invoice",
                "fieldtype": "Link",
                "options": "POS Invoice",
                "insert_after": "custom_is_split_payment",
                "read_only": 0,
                "hidden": 0,
                "print_hide": 1,
                "depends_on": "eval:doc.custom_is_split_payment==1",
                "description": "Links to the original invoice in split payment scenarios"
            }
        ]
    }
    
    try:
        create_custom_fields(custom_fields, update=True)
        frappe.db.commit()
        print("✓ Custom fields created successfully!")
        print("  - custom_is_split_payment")
        print("  - custom_original_invoice")
        return True
    except Exception as e:
        print(f"✗ Error creating custom fields: {str(e)}")
        frappe.log_error(f"Error creating split payment custom fields: {str(e)}", "Custom Field Creation Error")
        return False


def verify_custom_fields():
    """
    Verify that the custom fields were created successfully
    """
    try:
        meta = frappe.get_meta("POS Invoice")
        
        field1 = meta.get_field("custom_is_split_payment")
        field2 = meta.get_field("custom_original_invoice")
        
        if field1 and field2:
            print("\n✓ Verification successful!")
            print(f"  - custom_is_split_payment: {field1.fieldtype}")
            print(f"  - custom_original_invoice: {field2.fieldtype} -> {field2.options}")
            return True
        else:
            print("\n✗ Verification failed!")
            if not field1:
                print("  - custom_is_split_payment: NOT FOUND")
            if not field2:
                print("  - custom_original_invoice: NOT FOUND")
            return False
    except Exception as e:
        print(f"\n✗ Verification error: {str(e)}")
        return False


def remove_split_payment_custom_fields():
    """
    Remove the custom fields (use with caution!)
    """
    try:
        frappe.delete_doc("Custom Field", "POS Invoice-custom_is_split_payment", force=True)
        frappe.delete_doc("Custom Field", "POS Invoice-custom_original_invoice", force=True)
        frappe.db.commit()
        print("✓ Custom fields removed successfully!")
        return True
    except Exception as e:
        print(f"✗ Error removing custom fields: {str(e)}")
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("POS Invoice Split Payment - Custom Fields Setup")
    print("=" * 60)
    print("\nCreating custom fields...")
    
    if create_split_payment_custom_fields():
        print("\nVerifying custom fields...")
        verify_custom_fields()
        print("\n" + "=" * 60)
        print("Setup complete! You can now use split bill payments.")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("Setup failed! Check the error logs.")
        print("=" * 60)
