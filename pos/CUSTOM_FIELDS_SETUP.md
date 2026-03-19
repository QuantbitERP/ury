# Custom Fields Setup for Split Bill Feature

## Required Custom Fields

To enable the split bill functionality, you need to add two custom fields to the **POS Invoice** doctype.

## Method 1: Using Frappe UI (Recommended for Quick Setup)

### Step 1: Add `custom_is_split_payment` Field

1. Go to **Customize Form** in Frappe
2. Select **DocType**: `POS Invoice`
3. Click **Add Row** in the Custom Fields section
4. Fill in the following details:
   - **Label**: `Is Split Payment`
   - **Field Name**: `custom_is_split_payment`
   - **Field Type**: `Check`
   - **Default**: `0`
   - **Insert After**: Choose an appropriate field (e.g., `invoice_printed`)
   - **Description**: `Indicates if this invoice is part of a split payment`

5. Click **Update**

### Step 2: Add `custom_original_invoice` Field

1. In the same **Customize Form** for `POS Invoice`
2. Click **Add Row** in the Custom Fields section
3. Fill in the following details:
   - **Label**: `Original Invoice`
   - **Field Name**: `custom_original_invoice`
   - **Field Type**: `Link`
   - **Options**: `POS Invoice`
   - **Insert After**: `custom_is_split_payment`
   - **Description**: `Links to the original invoice in split payment scenarios`
   - **Depends On**: `eval:doc.custom_is_split_payment==1`

4. Click **Update**

## Method 2: Using Python Script (Recommended for Production)

Create a file: `apps/ury/ury/ury/custom_fields/pos_invoice_custom_fields.py`

```python
import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields

def create_pos_invoice_custom_fields():
    """Create custom fields for POS Invoice to support split payments"""
    
    custom_fields = {
        "POS Invoice": [
            {
                "fieldname": "custom_is_split_payment",
                "label": "Is Split Payment",
                "fieldtype": "Check",
                "insert_after": "invoice_printed",
                "default": "0",
                "description": "Indicates if this invoice is part of a split payment"
            },
            {
                "fieldname": "custom_original_invoice",
                "label": "Original Invoice",
                "fieldtype": "Link",
                "options": "POS Invoice",
                "insert_after": "custom_is_split_payment",
                "depends_on": "eval:doc.custom_is_split_payment==1",
                "description": "Links to the original invoice in split payment scenarios"
            }
        ]
    }
    
    create_custom_fields(custom_fields, update=True)
    frappe.db.commit()
    print("Custom fields created successfully!")

# Run this function
if __name__ == "__main__":
    create_pos_invoice_custom_fields()
```

### To Execute the Script:

```bash
cd /home/erpadmin/bench-urypos
bench --site [your-site-name] console
```

Then in the console:
```python
from ury.ury.custom_fields.pos_invoice_custom_fields import create_pos_invoice_custom_fields
create_pos_invoice_custom_fields()
```

## Method 3: Using Fixtures (Recommended for Version Control)

Add to `apps/ury/ury/hooks.py`:

```python
fixtures = [
    {
        "doctype": "Custom Field",
        "filters": [
            [
                "name",
                "in",
                [
                    "POS Invoice-custom_is_split_payment",
                    "POS Invoice-custom_original_invoice"
                ]
            ]
        ]
    }
]
```

Then export and import:
```bash
bench --site [your-site-name] export-fixtures
bench --site [your-site-name] migrate
```

## Verification

After creating the custom fields, verify they exist:

```bash
bench --site [your-site-name] console
```

```python
frappe.get_meta("POS Invoice").get_field("custom_is_split_payment")
frappe.get_meta("POS Invoice").get_field("custom_original_invoice")
```

Both should return field objects if created successfully.

## Database Schema

The custom fields will create the following columns in the database:

```sql
ALTER TABLE `tabPOS Invoice` 
ADD COLUMN `custom_is_split_payment` INT(1) DEFAULT 0;

ALTER TABLE `tabPOS Invoice` 
ADD COLUMN `custom_original_invoice` VARCHAR(140);
```

## Rollback (If Needed)

To remove the custom fields:

```python
frappe.delete_doc("Custom Field", "POS Invoice-custom_is_split_payment")
frappe.delete_doc("Custom Field", "POS Invoice-custom_original_invoice")
frappe.db.commit()
```

## Important Notes

1. **Backup First**: Always backup your database before making schema changes
2. **Test Environment**: Test in a development environment first
3. **Permissions**: Ensure you have System Manager role to create custom fields
4. **Migration**: If using fixtures, commit the changes to version control
5. **Documentation**: Update your project documentation with these fields

## Troubleshooting

### Issue: Fields not showing in form
- Clear cache: `bench --site [site-name] clear-cache`
- Reload the form in browser (Ctrl+Shift+R)

### Issue: Permission denied
- Ensure you're logged in as Administrator or have System Manager role

### Issue: Field already exists
- Check if fields were created previously
- Use `update=True` parameter in create_custom_fields()
