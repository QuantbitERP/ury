import React, { useState, useEffect } from 'react';
import { frappeFetch } from '../lib/frappe-sdk';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Spinner } from './ui/spinner';
import { showToast } from './ui/toast';

interface TransferWaiterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ordersToTransfer: string[];
  currentWaiter: string | null;
  onTransferSuccess: () => void;
}

const TransferWaiterDialog: React.FC<TransferWaiterDialogProps> = ({
  isOpen,
  onClose,
  ordersToTransfer,
  currentWaiter,
  onTransferSuccess
}) => {
  const [waiters, setWaiters] = useState<string[]>([]);
  const [selectedWaiter, setSelectedWaiter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchWaiters = async () => {
        setIsLoading(true);
        try {
          const res = await frappeFetch('/api/method/ury.ury.api.ury_print.get_all_pos_users');
          if (!res.ok) throw new Error('Failed to fetch waiters');
          const data = await res.json();
          setWaiters((data.message || []).filter((w: string) => w !== currentWaiter));
        } catch (err) {
          showToast.error(err instanceof Error ? err.message : 'Could not load waiter list.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchWaiters();
    }
  }, [isOpen, currentWaiter]);

  const handleConfirmTransfer = async () => {
    if (!selectedWaiter) {
      showToast.error("Please select a new waiter.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await frappeFetch('/api/method/ury.ury.api.ury_print.transfer_multiple_orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orders_to_transfer: JSON.stringify(ordersToTransfer),
          new_waiter: selectedWaiter
        })
      });
      if (!res.ok) throw new Error('Transfer failed');
      showToast.success(`Successfully transferred ${ordersToTransfer.length} orders.`);
      onTransferSuccess();
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'An error occurred during transfer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader> {/* Header remains centered by default */}
          <DialogTitle>Transfer Waiter</DialogTitle>
          <DialogDescription>
            You are about to transfer {ordersToTransfer.length} selected order(s).
          </DialogDescription>
        </DialogHeader>

        {/* --- THIS IS THE ONLY LINE THAT CHANGED --- */}
        <div className="px-6 py-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2 text-gray-700">Orders to Transfer:</h4>
            <div className="max-h-24 overflow-y-auto rounded-md border bg-gray-50 p-2 text-sm text-gray-600">
              <ul>
                {ordersToTransfer.map(order => <li key={order}>{order}</li>)}
              </ul>
            </div>
          </div>

          {currentWaiter && (
            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-700">Current Waiter:</h4>
              <p className="rounded-md border bg-gray-50 p-2 text-sm font-semibold text-gray-800">
                {currentWaiter}
              </p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium mb-2 text-gray-700">Select New Waiter:</h4>
            {isLoading ? (
              <Spinner message="Loading waiters..." />
            ) : (
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedWaiter || ""}
                onChange={(e) => setSelectedWaiter(e.target.value)}
              >
                <option value="" disabled>Select a user...</option>
                {waiters.map(waiter => (
                  <option key={waiter} value={waiter}>
                    {waiter}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirmTransfer} disabled={isSubmitting || isLoading || !selectedWaiter}>
            {isSubmitting ? 'Transferring...' : 'Confirm Transfer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransferWaiterDialog;