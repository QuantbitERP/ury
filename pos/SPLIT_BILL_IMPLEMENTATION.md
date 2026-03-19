# Split Bill Implementation

## Overview
This implementation ensures that when a bill is split, all invoices remain in **draft status** until all items are paid. Once all split payments are completed, the invoices are automatically submitted with **paid status**.

## Changes Made

### Backend Changes (`ury_order.py`)

#### 1. Modified `make_invoice()` Function
- **Added Parameters:**
  - `is_split_payment`: Flag to indicate if this is a split payment (0 or 1)
  - `original_invoice`: Reference to the original invoice for linking split invoices

- **New Logic:**
  - When `is_split_payment=1`, the invoice is saved as **draft** instead of being submitted
  - Custom fields are set to track split payment state:
    - `custom_is_split_payment`: Marks this as a split payment invoice
    - `custom_original_invoice`: Links to the original invoice
  - Payment completeness is checked: if payment amount >= grand total, the invoice is auto-submitted
  - After submission, calls `check_and_submit_split_invoices()` to check if all related invoices are paid

#### 2. Added `check_and_submit_split_invoices()` Function
- **Purpose:** Auto-submit all split invoices when payments are complete
- **Logic:**
  - Finds all draft invoices linked to the original invoice
  - Checks each invoice's payment status
  - Submits invoices where `total_paid >= grand_total`
  - Handles errors gracefully with logging

#### 3. Updated `create_order()` Function
- **Added Parameter:** `original_invoice` to link remaining items to the original invoice
- **New Logic:**
  - Sets `custom_original_invoice` and `custom_is_split_payment` fields when creating orders for remaining items
  - Properly sets restaurant and branch information

### Frontend Changes (`PaymentDialog.tsx`)

#### 1. Modified `handlePayment()` Function
- **Added Logic:**
  - Detects split payment mode: `isSplit = isSplitPayment && selectedSplitItems.length > 0`
  - Passes `is_split_payment` and `original_invoice` to backend
  - Parses response to check if invoice is still in draft or submitted
  - Shows appropriate toast messages based on payment status

#### 2. Enhanced User Feedback
- Different messages for different scenarios:
  - "Split payment successful. New order created for remaining items." - when items remain
  - "Split payment saved. Complete remaining payments to finalize." - when invoice is still draft
  - "All split payments completed and invoices submitted!" - when all payments complete

## Workflow Example

### Scenario: 3 items, split payment for 1 item

1. **Initial State:**
   - Original invoice has 3 items (Item A, Item B, Item C)
   - Status: Draft

2. **First Split Payment (Item A):**
   - User selects Item A in split bill mode
   - Makes payment for Item A
   - **Result:**
     - New invoice created for Item A with payment → Saved as **Draft**
     - New order created for remaining items (Item B, Item C) → Saved as **Draft**
     - Original invoice remains in **Draft**

3. **Second Split Payment (Item B):**
   - User selects Item B from the new order
   - Makes payment for Item B
   - **Result:**
     - New invoice created for Item B with payment → Saved as **Draft**
     - New order created for Item C → Saved as **Draft**

4. **Final Payment (Item C):**
   - User makes payment for Item C
   - **Result:**
     - Invoice for Item C with payment → **Auto-submitted with Paid status**
     - System checks all related invoices
     - All previous invoices (Item A, Item B) → **Auto-submitted with Paid status**
     - All invoices now show as **Paid**

## Required Custom Fields

To use this implementation, ensure these custom fields exist in the POS Invoice doctype:

1. **custom_is_split_payment** (Check/Boolean)
   - Marks if this invoice is part of a split payment

2. **custom_original_invoice** (Link to POS Invoice)
   - Links split invoices to the original invoice

## Testing Checklist

- [ ] Split payment for 1 item out of 3 - verify draft status
- [ ] Complete payment for 2nd item - verify still draft
- [ ] Complete payment for last item - verify all auto-submit
- [ ] Check invoice status shows as "Paid" after all payments
- [ ] Verify no items are lost during split
- [ ] Test with different payment methods
- [ ] Test with discounts applied
- [ ] Test with loyalty points redemption

## Notes

- Invoices remain in draft until **all** related split payments are completed
- The system automatically submits all related invoices when the last payment is made
- Error handling ensures that if auto-submit fails, invoices remain in draft for manual processing
- All split invoices are linked via `custom_original_invoice` field for tracking
