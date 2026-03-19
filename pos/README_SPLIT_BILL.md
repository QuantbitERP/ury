# Split Bill Payment Feature - Complete Implementation Guide

## 🎯 Feature Overview

This implementation provides a complete split bill payment system where:
- Customers can pay for individual items from an order separately
- **All invoices remain in DRAFT status** until all items are paid
- When the last item is paid, **all related invoices are automatically submitted** with PAID status
- Each payment creates a new invoice for the paid items
- Remaining unpaid items are moved to a new order

## 📋 Prerequisites

1. Frappe/ERPNext environment
2. URY POS application installed
3. Administrator or System Manager access
4. Database backup (recommended)

## 🚀 Installation Steps

### Step 1: Setup Custom Fields

The feature requires two custom fields in the POS Invoice doctype.

#### Option A: Automated Setup (Recommended)

```bash
cd /home/erpadmin/bench-urypos
bench --site [your-site-name] console
```

In the console:
```python
from ury.ury.custom_fields.pos_invoice_split_payment import create_split_payment_custom_fields, verify_custom_fields

# Create the fields
create_split_payment_custom_fields()

# Verify they were created
verify_custom_fields()
```

#### Option B: Manual Setup via UI

1. Go to **Customize Form**
2. Select **POS Invoice**
3. Add these fields:

**Field 1:**
- Label: `Is Split Payment`
- Field Name: `custom_is_split_payment`
- Type: `Check`
- Default: `0`

**Field 2:**
- Label: `Original Invoice`
- Field Name: `custom_original_invoice`
- Type: `Link`
- Options: `POS Invoice`
- Depends On: `eval:doc.custom_is_split_payment==1`

### Step 2: Verify Backend Changes

The following files have been modified:

1. **`/apps/ury/ury/ury/doctype/ury_order/ury_order.py`**
   - Modified `make_invoice()` function
   - Added `check_and_submit_split_invoices()` function
   - Updated `create_order()` function

2. **`/apps/ury/pos/src/components/PaymentDialog.tsx`**
   - Updated `handlePayment()` function
   - Enhanced user feedback messages

### Step 3: Clear Cache and Restart

```bash
cd /home/erpadmin/bench-urypos
bench --site [your-site-name] clear-cache
bench restart
```

## 📖 How It Works

### User Flow

1. **Create Order**: Add 3 items (A, B, C) to an order
2. **Enable Split Bill**: Toggle "Split Bill" in payment dialog
3. **Select Items**: Check Item A to pay for it
4. **Make Payment**: Enter payment amount and complete
5. **Result**: 
   - Invoice for Item A created (DRAFT status)
   - New order created for Items B & C (DRAFT status)
6. **Repeat**: Pay for Item B
   - Invoice for Item B created (DRAFT status)
   - New order created for Item C (DRAFT status)
7. **Final Payment**: Pay for Item C
   - Invoice for Item C created and **SUBMITTED**
   - **All previous invoices (A & B) automatically SUBMITTED**
   - All invoices now show **PAID** status ✓

### Technical Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. User selects items and clicks Pay with Split Bill ON   │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Frontend sends: is_split_payment=1, selected items     │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Backend make_invoice():                                 │
│     - Creates invoice with selected items                   │
│     - Sets custom_is_split_payment = 1                      │
│     - Saves as DRAFT (not submitted)                        │
│     - Checks if payment complete                            │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  4. If payment complete:                                    │
│     - Submit this invoice                                   │
│     - Call check_and_submit_split_invoices()                │
│     - Find all related draft invoices                       │
│     - Submit all that have complete payments                │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Frontend creates new order for remaining items          │
│     - Calls create_order() with original_invoice link       │
│     - New order created in DRAFT status                     │
└─────────────────────────────────────────────────────────────┘
```

## 🧪 Testing Guide

### Test Case 1: Basic Split Payment (3 Items)

1. Create order with 3 items ($10 each)
2. Enable split bill
3. Select and pay for Item 1
   - ✓ Invoice 1 created (DRAFT)
   - ✓ New order created for Items 2 & 3
4. Select and pay for Item 2
   - ✓ Invoice 2 created (DRAFT)
   - ✓ New order created for Item 3
5. Pay for Item 3
   - ✓ Invoice 3 created (SUBMITTED)
   - ✓ Invoice 1 auto-submitted (PAID)
   - ✓ Invoice 2 auto-submitted (PAID)

### Test Case 2: Split with Discounts

1. Create order with 2 items
2. Apply 10% discount
3. Enable split bill and pay for Item 1
   - ✓ Discount applied proportionally
   - ✓ Invoice saved as DRAFT
4. Pay for Item 2
   - ✓ Both invoices auto-submitted

### Test Case 3: Split with Loyalty Points

1. Create order with customer having loyalty points
2. Enable split bill
3. Redeem loyalty points on first item
   - ✓ Points redeemed correctly
   - ✓ Invoice saved as DRAFT
4. Complete remaining payments
   - ✓ All invoices submitted

### Test Case 4: Partial Payment Scenario

1. Create order with 3 items
2. Pay for 2 items via split bill
3. Leave 1 item unpaid
   - ✓ 2 invoices in DRAFT
   - ✓ 1 order in DRAFT
4. Come back later and pay for last item
   - ✓ All 3 invoices auto-submitted

## 🔍 Verification Queries

### Check Split Payment Invoices

```sql
-- Find all split payment invoices
SELECT name, customer, grand_total, docstatus, custom_is_split_payment, custom_original_invoice
FROM `tabPOS Invoice`
WHERE custom_is_split_payment = 1
ORDER BY creation DESC;

-- Find draft split invoices
SELECT name, customer, grand_total, custom_original_invoice
FROM `tabPOS Invoice`
WHERE custom_is_split_payment = 1 AND docstatus = 0;

-- Find submitted split invoices
SELECT name, customer, grand_total, custom_original_invoice
FROM `tabPOS Invoice`
WHERE custom_is_split_payment = 1 AND docstatus = 1;
```

### Check Invoice Relationships

```sql
-- Find all invoices related to a specific original invoice
SELECT name, grand_total, docstatus, status
FROM `tabPOS Invoice`
WHERE custom_original_invoice = 'POS-INV-2024-00001'
   OR name = 'POS-INV-2024-00001';
```

## 🐛 Troubleshooting

### Issue: Invoices Not Auto-Submitting

**Symptoms**: Last payment made but invoices still in draft

**Solutions**:
1. Check error logs:
   ```bash
   bench --site [site-name] console
   ```
   ```python
   frappe.get_all("Error Log", filters={"error": ["like", "%SPLIT_INVOICE%"]}, limit=5)
   ```

2. Manually trigger submission:
   ```python
   from ury.ury.doctype.ury_order.ury_order import check_and_submit_split_invoices
   check_and_submit_split_invoices("POS-INV-2024-00001")
   ```

### Issue: Custom Fields Not Found

**Symptoms**: Error about missing custom fields

**Solutions**:
1. Verify fields exist:
   ```python
   frappe.get_meta("POS Invoice").get_field("custom_is_split_payment")
   ```

2. Recreate fields:
   ```python
   from ury.ury.custom_fields.pos_invoice_split_payment import create_split_payment_custom_fields
   create_split_payment_custom_fields()
   ```

### Issue: Payment Dialog Not Showing Split Option

**Solutions**:
1. Clear browser cache (Ctrl+Shift+R)
2. Clear server cache:
   ```bash
   bench --site [site-name] clear-cache
   ```
3. Rebuild assets:
   ```bash
   bench build --app ury
   ```

## 📊 Monitoring and Analytics

### Dashboard Queries

```sql
-- Count of split payments today
SELECT COUNT(*) as split_payments_today
FROM `tabPOS Invoice`
WHERE custom_is_split_payment = 1
  AND DATE(creation) = CURDATE();

-- Average split payment value
SELECT AVG(grand_total) as avg_split_amount
FROM `tabPOS Invoice`
WHERE custom_is_split_payment = 1
  AND docstatus = 1;

-- Split payments by status
SELECT status, COUNT(*) as count, SUM(grand_total) as total_amount
FROM `tabPOS Invoice`
WHERE custom_is_split_payment = 1
GROUP BY status;
```

## 🔐 Security Considerations

1. **Permissions**: Ensure proper role permissions for POS Invoice
2. **Validation**: Backend validates payment amounts
3. **Audit Trail**: All invoices maintain creation and modification logs
4. **Data Integrity**: Foreign key relationships maintained via custom_original_invoice

## 📝 API Reference

### Backend Functions

#### `make_invoice()`
```python
@frappe.whitelist()
def make_invoice(
    customer, payments, cashier, pos_profile, owner,
    additionalDiscount=None, table=None, invoice=None,
    redeem_loyalty_points=0, loyalty_amount=0,
    loyalty_program=None, loyalty_points=0,
    items=None, is_split_payment=0, original_invoice=None
)
```

#### `check_and_submit_split_invoices()`
```python
@frappe.whitelist()
def check_and_submit_split_invoices(original_invoice)
```

#### `create_order()`
```python
@frappe.whitelist()
def create_order(
    customer, pos_profile, table=None,
    cashier=None, owner=None, items=None,
    original_invoice=None
)
```

## 📚 Additional Resources

- [SPLIT_BILL_IMPLEMENTATION.md](./SPLIT_BILL_IMPLEMENTATION.md) - Detailed implementation notes
- [SPLIT_BILL_FLOW.txt](./SPLIT_BILL_FLOW.txt) - Visual flow diagram
- [CUSTOM_FIELDS_SETUP.md](./CUSTOM_FIELDS_SETUP.md) - Custom fields setup guide

## 🤝 Support

For issues or questions:
1. Check error logs: `bench --site [site-name] show-log`
2. Review implementation documentation
3. Contact development team

## 📄 License

This implementation is part of the URY POS system.

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-10  
**Author**: Development Team
