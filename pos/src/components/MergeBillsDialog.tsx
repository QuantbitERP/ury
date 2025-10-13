import React, { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { showToast } from "./ui/toast";
import { frappeFetch } from "../lib/frappe-sdk";
import { formatCurrency } from "../lib/utils";

interface DraftInvoice {
  name: string;
  customer: string;
  grand_total: number;
  posting_date: string;
  items: any[];
}

interface MergeBillsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onMergeSuccess: (newBillName: string) => void;
}

const MergeBillsDialog: React.FC<MergeBillsDialogProps> = ({ isOpen, onClose, onMergeSuccess }) => {
  const [draftInvoices, setDraftInvoices] = useState<DraftInvoice[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>(""); // 🆕 Added

  useEffect(() => {
    if (isOpen) {
      fetchDraftInvoices();
      setSelectedInvoices([]);
      setSelectedCustomer("");
    }
  }, [isOpen]);

  const fetchDraftInvoices = async () => {
    setLoading(true);
    try {
      const res = await frappeFetch("/api/method/ury.ury.api.merge_bills.get_draft_invoices");
      if (!res.ok) throw new Error("Failed to fetch draft invoices");
      const data = await res.json();
      setDraftInvoices(data.message || []);
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : "Error loading draft invoices");
    } finally {
      setLoading(false);
    }
  };

  const toggleInvoiceSelection = (invoiceName: string) => {
    setSelectedInvoices((prev: string[]) =>
      prev.includes(invoiceName)
        ? prev.filter((b: string) => b !== invoiceName)
        : [...prev, invoiceName]
    );
  };

  const handleMerge = async () => {
    if (selectedInvoices.length < 2) {
      showToast.error("Please select at least 2 draft invoices to merge.");
      return;
    }

    if (!selectedCustomer) {
      showToast.error("Please select a customer for the merged invoice.");
      return;
    }

    setSubmitting(true);
    try {
      const mergeRes = await frappeFetch("/api/method/ury.ury.api.merge_bills.merge_draft_invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_names: selectedInvoices,
          selected_customer: selectedCustomer, // 🆕 Added
        }),
      });

      if (!mergeRes.ok) throw new Error("Failed to merge invoices");

      const mergeData = await mergeRes.json();
      const newInvoiceName = mergeData.message?.name;

      if (!newInvoiceName) {
        throw new Error("No invoice name returned from merge operation");
      }

      // Delete old invoices
      for (const invoiceName of selectedInvoices) {
        try {
          await frappeFetch("/api/method/frappe.client.delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              doctype: "POS Invoice",
              name: invoiceName,
            }),
          });
        } catch (deleteErr) {
          console.error(`Failed to delete invoice ${invoiceName}:`, deleteErr);
        }
      }

      showToast.success(`Invoices merged successfully! New invoice: ${newInvoiceName}`);
      onMergeSuccess(newInvoiceName);
      onClose();
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : "Failed to merge invoices");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTotal = draftInvoices
    .filter((invoice) => selectedInvoices.includes(invoice.name))
    .reduce((sum, invoice) => sum + invoice.grand_total, 0);

  // 🆕 Collect customers from selected invoices
  const availableCustomers = Array.from(
    new Set(
      draftInvoices
        .filter((inv) => selectedInvoices.includes(inv.name))
        .map((inv) => inv.customer)
    )
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Merge Draft Invoices</DialogTitle>
          <DialogDescription>
            Select draft invoices to merge into one new POS invoice.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4">
          {loading ? (
            <Spinner message="Loading draft invoices..." />
          ) : draftInvoices.length === 0 ? (
            <p className="text-gray-500 text-sm">No draft invoices found.</p>
          ) : (
            <>
              <div className="max-h-64 overflow-y-auto border rounded-md p-3 bg-gray-50">
                {draftInvoices.map((invoice) => (
                  <label
                    key={invoice.name}
                    className="flex items-center justify-between py-2 cursor-pointer border-b border-gray-200 last:border-b-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{invoice.name}</p>
                      <p className="text-xs text-gray-500">Customer: {invoice.customer}</p>
                      <p className="text-xs text-gray-600">Date: {invoice.posting_date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-green-600">
                        {formatCurrency(invoice.grand_total)}
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(invoice.name)}
                        onChange={() => toggleInvoiceSelection(invoice.name)}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                    </div>
                  </label>
                ))}
              </div>

              {selectedInvoices.length > 0 && (
                <>
                  {/* 🆕 Customer selection */}
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Customer for Merged Invoice
                    </label>
                    <select
                      className="border rounded-md px-3 py-2 w-full text-sm"
                      value={selectedCustomer}
                      onChange={(e) => setSelectedCustomer(e.target.value)}
                    >
                      <option value="">-- Select Customer --</option>
                      {availableCustomers.map((customer) => (
                        <option key={customer} value={customer}>
                          {customer}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-800">
                        Selected: {selectedInvoices.length} invoice
                        {selectedInvoices.length !== 1 ? "s" : ""}
                      </span>
                      <span className="text-sm font-semibold text-blue-900">
                        Total: {formatCurrency(selectedTotal)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleMerge}
            disabled={submitting || loading || selectedInvoices.length < 2 || !selectedCustomer}
          >
            {submitting
              ? "Merging..."
              : `Merge ${selectedInvoices.length} Invoice${selectedInvoices.length !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MergeBillsDialog;
