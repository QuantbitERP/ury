import React, { useState, useEffect } from 'react';
import { X, Percent, Coins } from 'lucide-react';
import { usePOSStore } from '../store/pos-store';
import { formatCurrency } from '../lib/utils';
import { Button, Input, Dialog, DialogContent } from './ui';
import { frappeFetch } from '../lib/frappe-sdk';

interface PaymentDialogProps {
  onClose: () => void;
  grandTotal: number;
  roundedTotal: number;
  invoice: string;
  customer: string;
  posProfile: string;
  table: string | null;
  cashier: string;
  owner: string;
  fetchOrders: () => Promise<void>;
  clearSelectedOrder: () => void;
  isSplitPayment?: boolean; // New prop for split payment mode
  splitItems?: any[]; // New prop for selected split items
  onToggleSplitPayment: (enable: boolean) => void; // New prop for toggling split payment
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  onClose,
  grandTotal,
  invoice,
  customer,
  posProfile,
  table,
  cashier,
  owner,
  fetchOrders,
  clearSelectedOrder,
  isSplitPayment,
  splitItems,
  onToggleSplitPayment
}) => {
  const { paymentModes, fetchPaymentModes, posProfile: storePosProfile, removePaidSplitItems } = usePOSStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discountValue, setDiscountValue] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [paymentInputs, setPaymentInputs] = useState<{ [mode: string]: string }>({});
  const [loyaltyPointsInfo, setLoyaltyPointsInfo] = useState<{
    loyalty_program: string | null;
    loyalty_points: number;
    conversion_factor: number;
    max_redeemable_amount: number;
  } | null>(null);
  const [redeemLoyaltyPoints, setRedeemLoyaltyPoints] = useState<boolean>(false);
  const [loyaltyAmount, setLoyaltyAmount] = useState<string>('');
  const [selectedSplitItems, setSelectedSplitItems] = useState<any[]>([]);

  useEffect(() => {
    fetchPaymentModes();
    fetchCustomerLoyaltyDetails();
  }, [fetchPaymentModes, customer, isSplitPayment, splitItems]);

  const calculateGrandTotal = () => {
    if (isSplitPayment && splitItems) {
      return selectedSplitItems.reduce((sum: number, item: any) => {
        return sum + item.amount;
      }, 0);
    }
    return grandTotal;
  };

  const calculatedGrandTotal = calculateGrandTotal();

  const fetchCustomerLoyaltyDetails = async () => {
    if (!customer) {
      setLoyaltyPointsInfo(null);
      return;
    }
    try {
      const url = `/api/method/ury.ury.doctype.ury_order.ury_order.get_loyalty_program_details_with_points?customer=${encodeURIComponent(customer)}&silent=true`;
      const res = await frappeFetch(url, {
        method: 'GET'
      });
      const data = await res.json();

      if (res.ok && data.message) {
        const { loyalty_program, loyalty_points, conversion_factor } = data.message;

        if (loyalty_program) {
          const max_redeemable_amount = parseFloat((loyalty_points * conversion_factor).toFixed(2));
          setLoyaltyPointsInfo({
            loyalty_program,
            loyalty_points,
            conversion_factor,
            max_redeemable_amount
          });
        } else {
          setLoyaltyPointsInfo(null);
        }
      } else {
        setLoyaltyPointsInfo(null);
      }
    } catch (err) {
      console.error('Failed to fetch loyalty details:', err);
      setLoyaltyPointsInfo(null);
    }
  };

  useEffect(() => {
    if (isSplitPayment && splitItems) {
      setSelectedSplitItems([]);
    } else {
      setSelectedSplitItems([]);
    }
  }, [isSplitPayment, splitItems]);

  const handleSplitItemChange = (itemUniqueId: string, isChecked: boolean) => {
    setSelectedSplitItems(prev => {
      if (isChecked) {
        const itemToAdd = splitItems?.find(item => item.item_name === itemUniqueId);
        return itemToAdd ? [...prev, itemToAdd] : prev;
      } else {
        return prev.filter(item => item.item_name !== itemUniqueId);
      }
    });
  };

  const payments = paymentModes
    .map((mode: any) => {
      const id = typeof mode === 'string' ? mode : mode.id;
      const amount = parseFloat(paymentInputs[id] || '');
      return amount > 0 ? { mode_of_payment: id, amount } : null;
    })
    .filter(Boolean);
  const paymentsTotal = payments.reduce((sum, p: any) => sum + p.amount, 0);

  const handleApplyDiscount = () => {
    const value = parseFloat(discountValue);
    if (isNaN(value) || value <= 0) {
      setError('Please enter a valid discount value');
      return;
    }

    let calculatedDiscount = 0;

    if (discountType === 'percentage') {
      if (value > 100) {
        setError('Percentage discount cannot exceed 100%');
        return;
      }
      calculatedDiscount = (calculatedGrandTotal * value) / 100;
    } else { // This handles the 'amount' type
      if (value > calculatedGrandTotal) {
        setError('Amount discount cannot be greater than the total');
        return;
      }
      calculatedDiscount = value;
    }

    setAppliedDiscount(calculatedDiscount);
    setError(null);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      let discountPercentageToSend = 0;
      const value = parseFloat(discountValue);

      if (!isNaN(value) && value > 0) {
        if (discountType === 'percentage') {
          discountPercentageToSend = value;
        } else {
          if (calculatedGrandTotal > 0) {
            discountPercentageToSend = (appliedDiscount / calculatedGrandTotal) * 100;
          }
        }
      }

      // Check if this is a split payment
      const isSplit = isSplitPayment && selectedSplitItems.length > 0;

      const res = await frappeFetch('/api/method/ury.ury.doctype.ury_order.ury_order.make_invoice', {
        method: 'POST',
        body: JSON.stringify({
          customer,
          payments,
          cashier,
          pos_profile: posProfile,
          owner,
          additionalDiscount: discountPercentageToSend > 0 ? discountPercentageToSend : null,
          table,
          invoice,
          items: isSplit ? selectedSplitItems.map(item => ({
            item: item.item_name,
            item_name: item.item_name,
            rate: item.qty > 0 ? item.amount / item.qty : 0,
            qty: item.qty,
            comment: item.comment || undefined,
            custom_dish_type: item.custom_dish_type || undefined,
            description: item.item_name,
          })) : undefined,
          is_split_payment: isSplit ? 1 : 0,
          original_invoice: isSplit ? invoice : null,
          redeem_loyalty_points: (redeemLoyaltyPoints && loyaltyPointsInfo?.loyalty_program && parseFloat(loyaltyAmount) > 0) ? 1 : 0,
          loyalty_amount: (redeemLoyaltyPoints && loyaltyPointsInfo?.loyalty_program && parseFloat(loyaltyAmount) > 0) ? (parseFloat(loyaltyAmount) || 0) : 0,
          loyalty_program: (redeemLoyaltyPoints && loyaltyPointsInfo?.loyalty_program && parseFloat(loyaltyAmount) > 0) ? loyaltyPointsInfo.loyalty_program : null,
          loyalty_points: (redeemLoyaltyPoints && loyaltyPointsInfo?.loyalty_program && parseFloat(loyaltyAmount) > 0)
            ? Math.round(parseFloat(loyaltyAmount) / (loyaltyPointsInfo.conversion_factor || 1))
            : 0,
        })

      });

      if (!res.ok) throw new Error('Failed to make payment');

      const responseData = await res.json();

      // NEW CODE: If split payment, create a new order for remaining items
      if (isSplit && splitItems) {
        const remainingItems = splitItems.filter(
          item => !selectedSplitItems.some(selected => selected.item_name === item.item_name)
        );

        if (remainingItems.length > 0) {
          // Create a new order/invoice for the remaining items
          const newOrderRes = await frappeFetch('/api/method/ury.ury.doctype.ury_order.ury_order.create_order', {
            method: 'POST',
            body: JSON.stringify({
              customer,
              payments,
              pos_profile: posProfile,
              table,
              cashier,
              owner,
              original_invoice: invoice,
              items: remainingItems.map(item => ({
                item: item.item_name,
                item_name: item.item_name,
                rate: item.qty > 0 ? item.amount / item.qty : 0,
                qty: item.qty,
                comment: item.comment || undefined,
                custom_dish_type: item.custom_dish_type || undefined,
                description: item.item_name,
              })),
            })
          });


          if (!newOrderRes.ok) {
            console.error('Failed to create order for remaining items');
            throw new Error('Failed to create order for remaining items');
          }

          if (typeof window !== 'undefined' && (window as any).showToast) {
            (window as any).showToast.success('Split payment successful. New order created for remaining items.');
          }
        } else {
          if (typeof window !== 'undefined' && (window as any).showToast) {
            const message = responseData?.message?.is_draft 
              ? 'Split payment saved. Complete remaining payments to finalize.'
              : 'All split payments completed and invoices submitted!';
            (window as any).showToast.success(message);
          }
        }

        removePaidSplitItems(selectedSplitItems.map(item => item.item_name));
      } else {
        if (typeof window !== 'undefined' && (window as any).showToast) {
          (window as any).showToast.success('Payment successful');
        }
        clearSelectedOrder();
      }

      onClose();
      await fetchOrders();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = calculatedGrandTotal;
  const totalDiscount = appliedDiscount;
  const discountedTotal = Math.max(0, subtotal - totalDiscount);
  const finalTotalBeforeLoyalty = appliedDiscount > 0 ? Math.ceil(discountedTotal) : Math.round(discountedTotal);
  const finalTotal = redeemLoyaltyPoints && parseFloat(loyaltyAmount) > 0
    ? Math.max(0, finalTotalBeforeLoyalty - parseFloat(loyaltyAmount))
    : finalTotalBeforeLoyalty;

  const finalAdjustment = finalTotal - discountedTotal;
  const roundedFinalAdjustment = Math.round(finalAdjustment * 100) / 100;
  const showFinalAdjustment = Math.abs(roundedFinalAdjustment) > 0.001;

  const getRemainingBalance = (currentId: string) => {
    const totalEntered = Object.entries(paymentInputs)
      .filter(([id]) => id !== currentId)
      .reduce((sum, [_, val]) => sum + (parseFloat(val) || 0), 0);
    return Math.max(0, finalTotal - totalEntered);
  };

  const handlePaymentInputFocus = (id: string) => {
    setPaymentInputs(inputs => {
      if (!inputs[id] || parseFloat(inputs[id]) === 0) {
        const remaining = getRemainingBalance(id);
        return { ...inputs, [id]: remaining > 0 ? String(remaining) : '' };
      }
      return inputs;
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent variant="xlarge" className="bg-white w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row p-0" showCloseButton={false}>
        {/* Left Column */}
        <div className="md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
            <Button onClick={onClose} variant="ghost" size="icon" className="p-2">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="mb-6">
            <label htmlFor="splitPaymentToggle" className="flex items-center justify-between cursor-pointer">
              <h3 className="text-lg font-semibold flex items-center gap-2">Split Bill</h3>
              <Input
                type="checkbox"
                id="splitPaymentToggle"
                checked={isSplitPayment}
                onChange={(e) => {
                  if (e.target.checked) {
                    setPaymentInputs({});
                    setAppliedDiscount(0);
                    setDiscountValue('');
                    setRedeemLoyaltyPoints(false);
                    setLoyaltyAmount('');
                  }
                  onToggleSplitPayment(e.target.checked);
                }}
                className="w-5 h-5"
              />
            </label>
          </div>

          {storePosProfile?.enable_discount === 1 && (
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Apply Discount
              </h3>
              <div className="flex w-full bg-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setDiscountType('percentage')}
                  className={`flex-1 p-2 rounded-md text-sm font-semibold transition-colors ${discountType === 'percentage' ? 'bg-white text-gray-900 shadow' : 'bg-transparent text-gray-600'
                    }`}
                >
                  Percentage
                </button>
                <button
                  onClick={() => setDiscountType('amount')}
                  className={`flex-1 p-2 rounded-md text-sm font-semibold transition-colors ${discountType === 'amount' ? 'bg-white text-gray-900 shadow' : 'bg-transparent text-gray-600'
                    }`}
                >
                  Amount
                </button>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === 'percentage' ? 'Enter %' : 'Enter Amount (Sh)'}
                  size="sm"
                  className="flex-1"
                />
                <Button onClick={handleApplyDiscount} variant="default" size="sm">
                  Apply
                </Button>
              </div>
            </div>
          )}

          {loyaltyPointsInfo?.loyalty_program && (
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Coins className="w-5 h-5" />
                Redeem Loyalty Points
              </h3>
              <div className="flex items-center justify-between">
                <label htmlFor="redeemLoyalty" className="flex items-center gap-2 cursor-pointer">
                  <Input
                    type="checkbox"
                    id="redeemLoyalty"
                    checked={redeemLoyaltyPoints}
                    onChange={(e) => {
                      setRedeemLoyaltyPoints(e.target.checked);
                      if (!e.target.checked) {
                        setLoyaltyAmount('');
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span>Use Loyalty Points</span>
                </label>
                {loyaltyPointsInfo && (
                  <span className="text-sm text-gray-600">
                    Available: {formatCurrency(loyaltyPointsInfo.max_redeemable_amount)}
                  </span>
                )}
              </div>
              {redeemLoyaltyPoints && loyaltyPointsInfo && (
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={loyaltyAmount}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (isNaN(value)) {
                      setLoyaltyAmount('');
                      setError(null);
                      return;
                    }
                    if (value > loyaltyPointsInfo.max_redeemable_amount) {
                      setError(`You cannot redeem more than ${formatCurrency(loyaltyPointsInfo.max_redeemable_amount)}.`);
                      setLoyaltyAmount(String(loyaltyPointsInfo.max_redeemable_amount));
                    } else {
                      setLoyaltyAmount(e.target.value);
                      setError(null);
                    }
                  }}
                  placeholder={`Enter amount (max ${formatCurrency(loyaltyPointsInfo.max_redeemable_amount)})`}
                  size="sm"
                  className="w-full"
                />
              )}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold">Payment Methods</h3>
            <div className="grid grid-cols-1 gap-3">
              {paymentModes.map((mode: any) => {
                const id = typeof mode === 'string' ? mode : mode.id;
                return (
                  <div key={id} className="flex items-center gap-3">
                    <span className="w-24 font-medium">{typeof mode === 'string' ? mode : mode.name}</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={paymentInputs[id] || ''}
                      onChange={e => setPaymentInputs(inputs => ({ ...inputs, [id]: e.target.value }))}
                      onFocus={() => handlePaymentInputFocus(id)}
                      placeholder="Amount"
                      className="flex-1"
                      size="sm"
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className="font-medium">Total Entered</span>
              <span className={'text-green-600 font-semibold flex items-center gap-1'}>
                {formatCurrency(paymentsTotal)} / {formatCurrency(finalTotal)}
                {paymentsTotal > finalTotal && (
                  <span className="text-yellow-700 font-semibold">
                    <Coins className="inline w-4 h-4 ml-1 text-yellow-500" />
                    <span className="text-yellow-500 font-bold ml-1">{formatCurrency(paymentsTotal - finalTotal)}</span>
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="md:w-1/2 p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-3 mb-6">
            <h3 className="text-lg font-semibold">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(appliedDiscount)}</span>
                </div>
              )}
              {showFinalAdjustment && (
                <div className="flex justify-between text-blue-600">
                  <span>Adjustment</span>
                  <span>{roundedFinalAdjustment > 0 ? '+' : ''}{formatCurrency(roundedFinalAdjustment)}</span>
                </div>
              )}
              {isSplitPayment && splitItems && (
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="text-md font-semibold mb-3 text-gray-800">Select Items to Pay</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {splitItems.map((item: any) => (
                      <div key={item.uniqueId} className="flex items-center justify-between">
                        <label htmlFor={`item-${item.uniqueId}`} className="flex items-center gap-3 cursor-pointer flex-1">
                          <Input
                            type="checkbox"
                            id={`item-${item.uniqueId}`}
                            checked={selectedSplitItems.some(selected => selected.item_name === item.item_name)}
                            onChange={(e) => handleSplitItemChange(item.item_name, e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700 flex-1">
                            {item.item_name} (x{item.quantity})
                          </span>
                        </label>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(finalTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handlePayment}
            disabled={isProcessing || payments.length === 0 || (isSplitPayment && selectedSplitItems.length === 0)}
            variant={isProcessing || payments.length === 0 || (isSplitPayment && selectedSplitItems.length === 0) ? "secondary" : "default"}
            className="w-full"
          >
            {isProcessing ? 'Processing...' : `Pay ${formatCurrency(paymentsTotal > 0 ? paymentsTotal : calculatedGrandTotal)}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
