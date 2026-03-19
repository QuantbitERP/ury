import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { X, Plus, Minus, CheckCircle2, ShoppingCart } from 'lucide-react';
import { OrderItem, usePOSStore } from '../store/pos-store';
import { cn, formatCurrency } from '../lib/utils';
import { Button, Dialog, DialogContent, Input } from './ui';
import { db } from '../lib/frappe-sdk';
import { call } from '../lib/frappe-sdk';

interface Variant {
  id: string;
  name: string;
  price: number;
}

interface Addon {
  id: string;
  name: string;
  price: number;
  category: 'sides' | 'drinks' | 'desserts';
}

interface ProductDialogProps {
  onClose: () => void;
  editMode?: boolean;
  initialVariant?: Variant;
  initialAddons?: Array<Omit<Addon, 'category'>>;
  initialQuantity?: number;
  itemToReplace?: OrderItem;
  initialDishType?: string;
}

const ProductDialog: React.FC<ProductDialogProps> = ({
  onClose,
  editMode = false,
  initialVariant,
  initialAddons = [],
  initialQuantity,
  itemToReplace,
  initialDishType,
}) => {
  const {
    selectedItem,
    addToOrder,
    removeFromOrder,
    setSelectedItem,
    getItemQuantityFromCart,
    activeOrders,
    menuItems,
  } = usePOSStore();

  const existingCartItem = selectedItem
    ? activeOrders.find(
        order =>
          order.id === selectedItem.id &&
          (!order.selectedVariant || order.selectedVariant.id === initialVariant?.id) &&
          (!order.selectedAddons ||
            (order.selectedAddons.length === initialAddons.length &&
              order.selectedAddons.every(addon =>
                initialAddons.some(initAddon => initAddon.id === addon.id)
              )))
      )
    : null;

  const [itemDoc,              setItemDoc]              = useState<any | null>(null);
  const [isItemLoading,        setIsItemLoading]        = useState(false);
  const [itemError,            setItemError]            = useState<string | null>(null);
  const [dishVariants,         setDishVariants]         = useState<Array<{ name: string; type: string }>>([]);
  const [selectedDishType,     setSelectedDishType]     = useState<string>(initialDishType || '');
  const [isDishVariantsLoading,setIsDishVariantsLoading]= useState(false);
  const [dishVariantsError,    setDishVariantsError]    = useState<string | null>(null);
  const [selectedAddons,       setSelectedAddons]       = useState<Array<{ id: string; name: string; price: number }>>([]);
  const [quantity,             setQuantity]             = useState<string>(editMode ? initialQuantity?.toString() || '0' : '0');
  const [comments,             setComments]             = useState<string>(itemToReplace?.comment || existingCartItem?.comment || '');
  const [addonItemCodes,       setAddonItemCodes]       = useState<string[]>([]);
  const [isAddonLoading,       setIsAddonLoading]       = useState(false);
  const [addonError,           setAddonError]           = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Fetch item doc + dish variants
  useEffect(() => {
    if (!selectedItem) {
      setItemDoc(null); setItemError(null); setIsItemLoading(false);
      setDishVariants([]); setSelectedDishType(''); setIsDishVariantsLoading(false);
      return;
    }
    setIsItemLoading(true); setItemError(null);
    db.getDoc('Item', selectedItem.item)
      .then((doc: any) => setItemDoc(doc))
      .catch(() => { setItemError('Failed to fetch item details'); setItemDoc(null); })
      .finally(() => setIsItemLoading(false));

    setIsDishVariantsLoading(true); setDishVariantsError(null);
    call.get('ury.ury.doctype.ury_order.ury_order.get_item_dish_variants', { item_code: selectedItem.item })
      .then((data: any) => {
        if (data.message && Array.isArray(data.message)) {
          setDishVariants(data.message);
          if (data.message.length === 1 && !editMode) setSelectedDishType(data.message[0].type);
        } else setDishVariants([]);
      })
      .catch(() => { setDishVariantsError('Failed to fetch dish variants'); setDishVariants([]); })
      .finally(() => setIsDishVariantsLoading(false));
  }, [selectedItem]);

  // Fetch add-on item codes
  useEffect(() => {
    if (!selectedItem) { setAddonItemCodes([]); setAddonError(null); setIsAddonLoading(false); return; }
    setIsAddonLoading(true); setAddonError(null);
    db.getDoc('Item', selectedItem.item)
      .then((doc: any) => {
        if (Array.isArray(doc.custom_pos_add_on_items)) {
          setAddonItemCodes(doc.custom_pos_add_on_items.map((e: any) => e.item).filter(Boolean));
        } else setAddonItemCodes([]);
      })
      .catch(() => { setAddonError('Failed to fetch add-ons'); setAddonItemCodes([]); })
      .finally(() => setIsAddonLoading(false));
  }, [selectedItem]);

  // Sync quantity from cart
  useEffect(() => {
    if (!editMode && selectedItem) {
      if (existingCartItem) {
        setQuantity(existingCartItem.quantity.toString());
        setComments(existingCartItem.comment || '');
      } else {
        setQuantity(getItemQuantityFromCart(selectedItem).toString());
      }
    }
  }, [selectedItem, editMode, getItemQuantityFromCart, existingCartItem]);

  // Click-outside close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) handleClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Escape close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  if (!selectedItem) return null;

  // Derived data
  const addonDetails = Array.isArray(itemDoc?.custom_pos_add_on_items)
    ? itemDoc.custom_pos_add_on_items
        .map((entry: any) => {
          const m = menuItems.find((mi: any) => mi.item === entry.item);
          return m
            ? { id: m.item, name: m.item_name, price: Number(m.price) }
            : { id: entry.item, name: entry.item, price: 0 };
        })
        .filter(Boolean)
    : [];

  const variantDetails = Array.isArray(itemDoc?.custom_pos_item_variants)
    ? itemDoc.custom_pos_item_variants
        .map((entry: any) => {
          const m = menuItems.find((mi: any) => mi.item === entry.item);
          return m
            ? { id: m.item, name: m.item_name, price: Number(m.price) }
            : { id: entry.item, name: entry.item, price: 0 };
        })
        .filter(Boolean)
    : [];

  const basePrice      = selectedItem?.price ? Number(selectedItem.price) : 0;
  const numericQuantity = quantity === '' ? 0 : parseInt(quantity, 10);
  const addonsTotal    = selectedAddons.reduce((s, a) => s + a.price, 0);
  const total          = (basePrice + addonsTotal) * numericQuantity;

  const handleQuantityChange = (value: string) => {
    if (value === '') { setQuantity(''); return; }
    const n = parseInt(value, 10);
    if (!isNaN(n) && n >= 0 && n <= 99) setQuantity(n.toString());
  };
  const handleIncrement = () => {
    const n = quantity === '' ? 0 : parseInt(quantity, 10);
    if (n < 99) setQuantity((n + 1).toString());
  };
  const handleDecrement = () => {
    const n = quantity === '' ? 0 : parseInt(quantity, 10);
    if (n > 0) setQuantity((n - 1).toString());
  };
  const handleAddonToggle = (addon: Omit<Addon, 'category'>) => {
    setSelectedAddons(cur =>
      cur.some(i => i.id === addon.id) ? cur.filter(i => i.id !== addon.id) : [...cur, addon]
    );
  };
  const handleVariantClick = (variantId: string) => {
    const m = menuItems.find((mi: any) => mi.item === variantId);
    if (m) setSelectedItem(m);
  };
  const handleAddToOrder = () => {
    const qty = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;
    if (isNaN(qty) || qty === 0) return;
    if (editMode && itemToReplace?.uniqueId) removeFromOrder(itemToReplace.uniqueId);
    const orderItem: OrderItem = { ...selectedItem, quantity: qty, price: basePrice, custom_dish_type: selectedDishType || null };
    addToOrder(orderItem);
    selectedAddons.forEach(addon => {
      const m = menuItems.find((mi: any) => mi.item === addon.id);
      const addonItem: OrderItem = m
        ? { ...m, quantity: qty, price: addon.price }
        : { id: addon.id, name: addon.name, price: addon.price, quantity: qty, image: null, item: addon.id, item_name: addon.name, course: '', description: '', special_dish: 0 as 0 | 1, tax_rate: 0 } as OrderItem;
      addToOrder(addonItem);
    });
    handleClose();
  };
  const handleClose = () => { setSelectedItem(null); onClose(); };

  // ── Section label helper ──────────────────────────────────────────────────
  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-2.5">{children}</h3>
  );

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent
        ref={dialogRef}
        variant="xlarge"
        className="bg-white w-full max-w-[90rem] max-h-[90vh] overflow-y-auto flex flex-col md:flex-row p-0 rounded-2xl shadow-2xl"
        showCloseButton={false}
      >
        {/* ── Left: Image ──────────────────────────────────────────────── */}
        <div className="md:w-[38%] relative bg-gray-100 shrink-0">
          {itemDoc?.image ? (
            <img
              src={itemDoc.image}
              alt={itemDoc.name}
              className="w-full min-h-80 h-full object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
              style={{ filter: 'saturate(0.82) brightness(0.96)' }}
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.style.display = 'none';
                const parent = t.parentElement;
                if (parent) {
                  const ph = document.createElement('div');
                  ph.className = 'w-full min-h-80 h-full bg-[#E4B315]/10 flex items-center justify-center text-[7rem] text-[#C69A11] font-extrabold rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none';
                  ph.textContent = (itemDoc?.name || '??').slice(0, 2).toUpperCase();
                  parent.insertBefore(ph, t);
                }
              }}
            />
          ) : (
            <div className="w-full min-h-80 h-full bg-[#E4B315]/10 flex items-center justify-center text-[7rem] text-[#C69A11] font-extrabold rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
              {itemDoc?.name?.slice(0, 2).toUpperCase() ?? '??'}
            </div>
          )}

          {/* Price badge overlaid on image */}
          <div className="absolute bottom-4 left-4">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#E4B315] text-white text-sm font-extrabold shadow-lg shadow-[#E4B315]/30">
              {formatCurrency(basePrice)}
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* ── Middle: Instructions + Variants + Quantity ────────────────── */}
        <div className="md:w-[31%] p-6 overflow-y-auto border-r border-gray-100 space-y-6">
          {/* Item name & code */}
          <div>
            <h2 className="text-xl font-extrabold text-[#2D2A26] leading-tight">
              {selectedItem?.item_name}
            </h2>
            <p className="text-xs text-gray-400 mt-1 font-mono">{selectedItem?.item}</p>
          </div>

          {/* Special Instructions */}
          <div>
            <SectionLabel>Special Instructions</SectionLabel>
            <Input
              placeholder="Any notes or special requests…"
              value={comments}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setComments(e.target.value)}
              className="border-gray-200 focus-visible:ring-[#E4B315]/40 focus-visible:border-[#E4B315]/50 rounded-xl text-sm"
            />
          </div>

          {/* Dish Type */}
          {isDishVariantsLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="h-4 w-4 rounded-full border-2 border-[#E4B315] border-t-transparent animate-spin" />
              Loading dish types…
            </div>
          ) : dishVariantsError ? (
            <p className="text-xs text-red-500">{dishVariantsError}</p>
          ) : dishVariants.length > 0 ? (
            <div>
              <SectionLabel>Dish Type</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {dishVariants.map(v => (
                  <button
                    key={v.type}
                    onClick={() => setSelectedDishType(v.type)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-xl border text-sm font-semibold transition-all duration-150',
                      selectedDishType === v.type
                        ? 'bg-gradient-to-r from-[#E4B315] to-[#C69A11] border-transparent text-white shadow-sm shadow-[#E4B315]/25'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-[#E4B315]/40 hover:text-[#C69A11]'
                    )}
                  >
                    {v.type}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Quantity */}
          <div>
            <SectionLabel>Quantity</SectionLabel>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDecrement}
                className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:border-[#E4B315]/40 hover:bg-[#E4B315]/5 transition-colors"
              >
                <Minus className="h-4 w-4 text-gray-600" />
              </button>
              <Input
                type="number"
                min="0"
                max="99"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                onBlur={() => { if (quantity === '') setQuantity('0'); }}
                className="w-16 text-center font-bold text-[#2D2A26] border-gray-200 focus-visible:ring-[#E4B315]/40 rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onClick={handleIncrement}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E4B315] to-[#C69A11] flex items-center justify-center shadow-sm shadow-[#E4B315]/25 hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          {/* Variants */}
          {variantDetails.length > 0 && (
            <div>
              <SectionLabel>Variants</SectionLabel>
              <div className="space-y-2">
                {variantDetails.map((variant: any) => {
                  const menuVariant = menuItems.find((m: any) => m.item === variant.id);
                  const isSelected = variant.id === itemDoc?.item;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantClick(variant.id)}
                      className={cn(
                        'w-full px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between transition-all duration-150',
                        isSelected
                          ? 'border-[#E4B315] bg-[#E4B315]/8'
                          : 'border-gray-200 hover:border-[#E4B315]/40 hover:bg-[#E4B315]/4'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-[#C69A11] shrink-0" />
                        )}
                        <span className={cn('text-sm font-semibold', isSelected ? 'text-[#C69A11]' : 'text-[#2D2A26]')}>
                          {variant.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 tabular-nums">
                        {formatCurrency(menuVariant ? Number(menuVariant.price) : 0)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Add-ons + Total + CTA ─────────────────────────────── */}
        <div className="md:w-[31%] p-6 flex flex-col overflow-y-auto">
          {/* Add-ons */}
          <div className="flex-1 overflow-y-auto">
            {isAddonLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <div className="h-4 w-4 rounded-full border-2 border-[#E4B315] border-t-transparent animate-spin" />
                Loading add-ons…
              </div>
            ) : addonError ? (
              <p className="text-xs text-red-500 mb-4">{addonError}</p>
            ) : addonDetails.length > 0 ? (
              <div className="mb-4">
                <SectionLabel>Add-ons</SectionLabel>
                <div className="space-y-2">
                  {addonDetails.map((addon: any) => {
                    const isSelected = selectedAddons.some(i => i.id === addon.id);
                    return (
                      <button
                        key={addon.id}
                        onClick={() => handleAddonToggle({ id: addon.id, name: addon.name, price: Number(addon.price) })}
                        className={cn(
                          'w-full px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between transition-all duration-150',
                          isSelected
                            ? 'border-[#E4B315] bg-[#E4B315]/8'
                            : 'border-gray-200 hover:border-[#E4B315]/40 hover:bg-[#E4B315]/4'
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={cn(
                            'w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors',
                            isSelected
                              ? 'bg-gradient-to-br from-[#E4B315] to-[#C69A11] border-transparent'
                              : 'border-gray-300 bg-white'
                          )}>
                            {isSelected && (
                              <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 fill-none stroke-white stroke-[1.8] stroke-linecap-round stroke-linejoin-round">
                                <polyline points="1 4 4 7 9 1" />
                              </svg>
                            )}
                          </span>
                          <span className={cn('text-sm font-medium truncate', isSelected ? 'text-[#C69A11]' : 'text-[#2D2A26]')}>
                            {addon.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 tabular-nums shrink-0 ml-2">
                          +{formatCurrency(Number(addon.price))}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-2">
                  <Plus className="h-5 w-5 text-gray-300" />
                </div>
                <p className="text-xs text-gray-400">No add-ons available</p>
              </div>
            )}
          </div>

          {/* Total + CTA */}
          <div className="pt-4 border-t border-gray-100 space-y-3 mt-auto">
            {/* Breakdown */}
            {selectedAddons.length > 0 && (
              <div className="space-y-1 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Base ({numericQuantity}×)</span>
                  <span className="tabular-nums">{formatCurrency(basePrice * numericQuantity)}</span>
                </div>
                {selectedAddons.map(a => (
                  <div key={a.id} className="flex justify-between">
                    <span className="truncate pr-2">{a.name}</span>
                    <span className="tabular-nums shrink-0">+{formatCurrency(a.price * numericQuantity)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Total row */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#2D2A26]">Total</span>
              <span className="text-lg font-extrabold text-[#C69A11] tabular-nums">{formatCurrency(total)}</span>
            </div>

            {/* Add to order button */}
            <button
              onClick={handleAddToOrder}
              disabled={numericQuantity === 0}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-200',
                numericQuantity > 0
                  ? 'bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white shadow-md shadow-[#E4B315]/25 hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
            >
              <ShoppingCart className="h-4 w-4" />
              {editMode || existingCartItem ? 'Update Order' : 'Add to Order'}
              {numericQuantity > 0 && (
                <span className="ml-1 bg-white/20 rounded-full px-1.5 py-0.5 text-[11px] font-extrabold">
                  ×{numericQuantity}
                </span>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;