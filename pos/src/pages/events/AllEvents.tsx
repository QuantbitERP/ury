import React, { useState, useEffect, useCallback, useRef } from 'react';
import PageLayout from '../../components/PageLayout';
// ─── Types ────────────────────────────────────────────────────────────────────

interface ItemGroup { name: string; }
interface Item { name: string; item_name: string; valuation_rate: number; }
interface URYRoom { name: string; room_type: string; custom_capacity: string; custom_rate: number; custom_daywise_rate: number; }
interface EventPurpose { name: string; event_purpose?: string; }
interface Customer { name: string; customer_name: string; mobile_number?: string; customer_group?: string; territory?: string; }

interface AccessoryRow {
  name?: string;
  accessories_type: string;
  accessories: string;
  qty: number;
  rate: number;
  amount: number;
  _items: Item[];
  _loadingItems: boolean;
}

interface FrappeEvent {
  name: string;
  subject: string;
  starts_on: string;
  ends_on: string;
  status: string;
  custom_event_purpose: string;
  event_type: string;
  custom_capacity: string;
  custom_final_amount: number;
  custom_amount: number;
  custom_rate: string;
  custom_daywise_rate: number;
  event_category: string;
  custom_customer?: string;
  deposit_status?: string;
  custom_room?: string;
  custom_event_charges?: string;
  send_reminder?: number;
  all_day?: number;
  custom_accessories?: Omit<AccessoryRow, '_items' | '_loadingItems'>[];
}

type ModalMode = 'none' | 'view' | 'create' | 'edit';

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_EVENTS: FrappeEvent[] = [{
  name: 'EV00014', subject: 'Birthday Party',
  starts_on: '2025-10-10 19:30:00', ends_on: '2025-10-10 23:00:00',
  status: 'Open', custom_event_purpose: 'Birthday Party',
  event_type: 'Private', custom_capacity: '200',
  custom_final_amount: 17600, custom_amount: 17500,
  custom_rate: '5000', custom_daywise_rate: 10000,
  event_category: 'Event', custom_customer: 'John Doe',
  deposit_status: 'Pending', custom_room: 'Party room',
  custom_event_charges: 'Hourly', send_reminder: 1,
  custom_accessories: [{ accessories_type: 'Sound Equipment', accessories: 'Sound', qty: 2, rate: 50, amount: 100 }]
}];

const MOCK_PURPOSES: EventPurpose[] = [
  { name: 'Birthday Party', event_purpose: 'Birthday Party' },
  { name: 'Wedding', event_purpose: 'Wedding' },
  { name: 'Corporate Meeting', event_purpose: 'Corporate Meeting' },
  { name: 'Conference', event_purpose: 'Conference' },
  { name: 'Anniversary', event_purpose: 'Anniversary' },
];
const MOCK_CUSTOMERS: Customer[] = [
  { name: 'CUST-001', customer_name: 'John Doe' },
  { name: 'CUST-002', customer_name: 'Priya Sharma' },
  { name: 'CUST-003', customer_name: 'Ali Hassan' },
];
const MOCK_ITEM_GROUPS: ItemGroup[] = [
  { name: 'Sound Equipment' }, { name: 'Lighting' }, { name: 'Furniture' }, { name: 'Catering' }
];
const MOCK_ITEMS: Record<string, Item[]> = {
  'Sound Equipment': [
    { name: 'MIC-001', item_name: 'Wireless Microphone', valuation_rate: 150 },
    { name: 'SPK-001', item_name: 'PA Speaker', valuation_rate: 300 },
  ],
  'Lighting': [
    { name: 'LED-001', item_name: 'LED Par Light', valuation_rate: 80 },
    { name: 'SPOT-001', item_name: 'Spotlight', valuation_rate: 120 },
  ],
  'Furniture': [
    { name: 'CHR-001', item_name: 'Banquet Chair', valuation_rate: 25 },
    { name: 'TBL-001', item_name: 'Round Table', valuation_rate: 75 },
  ],
  'Catering': [{ name: 'CAT-001', item_name: 'Buffet Setup', valuation_rate: 500 }],
};
const MOCK_ROOMS: URYRoom[] = [
  { name: 'Party room', room_type: 'NON-AC', custom_capacity: '200', custom_rate: 5000, custom_daywise_rate: 10000 },
  { name: 'Conference Hall', room_type: 'AC', custom_capacity: '100', custom_rate: 8000, custom_daywise_rate: 15000 },
  { name: 'Terrace', room_type: 'OPEN', custom_capacity: '300', custom_rate: 3000, custom_daywise_rate: 8000 },
];

const EMPTY_FORM: Omit<FrappeEvent, 'name'> = {
  subject: '', starts_on: '', ends_on: '', status: 'Open',
  custom_event_purpose: '', event_type: 'Private',
  custom_capacity: '', custom_final_amount: 0, custom_amount: 0,
  custom_rate: '', custom_daywise_rate: 0, event_category: 'Event',
  custom_customer: '', custom_room: '', custom_event_charges: 'Hourly',
  send_reminder: 0, all_day: 0,
};

const EMPTY_ROW = (): AccessoryRow => ({
  accessories_type: '', accessories: '', qty: 1, rate: 0, amount: 0,
  _items: [], _loadingItems: false,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (d: string) =>
  d ? new Date(d).toLocaleString('en-KE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) : '—';

// Status badge colours — matching Orders.tsx palette
const statusColors: Record<string, string> = {
  open: 'bg-[#E4B315]/10 text-[#C69A11] border border-[#E4B315]/30',
  completed: 'bg-green-50 text-green-700 border border-green-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
  closed: 'bg-sky-50 text-sky-700 border border-sky-200',
};

const apiGet = async (url: string) => {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) throw new Error(`${res.status}`);
  const d = await res.json();
  return d.data ?? d.message ?? d;
};


// ─── Shared input / select class strings ─────────────────────────────────────

const inputCls =
  "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#2D2A26] w-full " +
  "focus:outline-none focus:ring-2 focus:ring-[#E4B315]/30 focus:border-[#E4B315]/50 " +
  "disabled:bg-gray-50 disabled:text-gray-400 transition-colors";

const selectCls =
  "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#2D2A26] w-full " +
  "focus:outline-none focus:ring-2 focus:ring-[#E4B315]/30 focus:border-[#E4B315]/50 " +
  "disabled:bg-gray-50 transition-colors";

// ─── Base UI pieces ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[status.toLowerCase()] ?? 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
    {status}
  </span>
);

const Field = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
    <p className="text-sm text-[#2D2A26] font-medium">
      {value !== null && value !== undefined
        ? (typeof value === 'number' ? `KSh ${value.toLocaleString()}` : value)
        : 'KSh 0'}
    </p>
  </div>
);

const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1 block">
    {children}{required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const SectionHeading = ({ children, noMargin }: { children: React.ReactNode; noMargin?: boolean }) => (
  <div className={noMargin ? '' : '-mb-1'}>
    <p className="text-[11px] font-bold uppercase tracking-widest text-[#C69A11]">{children}</p>
  </div>
);

const IconBtn = ({ onClick, title, children, color }: {
  onClick: () => void; title: string; children: React.ReactNode; color: string;
}) => (
  <button title={title} onClick={onClick} className={`p-1.5 rounded-lg transition-colors ${color}`}>
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{children}</svg>
  </button>
);

const Spinner = ({ sm }: { sm?: boolean }) => (
  <svg className={`animate-spin ${sm ? 'w-3.5 h-3.5' : 'w-5 h-5'} shrink-0`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

const Modal = ({ title, subtitle, onClose, children, wide }: {
  title: string; subtitle?: string; onClose: () => void;
  children: React.ReactNode; wide?: boolean;
}) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-4xl' : 'max-w-xl'} max-h-[92vh] flex flex-col border border-gray-100`}>
      <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-[#2D2A26]">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 ml-4 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="overflow-y-auto px-6 py-5 flex-1">{children}</div>
    </div>
  </div>
);

// ─── SearchableSelect — with inline quick-create ──────────────────────────────

interface SearchableSelectOption { label: string; value: string; }

interface SearchableSelectProps {
  label: string;
  value: string;
  options: SearchableSelectOption[];
  loading?: boolean;
  required?: boolean;
  placeholder?: string;
  createLabel: string;
  createDoctype: string;
  createFields: { name: string; label: string; required?: boolean; }[];
  onSelect: (value: string) => void;
  onCreated: (newOption: SearchableSelectOption) => void;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label, value, options, loading, required, placeholder,
  createLabel, createDoctype, createFields,
  onSelect, onCreated,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createValues, setCreateValues] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false); setShowCreate(false); setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const selectedLabel = options.find(o => o.value === value)?.label ?? value;

  const handleSelect = (val: string) => {
    onSelect(val); setOpen(false); setSearch(''); setShowCreate(false);
  };

  const handleCreate = async () => {
    setCreating(true); setCreateError('');
    const payload: Record<string, string> = { doctype: createDoctype, ...createValues };
    try {
      const res = await fetch(`/api/resource/${encodeURIComponent(createDoctype)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': (window as any).csrf_token ?? '' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) {
        let errMsg = 'Failed to create record.';
        try {
          const serverMsgs = JSON.parse(json._server_messages ?? '[]');
          const parsed = JSON.parse(serverMsgs[0] ?? '{}');
          errMsg = parsed.message ?? json.exception ?? errMsg;
        } catch {
          errMsg = json.exception?.replace(/^.*ValidationError:\s*/, '') ?? errMsg;
        }
        setCreateError(errMsg); setCreating(false); return;
      }
      const data = json.data ?? json.message ?? json;
      const newName = data.name ?? createValues[createFields[0].name] ?? `NEW-${Date.now()}`;
      const newLabel = createValues[createFields[0].name] ?? newName;
      const newOpt = { value: newName, label: newLabel };
      onCreated(newOpt); onSelect(newName);
      setShowCreate(false); setCreateValues({}); setOpen(false); setSearch('');
    } catch (e: any) {
      setCreateError(e?.message ?? 'Network error. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <Label required={required}>{label}</Label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setShowCreate(false); setSearch(''); }}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-[#E4B315]/30 hover:border-[#E4B315]/40 transition-colors"
      >
        <span className={value ? 'text-[#2D2A26]' : 'text-gray-400'}>
          {loading ? 'Loading…' : (value ? selectedLabel : (placeholder ?? `Select ${label}…`))}
        </span>
        <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">

          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}…`}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E4B315]/30"
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="flex items-center gap-2 px-4 py-3 text-gray-400 text-sm">
                <Spinner sm /> Loading…
              </div>
            ) : filtered.length === 0 && !search ? (
              <p className="px-4 py-3 text-sm text-gray-400">No records found.</p>
            ) : filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400">
                No match for "<span className="font-medium text-gray-600">{search}</span>"
              </p>
            ) : (
              filtered.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#E4B315]/10 transition-colors flex items-center justify-between group
                    ${opt.value === value ? 'bg-[#E4B315]/10 text-[#C69A11] font-semibold' : 'text-gray-700'}`}
                >
                  {opt.label}
                  {opt.value === value && (
                    <svg className="w-4 h-4 text-[#C69A11] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>

          {/* ＋ Create new */}
          {!showCreate && (
            <div className="border-t border-gray-100">
              <button
                type="button"
                onClick={() => { setShowCreate(true); setCreateValues({}); setCreateError(''); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#C69A11] hover:bg-[#E4B315]/10 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Create new {createLabel}
              </button>
            </div>
          )}

          {/* Inline quick-create form */}
          {showCreate && (
            <div className="border-t border-[#E4B315]/20 bg-[#E4B315]/5 p-3 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#C69A11] mb-2">
                New {createLabel}
              </p>
              {createFields.map(f => (
                <div key={f.name}>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-0.5">
                    {f.label}{f.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    value={createValues[f.name] ?? ''}
                    onChange={e => setCreateValues(v => ({ ...v, [f.name]: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E4B315]/30"
                    placeholder={f.label}
                  />
                </div>
              ))}
              {createError && <p className="text-xs text-red-500">{createError}</p>}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={creating || createFields.filter(f => f.required).some(f => !createValues[f.name]?.trim())}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#E4B315] to-[#C69A11] disabled:opacity-50 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm hover:opacity-90 transition-all"
                >
                  {creating ? <><Spinner sm /> Saving…</> : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Save & Select
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setCreateValues({}); }}
                  className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-500 text-xs font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Room Selector ────────────────────────────────────────────────────────────

const RoomSelector = ({ value, rooms, loading, onChange }: {
  value: string; rooms: URYRoom[]; loading: boolean;
  onChange: (room: URYRoom | null) => void;
}) => {
  const selected = rooms.find(r => r.name === value);
  return (
    <div className="col-span-2">
      <Label>Room</Label>
      <div className="flex gap-3 items-start flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <select
            value={value}
            onChange={e => onChange(rooms.find(r => r.name === e.target.value) ?? null)}
            className={selectCls} disabled={loading}
          >
            <option value="">{loading ? 'Loading rooms…' : 'Select a room…'}</option>
            {rooms.map(r => (
              <option key={r.name} value={r.name}>{r.name} — {r.room_type}</option>
            ))}
          </select>
        </div>
        {selected && (
          <div className="flex gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
              </svg>
              {selected.custom_capacity} guests
            </span>
            <span className="inline-flex items-center gap-1 bg-[#E4B315]/10 text-[#C69A11] px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              KSh {Number(selected.custom_rate).toLocaleString()}/hr
            </span>
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              KSh {Number(selected.custom_daywise_rate).toLocaleString()}/day
            </span>
            <span className={`inline-flex items-center px-3 py-2 rounded-lg text-xs font-semibold
              ${selected.room_type === 'AC' ? 'bg-blue-50 text-blue-700' :
                selected.room_type === 'NON-AC' ? 'bg-orange-50 text-orange-700' :
                  'bg-teal-50 text-teal-700'}`}>
              {selected.room_type}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Accessory Table Row ──────────────────────────────────────────────────────

const AccessoryTableRow = ({ row, index, itemGroups, onUpdate, onRemove }: {
  row: AccessoryRow; index: number; itemGroups: ItemGroup[];
  onUpdate: (i: number, patch: Partial<AccessoryRow>) => void;
  onRemove: (i: number) => void;
}) => {
  const handleGroupChange = async (groupName: string) => {
    onUpdate(index, { accessories_type: groupName, accessories: '', rate: 0, amount: 0, _items: [], _loadingItems: true });
    if (!groupName) return;
    try {
      const data = await apiGet(
        `/api/resource/Item?filters=[["item_group","=","${encodeURIComponent(groupName)}"],["disabled","=",0]]&fields=["name","item_name","valuation_rate"]&limit=200`
      );
      onUpdate(index, { _items: Array.isArray(data) ? data : [], _loadingItems: false });
    } catch {
      onUpdate(index, { _items: MOCK_ITEMS[groupName] ?? [], _loadingItems: false });
    }
  };

  const handleItemChange = (itemName: string) => {
    const item = row._items.find(i => i.name === itemName);
    const rate = item?.valuation_rate ?? 0;
    onUpdate(index, { accessories: itemName, rate, amount: rate * row.qty });
  };

  return (
    <tr className="border-t border-gray-100 hover:bg-[#E4B315]/5 transition-colors group">
      <td className="px-3 py-2 min-w-[160px]">
        <select value={row.accessories_type} onChange={e => handleGroupChange(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E4B315]/30">
          <option value="">Select group…</option>
          {itemGroups.map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
        </select>
      </td>
      <td className="px-3 py-2 min-w-[180px]">
        {row._loadingItems ? (
          <div className="flex items-center gap-2 px-2 text-gray-400 text-sm"><Spinner sm />Loading items…</div>
        ) : (
          <select value={row.accessories} onChange={e => handleItemChange(e.target.value)}
            disabled={!row.accessories_type || row._items.length === 0}
            className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E4B315]/30 disabled:bg-gray-50 disabled:text-gray-400">
            <option value="">Select item…</option>
            {row._items.map(i => <option key={i.name} value={i.name}>{i.item_name || i.name}</option>)}
          </select>
        )}
      </td>
      <td className="px-3 py-2 w-[80px]">
        <input type="number" min="1" value={row.qty}
          onChange={e => onUpdate(index, { qty: Number(e.target.value), amount: Number(e.target.value) * row.rate })}
          className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#E4B315]/30" />
      </td>
      <td className="px-3 py-2 w-[130px]">
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium select-none">KSh</span>
          <input type="number" min="0" value={row.rate}
            onChange={e => onUpdate(index, { rate: Number(e.target.value), amount: Number(e.target.value) * row.qty })}
            className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#E4B315]/30" />
        </div>
        {row.accessories && row.rate > 0 && (
          <p className="text-[10px] text-[#C69A11] font-medium text-center mt-0.5">from valuation</p>
        )}
      </td>
      <td className="px-4 py-2 text-right font-semibold text-gray-700 w-[110px]">
        KSh {row.amount.toLocaleString()}
      </td>
      <td className="px-2 py-2 w-10 text-center">
        <button type="button" onClick={() => onRemove(index)}
          className="text-gray-200 group-hover:text-gray-400 hover:!text-red-500 transition-colors p-1 rounded">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </td>
    </tr>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

// local type alias so calculateAmount can reference form shape
type EventForm = Omit<FrappeEvent, 'name'>;

const AllEvents: React.FC = () => {
  const [events, setEvents] = useState<FrappeEvent[]>([]);
  const [filtered, setFiltered] = useState<FrappeEvent[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalMode>('none');
  const [selected, setSelected] = useState<FrappeEvent | null>(null);
  const [form, setForm] = useState<EventForm>(EMPTY_FORM);
  const [accessories, setAccessories] = useState<AccessoryRow[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [itemGroups, setItemGroups] = useState<ItemGroup[]>([]);
  const [rooms, setRooms] = useState<URYRoom[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [purposes, setPurposes] = useState<EventPurpose[]>([]);
  const [purposesLoading, setPurposesLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  // ── Calculation Functions ──
  const calculateAmount = useCallback((form: EventForm) => {
    if (!form.starts_on || !form.ends_on || !form.custom_rate) return 0;
    const start = new Date(form.starts_on);
    const end = new Date(form.ends_on);
    const diffMs = end.getTime() - start.getTime();
    const hours = diffMs / (1000 * 60 * 60);
    const rate = parseFloat(form.custom_rate?.toString() || '0');
    const daywiseRate = parseFloat(form.custom_daywise_rate?.toString() || '0');
    const amount = form.custom_event_charges === "Hourly" ? hours * rate : hours * daywiseRate;
    return Math.round(amount * 100) / 100;
  }, []);

  const calculateFinalAmount = useCallback((form: EventForm, accessories: AccessoryRow[]) => {
    const eventAmount = calculateAmount(form);
    const totalAccessoriesAmount = accessories.reduce((sum, row) => {
      return sum + parseFloat(row.amount?.toString() || '0');
    }, 0);
    return Math.round((eventAmount + totalAccessoriesAmount) * 100) / 100;
  }, [calculateAmount]);

  useEffect(() => {
    const newAmount = calculateAmount(form);
    setForm(prev => ({ ...prev, custom_amount: newAmount }));
  }, [form.starts_on, form.ends_on, form.custom_rate, form.custom_event_charges, calculateAmount]);

  useEffect(() => {
    const newFinalAmount = calculateFinalAmount(form, accessories);
    setForm(prev => ({ ...prev, custom_final_amount: newFinalAmount }));
  }, [form.custom_amount, accessories, calculateFinalAmount]);

  // ── Load events ──
  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet('/api/resource/Event?fields=["name","subject","starts_on","ends_on","status","custom_event_purpose","event_type","custom_capacity","custom_final_amount","custom_amount","custom_rate","custom_daywise_rate","event_category","custom_customer","custom_room","custom_event_charges","send_reminder","all_day","custom_accessories"]&limit=100');
        setEvents(Array.isArray(data) ? data : MOCK_EVENTS);
      } catch {
        setEvents(MOCK_EVENTS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Load item groups ──
  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet('/api/resource/Item Group?fields=["name"]&limit=200&filters=[["is_group","=",0]]');
        setItemGroups(Array.isArray(data) ? data : MOCK_ITEM_GROUPS);
      } catch { setItemGroups(MOCK_ITEM_GROUPS); }
    })();
  }, []);

  const fetchRooms = useCallback(async () => {
    setRoomsLoading(true);
    try {
      const data = await apiGet('/api/resource/URY Room?fields=["name","room_type","custom_capacity","custom_rate","custom_daywise_rate"]&limit=100');
      setRooms(Array.isArray(data) ? data : MOCK_ROOMS);
    } catch { setRooms(MOCK_ROOMS); }
    finally { setRoomsLoading(false); }
  }, []);

  const fetchPurposes = useCallback(async () => {
    setPurposesLoading(true);
    try {
      const data = await apiGet('/api/resource/Event Purpose?fields=["name","event_purpose"]&limit=200');
      setPurposes(Array.isArray(data) ? data : MOCK_PURPOSES);
    } catch { setPurposes(MOCK_PURPOSES); }
    finally { setPurposesLoading(false); }
  }, []);

  const fetchCustomers = useCallback(async () => {
    setCustomersLoading(true);
    try {
      const data = await apiGet('/api/resource/Customer?fields=["name","customer_name"]&limit=500');
      setCustomers(Array.isArray(data) ? data : MOCK_CUSTOMERS);
    } catch { setCustomers(MOCK_CUSTOMERS); }
    finally { setCustomersLoading(false); }
  }, []);

  // ── Filter ──
  useEffect(() => {
    let list = events;
    if (search) list = list.filter(e =>
      e.subject.toLowerCase().includes(search.toLowerCase()) ||
      (e.custom_customer ?? '').toLowerCase().includes(search.toLowerCase()) ||
      e.name.toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter !== 'all') list = list.filter(e => e.status === statusFilter);
    setFiltered(list);
  }, [events, search, statusFilter]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openView = (e: FrappeEvent) => { setSelected(e); setModal('view'); };

  const openCreate = () => {
    setForm(EMPTY_FORM); setAccessories([]); setEditingName(null);
    fetchRooms(); fetchPurposes(); fetchCustomers(); setModal('create');
  };

  const openEdit = async (ev: FrappeEvent) => {
    const name = ev.name;
    try {
      const eventData = await apiGet(`/api/resource/Event/${encodeURIComponent(name)}?fields=["*","custom_accessories"]&limit=100`);
      const { name: eventName, ...eventRest } = eventData;
      const toLocalDT = (s: string) => s ? s.replace(' ', 'T').slice(0, 16) : s;
      setForm({ ...eventRest, starts_on: toLocalDT(eventRest.starts_on), ends_on: toLocalDT(eventRest.ends_on) });
      setEditingName(name);
      fetchRooms(); fetchPurposes(); fetchCustomers(); setModal('edit');

      const existingAcc = eventData.custom_accessories || [];
      if (existingAcc.length === 0) { setAccessories([]); return; }

      const uniqueGroups = [...new Set(existingAcc.map((a: any) => a.accessories_type).filter(Boolean))] as string[];
      const groupItemsMap: Record<string, Item[]> = {};
      await Promise.all(uniqueGroups.map(async (group) => {
        try {
          const data = await apiGet(
            `/api/resource/Item?filters=[["item_group","=","${encodeURIComponent(group)}"],["disabled","=",0]]&fields=["name","item_name","valuation_rate"]&limit=200`
          );
          groupItemsMap[group] = Array.isArray(data) ? data : (MOCK_ITEMS[group] ?? []);
        } catch {
          groupItemsMap[group] = MOCK_ITEMS[group] ?? [];
        }
      }));

      setAccessories(existingAcc.map((a: any) => ({
        ...a,
        _items: a.accessories_type ? (groupItemsMap[a.accessories_type] ?? []) : [],
        _loadingItems: false,
      })));
    } catch (error) {
      console.error('Error fetching event data:', error);
      showToast('Failed to fetch event data', 'error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleRoomSelect = (room: URYRoom | null) => {
    if (!room) { setForm(f => ({ ...f, custom_room: '' })); return; }
    setForm(f => ({
      ...f, custom_room: room.name, custom_capacity: room.custom_capacity,
      custom_rate: String(room.custom_rate), custom_daywise_rate: room.custom_daywise_rate,
    }));
  };

  const addRow = () => setAccessories(a => [...a, EMPTY_ROW()]);
  const updateRow = (i: number, patch: Partial<AccessoryRow>) => {
    setAccessories(rows => {
      const updatedRows = rows.map((r, idx) => idx === i ? { ...r, ...patch } : r);
      const updatedRow = updatedRows[i];
      if (patch.qty !== undefined || patch.rate !== undefined) {
        const qty = parseFloat(updatedRow.qty?.toString() || '0');
        const rate = parseFloat(updatedRow.rate?.toString() || '0');
        updatedRow.amount = Math.round((qty * rate) * 100) / 100;
      }
      return updatedRows;
    });
  };
  const removeRow = (i: number) => setAccessories(a => a.filter((_, idx) => idx !== i));
  const accessoriesTotal = accessories.reduce((s, r) => s + r.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const cleanAcc = accessories.map(({ _items, _loadingItems, ...rest }) => rest);
    const isEdit = modal === 'edit' && editingName;

    if (isEdit) {
      const payload = { ...form, custom_accessories: cleanAcc };
      try {
        const res = await fetch(`/api/resource/Event/${encodeURIComponent(editingName!)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': (window as any).csrf_token ?? '' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const json = await res.json();
          let errMsg = 'Failed to update event.';
          try {
            const msgs = JSON.parse(json._server_messages ?? '[]');
            errMsg = JSON.parse(msgs[0] ?? '{}').message ?? json.exception ?? errMsg;
          } catch { errMsg = json.exception?.replace(/^.*ValidationError:\s*/, '') ?? errMsg; }
          showToast(errMsg, 'error'); setSaving(false); return;
        }
        setEvents(evs => evs.map(ev => ev.name === editingName ? { ...ev, ...payload, name: editingName! } : ev));
        setModal('none'); showToast('Event updated!', 'success');
      } catch {
        setEvents(evs => evs.map(ev => ev.name === editingName ? { ...ev, ...payload, name: editingName! } : ev));
        setModal('none'); showToast('Updated locally (API unavailable).', 'success');
      } finally { setSaving(false); }
    } else {
      const payload = { ...form, doctype: 'Event', custom_accessories: cleanAcc };
      try {
        const res = await fetch('/api/resource/Event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': (window as any).csrf_token ?? '' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const json = await res.json();
          let errMsg = 'Failed to create event.';
          try {
            const msgs = JSON.parse(json._server_messages ?? '[]');
            errMsg = JSON.parse(msgs[0] ?? '{}').message ?? json.exception ?? errMsg;
          } catch { errMsg = json.exception?.replace(/^.*ValidationError:\s*/, '') ?? errMsg; }
          showToast(errMsg, 'error'); setSaving(false); return;
        }
        const data = await res.json();
        setEvents(evs => [{ ...payload, name: data.data?.name ?? `EV-${Date.now()}` }, ...evs]);
        setModal('none'); showToast('Event created!', 'success');
      } catch {
        setEvents(evs => [{ ...payload, name: `EV-${Date.now()}`, custom_accessories: cleanAcc }, ...evs]);
        setModal('none'); showToast('Saved locally (API unavailable).', 'success');
      } finally { setSaving(false); }
    }
  };

  const handleDelete = async (name: string) => {
    if (!window.confirm('Delete this event?')) return;
    try { await fetch(`/api/resource/Event/${name}`, { method: 'DELETE' }); } catch { /* */ }
    setEvents(ev => ev.filter(e => e.name !== name));
    showToast('Event deleted.', 'success');
  };

  const updateStatus = async (name: string, status: string) => {
    try {
      await fetch(`/api/resource/Event/${name}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch { /* */ }
    setEvents(ev => ev.map(e => e.name === name ? { ...e, status } : e));
    showToast(`Status → ${status}`, 'success');
  };

  const purposeOptions = purposes.map(p => ({ value: p.name, label: p.event_purpose ?? p.name }));
  const customerOptions = customers.map(c => ({ value: c.name, label: c.customer_name || c.name }));

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <PageLayout
      title="Events"
      subtitle="Frappe · Event Doctype"
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:border-[#E4B315]/40 hover:text-[#C69A11] transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to POS
          </button>
          <button onClick={openCreate}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow shadow-[#E4B315]/20 transition-all hover:opacity-90 active:scale-95">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Event
          </button>
        </div>
      }
    >
      <div className="px-8 py-6 max-w-7xl mx-auto h-full overflow-y-auto">

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, client, ID…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#E4B315]/30 focus:border-[#E4B315]/50 placeholder-gray-400 transition-colors" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E4B315]/30 transition-colors">
            <option value="all">All Statuses</option>
            {['Open', 'Completed', 'Closed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div className="flex items-center justify-center h-52 gap-3">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-full border-2 border-[#E4B315]/20" />
              <div className="absolute inset-0 rounded-full border-2 border-[#E4B315] border-t-transparent animate-spin" />
            </div>
            <span className="text-sm text-gray-400 font-medium">Loading events…</span>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-[#C69A11]">
                Events ({filtered.length}{filtered.length !== events.length ? ` of ${events.length}` : ''})
              </p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-50">
                  {['Event', 'Client', 'Purpose', 'Date & Time', 'Room', 'Amount', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16">
                      <div className="w-14 h-14 rounded-2xl bg-[#E4B315]/10 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-[#C69A11]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-[#2D2A26] mb-1">No events found</p>
                      <p className="text-xs text-gray-400">
                        <button onClick={openCreate} className="text-[#C69A11] font-semibold hover:underline">Create one →</button>
                      </p>
                    </td>
                  </tr>
                ) : filtered.map(ev => (
                  <tr key={ev.name} className="hover:bg-[#E4B315]/5 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[#2D2A26]">{ev.subject}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{ev.name}</div>
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-sm">{ev.custom_customer || '—'}</td>
                    <td className="px-5 py-4 text-sm">
                      {ev.custom_event_purpose ? (
                        <span className="inline-flex items-center bg-[#E4B315]/10 text-[#C69A11] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#E4B315]/20">
                          {ev.custom_event_purpose}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-gray-700 text-xs font-medium">{fmt(ev.starts_on)}</div>
                      <div className="text-xs text-gray-400">→ {fmt(ev.ends_on)}</div>
                    </td>
                    <td className="px-5 py-4">
                      {ev.custom_room ? (
                        <span className="inline-flex items-center gap-1 text-gray-600 text-xs font-medium">
                          <svg className="w-3 h-3 shrink-0 text-[#C69A11]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          {ev.custom_room}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-[#2D2A26] tabular-nums">KSh {(ev.custom_final_amount ?? 0).toLocaleString()}</div>
                      <div className="text-xs text-gray-400">{ev.custom_event_charges}</div>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={ev.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <IconBtn title="View" onClick={() => openView(ev)} color="text-[#C69A11] hover:bg-[#E4B315]/10">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </IconBtn>
                        <IconBtn title="Edit" onClick={() => openEdit(ev)} color="text-gray-400 hover:bg-[#E4B315]/10 hover:text-[#C69A11]">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </IconBtn>
                        {ev.status !== 'Completed' && (
                          <IconBtn title="Complete" onClick={() => updateStatus(ev.name, 'Completed')} color="text-emerald-600 hover:bg-emerald-50">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </IconBtn>
                        )}
                        {ev.status !== 'Cancelled' && (
                          <IconBtn title="Cancel" onClick={() => updateStatus(ev.name, 'Cancelled')} color="text-red-500 hover:bg-red-50">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </IconBtn>
                        )}
                        <IconBtn title="Delete" onClick={() => handleDelete(ev.name)} color="text-gray-300 hover:bg-red-50 hover:text-red-500">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400 font-medium">
              {filtered.length} event{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>

      {/* ── VIEW MODAL ── */}
      {modal === 'view' && selected && (
        <Modal title={selected.subject} subtitle={selected.name} onClose={() => setModal('none')}>
          <div className="space-y-5">
            <SectionHeading>Overview</SectionHeading>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Status" value={selected.status} />
              <Field label="Event Type" value={selected.event_type} />
              <Field label="Category" value={selected.event_category} />
              <Field label="Charges" value={selected.custom_event_charges} />
            </div>
            <SectionHeading>Schedule</SectionHeading>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Starts" value={fmt(selected.starts_on)} />
              <Field label="Ends" value={fmt(selected.ends_on)} />
            </div>
            <SectionHeading>Venue & Guests</SectionHeading>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Room" value={selected.custom_room} />
              <Field label="Capacity" value={`${selected.custom_capacity} guests`} />
              <Field label="Customer" value={selected.custom_customer} />
              <Field label="Purpose" value={selected.custom_event_purpose} />
            </div>
            <SectionHeading>Financials</SectionHeading>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Amount" value={`KSh ${(selected.custom_amount ?? 0).toLocaleString()}`} />
              <Field label="Hourly Rate" value={`KSh ${Number(selected.custom_rate).toLocaleString()}`} />
              <Field label="Daywise Rate" value={`KSh ${(selected.custom_daywise_rate ?? 0).toLocaleString()}`} />
              <Field label="Final Amount" value={`KSh ${(selected.custom_final_amount ?? 0).toLocaleString()}`} />
              <Field label="Deposit Status" value={selected.deposit_status} />
            </div>
            {(selected.custom_accessories?.length ?? 0) > 0 && (
              <>
                <SectionHeading>Accessories</SectionHeading>
                <div className="rounded-xl overflow-hidden border border-gray-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-100">
                        <th className="text-left px-4 py-2.5">Item</th>
                        <th className="text-left px-4 py-2.5">Group</th>
                        <th className="text-right px-4 py-2.5">Qty</th>
                        <th className="text-right px-4 py-2.5">Rate</th>
                        <th className="text-right px-4 py-2.5">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.custom_accessories!.map((a, i) => (
                        <tr key={i} className="border-t border-gray-50 hover:bg-[#E4B315]/5 transition-colors">
                          <td className="px-4 py-2 font-medium text-[#2D2A26]">{a.accessories}</td>
                          <td className="px-4 py-2 text-gray-500">{a.accessories_type}</td>
                          <td className="px-4 py-2 text-right text-gray-600">{a.qty}</td>
                          <td className="px-4 py-2 text-right text-gray-600">KSh {a.rate.toLocaleString()}</td>
                          <td className="px-4 py-2 text-right font-bold text-[#C69A11]">KSh {a.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* ── CREATE / EDIT MODAL ── */}
      {(modal === 'create' || modal === 'edit') && (
        <Modal
          title={modal === 'edit' ? `Edit Event — ${editingName}` : 'New Event'}
          subtitle="Frappe · Event Doctype"
          onClose={() => setModal('none')}
          wide
        >
          <form onSubmit={handleSubmit} className="space-y-6">

            <SectionHeading>Basic Info</SectionHeading>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label required>Subject / Event Name</Label>
                <input name="subject" value={form.subject} onChange={handleChange} required
                  className={inputCls} placeholder="e.g. Birthday Party" />
              </div>

              <div>
                <SearchableSelect
                  label="Event Purpose"
                  value={form.custom_event_purpose}
                  options={purposeOptions}
                  loading={purposesLoading}
                  placeholder="Select purpose…"
                  createLabel="Event Purpose"
                  createDoctype="Event Purpose"
                  createFields={[{ name: 'event_purpose', label: 'Purpose Name', required: true }]}
                  onSelect={v => setForm(f => ({ ...f, custom_event_purpose: v }))}
                  onCreated={opt => setPurposes(p => [...p, { name: opt.value, event_purpose: opt.label }])}
                />
              </div>

              <div>
                <SearchableSelect
                  label="Customer"
                  value={form.custom_customer ?? ''}
                  options={customerOptions}
                  loading={customersLoading}
                  placeholder="Select customer…"
                  createLabel="Customer"
                  createDoctype="Customer"
                  createFields={[
                    { name: 'customer_name', label: 'Customer Name', required: true },
                    { name: 'mobile_number', label: 'Mobile Number', required: true },
                    { name: 'customer_type', label: 'Customer Type (Individual / Company)', required: true },
                  ]}
                  onSelect={v => setForm(f => ({ ...f, custom_customer: v }))}
                  onCreated={opt => setCustomers(c => [...c, { name: opt.value, customer_name: opt.label }])}
                />
              </div>

              <div>
                <Label>Event Type</Label>
                <select name="event_type" value={form.event_type} onChange={handleChange} className={selectCls}>
                  {['Private', 'Public', 'Confidential'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <Label>Event Category</Label>
                <select name="event_category" value={form.event_category} onChange={handleChange} className={selectCls}>
                  {['Event', 'Meeting', 'Call', 'Sent/Received Email', 'Other'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <Label>Status</Label>
                <select name="status" value={form.status} onChange={handleChange} className={selectCls}>
                  {['Open', 'Completed', 'Closed', 'Cancelled'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <Label>Charges Type</Label>
                <select name="custom_event_charges" value={form.custom_event_charges ?? ''} onChange={handleChange} className={selectCls}>
                  {['Hourly', 'Daily', 'Fixed', 'Per Head'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <SectionHeading>Schedule</SectionHeading>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>Starts On</Label>
                <input name="starts_on" type="datetime-local" value={form.starts_on} onChange={handleChange} required className={inputCls} />
              </div>
              <div>
                <Label required>Ends On</Label>
                <input name="ends_on" type="datetime-local" value={form.ends_on} onChange={handleChange} required className={inputCls} />
              </div>
            </div>

            <SectionHeading>Venue & Guests</SectionHeading>
            <div className="grid grid-cols-2 gap-4">
              <RoomSelector value={form.custom_room ?? ''} rooms={rooms} loading={roomsLoading} onChange={handleRoomSelect} />
              <div>
                <Label>Capacity (guests)</Label>
                <input name="custom_capacity" type="number" value={form.custom_capacity} onChange={handleChange}
                  className={inputCls} placeholder="Auto-filled from room" />
              </div>
            </div>

            <SectionHeading>Financials</SectionHeading>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Amount (KSh)</Label>
                <input name="custom_amount" type="number" value={form.custom_amount} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <Label>Hourly Rate (KSh)</Label>
                <div className="relative">
                  <input name="custom_rate" type="number" value={form.custom_rate} onChange={handleChange}
                    className={inputCls + ' pr-24'} placeholder="Auto from room" />
                  {form.custom_room && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-[#C69A11] bg-[#E4B315]/10 px-1.5 py-0.5 rounded pointer-events-none">FROM ROOM</span>
                  )}
                </div>
              </div>
              <div>
                <Label>Daywise Rate (KSh)</Label>
                <div className="relative">
                  <input name="custom_daywise_rate" type="number" value={form.custom_daywise_rate} onChange={handleChange}
                    className={inputCls + ' pr-24'} placeholder="Auto from room" />
                  {form.custom_room && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-[#C69A11] bg-[#E4B315]/10 px-1.5 py-0.5 rounded pointer-events-none">FROM ROOM</span>
                  )}
                </div>
              </div>
              <div>
                <Label>Final Amount (KSh)</Label>
                <input name="custom_final_amount" type="number" value={form.custom_final_amount} onChange={handleChange} className={inputCls} />
              </div>
            </div>

            {/* Accessories */}
            <div className="flex items-center justify-between">
              <SectionHeading noMargin>Accessories</SectionHeading>
              <button type="button" onClick={addRow}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C69A11] hover:text-[#E4B315] bg-[#E4B315]/10 hover:bg-[#E4B315]/15 px-3 py-1.5 rounded-lg transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Add Row
              </button>
            </div>
            {accessories.length > 0 ? (
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                      <th className="text-left px-3 py-2.5">Item Group (Type)</th>
                      <th className="text-left px-3 py-2.5">Item</th>
                      <th className="px-3 py-2.5 text-center">Qty</th>
                      <th className="px-3 py-2.5 text-right">Rate (KSh)</th>
                      <th className="px-3 py-2.5 text-right">Amount</th>
                      <th className="px-3 py-2.5 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessories.map((row, i) => (
                      <AccessoryTableRow key={`${row.name}-${row.accessories_type}-${i}`} row={row} index={i} itemGroups={itemGroups} onUpdate={updateRow} onRemove={removeRow} />
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-100 bg-gray-50">
                      <td colSpan={4} className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Accessories Total</td>
                      <td className="px-4 py-2.5 text-right font-bold text-[#2D2A26]">KSh {accessoriesTotal.toLocaleString()}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-gray-200 py-8 text-center">
                <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-sm text-gray-400">No accessories added yet</p>
                <button type="button" onClick={addRow} className="mt-2 text-xs text-[#C69A11] hover:underline font-semibold">+ Add first row</button>
              </div>
            )}

            {/* Footer actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setModal('none')}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E4B315] to-[#C69A11] hover:opacity-90 text-white text-sm font-semibold shadow shadow-[#E4B315]/20 transition-all active:scale-95 disabled:opacity-60 inline-flex items-center gap-2">
                {saving && <Spinner sm />}
                {saving ? 'Saving…' : modal === 'edit' ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 inline-flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold
          ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success'
            ? <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            : <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
          {toast.msg}
        </div>
      )}
    </PageLayout>
  );
};

export default AllEvents;