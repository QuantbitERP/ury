import { useState, useEffect } from 'react';
import { TrendingUp, Download, Printer, Search, Info, FileText, Calendar } from 'lucide-react';
import {
    getCateringLevyDataForMonth,
    CateringLevyTransaction,
    CateringLevySummary,
} from '../../lib/api/catering-levy-api';

// ─────────────────────────────────────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────────────────────────────────────

const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

const LEVY_RATE = 2; // Catering Training Levy = 2% of gross sales

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const CateringLevy = () => {
    const [selectedMonth, setSelectedMonth] = useState(
        (new Date().getMonth() + 1).toString()
    );
    const [selectedYear, setSelectedYear] = useState(currentYear.toString());
    const [searchQuery, setSearchQuery] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [transactions, setTransactions] = useState<CateringLevyTransaction[]>([]);
    const [summary, setSummary] = useState<CateringLevySummary>({
        total_levy_collected: 0,
        gross_sales: 0,
        transaction_count: 0,
        payment_due_date: '',
    });

    // ── Data fetch ─────────────────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await getCateringLevyDataForMonth(selectedYear, selectedMonth);

                if (!cancelled) {
                    setTransactions(result.transactions);
                    setSummary(result.summary);
                }
            } catch (err: any) {
                console.error('Catering Levy fetch error:', err);
                if (!cancelled) {
                    setError(err?.message ?? 'Failed to load catering levy data.');
                    setTransactions([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        run();
        return () => { cancelled = true; };
    }, [selectedMonth, selectedYear]);

    // ── Formatters ──────────────────────────────────────────────────────────────
    const formatCurrency = (n: number) =>
        new Intl.NumberFormat('en-KE', {
            style: 'currency', currency: 'KES',
            minimumFractionDigits: 0, maximumFractionDigits: 0,
        }).format(n);

    const formatDate = (d: string) => {
        if (!d) return '—';
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
        }).format(new Date(d));
    };

    // Due date formatted as M/D/YYYY to match the screenshot style
    const formatDueDate = (iso: string) => {
        if (!iso) return '—';
        const dt = new Date(iso);
        return `${dt.getMonth() + 1}/${dt.getDate()}/${dt.getFullYear()}`;
    };

    // ── Filtering ───────────────────────────────────────────────────────────────
    const filtered = transactions.filter(tx => {
        const q = searchQuery.toLowerCase();
        return (
            !q ||
            tx.voucher_no.toLowerCase().includes(q) ||
            tx.order_number.toLowerCase().includes(q)
        );
    });

    // ── CSV Export ──────────────────────────────────────────────────────────────
    const downloadCSV = () => {
        const header = ['Date', 'Order #', 'Gross Sales', `Levy (${LEVY_RATE}%)`];
        const rows = filtered.map(tx => [
            tx.posting_date,
            tx.order_number,
            tx.gross_sales.toFixed(2),
            tx.levy_amount.toFixed(2),
        ]);
        const csv = [header, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `catering-levy-${selectedYear}-${selectedMonth.padStart(2, '0')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ── Print ───────────────────────────────────────────────────────────────────
    const handlePrint = () => window.print();

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="max-w-7xl mx-auto space-y-5 p-6 bg-gray-50/80 min-h-full">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                Catering Levy
            </h1>

            {/* ── Dashboard Summary Cards ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Total Levy Collected */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:border-[#E4B315]/30 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-gray-400">
                            Total Levy Collected
                        </span>
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="text-2xl font-extrabold text-[#C69A11]">
                        {loading ? '…' : formatCurrency(summary.total_levy_collected)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                        {LEVY_RATE}% of gross sales
                    </div>
                </div>

                {/* Gross Sales
            Source: GL Entry (account='Catering Levy Payable - QR') →
                    Sales Invoice Items → SUM(base_amount) */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:border-[#E4B315]/30 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-gray-400">
                            Gross Sales
                        </span>
                        <FileText className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="text-xl font-extrabold text-[#2D2A26]">
                        {loading ? '…' : formatCurrency(summary.gross_sales)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                        {loading ? '—' : `${summary.transaction_count} transaction${summary.transaction_count !== 1 ? 's' : ''}`}
                    </div>
                </div>

                {/* Payment Due Date — 20th of the following month */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:border-[#E4B315]/30 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-gray-400">
                            Payment Due Date
                        </span>
                        <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="text-2xl font-bold text-red-500">
                        {loading ? '…' : formatDueDate(summary.payment_due_date)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                        Tourism Fund remittance
                    </div>
                </div>
            </div>

            {/* ── CTL Register ─────────────────────────────────────────────────── */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">

                {/* Register header */}
                <div className="mb-1">
                    <h2 className="text-xl font-semibold">
                        Catering Training Levy (CTL) Register
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Kenya Catering Training Levy — {LEVY_RATE}% of gross sales remitted to Tourism Fund
                    </p>
                </div>

                {/* Controls row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-5 mb-5 gap-4">
                    {/* Period selectors */}
                    <div className="flex gap-3">
                        <select
                            value={selectedMonth}
                            onChange={e => setSelectedMonth(e.target.value)}
                            className="p-2 border border-gray-200 rounded-xl bg-transparent text-sm"
                        >
                            {months.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={e => setSelectedYear(e.target.value)}
                            className="p-2 border border-gray-200 rounded-xl bg-transparent text-sm"
                        >
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                        >
                            <Printer className="h-4 w-4" /> Print
                        </button>
                        <button
                            onClick={downloadCSV}
                            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                        >
                            <Download className="h-4 w-4" /> Download CSV
                        </button>
                    </div>
                </div>

                {/* Error banner */}
                {error && (
                    <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Kenya Tourism Act info banner */}
                <div className="mb-5 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-900">
                    <div className="font-semibold text-indigo-700 mb-2">
                        Kenya Tourism Act — Catering Training Levy
                    </div>
                    <ul className="space-y-1">
                        <li>
                            <span className="font-medium">• Rate:</span>{' '}
                            <span className="text-indigo-600">{LEVY_RATE}% of gross sales</span>
                        </li>
                        <li>
                            <span className="font-medium">• Payable to:</span>{' '}
                            <span className="text-indigo-600">Tourism Fund</span>
                        </li>
                        <li>
                            <span className="font-medium">• Due:</span>{' '}
                            <span className="text-indigo-600">By the 20th of the following month</span>
                        </li>
                        <li>
                            <span className="font-medium">• Purpose:</span>{' '}
                            <span className="text-indigo-600">Training and development in hospitality sector</span>
                        </li>
                    </ul>
                </div>

                {/* Search */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search order # or invoice…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-9 pr-3 py-2 w-full border border-gray-200 rounded-xl text-sm"
                        />
                    </div>
                </div>

                {/* Table
            Columns per spec:  Date | Order # | Gross Sales | Levy (2%)
            EXCLUDED per spec: Service Type, Payment Method              */}
                <div className="overflow-x-auto border border-gray-100 rounded-lg">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                {/* Date ← gl.posting_date */}
                                <th className="p-4 font-medium">Date</th>

                                {/* Order # ← Sales Invoice.order_type */}
                                <th className="p-4 font-medium">Order #</th>

                                {/* Gross Sales ← SUM(Sales Invoice Item.base_amount) per parent */}
                                <th className="p-4 font-medium text-right">Gross Sales</th>

                                {/* Levy (2%) ← Sales Taxes and Charges.base_tax_amount
                               WHERE account_head = 'Catering Levy Payable - QR' */}
                                <th className="p-4 font-medium text-right">Levy ({LEVY_RATE}%)</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={4} className="text-center p-10 text-gray-400">
                                        Loading catering levy transactions…
                                    </td>
                                </tr>
                            )}

                            {!loading && filtered.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center p-10 text-gray-400">
                                        No catering levy transactions found for this period.
                                    </td>
                                </tr>
                            )}

                            {!loading && filtered.map(tx => (
                                <tr
                                    key={tx.id}
                                    className="border-b border-gray-100 last:border-0 hover:bg-[#E4B315]/3"
                                >
                                    {/* Date ← gl.posting_date */}
                                    <td className="p-4 whitespace-nowrap">{formatDate(tx.posting_date)}</td>

                                    {/* Order # ← Sales Invoice.order_type */}
                                    <td className="p-4 font-medium text-[#C69A11]">{tx.order_number}</td>

                                    {/* Gross Sales ← SUM(Sales Invoice Item.base_amount) */}
                                    <td className="p-4 text-right">{formatCurrency(tx.gross_sales)}</td>

                                    {/* Levy (2%) ← Sales Taxes and Charges.base_tax_amount */}
                                    <td className="p-4 text-right font-semibold text-indigo-600">
                                        {formatCurrency(tx.levy_amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                        {/* Totals footer */}
                        {!loading && filtered.length > 0 && (
                            <tfoot className="bg-gray-50/30 border-t-2 border-gray-100 font-semibold text-sm">
                                <tr>
                                    <td colSpan={2} className="p-4">
                                        Totals ({filtered.length} record{filtered.length !== 1 ? 's' : ''})
                                    </td>
                                    <td className="p-4 text-right">
                                        {formatCurrency(filtered.reduce((s, t) => s + t.gross_sales, 0))}
                                    </td>
                                    <td className="p-4 text-right text-indigo-600">
                                        {formatCurrency(filtered.reduce((s, t) => s + t.levy_amount, 0))}
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CateringLevy;