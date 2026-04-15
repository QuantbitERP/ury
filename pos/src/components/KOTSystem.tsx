import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { kotAPI, KOTOrder } from '../lib/kot-api';
import {
  ArrowLeft, RefreshCw, Search, Clock, ChefHat, CheckCircle2,
  UtensilsCrossed, AlertTriangle, X,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

const getElapsedMinutes = (time: string): number => {
  const kotTime = new Date(`${new Date().toISOString().split('T')[0]} ${time}`);
  return Math.max(0, Math.floor((Date.now() - kotTime.getTime()) / 60000));
};

const isOverdue = (time: string) => getElapsedMinutes(time) > 30;

// ── Elapsed timer badge ───────────────────────────────────────────────────────

function ElapsedBadge({ time }: { time: string }) {
  const mins = getElapsedMinutes(time);
  const overdue = mins > 30;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
      overdue
        ? 'bg-red-100 text-red-700'
        : mins > 15
        ? 'bg-orange-100 text-orange-700'
        : 'bg-gray-100 text-gray-500'
    }`}>
      <Clock className="h-2.5 w-2.5" />
      {mins}m ago
      {overdue && ' • OVERDUE'}
    </span>
  );
}

// ── KOT Card ─────────────────────────────────────────────────────────────────

interface KOTCardProps {
  kot: KOTOrder;
  onStartPreparing: (name: string) => void;
  onMarkReady: (name: string) => void;
  onMarkServed: (name: string) => void;
  onBackToPending: (name: string) => void;
}

const STATUS_CONFIG = {
  'Ready For Prepare': {
    border: 'border-l-red-400',
    headerBg: 'bg-red-50',
    headerText: 'text-red-700',
  },
  Preparing: {
    border: 'border-l-[#E4B315]',
    headerBg: 'bg-[#E4B315]/8',
    headerText: 'text-[#C69A11]',
  },
  Ready: {
    border: 'border-l-green-400',
    headerBg: 'bg-green-50',
    headerText: 'text-green-700',
  },
};

const KOTCard: React.FC<KOTCardProps> = ({
  kot, onStartPreparing, onMarkReady, onMarkServed, onBackToPending,
}) => {
  const cfg = STATUS_CONFIG[kot.order_status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG['Ready For Prepare'];
  const overdue = isOverdue(kot.time);

  return (
    <div className={`
      bg-white border border-gray-100 border-l-4 ${cfg.border}
      rounded-2xl shadow-sm hover:shadow-md hover:shadow-[#E4B315]/8
      transition-all duration-200 overflow-hidden
    `}>
      {/* Card header */}
      <div className={`${cfg.headerBg} px-4 py-2.5 flex items-center justify-between`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-extrabold text-[#2D2A26] truncate">{kot.name}</span>
          {kot.order_no && kot.order_no > 0 && (
            <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E4B315]/15 text-[#C69A11]">
              Table {kot.order_no}
            </span>
          )}
        </div>
        <ElapsedBadge time={kot.time} />
      </div>

      {/* Card body */}
      <div className="px-4 py-3">
        {/* Customer / invoice tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {kot.invoice && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              {kot.invoice}
            </span>
          )}
          {kot.customer_name && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E4B315]/10 text-[#C69A11]">
              {kot.customer_name}
            </span>
          )}
        </div>

        {/* Items */}
        <ul className="space-y-1.5 mb-3">
          {kot.kot_items?.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="shrink-0 w-5 h-5 rounded-full bg-[#E4B315] text-white text-[10px] font-extrabold flex items-center justify-center mt-0.5">
                {item.quantity}
              </span>
              <div className="min-w-0">
                <span className="font-semibold text-[#2D2A26]">{item.item_name}</span>
                {item.comments && (
                  <span className="block text-xs text-gray-400 italic mt-0.5">"{item.comments}"</span>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2 border-t border-gray-50">
          {kot.order_status === 'Ready For Prepare' && (
            <button
              onClick={() => onStartPreparing(kot.name)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white text-xs font-bold shadow-sm shadow-[#E4B315]/25 hover:opacity-90 transition-opacity"
            >
              <ChefHat className="h-3.5 w-3.5" /> Start Preparing
            </button>
          )}

          {kot.order_status === 'Preparing' && (
            <>
              <button
                onClick={() => onMarkReady(kot.name)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500 text-white text-xs font-bold hover:bg-green-600 transition-colors"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Mark Ready
              </button>
              <button
                onClick={() => onBackToPending(kot.name)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-500 text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
            </>
          )}

          {kot.order_status === 'Ready' && (
            <button
              onClick={() => onMarkServed(kot.name)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#2D2A26] text-white text-xs font-bold hover:bg-black transition-colors"
            >
              <UtensilsCrossed className="h-3.5 w-3.5" /> Mark Served
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Column header ─────────────────────────────────────────────────────────────

function ColumnHeader({ title, count, color }: { title: string; count: number; color: string }) {
  const configs = {
    red:   { bg: 'bg-red-50',         border: 'border-red-200',         text: 'text-red-700',    dot: 'bg-red-400'   },
    gold:  { bg: 'bg-[#E4B315]/8',    border: 'border-[#E4B315]/30',    text: 'text-[#C69A11]',  dot: 'bg-[#E4B315]' },
    green: { bg: 'bg-green-50',       border: 'border-green-200',       text: 'text-green-700',  dot: 'bg-green-400' },
  } as const;
  const c = configs[color as keyof typeof configs] ?? configs.gold;
  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl px-4 py-3 mb-4 flex items-center justify-between`}>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${c.dot}`} />
        <span className={`text-sm font-bold ${c.text}`}>{title}</span>
      </div>
      <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${c.bg} ${c.text} border ${c.border}`}>
        {count}
      </span>
    </div>
  );
}

// ── Empty column state ────────────────────────────────────────────────────────

function EmptyCol({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#E4B315]/10 flex items-center justify-center mb-3">
        <ChefHat className="h-5 w-5 text-[#C69A11]" />
      </div>
      <p className="text-sm text-gray-400 font-medium">{message}</p>
    </div>
  );
}

// ── Main KOTSystem ────────────────────────────────────────────────────────────

const KOTSystem: React.FC = () => {
  const navigate = useNavigate();
  const [pendingKOTs,   setPendingKOTs]   = useState<KOTOrder[]>([]);
  const [preparingKOTs, setPreparingKOTs] = useState<KOTOrder[]>([]);
  const [readyKOTs,     setReadyKOTs]     = useState<KOTOrder[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [searchTerm,    setSearchTerm]    = useState('');

  const fetchKOTs = async () => {
    setLoading(true);
    try {
      const [pending, preparing, ready] = await Promise.all([
        kotAPI.getKOTsByStatus('Ready For Prepare'),
        kotAPI.getKOTsByStatus('Preparing'),
        kotAPI.getKOTsByStatus('Ready'),
      ]);
      setPendingKOTs(pending);
      setPreparingKOTs(preparing);
      setReadyKOTs(ready);
    } catch {
      setPendingKOTs([]);
      setPreparingKOTs([]);
      setReadyKOTs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKOTs();
    const interval = setInterval(fetchKOTs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStartPreparing = async (name: string) => { if (await kotAPI.startPreparing(name)) fetchKOTs(); };
  const handleMarkReady      = async (name: string) => { if (await kotAPI.markReady(name))      fetchKOTs(); };
  const handleMarkServed     = async (name: string) => { if (await kotAPI.markServed(name))     fetchKOTs(); };
  const handleBackToPending  = async (name: string) => { if (await kotAPI.backToPending(name))  fetchKOTs(); };

  const filterKOTs = (kots: KOTOrder[]) => {
    if (!searchTerm) return kots;
    const t = searchTerm.toLowerCase();
    return kots.filter(k =>
      k.name.toLowerCase().includes(t) ||
      k.customer_name?.toLowerCase().includes(t) ||
      k.invoice?.toLowerCase().includes(t) ||
      k.kot_items?.some(i => i.item_name.toLowerCase().includes(t))
    );
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/80">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-[#E4B315]/20" />
            <div className="absolute inset-0 rounded-full border-2 border-[#E4B315] border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-gray-400 font-medium">Loading Kitchen Orders…</p>
        </div>
      </div>
    );
  }

  const totalActive = filterKOTs(pendingKOTs).length + filterKOTs(preparingKOTs).length + filterKOTs(readyKOTs).length;

  return (
    <div className="min-h-screen bg-gray-50/80 flex flex-col">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm shrink-0">
        <div className="px-6 py-4 flex items-center justify-between gap-4">
          {/* Left: back + title */}
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-100 bg-white text-sm font-semibold text-gray-600 hover:border-[#E4B315]/40 hover:text-[#C69A11] transition-all shadow-sm shrink-0"
            >
              <ArrowLeft className="h-4 w-4" /> EPOS
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-extrabold text-[#2D2A26] leading-tight tracking-tight">Kitchen Order Tickets</h1>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{totalActive} active order{totalActive !== 1 ? 's' : ''} · auto-refreshes every 30s</p>
            </div>
          </div>

          {/* Right: search + refresh */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-48 pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E4B315]/30 focus:border-[#E4B315]/50 text-gray-700"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <X className="h-3 w-3 text-gray-400" />
                </button>
              )}
            </div>
            <button
              onClick={fetchKOTs}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-100 bg-white text-sm font-semibold text-gray-600 hover:border-[#E4B315]/40 hover:text-[#C69A11] transition-all shadow-sm"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── Three columns ── */}
      <div className="flex flex-1 min-h-0 divide-x divide-gray-100">
        {/* Pending */}
        <div className="flex-1 flex flex-col p-4 min-w-0">
          <ColumnHeader title="Pending" count={filterKOTs(pendingKOTs).length} color="red" />
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {filterKOTs(pendingKOTs).length === 0
              ? <EmptyCol message="No pending orders" />
              : filterKOTs(pendingKOTs).map(k => (
                <KOTCard key={k.name} kot={k}
                  onStartPreparing={handleStartPreparing}
                  onMarkReady={handleMarkReady}
                  onMarkServed={handleMarkServed}
                  onBackToPending={handleBackToPending}
                />
              ))
            }
          </div>
        </div>

        {/* Preparing */}
        <div className="flex-1 flex flex-col p-4 min-w-0">
          <ColumnHeader title="Preparing" count={filterKOTs(preparingKOTs).length} color="gold" />
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {filterKOTs(preparingKOTs).length === 0
              ? <EmptyCol message="Nothing being prepared" />
              : filterKOTs(preparingKOTs).map(k => (
                <KOTCard key={k.name} kot={k}
                  onStartPreparing={handleStartPreparing}
                  onMarkReady={handleMarkReady}
                  onMarkServed={handleMarkServed}
                  onBackToPending={handleBackToPending}
                />
              ))
            }
          </div>
        </div>

        {/* Ready */}
        <div className="flex-1 flex flex-col p-4 min-w-0">
          <ColumnHeader title="Ready to Serve" count={filterKOTs(readyKOTs).length} color="green" />
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {filterKOTs(readyKOTs).length === 0
              ? <EmptyCol message="No orders ready yet" />
              : filterKOTs(readyKOTs).map(k => (
                <KOTCard key={k.name} kot={k}
                  onStartPreparing={handleStartPreparing}
                  onMarkReady={handleMarkReady}
                  onMarkServed={handleMarkServed}
                  onBackToPending={handleBackToPending}
                />
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default KOTSystem;