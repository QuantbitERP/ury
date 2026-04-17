import React, { useEffect, useRef, useState } from 'react';
import {
  Clock, Printer, Pencil, X, ShoppingCart, AlertCircle, DollarSign,
  TrendingUp, ChevronDown, Search, Eye, Ban, Download,
  Calendar, ChevronLeft, ChevronRight, Users, Layers, ArrowRight,
} from 'lucide-react';
import { Button } from '../components/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { showToast } from '../components/ui/toast';
import { useRootStore } from '../store/root-store';
import { formatCurrency } from '../lib/utils';
import { Spinner } from '../components/ui/spinner';
import { Textarea } from '../components/ui/textarea';
import { usePOSStore } from '../store/pos-store';
import { useNavigate } from 'react-router-dom';
import PaymentDialog from '../components/PaymentDialog';
import { printOrder } from '../lib/print';
import { frappeFetch } from '../lib/frappe-sdk';
import { v4 as uuidv4 } from 'uuid';
import TransferWaiterDialog from '../components/TransferWaiterDialog';
import MergeBillsDialog from '../components/MergeBillsDialog';
import { getPOSInvoiceItems } from '../lib/invoice-api';
import { PageLayout } from '../components/PageLayout';

// ─── Date Range Picker ─────────────────────────────────────────────────────────
function DateRangePicker({ value, onChange }: {
  value: { from: Date; to: Date };
  onChange: (range: { from: Date; to: Date }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selecting, setSelecting] = useState<'from' | 'to'>('from');
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return d;
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);

  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  function getMonths() { const m1 = new Date(viewMonth); const m2 = new Date(viewMonth); m2.setMonth(m2.getMonth() + 1); return [m1, m2]; }
  function daysInM(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
  function firstDay(y: number, m: number) { return new Date(y, m, 1).getDay(); }

  function handleDayClick(date: Date) {
    if (selecting === 'from') { onChange({ from: date, to: date }); setSelecting('to'); }
    else { onChange(date < value.from ? { from: date, to: value.from } : { from: value.from, to: date }); setSelecting('from'); setOpen(false); }
  }
  function inRange(date: Date) {
    const to = selecting === 'to' && hoverDate ? hoverDate : value.to;
    if (!value.from || !to) return false;
    const d = date.getTime();
    return d >= Math.min(value.from.getTime(), to.getTime()) && d <= Math.max(value.from.getTime(), to.getTime());
  }
  function isStart(d: Date) { return value.from && d.toDateString() === value.from.toDateString(); }
  function isEnd(d: Date) { const e = selecting === 'to' && hoverDate ? hoverDate : value.to; return e && d.toDateString() === e.toDateString(); }

  function renderMonth(monthDate: Date) {
    const year = monthDate.getFullYear(); const month = monthDate.getMonth();
    const days = daysInM(year, month); const fd = firstDay(year, month);
    const cells: React.ReactNode[] = [];
    for (let i = 0; i < fd; i++) cells.push(<div key={`e${i}`} />);
    for (let d = 1; d <= days; d++) {
      const date = new Date(year, month, d);
      const inR = inRange(date); const s = isStart(date); const e = isEnd(date);
      const today = date.toDateString() === new Date().toDateString();
      cells.push(
        <button key={d} onClick={() => handleDayClick(date)}
          onMouseEnter={() => selecting === 'to' && setHoverDate(date)}
          className={['w-8 h-8 text-xs rounded-full flex items-center justify-center transition-all',
            inR && !s && !e ? 'bg-[#E4B315]/15 text-[#C69A11] rounded-none' : '',
            s || e ? 'bg-gradient-to-br from-[#E4B315] to-[#C69A11] text-white font-semibold' : '',
            today && !s && !e ? 'border border-[#E4B315] font-bold' : '',
            !inR && !s && !e ? 'hover:bg-gray-100' : '',
          ].join(' ')}>{d}</button>
      );
    }
    return (
      <div className="w-56">
        <div className="text-center text-sm font-semibold text-[#2D2A26] mb-2">{monthDate.toLocaleDateString('en-US', { month:'long', year:'numeric' })}</div>
        <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="text-xs text-gray-400 font-medium w-8">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-0.5">{cells}</div>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white hover:border-[#E4B315]/40 transition-colors min-w-[155px]">
        <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
        <span className="truncate">{fmt(value.from)} – {fmt(value.to)}</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setViewMonth(m => { const n = new Date(m); n.setMonth(n.getMonth()-1); return n; })} className="p-1.5 hover:bg-gray-100 rounded-xl"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setViewMonth(m => { const n = new Date(m); n.setMonth(n.getMonth()+1); return n; })} className="p-1.5 hover:bg-gray-100 rounded-xl"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="flex gap-6">{getMonths().map((m,i) => <div key={i}>{renderMonth(m)}</div>)}</div>
          <div className="mt-3 pt-3 border-t text-xs text-gray-400 text-center">{selecting==='from'?'Select start date':'Select end date'}</div>
        </div>
      )}
    </div>
  );
}

// ─── Shared UI atoms ──────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent=false, alert=false }: { label:string; value:string|number; icon:any; accent?:boolean; alert?:boolean; }) {
  return (
    <div className={`relative rounded-2xl p-5 overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg ${accent?'bg-gradient-to-br from-[#E4B315] to-[#C69A11] shadow-md shadow-[#E4B315]/20':alert?'bg-white border border-red-100 shadow-sm':'bg-white border border-gray-100 shadow-sm'}`}>
      {accent&&<div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-6 translate-x-6"/>}
      <div className="flex justify-between items-start mb-3">
        <span className={`text-xs font-bold tracking-wider uppercase ${accent?'text-white/80':'text-gray-400'}`}>{label}</span>
        <span className={`p-2 rounded-xl ${accent?'bg-white/20 text-white':alert?'bg-red-50 text-red-500':'bg-[#E4B315]/10 text-[#C69A11]'}`}><Icon className="w-4 h-4"/></span>
      </div>
      <p className={`text-2xl font-extrabold tracking-tight ${accent?'text-white':'text-[#2D2A26]'}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status:string }) {
  const map: Record<string,string> = { 'Completed':'bg-green-50 text-green-700 border-green-200','Paid':'bg-green-50 text-green-700 border-green-200','Draft':'bg-gray-50 text-gray-600 border-gray-200','Unbilled':'bg-[#E4B315]/10 text-[#C69A11] border-[#E4B315]/30','Pending':'bg-orange-50 text-orange-700 border-orange-200','Recently Paid':'bg-blue-50 text-blue-700 border-blue-200','Return':'bg-red-50 text-red-700 border-red-200','Consolidated':'bg-purple-50 text-purple-700 border-purple-200' };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status]||'bg-gray-50 text-gray-600 border-gray-200'}`}>{status}</span>;
}

function FilterSelect({ value, onChange, options, placeholder }: { value:string; onChange:(v:string)=>void; options:{label:string;value:string}[]; placeholder:string; }) {
  return (
    <div className="relative">
      <select value={value} onChange={e=>onChange(e.target.value)} className="appearance-none border border-gray-200 rounded-xl px-3 py-2 pr-8 text-sm text-gray-700 bg-white hover:border-[#E4B315]/40 focus:outline-none focus:ring-2 focus:ring-[#E4B315]/30 w-full transition-colors">
        <option value="">{placeholder}</option>
        {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
    </div>
  );
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────
function OrderDetailModal({ order, items, taxes, onClose, onPrint, onPayment, isPrinting, onCancel, onEdit, editLoading }: {
  order:any; items:any[]; taxes:any[]; onClose:()=>void; onPrint:()=>void; onPayment:()=>void;
  isPrinting:boolean; onCancel:()=>void; onEdit:()=>void; editLoading:boolean;
}) {
  const canEdit = ['Draft','Unbilled','Recently Paid'].includes(order.status);
  const canPay  = ['Draft','Unbilled','Recently Paid'].includes(order.status);
  const subtotal = items.reduce((s,i)=>s+(i.amount||0),0);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#2D2A26]">Order: {order.name}</h2>
          <div className="flex items-center gap-2">
            <StatusBadge status={order.status}/>
            {order.payment_status&&<StatusBadge status={order.payment_status}/>}
            <button onClick={onClose} className="ml-1 p-1.5 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-4 h-4 text-gray-500"/></button>
          </div>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-2">Order Information</p>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-400 mb-0.5">Created</p><p className="text-sm text-[#2D2A26] font-medium">{new Date(order.posting_date+' '+order.posting_time).toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'numeric',hour12:true})}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Service Type</p><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#E4B315]/10 text-[#C69A11] border border-[#E4B315]/30">{order.order_type}</span></div>
            </div>
          </div>
          {order.restaurant_table&&(<><hr className="border-gray-50"/><div><p className="text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-2">Table Information</p><div className="grid grid-cols-2 gap-4"><div><p className="text-xs text-gray-400 mb-0.5">Table</p><p className="text-sm font-medium text-[#2D2A26]">{order.restaurant_table}</p></div>{order.seats&&<div><p className="text-xs text-gray-400 mb-0.5">Seats</p><p className="text-sm font-medium text-[#2D2A26]">{order.seats}</p></div>}</div></div></>)}
          <hr className="border-gray-50"/>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-2">Order Items</p>
            <div className="divide-y divide-gray-50">
              <div className="grid grid-cols-4 text-[10px] font-bold text-gray-400 pb-2 uppercase tracking-wider"><div className="col-span-2">Item</div><div className="text-center">Qty</div><div className="text-right">Price</div></div>
              {items.map((item,i)=><div key={i} className="grid grid-cols-4 py-2.5 text-sm"><div className="col-span-2 font-medium text-[#2D2A26]">{item.item_name}</div><div className="text-center text-gray-500">{item.qty}</div><div className="text-right text-[#2D2A26]">{formatCurrency(item.rate||item.amount/item.qty)}</div></div>)}
            </div>
          </div>
          <hr className="border-gray-50"/>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-2">Financial Summary</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Subtotal</span><span className="font-medium text-[#2D2A26]">{formatCurrency(subtotal)}</span></div>
              {taxes.map((tax,i)=><div key={i} className="flex justify-between text-sm"><span className="text-gray-400">{tax.description}</span><span className="font-medium text-[#2D2A26]">{formatCurrency(tax.rate)}</span></div>)}
              <div className="flex justify-between text-base font-extrabold pt-2 border-t border-gray-100"><span className="text-[#2D2A26]">Total</span><span className="text-[#C69A11]">{formatCurrency(order.rounded_total)}</span></div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {canEdit&&(<><button onClick={onEdit} disabled={editLoading} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:border-[#E4B315]/40 hover:text-[#C69A11] transition-colors"><Pencil className="w-3.5 h-3.5"/>Edit</button><button onClick={onCancel} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors"><Ban className="w-3.5 h-3.5"/>Cancel</button></>)}
          </div>
          <div className="flex gap-2">
            <button onClick={onPrint} disabled={isPrinting} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:border-[#E4B315]/40 hover:text-[#C69A11] transition-colors">
              {isPrinting?<Spinner className="w-3.5 h-3.5" hideMessage/>:<Printer className="w-3.5 h-3.5"/>} Print Receipt
            </button>
            {canPay&&<button onClick={onPayment} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white shadow-sm shadow-[#E4B315]/20 hover:opacity-90 transition-opacity"><DollarSign className="w-3.5 h-3.5"/>Process Payment</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Orders() {
  const {
    orders, orderLoading, error, selectedStatus, pagination,
    selectedOrder, selectedOrderItems, selectedOrderTaxes,
    selectedOrderLoading, selectedOrderError,
    fetchOrders, setSelectedStatus, goToNextPage, goToPreviousPage,
    selectOrder, clearSelectedOrder, orderSearchQuery, setOrderSearchQuery
  } = useRootStore();

  const posStore = usePOSStore();
  const navigate = useNavigate();
  const mounted  = useRef(false);

  const [cancelDialogOpen,          setCancelDialogOpen]          = useState(false);
  const [cancelReason,              setCancelReason]              = useState('');
  const [cancelLoading,             setCancelLoading]             = useState(false);
  const [editLoading,               setEditLoading]               = useState(false);
  const [showPaymentDialog,         setShowPaymentDialog]         = useState(false);
  const [isPrinting,                setIsPrinting]                = useState(false);
  const [isSplitPaymentMode,        setIsSplitPaymentMode]        = useState(false);
  const [isTransferMode,            setIsTransferMode]            = useState(false);
  const [selectedOrdersForTransfer, setSelectedOrdersForTransfer] = useState<string[]>([]);
  const [isTransferDialogOpen,      setIsTransferDialogOpen]      = useState(false);
  const [isMergeMode,               setIsMergeMode]               = useState(false);
  const [isMergeBillsDialogOpen,    setIsMergeBillsDialogOpen]    = useState(false);
  const [showDetailModal,           setShowDetailModal]           = useState(false);
  const [orderItemCounts,           setOrderItemCounts]           = useState<Record<string,number>>({});
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ── Filter state ────────────────────────────────────────────────────────────
  const [dateRange,           setDateRange]           = useState({ from: new Date(Date.now() - 30*86400000), to: new Date() });
  const [quickDate,           setQuickDate]           = useState('Last 30 Days');
  const [serviceTypeFilter,   setServiceTypeFilter]   = useState('');
  const [orderStatusFilter,   setOrderStatusFilter]   = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  // Debounced search → server re-fetch
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderSearchQuery(e.target.value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => fetchOrders(), 500);
  };

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { if (!mounted.current) { mounted.current = true; return; } fetchOrders(); }, [orderSearchQuery]);

  useEffect(() => {
    if (!orders.length) return;
    (async () => {
      const counts: Record<string,number> = {};
      for (const o of orders) {
        try { const { items } = await getPOSInvoiceItems(o.name); counts[o.name] = items.length; }
        catch { counts[o.name] = 0; }
      }
      setOrderItemCounts(counts);
    })();
  }, [orders]);

  const handleQuickDate = (label: string) => {
    setQuickDate(label);
    const now = new Date(); const from = new Date();
    if (label === 'Today') from.setHours(0,0,0,0);
    else if (label === 'Yesterday') { from.setDate(from.getDate()-1); from.setHours(0,0,0,0); now.setDate(now.getDate()-1); }
    else if (label === 'Last 7 Days') from.setDate(from.getDate()-7);
    else if (label === 'Last 30 Days') from.setDate(from.getDate()-30);
    else { from.setFullYear(2000); }
    setDateRange({ from, to: now });
  };

  // ── CLIENT-SIDE FILTERS applied to server orders ───────────────────────────
  const displayedOrders = orders.filter(o => {
    const postDate = new Date(o.posting_date);
    const from = new Date(dateRange.from); from.setHours(0,0,0,0);
    const to   = new Date(dateRange.to);   to.setHours(23,59,59,999);
    if (postDate < from || postDate > to) return false;
    if (serviceTypeFilter   && o.order_type      !== serviceTypeFilter)   return false;
    if (orderStatusFilter   && o.status          !== orderStatusFilter)   return false;
    if (paymentStatusFilter && o.payment_status  !== paymentStatusFilter) return false;
    return true;
  });

  // Stats always from full server list
  const todayStr      = new Date().toDateString();
  const todayOrders   = orders.filter(o => new Date(o.posting_date).toDateString() === todayStr);
  const pendingOrders = orders.filter(o => ['Draft','Unbilled','Pending'].includes(o.status));
  const revenueToday  = todayOrders.reduce((s,o) => s+(o.rounded_total||0), 0);
  const avgOrderValue = orders.length ? orders.reduce((s,o) => s+(o.rounded_total||0),0)/orders.length : 0;

  const formatDateTime = (date: string, time: string) =>
    new Date(date+' '+time).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'numeric',hour12:true});

  const handleOrderClick = (order: any) => { if (!isTransferMode&&!isMergeMode) { selectOrder(order); setShowDetailModal(true); } };

  const handleToggleTransferMode = () => {
    setIsTransferMode(!isTransferMode);
    setSelectedOrdersForTransfer([]);
    if (isMergeMode) setIsMergeMode(false);
  };

  const handleToggleMergeMode = () => {
    setIsMergeMode(!isMergeMode);
    setSelectedOrdersForTransfer([]);
    if (isTransferMode) setIsTransferMode(false);
  };

  const handleOrderSelection = (orderName: string) => {
    setSelectedOrdersForTransfer(prev =>
      prev.includes(orderName) ? prev.filter(n => n !== orderName) : [...prev, orderName]
    );
  };

  const handleProceedWithTransfer = () => {
    if (selectedOrdersForTransfer.length === 0) {
      showToast.error('Please select at least one order to transfer.');
      return;
    }
    setIsTransferDialogOpen(true);
  };

  const handleProceedWithMerge = () => {
    if (selectedOrdersForTransfer.length < 2) {
      showToast.error('Please select at least 2 orders to merge.');
      return;
    }
    setIsMergeBillsDialogOpen(true);
  };

  async function handleCancelOrder() {
    if (!selectedOrder) return;
    if (!cancelReason.trim()) { showToast.error('Please enter a reason.'); return; }
    setCancelLoading(true);
    try {
      const res = await frappeFetch('/api/method/ury.ury.doctype.ury_order.ury_order.cancel_order',
        { method:'POST', body: JSON.stringify({ invoice_id:selectedOrder.name, reason:cancelReason }) });
      if (!res.ok) throw new Error('Failed to cancel order');
      showToast.success('Order cancelled successfully');
      setCancelDialogOpen(false); setCancelReason(''); clearSelectedOrder(); setShowDetailModal(false); fetchOrders();
    } catch (err) { showToast.error(err instanceof Error ? err.message : 'Failed to cancel order'); }
    finally { setCancelLoading(false); }
  }

  async function handleEditOrder() {
    if (!selectedOrder) return;
    setEditLoading(true);
    try {
      const res = await frappeFetch(`/api/method/frappe.client.get?doctype=POS+Invoice&name=${selectedOrder.name}`);
      if (!res.ok) throw new Error('Failed to fetch order details');
      const data = await res.json(); const order = data.message;
      posStore.resetOrderState(); posStore.setSelectedOrderType(order.order_type); posStore.setOrderForUpdate(order.name);
      if (order.restaurant_table) posStore.setSelectedTable(order.restaurant_table, order.custom_restaurant_room||null, true);
      posStore.setSelectedCustomer({ id:order.customer, name:order.customer_name, phone:order.mobile_number });
      const items = (order.items||[]).map((item:any) => ({
        id:item.item_code, name:item.item_name, price:item.rate, quantity:item.qty,
        amount:item.amount, image:item.image||null, uniqueId:uuidv4(),
        item:item.item_code, item_name:item.item_name, item_image:null,
        course:'', description:item.description||'', special_dish:0, tax_rate:0, custom_dish_type:item.custom_dish_type||null,
      }));
      for (const cartItem of items) await posStore.addToOrder(cartItem);
      navigate('/');
    } catch (err) { showToast.error(err instanceof Error ? err.message : 'Failed to edit order'); }
    finally { setEditLoading(false); }
  }

  async function handlePrintOrder() {
    if (!selectedOrder || !posStore.posProfile) return;
    setIsPrinting(true);
    try {
      await printOrder({ orderId:selectedOrder.name, posProfile:posStore.posProfile });
      showToast.success('Printed Successfully');
      selectOrder({ ...selectedOrder, invoice_printed:1 });
      if (selectedStatus === 'Unbilled') { showToast.info('Order moved to Draft after printing.'); setSelectedStatus('Draft'); fetchOrders(); }
    } catch (err: any) { showToast.error('Print failed: '+(err?.message||err)); }
    finally { setIsPrinting(false); }
  }

  function handlePaymentClick() {
    if (!selectedOrder) return;
    if (String(selectedOrder.invoice_printed)==='0') { showToast.error('Please print invoice before making payment'); return; }
    setShowPaymentDialog(true);
  }

  const handleExportCSV = () => {
    const headers=['Order #','Date & Time','Service Type','Table/Customer','Items','Amount','Status','Payment'];
    const rows=displayedOrders.map(o=>[o.name,formatDateTime(o.posting_date,o.posting_time),o.order_type,o.restaurant_table?`Table ${o.restaurant_table}`:o.customer,orderItemCounts[o.name]||0,o.rounded_total,o.status,o.payment_status||'']);
    const csv=[headers,...rows].map(r=>r.join(',')).join('\n');
    const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='orders.csv'; a.click();
  };

  const hasFilters = !!(serviceTypeFilter || orderStatusFilter || paymentStatusFilter);

  return (
    <PageLayout
      title="Order Management"
      subtitle="View, search and manage all restaurant orders"
      actions={
        <div className="flex items-center gap-2" data-tour="bulk-actions">
          {isTransferMode ? (
            <>
              <button onClick={handleProceedWithTransfer}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                <ArrowRight className="w-4 h-4" /> Proceed Transfer ({selectedOrdersForTransfer.length})
              </button>
              <button onClick={handleToggleTransferMode}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors">
                <X className="w-4 h-4" /> Cancel
              </button>
            </>
          ) : isMergeMode ? (
            <>
              <button onClick={handleProceedWithMerge}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm">
                <ArrowRight className="w-4 h-4" /> Proceed Merge ({selectedOrdersForTransfer.length})
              </button>
              <button onClick={handleToggleMergeMode}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors">
                <X className="w-4 h-4" /> Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={handleToggleTransferMode}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:border-[#E4B315]/40 hover:text-[#C69A11] transition-colors shadow-sm">
                <Users className="w-4 h-4" /> Transfer Waiter
              </button>
              <button onClick={handleToggleMergeMode}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:border-[#E4B315]/40 hover:text-[#C69A11] transition-colors shadow-sm">
                <Layers className="w-4 h-4" /> Merge Bills
              </button>
              <button onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:border-[#E4B315]/40 hover:text-[#C69A11] transition-colors shadow-sm"
                data-tour="export-csv"
              >
                <Download className="w-4 h-4"/> Export CSV
              </button>
            </>
          )}
        </div>
      }
    >
      <div className="overflow-auto px-6 py-5 space-y-4 max-w-screen-2xl mx-auto w-full">

        {error && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 text-amber-500 shrink-0"/> {error}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4" data-tour="orders-stats">
          <StatCard accent label="Revenue Today"  value={formatCurrency(revenueToday)} icon={DollarSign}/>
          <StatCard       label="Today's Orders"  value={todayOrders.length}           icon={ShoppingCart}/>
          <StatCard alert  label="Pending Orders" value={pendingOrders.length}          icon={Clock}/>
          <StatCard       label="Avg Order Value" value={formatCurrency(avgOrderValue)} icon={TrendingUp}/>
        </div>

        {/* Filters panel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5" data-tour="orders-filters">
          <p className="text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-4">Filter Orders</p>

          {/* Search */}
          <div className="relative mb-4" data-tour="orders-search">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
            <input type="text" value={orderSearchQuery} onChange={handleSearchChange}
              placeholder="Search by order #, customer name, phone, or table…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E4B315]/30 focus:border-[#E4B315]/50 text-gray-700 placeholder-gray-400 transition-colors"/>
          </div>

          {/* Quick date chips */}
          <div className="flex gap-2 mb-4 flex-wrap" data-tour="quick-dates">
            {['Today','Yesterday','Last 7 Days','Last 30 Days','All Time'].map(label => (
              <button key={label} onClick={() => handleQuickDate(label)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${quickDate===label?'bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white border-transparent shadow-sm shadow-[#E4B315]/20':'bg-white text-gray-600 border-gray-200 hover:border-[#E4B315]/40 hover:text-[#C69A11]'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Advanced filters — all wired */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-1 block">Date Range</label>
              <DateRangePicker value={dateRange} onChange={setDateRange}/>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-1 block">Service Type</label>
              <FilterSelect value={serviceTypeFilter} onChange={setServiceTypeFilter} placeholder="All Types"
                options={[{label:'Dine In',value:'Dine In'},{label:'Takeout',value:'Takeout'},{label:'Delivery',value:'Delivery'}]}/>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-1 block">Order Status</label>
              <FilterSelect value={orderStatusFilter} onChange={setOrderStatusFilter} placeholder="All Statuses"
                options={['Draft','Unbilled','Pending','Completed','Paid','Return'].map(s=>({label:s,value:s}))}/>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-1 block">Payment Status</label>
              <FilterSelect value={paymentStatusFilter} onChange={setPaymentStatusFilter} placeholder="All Payments"
                options={['Paid','Pending','Unpaid'].map(s=>({label:s,value:s}))}/>
            </div>
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <div className="flex gap-2 mt-3 flex-wrap items-center">
              {serviceTypeFilter&&<span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#E4B315]/10 text-[#C69A11] text-xs font-semibold rounded-full">{serviceTypeFilter}<button onClick={()=>setServiceTypeFilter('')}><X className="h-3 w-3"/></button></span>}
              {orderStatusFilter&&<span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#E4B315]/10 text-[#C69A11] text-xs font-semibold rounded-full">{orderStatusFilter}<button onClick={()=>setOrderStatusFilter('')}><X className="h-3 w-3"/></button></span>}
              {paymentStatusFilter&&<span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#E4B315]/10 text-[#C69A11] text-xs font-semibold rounded-full">{paymentStatusFilter}<button onClick={()=>setPaymentStatusFilter('')}><X className="h-3 w-3"/></button></span>}
              <button onClick={()=>{setServiceTypeFilter('');setOrderStatusFilter('');setPaymentStatusFilter('');}} className="text-xs text-gray-400 hover:text-red-500 font-medium">Clear all</button>
            </div>
          )}
        </div>

        {/* Orders table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" data-tour="orders-table">
          <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-[#C69A11]">
              Orders ({displayedOrders.length}{displayedOrders.length!==orders.length?` of ${orders.length}`:''})
            </p>
          </div>

          {orderLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-2 border-[#E4B315]/20"/>
                <div className="absolute inset-0 rounded-full border-2 border-[#E4B315] border-t-transparent animate-spin"/>
              </div>
              <p className="text-sm text-gray-400 font-medium">Loading orders…</p>
            </div>
          ) : displayedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#E4B315]/10 flex items-center justify-center mb-4"><ShoppingCart className="w-6 h-6 text-[#C69A11]"/></div>
              <p className="text-sm font-bold text-[#2D2A26] mb-1">No orders found</p>
              <p className="text-xs text-gray-400">{hasFilters?'Try clearing your filters':'Try adjusting your date range or search term'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    {(isTransferMode || isMergeMode ? ['Select','Order #','Date & Time','Service Type','Table/Customer','Items','Amount','Status','Payment','Actions'] : ['Order #','Date & Time','Service Type','Table/Customer','Items','Amount','Status','Payment','Actions']).map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {displayedOrders.map(order => (
                    <tr key={order.name} className={`hover:bg-[#E4B315]/3 transition-colors ${selectedOrdersForTransfer.includes(order.name) ? 'bg-blue-50' : ''}`}>
                      {(isTransferMode || isMergeMode) && (
                        <td className="px-4 py-3.5">
                          <input
                            type="checkbox"
                            checked={selectedOrdersForTransfer.includes(order.name)}
                            onChange={() => handleOrderSelection(order.name)}
                            className="h-4 w-4 text-blue-600 rounded cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="px-4 py-3.5">
                        <button onClick={() => handleOrderClick(order)} className="text-sm font-bold text-[#C69A11] hover:text-[#E4B315] hover:underline transition-colors">{order.name}</button>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">{formatDateTime(order.posting_date,order.posting_time)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${order.order_type==='Dine In'?'bg-[#E4B315]/10 text-[#C69A11] border-[#E4B315]/30':'bg-gray-50 text-gray-600 border-gray-200'}`}>{order.order_type}</span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-700 font-medium">{order.restaurant_table?`Table ${order.restaurant_table}`:order.customer}</td>
                      <td className="px-4 py-3.5"><span className="inline-flex items-center px-2 py-1 bg-[#E4B315]/10 text-[#C69A11] rounded-full text-xs font-bold">{orderItemCounts[order.name]||0} items</span></td>
                      <td className="px-4 py-3.5 text-sm font-bold text-[#2D2A26] tabular-nums whitespace-nowrap">{formatCurrency(order.rounded_total)}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={order.status}/></td>
                      <td className="px-4 py-3.5">{order.payment_status?<StatusBadge status={order.payment_status}/>:<span className="text-xs text-gray-300 italic">—</span>}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1" data-tour="action-buttons">
                          <button onClick={() => handleOrderClick(order)} className="p-1.5 hover:bg-[#E4B315]/10 rounded-lg transition-colors text-gray-400 hover:text-[#C69A11]" title="View"><Eye className="w-4 h-4"/></button>
                          {['Draft','Unbilled','Recently Paid'].includes(order.status)&&(
                            <button onClick={() => { selectOrder(order); setShowDetailModal(false); if (String(order.invoice_printed)==='0') { showToast.error('Please print invoice before making payment'); return; } setShowPaymentDialog(true); }}
                              className="p-1.5 hover:bg-[#E4B315]/10 rounded-lg transition-colors text-gray-400 hover:text-[#C69A11]" title="Payment"><DollarSign className="w-4 h-4"/></button>
                          )}
                          <button onClick={async () => { selectOrder(order); await handlePrintOrder(); }} className="p-1.5 hover:bg-[#E4B315]/10 rounded-lg transition-colors text-gray-400 hover:text-[#C69A11]" title="Print"><Printer className="w-4 h-4"/></button>
                          {['Draft','Unbilled','Recently Paid'].includes(order.status)&&(
                            <button onClick={() => { selectOrder(order); setCancelDialogOpen(true); }} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500" title="Cancel"><Ban className="w-4 h-4"/></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!orderLoading && orders.length > 0 && (
            <div className="px-5 py-3.5 border-t border-gray-50 flex items-center justify-center gap-3">
              <button onClick={goToPreviousPage} disabled={pagination.currentPage===1} className="px-4 py-1.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 disabled:opacity-40 hover:border-[#E4B315]/40 hover:text-[#C69A11] transition-colors">Previous</button>
              <span className="text-sm text-gray-400 font-medium">Page {pagination.currentPage}</span>
              <button onClick={goToNextPage} disabled={!pagination.hasNextPage} className="px-4 py-1.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 disabled:opacity-40 hover:border-[#E4B315]/40 hover:text-[#C69A11] transition-colors">Next</button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showDetailModal && selectedOrder && !selectedOrderLoading && !selectedOrderError && (
        <OrderDetailModal order={selectedOrder} items={selectedOrderItems} taxes={selectedOrderTaxes}
          onClose={() => { setShowDetailModal(false); clearSelectedOrder(); }}
          onPrint={handlePrintOrder} onPayment={handlePaymentClick} isPrinting={isPrinting}
          onCancel={() => setCancelDialogOpen(true)} onEdit={handleEditOrder} editLoading={editLoading}/>
      )}

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cancel Order</DialogTitle><DialogDescription>Please provide a reason for cancelling this order.</DialogDescription></DialogHeader>
          <div className="px-6 mb-3"><Textarea placeholder="Enter cancel reason" value={cancelReason} onChange={e=>setCancelReason(e.target.value)} disabled={cancelLoading} autoFocus/></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)} disabled={cancelLoading}>Close</Button>
            <Button variant="danger" onClick={handleCancelOrder} disabled={cancelLoading}>{cancelLoading?'Cancelling…':'Confirm Cancel'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showPaymentDialog && selectedOrder && (
        <PaymentDialog onClose={() => setShowPaymentDialog(false)} grandTotal={selectedOrder.grand_total}
          roundedTotal={selectedOrder.rounded_total} invoice={selectedOrder.name} customer={selectedOrder.customer}
          posProfile={posStore.posProfile?.name||''} table={selectedOrder.restaurant_table||null}
          cashier={posStore.posProfile?.cashier||''} owner={posStore.posProfile?.cashier||''}
          fetchOrders={fetchOrders} clearSelectedOrder={clearSelectedOrder} isSplitPayment={isSplitPaymentMode}
          splitItems={isSplitPaymentMode?selectedOrderItems:undefined}
          onToggleSplitPayment={(enable)=>{ setIsSplitPaymentMode(enable); setShowPaymentDialog(enable); }}/>
      )}

      <TransferWaiterDialog isOpen={isTransferDialogOpen} onClose={() => setIsTransferDialogOpen(false)}
        ordersToTransfer={selectedOrdersForTransfer}
        currentWaiter={orders.find(o=>o.name===selectedOrdersForTransfer[0])?.waiter||null}
        onTransferSuccess={() => { setIsTransferDialogOpen(false); setIsTransferMode(false); setSelectedOrdersForTransfer([]); fetchOrders(); }}/>

      <MergeBillsDialog isOpen={isMergeBillsDialogOpen} onClose={() => setIsMergeBillsDialogOpen(false)}
        onMergeSuccess={(newBillName:string) => { setIsMergeBillsDialogOpen(false); setIsMergeMode(false); showToast.success(`Bills merged! New invoice: ${newBillName}`); fetchOrders(); }}/>
    </PageLayout>
  );
}