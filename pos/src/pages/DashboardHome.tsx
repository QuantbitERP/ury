import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, ShoppingCart, Users, TrendingUp, AlertTriangle,
  Package, UserCheck, Calendar, RefreshCw, Clock,
  BarChart2, Settings, ChevronRight, UserPlus,
  Boxes, Truck, LayoutGrid, FileText, TrendingDown,
} from 'lucide-react';
import {
  fetchTabData, TabId,
  OverviewData, OperationsData, StaffData, EventsData, AnalyticsData,
} from '../lib/api/dashboard-api';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency', currency: 'KES',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n).replace('KES', 'KSh');

const fmtShort = (n: number) => {
  if (n >= 1_000_000) return `KSh ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `KSh ${(n / 1_000).toFixed(0)}K`;
  return fmt(n);
};

const todayStr = () => {
  const d = new Date();
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
};

const fmtDate = (s: string) => {
  if (!s) return '—';
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(s));
};

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens (matching landing page mustard palette)
// ─────────────────────────────────────────────────────────────────────────────

const GOLD = '#E4B315';
const GOLD_DARK = '#C69A11';

// ─────────────────────────────────────────────────────────────────────────────
// Spinner
// ─────────────────────────────────────────────────────────────────────────────

const Spinner = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <div className="relative">
      <div className="h-10 w-10 rounded-full border-2 border-[#E4B315]/20" />
      <div className="absolute inset-0 h-10 w-10 rounded-full border-2 border-[#E4B315] border-t-transparent animate-spin" />
    </div>
    <p className="text-sm text-gray-400 font-medium">Loading dashboard…</p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// StatCard — redesigned to match mustard theme
// ─────────────────────────────────────────────────────────────────────────────

const StatCard = ({
  label, value, sub, icon, accent = false, alert = false,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon: React.ReactNode;
  accent?: boolean;   // gold-highlighted card
  alert?: boolean;    // red-highlighted card
}) => (
  <div
    className={`relative rounded-2xl p-5 flex-1 min-w-0 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
      accent
        ? 'bg-gradient-to-br from-[#E4B315] to-[#C69A11] text-white shadow-md shadow-[#E4B315]/20'
        : alert
        ? 'bg-white border border-red-100 shadow-sm hover:shadow-red-100/40'
        : 'bg-white border border-gray-100 shadow-sm hover:shadow-gray-200/60'
    }`}
  >
    {/* Background decoration */}
    {accent && (
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-6 translate-x-6 pointer-events-none" />
    )}

    <div className="flex justify-between items-start mb-4">
      <span className={`text-xs font-bold tracking-wider uppercase ${accent ? 'text-white/80' : 'text-gray-400'}`}>
        {label}
      </span>
      <span
        className={`p-2 rounded-xl ${
          accent
            ? 'bg-white/20 text-white'
            : alert
            ? 'bg-red-50 text-red-500'
            : 'bg-[#E4B315]/10 text-[#C69A11]'
        }`}
      >
        {icon}
      </span>
    </div>

    <div className={`text-2xl font-extrabold mb-2 tracking-tight ${accent ? 'text-white' : 'text-[#2D2A26]'}`}>
      {value}
    </div>

    {sub && (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          accent
            ? 'bg-white/20 text-white'
            : alert
            ? 'bg-red-50 text-red-600'
            : 'bg-[#E4B315]/10 text-[#C69A11]'
        }`}
      >
        {sub}
      </span>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ActionBtn — gold-accented quick action
// ─────────────────────────────────────────────────────────────────────────────

const ActionBtn = ({
  icon, label, onClick, primary = false,
}: { icon: React.ReactNode; label: string; onClick?: () => void; primary?: boolean }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center gap-2.5 py-5 rounded-2xl border transition-all duration-200 text-sm font-semibold hover:-translate-y-0.5 ${
      primary
        ? 'bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white border-transparent shadow-md shadow-[#E4B315]/25 hover:shadow-lg hover:shadow-[#E4B315]/30'
        : 'bg-white border-gray-100 hover:border-[#E4B315]/40 hover:bg-[#E4B315]/4 text-[#2D2A26] shadow-sm'
    }`}
  >
    <span className={`p-2 rounded-xl ${primary ? 'bg-white/20' : 'bg-[#E4B315]/10 text-[#C69A11]'}`}>
      {icon}
    </span>
    {label}
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// NavLink
// ─────────────────────────────────────────────────────────────────────────────

const NavLink = ({ icon, label, sub, onClick }: {
  icon: React.ReactNode; label: string; sub: string; onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 border border-gray-100 bg-white rounded-2xl hover:border-[#E4B315]/30 hover:bg-[#E4B315]/3 hover:-translate-y-0.5 transition-all duration-200 text-left shadow-sm"
  >
    <span className="text-[#C69A11] bg-[#E4B315]/10 p-2 rounded-xl shrink-0">{icon}</span>
    <div className="min-w-0">
      <div className="text-sm font-semibold text-[#2D2A26]">{label}</div>
      <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
    </div>
    <ChevronRight className="h-4 w-4 text-gray-300 ml-auto shrink-0" />
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// Section Header
// ─────────────────────────────────────────────────────────────────────────────

const SectionCard = ({ title, children, action, actionLabel }: {
  title: string; children: React.ReactNode; action?: () => void; actionLabel?: string;
}) => (
  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
      <h3 className="font-bold text-[#2D2A26] text-sm tracking-wide">{title}</h3>
      {action && (
        <button onClick={action} className="text-xs font-semibold text-[#E4B315] hover:text-[#C69A11] flex items-center gap-1 transition-colors">
          {actionLabel} <ChevronRight className="h-3 w-3" />
        </button>
      )}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Mini Charts (SVG — mustard/gold palette)
// ─────────────────────────────────────────────────────────────────────────────

const LineChart = ({ data }: { data: { date: string; revenue: number }[] }) => {
  if (!data.length) return (
    <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data available</div>
  );

  const W = 600, H = 180, PAD = 32;
  const maxV = Math.max(...data.map(d => d.revenue), 1);
  const pts = data.map((d, i) => ({
    x: PAD + (i / Math.max(data.length - 1, 1)) * (W - PAD * 2),
    y: PAD + (1 - d.revenue / maxV) * (H - PAD * 2),
    label: d.date.slice(8),
  }));

  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const fillPath = `${path} L${pts[pts.length - 1].x},${H - PAD} L${pts[0].x},${H - PAD} Z`;

  const yLabels = [0, maxV * 0.5, maxV].map(v => ({
    v, y: PAD + (1 - v / maxV) * (H - PAD * 2),
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48">
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E4B315" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#E4B315" stopOpacity="0" />
        </linearGradient>
      </defs>
      {yLabels.map((yl, i) => (
        <g key={i}>
          <line x1={PAD} y1={yl.y} x2={W - PAD} y2={yl.y} stroke="#f3f4f6" strokeWidth="1" />
          <text x={PAD - 6} y={yl.y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
            {yl.v >= 1000 ? `${Math.round(yl.v / 1000)}k` : Math.round(yl.v)}
          </text>
        </g>
      ))}
      <path d={fillPath} fill="url(#goldGrad)" />
      <path d={path} fill="none" stroke="#E4B315" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#fff" stroke="#E4B315" strokeWidth="2" />
      ))}
      {pts.filter((_, i) => i % Math.max(1, Math.floor(pts.length / 8)) === 0).map((p, i) => (
        <text key={i} x={p.x} y={H - 6} textAnchor="middle" fontSize="9" fill="#9ca3af">{p.label}</text>
      ))}
    </svg>
  );
};

const BarChart = ({ data }: { data: { hour: string; orders: number }[] }) => {
  const active = data.filter(d => d.orders > 0);
  if (!active.length) return (
    <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data available</div>
  );

  const W = 600, H = 180, PAD = 32;
  const maxV = Math.max(...data.map(d => d.orders), 1);
  const barW = Math.max(2, (W - PAD * 2) / 24 - 3);

  const yLabels = [0, Math.ceil(maxV / 2), maxV].map(v => ({
    v, y: PAD + (1 - v / maxV) * (H - PAD * 2),
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E4B315" />
          <stop offset="100%" stopColor="#C69A11" />
        </linearGradient>
      </defs>
      {yLabels.map((yl, i) => (
        <g key={i}>
          <line x1={PAD} y1={yl.y} x2={W - PAD} y2={yl.y} stroke="#f3f4f6" strokeWidth="1" />
          <text x={PAD - 6} y={yl.y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">{yl.v}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const x  = PAD + i * (W - PAD * 2) / 24;
        const bH = d.orders > 0 ? (d.orders / maxV) * (H - PAD * 2) : 0;
        const y  = PAD + (H - PAD * 2) - bH;
        return (
          <g key={i}>
            {d.orders > 0 && (
              <rect x={x} y={y} width={barW} height={bH} fill="url(#barGrad)" rx="3" />
            )}
            {i % 2 === 0 && (
              <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="8" fill="#9ca3af">
                {d.hour.slice(0, 5)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Tab content — Overview
// ─────────────────────────────────────────────────────────────────────────────

const OverviewTab = ({ data, navigate }: { data: OverviewData; navigate: (path: string) => void }) => (
  <div className="space-y-5">
    {/* Primary KPIs */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        accent
        label="Monthly Revenue"
        value={fmtShort(data.monthly_revenue)}
        sub="This month"
        icon={<DollarSign className="h-4 w-4" />}
      />
      <StatCard
        label="Total Orders"
        value={data.total_orders}
        sub="0 today"
        icon={<ShoppingCart className="h-4 w-4" />}
      />
      <StatCard
        label="Unique Customers"
        value={data.unique_customers}
        sub="This month"
        icon={<Users className="h-4 w-4" />}
      />
      <StatCard
        label="Avg Order Value"
        value={fmtShort(data.avg_order_value)}
        sub="Per order"
        icon={<TrendingUp className="h-4 w-4" />}
      />
    </div>

    {/* Operational KPIs */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        alert
        label="Low Stock Items"
        value={data.low_stock_count}
        sub="Needs attention"
        icon={<AlertTriangle className="h-4 w-4" />}
      />
      <StatCard
        alert
        label="Pending Orders"
        value={data.pending_orders}
        sub="To process"
        icon={<Package className="h-4 w-4" />}
      />
      <StatCard
        label="Staff on Shift"
        value={data.staff_on_shift}
        sub="Active today"
        icon={<UserCheck className="h-4 w-4" />}
      />
      <StatCard
        label="Upcoming Events"
        value={data.upcoming_events}
        sub="Scheduled"
        icon={<Calendar className="h-4 w-4" />}
      />
    </div>

    {/* Quick Actions */}
    <SectionCard title="Quick Actions">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <ActionBtn primary icon={<ShoppingCart className="h-5 w-5" />} label="New Order" onClick={() => navigate('/')} />
        <ActionBtn icon={<Package className="h-5 w-5" />} label="Inventory" onClick={() => navigate('/inventory')} />
        <ActionBtn icon={<Calendar className="h-5 w-5" />} label="Events" onClick={() => navigate('/events/calendar')} />
        <ActionBtn icon={<BarChart2 className="h-5 w-5" />} label="Reports" onClick={() => navigate('/reports/sales-report')} />
      </div>
    </SectionCard>

    {/* Top Selling Items */}
    <SectionCard title="Top Selling Items This Month">
      {data.top_selling_items.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">No sales data for this period.</p>
      ) : (
        <div className="divide-y divide-gray-50">
          {data.top_selling_items.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3.5">
                <span
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-extrabold ${
                    i === 0 ? 'bg-[#E4B315] text-white' : 'bg-[#E4B315]/10 text-[#C69A11]'
                  }`}
                >
                  {i + 1}
                </span>
                <div>
                  <div className="text-sm font-semibold text-[#2D2A26]">{item.item_name}</div>
                  <div className="text-xs text-gray-400">{Math.round(item.qty)} sold</div>
                </div>
              </div>
              <span className="text-sm font-bold text-[#2D2A26]">{fmt(item.revenue)}</span>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Tab content — Operations
// ─────────────────────────────────────────────────────────────────────────────

const OperationsTab = ({ data, navigate }: { data: OperationsData; navigate: (path: string) => void }) => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Low Stock Items', value: data.low_stock_count, icon: <AlertTriangle className="h-4 w-4" />, path: '/inventory', alert: true },
        { label: 'Pending POs', value: data.pending_purchase_orders, icon: <ShoppingCart className="h-4 w-4" />, path: '/purchase-orders', alert: true },
        { label: 'Active Suppliers', value: data.active_suppliers, icon: <Users className="h-4 w-4" />, path: '/suppliers', alert: false },
        { label: 'Inventory Items', value: data.total_inventory_items, icon: <Boxes className="h-4 w-4" />, path: '/inventory', alert: false },
      ].map((item, i) => (
        <button key={i} onClick={() => navigate(item.path)} className="text-left">
          <StatCard alert={item.alert} label={item.label} value={item.value} icon={item.icon} />
        </button>
      ))}
    </div>

    {/* Purchase Orders */}
    <SectionCard title="Purchase Orders Requiring Action" action={() => navigate('/purchase-orders')} actionLabel="View All">
      <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100 mb-4">
        <div className="p-2 bg-orange-100 rounded-xl">
          <ShoppingCart className="h-5 w-5 text-orange-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-orange-800">
            {data.pending_purchase_orders} purchase order{data.pending_purchase_orders !== 1 ? 's' : ''} pending review
          </p>
          <p className="text-xs text-orange-600 mt-0.5">Review and approve to maintain inventory levels</p>
        </div>
        <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold shrink-0">
          {data.pending_purchase_orders} Pending
        </span>
      </div>
      <button
        onClick={() => navigate('/purchase-orders')}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm shadow-md shadow-orange-200"
      >
        <ShoppingCart className="h-4 w-4" /> Review Purchase Orders
      </button>
    </SectionCard>

    {/* Low Stock Items */}
    <SectionCard title="Low Stock Alerts" action={() => navigate('/inventory')} actionLabel="View Inventory">
      {!data.low_stock_items?.length ? (
        <div className="flex items-center gap-3 py-4 text-green-600">
          <div className="p-2 bg-green-50 rounded-xl"><Package className="h-4 w-4" /></div>
          <p className="text-sm font-medium">All stock levels are healthy</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {data.low_stock_items.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
              <div>
                <div className="text-sm font-semibold text-[#2D2A26]">{item.item_name}</div>
                <div className="text-xs text-gray-400">{item.item_code} · {item.item_group}</div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <div className={`text-sm font-bold ${item.actual_qty === 0 ? 'text-red-600' : 'text-orange-500'}`}>
                  {item.actual_qty} {item.actual_qty === 0 ? '(Out)' : 'left'}
                </div>
                <div className="text-xs text-gray-400">Min: {item.min_qty}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>

    {/* Navigation shortcuts */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <NavLink icon={<Package className="h-4 w-4" />} label="Inventory Management" sub="View and manage stock" onClick={() => navigate('/inventory')} />
      <NavLink icon={<Truck className="h-4 w-4" />} label="Supplier Management" sub="Manage suppliers" onClick={() => navigate('/suppliers')} />
      <NavLink icon={<ShoppingCart className="h-4 w-4" />} label="Purchase Orders" sub="Create and track POs" onClick={() => navigate('/purchase-orders')} />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Tab content — Staff
// ─────────────────────────────────────────────────────────────────────────────

const StaffTab = ({ data, navigate }: { data: StaffData; navigate: (path: string) => void }) => (
  <div className="space-y-5">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard accent label="Total Staff" value={data.total_staff} sub="All employees" icon={<Users className="h-4 w-4" />} />
      <StatCard label="On Shift Today" value={data.on_shift_today} sub="Currently working" icon={<UserCheck className="h-4 w-4" />} />
      <StatCard label="Recent Hires" value={data.recent_hires} sub="Last 30 days" icon={<UserPlus className="h-4 w-4" />} />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <NavLink icon={<Users className="h-4 w-4" />} label="All Employees" sub="View full staff list" onClick={() => navigate('/hr/employees')} />
      <NavLink icon={<Clock className="h-4 w-4" />} label="Shift Management" sub="View and edit shifts" onClick={() => navigate('/hr/shifts')} />
      <NavLink icon={<UserPlus className="h-4 w-4" />} label="Add Employee" sub="Onboard new staff" onClick={() => navigate('/hr/employees/new')} />
      <NavLink icon={<DollarSign className="h-4 w-4" />} label="Payroll" sub="Process payments" onClick={() => navigate('/hr/payroll')} />
      <NavLink icon={<FileText className="h-4 w-4" />} label="Leave Management" sub="Manage leave requests" onClick={() => navigate('/hr/leaves')} />
      <NavLink icon={<BarChart2 className="h-4 w-4" />} label="Staff Reports" sub="Performance analytics" onClick={() => navigate('/reports/staff')} />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Tab content — Events
// ─────────────────────────────────────────────────────────────────────────────

const EventsTab = ({ data, navigate }: { data: EventsData; navigate: (path: string) => void }) => (
  <div className="space-y-5">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard accent label="Upcoming Events" value={data.upcoming_count} sub="Scheduled" icon={<Calendar className="h-4 w-4" />} />
      <StatCard label="Event Revenue" value={fmtShort(data.event_revenue)} sub="This month" icon={<DollarSign className="h-4 w-4" />} />
      <StatCard label="Expected Guests" value={data.expected_guests} sub="Total upcoming" icon={<Users className="h-4 w-4" />} />
    </div>

    <SectionCard title="Upcoming Events" action={() => navigate('/events')} actionLabel="View All">
      {!data.upcoming_events?.length ? (
        <p className="text-sm text-gray-400 py-6 text-center">No upcoming events scheduled</p>
      ) : (
        <div className="divide-y divide-gray-50">
          {data.upcoming_events.map((evt, i) => (
            <div key={i} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-[#E4B315]/10 rounded-xl flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-[#C69A11]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#2D2A26]">{evt.subject}</div>
                  <div className="text-xs text-gray-400">{fmtDate(evt.starts_on)}</div>
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <div className="text-sm font-bold text-[#2D2A26]">{evt.expected_guests}</div>
                <div className="text-xs text-gray-400">Guests</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <NavLink icon={<Calendar className="h-4 w-4" />} label="Event Calendar" sub="View all bookings" onClick={() => navigate('/events/calendar')} />
      <NavLink icon={<Settings className="h-4 w-4" />} label="Create Event" sub="Book a new event" onClick={() => navigate('/events/new')} />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Tab content — Analytics
// ─────────────────────────────────────────────────────────────────────────────

const AnalyticsTab = ({ data }: { data: AnalyticsData }) => {
  const growthSign = data.customer_growth_pct >= 0 ? '+' : '';
  return (
    <div className="space-y-5">
      {/* KPI summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard accent label="Monthly Revenue" value={fmtShort(data.monthly_revenue)} sub="+20.6% vs last" icon={<DollarSign className="h-4 w-4" />} />
        <StatCard label="Customer Growth" value={`${growthSign}${data.customer_growth_pct.toFixed(1)}%`} sub="vs last month" icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="Avg Order Value" value={fmtShort(data.avg_order_value)} sub={`${data.total_orders} orders`} icon={<ShoppingCart className="h-4 w-4" />} />
        <StatCard label="Repeat Customers" value={`${data.repeat_customer_pct.toFixed(1)}%`} sub="Loyalty rate" icon={<UserCheck className="h-4 w-4" />} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Revenue Trend">
          <LineChart data={data.revenue_trend} />
        </SectionCard>
        <SectionCard title="Orders by Hour">
          <BarChart data={data.orders_by_hour} />
        </SectionCard>
      </div>

      {/* Top items + performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Top Performing Items">
          {data.top_performing_items.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No data this month.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {data.top_performing_items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div>
                    <div className="text-sm font-semibold text-[#2D2A26]">{item.item_name}</div>
                    <div className="text-xs text-gray-400">{item.orders} orders</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-sm font-bold text-[#2D2A26]">{fmt(item.revenue)}</span>
                    {item.is_top && (
                      <span className="px-2 py-0.5 bg-[#E4B315] text-white rounded-full text-xs font-bold">
                        #1
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Performance Summary">
          <div className="space-y-3">
            {[
              { label: 'Peak Performance Hour', sub: data.peak_hour, badge: 'Optimal', badgeStyle: 'bg-[#E4B315] text-white' },
              { label: 'Repeat Customers', sub: `${data.repeat_customer_pct.toFixed(1)}% loyalty rate`, badge: 'Good', badgeStyle: 'bg-green-100 text-green-700' },
              { label: 'Top Selling Item', sub: data.top_selling_item, badge: '#1 Item', badgeStyle: 'bg-[#E4B315]/10 text-[#C69A11]' },
              { label: 'Total Orders', sub: `${data.total_orders} this month`, badge: 'Active', badgeStyle: 'bg-blue-100 text-blue-700' },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <div className="text-sm font-semibold text-[#2D2A26]">{row.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{row.sub}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ml-3 ${row.badgeStyle}`}>{row.badge}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Detailed Reports */}
      <SectionCard title="Detailed Reports">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { icon: <BarChart2 className="h-5 w-5" />, label: 'Sales' },
            { icon: <DollarSign className="h-5 w-5" />, label: 'Financial' },
            { icon: <Users className="h-5 w-5" />, label: 'Customer' },
            { icon: <Package className="h-5 w-5" />, label: 'Inventory' },
            { icon: <UserCheck className="h-5 w-5" />, label: 'Staff' },
            { icon: <Calendar className="h-5 w-5" />, label: 'Events' },
          ].map((r, i) => (
            <button key={i} className="flex flex-col items-center gap-2 p-4 border border-gray-100 rounded-2xl hover:border-[#E4B315]/30 hover:bg-[#E4B315]/4 hover:-translate-y-0.5 transition-all text-center bg-white shadow-sm">
              <span className="text-[#C69A11] bg-[#E4B315]/10 p-2 rounded-xl">{r.icon}</span>
              <span className="text-xs font-semibold text-gray-500">{r.label}</span>
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main DashboardHome
// ─────────────────────────────────────────────────────────────────────────────

type TabDef = { id: TabId; label: string; icon: React.ReactNode };

const TABS: TabDef[] = [
  { id: 'overview',   label: 'Overview',   icon: <LayoutGrid className="h-4 w-4" /> },
  { id: 'operations', label: 'Operations', icon: <Package className="h-4 w-4" /> },
  { id: 'staff',      label: 'Staff',      icon: <Users className="h-4 w-4" /> },
  { id: 'events',     label: 'Events',     icon: <Calendar className="h-4 w-4" /> },
  { id: 'analytics',  label: 'Analytics',  icon: <BarChart2 className="h-4 w-4" /> },
];

const DashboardHome = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const saved = sessionStorage.getItem('dashboardActiveTab');
    return (saved as TabId) || 'overview';
  });
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => { sessionStorage.setItem('dashboardActiveTab', activeTab); }, [activeTab]);

  const [overview,   setOverview]   = useState<OverviewData   | null>(null);
  const [operations, setOperations] = useState<OperationsData | null>(null);
  const [staff,      setStaff]      = useState<StaffData      | null>(null);
  const [events,     setEvents]     = useState<EventsData     | null>(null);
  const [analytics,  setAnalytics]  = useState<AnalyticsData  | null>(null);

  const hasData: Record<TabId, boolean> = {
    overview: !!overview, operations: !!operations,
    staff: !!staff, events: !!events, analytics: !!analytics,
  };

  const load = useCallback(async (tab: TabId, force = false) => {
    if (hasData[tab] && !force) return;
    setLoading(true); setError(null);
    try {
      const result = await fetchTabData(tab);
      if (result.overview)   setOverview(result.overview);
      if (result.operations) setOperations(result.operations);
      if (result.staff)      setStaff(result.staff);
      if (result.events)     setEvents(result.events);
      if (result.analytics)  setAnalytics(result.analytics);
      setLastRefresh(new Date());
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load dashboard data. Using sample data.');
      if (tab === 'overview') {
        setOverview({ monthly_revenue: 125500, total_orders: 1234, unique_customers: 892, avg_order_value: 101.7, low_stock_count: 8, pending_orders: 12, staff_on_shift: 15, upcoming_events: 3, top_selling_items: [{ item_name: 'Sample Item 1', qty: 45, revenue: 12500 }, { item_name: 'Sample Item 2', qty: 32, revenue: 8900 }, { item_name: 'Sample Item 3', qty: 28, revenue: 7200 }] });
      } else if (tab === 'operations') {
        setOperations({ low_stock_count: 8, pending_purchase_orders: 5, active_suppliers: 23, total_inventory_items: 156, low_stock_items: [{ item_code: 'ITEM001', item_name: 'Sample Low Stock Item 1', item_group: 'Beverages', actual_qty: 3, min_qty: 10 }, { item_code: 'ITEM002', item_name: 'Sample Low Stock Item 2', item_group: 'Food', actual_qty: 0, min_qty: 5 }] });
      } else if (tab === 'staff') {
        setStaff({ total_staff: 45, on_shift_today: 15, recent_hires: 3 });
      } else if (tab === 'events') {
        setEvents({ upcoming_count: 3, event_revenue: 25000, expected_guests: 150, upcoming_events: [{ name: 'EVT001', subject: 'Birthday Party', starts_on: '2026-03-20', ends_on: '2026-03-20', expected_guests: 25 }, { name: 'EVT002', subject: 'Corporate Event', starts_on: '2026-03-25', ends_on: '2026-03-25', expected_guests: 50 }] });
      } else if (tab === 'analytics') {
        setAnalytics({ monthly_revenue: 125500, customer_growth_pct: 12.5, avg_order_value: 101.7, repeat_customer_pct: 35.2, total_orders: 1234, revenue_trend: [{ date: '2026-03-01', revenue: 4200 }, { date: '2026-03-05', revenue: 5100 }, { date: '2026-03-10', revenue: 4800 }, { date: '2026-03-15', revenue: 6200 }], orders_by_hour: [{ hour: '09:00', orders: 12 }, { hour: '12:00', orders: 45 }, { hour: '15:00', orders: 38 }, { hour: '18:00', orders: 52 }, { hour: '21:00', orders: 28 }], top_performing_items: [{ item_name: 'Sample Item 1', item_code: 'ITEM001', orders: 145, revenue: 12500, is_top: true }, { item_name: 'Sample Item 2', item_code: 'ITEM002', orders: 98, revenue: 8900, is_top: false }], peak_hour: '18:00-19:00', top_selling_item: 'Sample Item 1' });
      }
    } finally { setLoading(false); }
  }, [hasData]);

  useEffect(() => { load(activeTab); }, [activeTab]);
  const handleRefresh = () => load(activeTab, true);

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-10">

      {/* ── Header ── */}
      <div className="flex justify-between items-start pt-1">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2D2A26] tracking-tight">Quant Restaurant</h1>
          <p className="text-sm text-gray-400 mt-0.5 font-medium">Real-time restaurant operations dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 font-medium bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm">
            <Clock className="h-3.5 w-3.5" /> {todayStr()}
          </span>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-100 bg-white rounded-xl text-sm font-semibold text-gray-600 hover:border-[#E4B315]/40 hover:text-[#C69A11] disabled:opacity-50 transition-all shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-[#E4B315]' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm p-1 gap-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white shadow-md shadow-[#E4B315]/20'
                : 'text-gray-400 hover:text-[#2D2A26] hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-sm">
          <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Tab Content ── */}
      {loading && !hasData[activeTab] ? (
        <Spinner />
      ) : (
        <>
          {activeTab === 'overview'   && overview   && <OverviewTab   data={overview}   navigate={navigate} />}
          {activeTab === 'operations' && operations && <OperationsTab data={operations} navigate={navigate} />}
          {activeTab === 'staff'      && staff      && <StaffTab      data={staff}      navigate={navigate} />}
          {activeTab === 'events'     && events     && <EventsTab     data={events}     navigate={navigate} />}
          {activeTab === 'analytics'  && analytics  && <AnalyticsTab  data={analytics}  />}
        </>
      )}
    </div>
  );
};

export default DashboardHome;