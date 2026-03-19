import React, { useState, useEffect, useCallback } from 'react';
import {
  Wine, RefreshCw, LogOut, Volume2, VolumeX, Maximize2,
  Clock, MapPin, CheckCircle2, AlertCircle, Loader2,
  GlassWater, RotateCcw, Sparkles, X,
} from 'lucide-react';
import { barAPI, KOTOrder } from '../lib/bar-api';

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const OVERDUE_MINUTES = 15;
const POLL_INTERVAL   = 30_000; // same as KOT (30 s)

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const getElapsed = (dateStr: string, timeStr: string): number => {
  try {
    const t = new Date(`${dateStr} ${timeStr.split('.')[0]}`);
    return Math.floor((Date.now() - t.getTime()) / 60_000);
  } catch { return 0; }
};

const fmtElapsed = (m: number) =>
  m < 60 ? `${m} min ago` : `${Math.floor(m / 60)}h ${m % 60}m ago`;

const useTick = () => {
  const [t, set] = useState(0);
  useEffect(() => {
    const id = setInterval(() => set(n => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);
  return t;
};

// ─────────────────────────────────────────────────────────────────────────────
// Per-column theme
// ─────────────────────────────────────────────────────────────────────────────

const THEMES = {
  queued: {
    colBg:   'bg-[#0f172a]',
    border:  'border-cyan-800/40',
    title:   'text-cyan-300',
    count:   'bg-cyan-500/20 text-cyan-200',
    icon:    'text-cyan-400',
    lAccent: 'border-l-cyan-400',
    cardBg:  'bg-[#0c1a2e] hover:bg-[#0f2035]',
    btn:     'bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold',
    elapsed: 'text-cyan-400',
    empty:   'text-cyan-900',
  },
  mixing: {
    colBg:   'bg-[#1a1200]',
    border:  'border-amber-800/40',
    title:   'text-amber-300',
    count:   'bg-amber-500/20 text-amber-200',
    icon:    'text-amber-400',
    lAccent: 'border-l-amber-400',
    cardBg:  'bg-[#1c1505] hover:bg-[#21180a]',
    btn:     'bg-emerald-500 hover:bg-emerald-400 text-white font-bold',
    elapsed: 'text-amber-400',
    empty:   'text-amber-900',
  },
  ready: {
    colBg:   'bg-[#001a10]',
    border:  'border-emerald-800/40',
    title:   'text-emerald-300',
    count:   'bg-emerald-500/20 text-emerald-200',
    icon:    'text-emerald-400',
    lAccent: 'border-l-emerald-400',
    cardBg:  'bg-[#051a0c] hover:bg-[#071f10]',
    btn:     'bg-purple-500 hover:bg-purple-400 text-white font-bold',
    elapsed: 'text-emerald-400',
    empty:   'text-emerald-900',
  },
} as const;

type TK = keyof typeof THEMES;

// ─────────────────────────────────────────────────────────────────────────────
// Order Card — mirrors KOTCard layout, adapted for bar
// ─────────────────────────────────────────────────────────────────────────────

interface CardProps {
  order: KOTOrder; tk: TK; tick: number;
  onStartMixing: (n: string) => void;
  onMarkReady:   (n: string) => void;
  onMarkServed:  (n: string) => void;
  onBackToQueue: (n: string) => void;
}

const BarCard: React.FC<CardProps> = ({
  order, tk, onStartMixing, onMarkReady, onMarkServed, onBackToQueue,
}) => {
  const T = THEMES[tk];
  const elapsed = getElapsed(order.date, order.time);
  const overdue = elapsed > OVERDUE_MINUTES;

  const tableLabel = order.table_takeaway
    ? `Table ${order.table_takeaway}`
    : order.order_no ? `Table ${order.order_no}` : 'Takeaway';

  return (
    <div className={`
      relative rounded-lg border border-l-4 ${T.lAccent} ${T.cardBg}
      border-[#2a2a2a] px-4 pt-4 pb-4 mb-3 shadow-md
      transition-shadow duration-200 hover:shadow-lg
    `}>

      {/* Overdue pulse dot */}
      {overdue && tk === 'queued' && (
        <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
          <span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative flex h-3 w-3 rounded-full bg-red-500" />
        </span>
      )}

      {/* Row 1: Order name + type badge */}
      <div className="flex justify-between items-start mb-1">
        <div>
          <h3 className="font-semibold text-white text-sm leading-tight">{order.name}</h3>
          {order.invoice && (
            <p className="text-xs text-white/40 mt-0.5">
              {order.invoice}{order.customer_name ? ` • ${order.customer_name}` : ''}
            </p>
          )}
        </div>
        <span className="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded shrink-0 ml-2">
          {order.type === 'New Order' ? 'Dine In' : (order.type || 'Order')}
        </span>
      </div>

      {/* Row 2: Elapsed + overdue */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`flex items-center gap-1 text-xs ${T.elapsed}`}>
          <Clock className="h-3 w-3" /> {fmtElapsed(elapsed)}
        </span>
        {overdue && (
          <span className="text-[10px] font-extrabold tracking-wide px-2 py-0.5
                           rounded-full bg-red-500 text-white uppercase">
            OVERDUE
          </span>
        )}
      </div>

      {/* Row 3: Table */}
      <div className="flex items-center gap-1 mb-3 text-xs text-white/45">
        <MapPin className="h-3 w-3 shrink-0" />
        <span>{tableLabel}</span>
      </div>

      <hr className="border-white/10 mb-3" />

      {/* Row 4: Bar items from kot_items (already filtered to bar_item=1) */}
      <div className="space-y-1.5 mb-4">
        {(order.kot_items || []).map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-white/85">
            <GlassWater className="h-3.5 w-3.5 text-white/30 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold">{item.quantity}x</span> {item.item_name}
              {item.comments && (
                <span className="text-white/40 italic ml-1">({item.comments})</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Row 5: Action buttons */}
      <div className="flex gap-2">
        {tk === 'queued' && (
          <button onClick={() => onStartMixing(order.name)}
            className={`w-full py-2 rounded-lg text-sm transition-all active:scale-[0.98] ${T.btn}`}>
            Start Mixing
          </button>
        )}

        {tk === 'mixing' && (
          <>
            <button onClick={() => onMarkReady(order.name)}
              className={`flex-1 py-2 rounded-lg text-sm transition-all active:scale-[0.98] ${T.btn}`}>
              Ready to Serve
            </button>
            <button onClick={() => onBackToQueue(order.name)}
              className="px-3 py-2 rounded-lg text-sm bg-white/10 hover:bg-white/20
                         text-white/60 transition-all active:scale-[0.98]"
              title="Back to queue">
              <RotateCcw className="h-4 w-4" />
            </button>
          </>
        )}

        {tk === 'ready' && (
          <button onClick={() => onMarkServed(order.name)}
            className={`w-full py-2 rounded-lg text-sm transition-all active:scale-[0.98] ${T.btn}`}>
            Mark Served
          </button>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Column
// ─────────────────────────────────────────────────────────────────────────────

interface ColProps {
  tk: TK; title: string; icon: React.ReactNode; emptyMsg: string;
  orders: KOTOrder[]; tick: number;
  onStartMixing: (n: string) => void; onMarkReady:   (n: string) => void;
  onMarkServed:  (n: string) => void; onBackToQueue: (n: string) => void;
}

const Column: React.FC<ColProps> = ({
  tk, title, icon, emptyMsg, orders, tick,
  onStartMixing, onMarkReady, onMarkServed, onBackToQueue,
}) => {
  const T = THEMES[tk];
  return (
    <div className={`flex flex-col flex-1 min-w-0 h-full rounded-xl border ${T.border} ${T.colBg} p-4`}>
      {/* Column header */}
      <div className="flex items-center gap-2 mb-4">
        <span className={T.icon}>{icon}</span>
        <span className={`font-bold text-lg ${T.title}`}>
          {title} ({orders.length})
        </span>
        <span className={`ml-auto text-sm font-semibold px-2.5 py-0.5 rounded-full ${T.count}`}>
          {orders.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto
                      scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/20">
            <Wine className={`h-10 w-10 ${T.empty} opacity-40`} />
            <p className="text-sm">{emptyMsg}</p>
          </div>
        ) : (
          orders.map(o => (
            <BarCard key={o.name} order={o} tk={tk} tick={tick}
              onStartMixing={onStartMixing} onMarkReady={onMarkReady}
              onMarkServed={onMarkServed}   onBackToQueue={onBackToQueue} />
          ))
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Clear confirm
// ─────────────────────────────────────────────────────────────────────────────

const ClearDialog = ({ count, onOk, onCancel }: {
  count: number; onOk: () => void; onCancel: () => void;
}) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-[#111] border border-red-800/60 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <AlertCircle className="h-6 w-6 text-red-400 shrink-0" />
        <h3 className="text-white font-semibold text-lg">Clear all queued?</h3>
      </div>
      <p className="text-white/55 text-sm mb-6 leading-relaxed">
        This will mark all <span className="text-red-300 font-bold">{count}</span> queued
        bar order{count !== 1 ? 's' : ''} as Served. This cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white/10
                     hover:bg-white/20 text-white/60 transition-all">
          Cancel
        </button>
        <button onClick={onOk}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-600
                     hover:bg-red-500 text-white transition-all">
          Clear All
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

const BarDisplay: React.FC = () => {
  const [queued,  setQueued]  = useState<KOTOrder[]>([]);
  const [mixing,  setMixing]  = useState<KOTOrder[]>([]);
  const [ready,   setReady]   = useState<KOTOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [muted,   setMuted]   = useState(false);
  const [search,  setSearch]  = useState('');
  const [showClear, setShowClear] = useState(false);
  const tick = useTick();

  // ── Fetch — same shape as KOTSystem.fetchKOTs ───────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const [q, m, r] = await Promise.all([
        barAPI.getBarOrdersByStatus('Ready For Prepare'),
        barAPI.getBarOrdersByStatus('Preparing'),
        barAPI.getBarOrdersByStatus('Ready'),
      ]);
      setQueued(q);
      setMixing(m);
      setReady(r);
    } catch (error) {
      console.error('Error fetching bar orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, POLL_INTERVAL); // same as KOT 30s
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // ── Handlers (mirror KOTSystem exactly) ─────────────────────────────────
  const handleStartMixing = async (kotName: string) => {
    const success = await barAPI.startMixing(kotName);
    if (success) fetchOrders();
  };

  const handleMarkReady = async (kotName: string) => {
    const success = await barAPI.markReady(kotName);
    if (success) fetchOrders();
  };

  const handleMarkServed = async (kotName: string) => {
    const success = await barAPI.markServed(kotName);
    if (success) fetchOrders();
  };

  const handleBackToQueue = async (kotName: string) => {
    const success = await barAPI.backToQueue(kotName);
    if (success) fetchOrders();
  };

  const handleClearAll = async () => {
    await Promise.all(queued.map(o => barAPI.markServed(o.name)));
    setShowClear(false);
    fetchOrders();
  };

  // ── Search filter — same as KOTSystem.filterKOTs ────────────────────────
  const filterOrders = (orders: KOTOrder[]) => {
    if (!search) return orders;
    const term = search.toLowerCase();
    return orders.filter(o =>
      o.name.toLowerCase().includes(term) ||
      o.customer_name?.toLowerCase().includes(term) ||
      o.invoice?.toLowerCase().includes(term) ||
      o.kot_items?.some(i => i.item_name.toLowerCase().includes(term))
    );
  };

  // ── Loading screen ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Wine className="h-10 w-10 text-cyan-400 animate-bounce" />
            <Loader2 className="h-10 w-10 text-amber-400 animate-spin" />
          </div>
          <p className="text-white/50 text-sm tracking-widest uppercase">
            Loading Bar Orders…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">

      {/* ── Top bar (mirrors KOTSystem header exactly) ──────────────── */}
      <div className="bg-[#111] border-b border-white/10">
        <div className="px-6 py-3">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <Wine className="h-5 w-5 text-cyan-400" />
              <h1 className="text-xl font-bold text-amber-400">
                Bar Order Display
              </h1>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400
                               bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setMuted(m => !m)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 transition-all">
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <button onClick={() => document.documentElement.requestFullscreen?.()}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 transition-all">
                <Maximize2 className="h-4 w-4" />
              </button>
              <button onClick={fetchOrders}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10
                           text-white/60 text-sm rounded-lg border border-white/10 transition-all">
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
              <button
                onClick={() => setShowClear(true)}
                className="flex items-center gap-2 px-3 py-2 bg-red-600/80 hover:bg-red-600
                           text-white text-sm rounded-lg transition-all">
                <X className="h-4 w-4" />
                Clear All Pending
                {queued.length > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-white/20 text-white
                                   text-[11px] font-bold flex items-center justify-center">
                    {queued.length}
                  </span>
                )}
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10
                                 text-white/60 text-sm rounded-lg border border-white/10 transition-all">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="max-w-md">
            <input
              type="text"
              placeholder="Search bar orders..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm
                         text-white placeholder-white/30 focus:ring-2 focus:ring-cyan-500/40
                         focus:border-cyan-500/50 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Sub-header */}
      <div className="flex items-center gap-2 px-6 py-2 bg-[#0d0d0d] border-b border-white/[0.06]">
        <GlassWater className="h-4 w-4 text-white/30" />
        <span className="text-sm font-semibold text-white/50">Bar Order Ticket System</span>
        <span className="ml-auto text-xs text-white/20">
          Items filtered: <span className="text-cyan-500/60">custom_bar_item = 1</span> in Item doctype
        </span>
      </div>

      {/* ── Three-column board ───────────────────────────────────────── */}
      <div className="flex flex-1 gap-4 p-5 min-h-0 overflow-hidden">
        <Column
          tk="queued" title="Pending" emptyMsg="No orders queued"
          icon={<Clock className="h-5 w-5" />}
          orders={filterOrders(queued)} tick={tick}
          onStartMixing={handleStartMixing} onMarkReady={handleMarkReady}
          onMarkServed={handleMarkServed}   onBackToQueue={handleBackToQueue}
        />

        <Column
          tk="mixing" title="Preparing" emptyMsg="No orders being mixed"
          icon={<Sparkles className="h-5 w-5" />}
          orders={filterOrders(mixing)} tick={tick}
          onStartMixing={handleStartMixing} onMarkReady={handleMarkReady}
          onMarkServed={handleMarkServed}   onBackToQueue={handleBackToQueue}
        />

        <Column
          tk="ready" title="Ready" emptyMsg="No orders ready"
          icon={<CheckCircle2 className="h-5 w-5" />}
          orders={filterOrders(ready)} tick={tick}
          onStartMixing={handleStartMixing} onMarkReady={handleMarkReady}
          onMarkServed={handleMarkServed}   onBackToQueue={handleBackToQueue}
        />
      </div>

      {showClear && (
        <ClearDialog count={queued.length} onOk={handleClearAll} onCancel={() => setShowClear(false)} />
      )}
    </div>
  );
};

export default BarDisplay;
