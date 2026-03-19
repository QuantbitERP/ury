import React, { useState, useEffect } from 'react';
import { BadgePercent, Calculator, Download, Printer, Search, Info } from 'lucide-react';
import { getVATDataForMonth, VATTransaction } from '../../lib/api/vat-api';

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: The Python file (vat_manager.py) lives at:
//   ury/ury/api/vat_manager.py
// ─────────────────────────────────────────────────────────────────────────────

const months = [
    { value: '1',  label: 'January'   },
    { value: '2',  label: 'February'  },
    { value: '3',  label: 'March'     },
    { value: '4',  label: 'April'     },
    { value: '5',  label: 'May'       },
    { value: '6',  label: 'June'      },
    { value: '7',  label: 'July'      },
    { value: '8',  label: 'August'    },
    { value: '9',  label: 'September' },
    { value: '10', label: 'October'   },
    { value: '11', label: 'November'  },
    { value: '12', label: 'December'  },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const VATManager = () => {
    const [selectedMonth, setSelectedMonth] = useState('12'); // Default to December (has data)
    const [selectedYear, setSelectedYear]  = useState('2025');   // Default to 2025 (has data)
    const [filterType,   setFilterType]    = useState('All Types');
    const [searchQuery,  setSearchQuery]   = useState('');

    const [loading,         setLoading]         = useState(true);
    const [error,           setError]           = useState<string | null>(null);
    const [vatRate,         setVatRate]         = useState<number | null>(null);
    const [vatTemplateName, setVatTemplateName] = useState<string>('Standard Rate');
    const [transactions,    setTransactions]    = useState<VATTransaction[]>([]);

    // Calculator state
    const [showCalculator, setShowCalculator] = useState(false);
    const [calcGross,      setCalcGross]      = useState('');
    const [calcNet,        setCalcNet]        = useState('');

    // ─── Data Fetching ────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Use the new API to get both VAT rate and transactions
                const result = await getVATDataForMonth(selectedYear, selectedMonth);
                
                // Set VAT rate and template name
                setVatRate(result.rate.rate);
                setVatTemplateName(result.rate.template_name);
                
                // Set transactions with client-side deduplication
                const seen = new Set<string>();
                const deduped = (result.transactions || []).filter(tx => {
                    if (seen.has(tx.voucher_no)) return false;
                    seen.add(tx.voucher_no);
                    return true;
                });

                // Sort descending by date (server already does this, but ensure it)
                deduped.sort(
                    (a, b) =>
                        new Date(b.posting_date).getTime() -
                        new Date(a.posting_date).getTime()
                );

                setTransactions(deduped);

            } catch (err: any) {
                console.error('VAT Manager fetch error:', err);
                setError(
                    err?.message ||
                    'Failed to load VAT data. Check console for details.'
                );
                setTransactions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedMonth, selectedYear]);

    // ─── Formatters ───────────────────────────────────────────────────────────
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-KE', {
            style:                 'currency',
            currency:              'KES',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);

    const formatDate = (dateString: string) =>
        new Intl.DateTimeFormat('en-GB', {
            day:   '2-digit',
            month: 'short',
            year:  'numeric',
        }).format(new Date(dateString));

    // ─── Helper: Show date range hint ───────────────────────────────────────────
    const getDateRangeHint = () => {
        const startDate = `${selectedYear}-${selectedMonth.padStart(2, '0')}-01`;
        const monthIndex = parseInt(selectedMonth) - 1; // Convert 1-based to 0-based
        const lastDay   = new Date(
            parseInt(selectedYear),
            monthIndex + 1, // Next month
            0                // Day 0 = last day of previous month
        ).getDate();
        const endDate = `${selectedYear}-${selectedMonth.padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    };

    // ─── Summary Calculations ─────────────────────────────────────────────────
    let outputVAT   = 0, outputCount = 0;
    let inputVAT    = 0, inputCount  = 0;

    transactions.forEach(tx => {
        if (tx.voucher_type === 'Sales Invoice') {
            outputVAT += tx.vat_amount;
            outputCount++;
        } else if (tx.voucher_type === 'Purchase Invoice') {
            inputVAT += tx.vat_amount;
            inputCount++;
        }
    });

    const vatPayable = outputVAT - inputVAT;

    // ─── Filtering ────────────────────────────────────────────────────────────
    const filteredTransactions = transactions.filter(tx => {
        const matchesSearch =
            tx.voucher_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.reference.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesType = true;
        if (filterType === 'Sale') {
            matchesType = tx.voucher_type === 'Sales Invoice';
        } else if (filterType === 'Purchase') {
            matchesType = tx.voucher_type === 'Purchase Invoice';
        }

        return matchesSearch && matchesType;
    });

    // ─── Calculator Handlers ──────────────────────────────────────────────────
    const handleCalcGrossChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCalcGross(val);
        if (val && !isNaN(Number(val)) && vatRate) {
            const net = Number(val) / (1 + vatRate / 100);
            setCalcNet(net.toFixed(2));
        } else {
            setCalcNet('');
        }
    };

    const handleCalcNetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCalcNet(val);
        if (val && !isNaN(Number(val)) && vatRate) {
            const gross = Number(val) * (1 + vatRate / 100);
            setCalcGross(gross.toFixed(2));
        } else {
            setCalcGross('');
        }
    };

    const clearCalculator = () => { setCalcGross(''); setCalcNet(''); };

    // ─── CSV Export Handler ───────────────────────────────────────────────────
    const handleExportCSV = () => {
        if (filteredTransactions.length === 0) {
            alert('No data to export');
            return;
        }

        // CSV Headers
        const headers = [
            'Date',
            'Type', 
            'Reference',
            'Invoice No.',
            'Net Amount',
            `VAT (${vatRate ?? 0}%)`,
            'Gross Amount'
        ];

        // CSV Data
        const csvData = filteredTransactions.map(tx => [
            formatDate(tx.posting_date),
            tx.voucher_type === 'Sales Invoice' ? 'Sale' : 'Purchase',
            tx.reference,
            tx.voucher_no,
            tx.net_amount.toFixed(2),
            tx.vat_amount.toFixed(2),
            tx.gross_amount.toFixed(2)
        ]);

        // Add totals row
        const totals = [
            '',
            'TOTALS',
            '',
            `${filteredTransactions.length} records`,
            filteredTransactions.reduce((s, t) => s + t.net_amount, 0).toFixed(2),
            filteredTransactions.reduce((s, t) => s + t.vat_amount, 0).toFixed(2),
            filteredTransactions.reduce((s, t) => s + t.gross_amount, 0).toFixed(2)
        ];
        csvData.push(totals);

        // Convert to CSV string
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        // Create and download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        const fileName = `VAT_Transactions_${selectedYear}_${selectedMonth.padStart(2, '0')}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ─── Derived calculator values ────────────────────────────────────────────
    const calcVatAmount =
        calcGross && vatRate
            ? (Number(calcGross) - Number(calcGross) / (1 + vatRate / 100)).toFixed(2)
            : calcNet && vatRate
            ? (Number(calcNet) * (vatRate / 100)).toFixed(2)
            : null;

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="max-w-7xl mx-auto space-y-5">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <BadgePercent className="h-6 w-6" />
                VAT Manager
            </h1>

            <div className="bg-card border border-border rounded-lg p-6">
                {/* ── Header Row ─────────────────────────────────────────── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h2 className="text-xl font-semibold">VAT Management</h2>

                    <div className="flex flex-wrap gap-3 items-center">
                        {/* Period selectors */}
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

                        {/* Action buttons */}
                        <button
                            onClick={() => setShowCalculator(true)}
                            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm hover:bg-muted transition-colors"
                        >
                            <Calculator className="h-4 w-4" />
                            Calculator
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm hover:bg-muted transition-colors">
                            <Printer className="h-4 w-4" />
                            Print
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-2 bg-primary text-[#C69A11]-foreground rounded-md text-sm hover:bg-primary/90 transition-colors" onClick={handleExportCSV}>
                            <Download className="h-4 w-4" />
                            Export
                        </button>
                    </div>
                </div>

                {/* ── Error Banner ────────────────────────────────────────── */}
                {error && (
                    <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* ── Current VAT Rate Banner ─────────────────────────────── */}
                <div className="bg-muted/30 p-4 rounded-lg flex justify-between items-center mb-6 border border-border/50">
                    <div>
                        <div className="font-medium text-foreground">Current VAT Rate</div>
                        <div className="text-sm text-muted-foreground">{vatTemplateName}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                            Source: Item Tax Template → Tax Rates → tax_rate
                        </div>
                    </div>
                    <div className="text-3xl font-bold">
                        {loading ? '…' : `${vatRate ?? 0}%`}
                    </div>
                </div>

                {/* ── Summary Cards ───────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="border border-border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-muted-foreground text-sm font-medium">
                                Output VAT (Sales)
                            </span>
                            <Calculator className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold text-green-600 mb-1">
                            {formatCurrency(outputVAT)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {outputCount} transaction{outputCount !== 1 ? 's' : ''}
                        </div>
                    </div>

                    <div className="border border-border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-muted-foreground text-sm font-medium">
                                Input VAT (Purchases)
                            </span>
                            <Calculator className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                            {formatCurrency(inputVAT)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {inputCount} transaction{inputCount !== 1 ? 's' : ''}
                        </div>
                    </div>

                    <div className="border border-border rounded-lg p-4 bg-[#E4B315]/8">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-foreground text-sm font-medium">
                                VAT Payable
                            </span>
                            <Calculator className="h-4 w-4 text-[#C69A11]" />
                        </div>
                        <div className="text-2xl font-bold text-[#C69A11] mb-1">
                            {formatCurrency(vatPayable)}
                        </div>
                        <div className="text-xs text-muted-foreground">To pay KRA</div>
                    </div>
                </div>

                {/* ── VAT Transaction Register ─────────────────────────────── */}
                <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                        <h3 className="text-lg font-semibold">VAT Transaction Register</h3>

                        <div className="flex gap-3 w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-none">
                                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search invoice or reference…"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-3 py-2 w-full border border-gray-200 rounded-xl text-sm"
                                />
                            </div>
                            <select
                                value={filterType}
                                onChange={e => setFilterType(e.target.value)}
                                className="p-2 border border-gray-200 rounded-xl text-sm"
                            >
                                <option value="All Types">All Types</option>
                                <option value="Sale">Sales</option>
                                <option value="Purchase">Purchases</option>
                            </select>
                        </div>
                    </div>

                    <div className="border border-border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto overflow-y-auto max-h-96">
                            <table className="w-full text-sm text-left sticky top-0">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="p-4 font-medium">Date</th>
                                    <th className="p-4 font-medium">Type</th>
                                    {/* Reference: "Sales" for Sales Invoice, "Invoice" for Purchase Invoice */}
                                    <th className="p-4 font-medium">Reference</th>
                                    <th className="p-4 font-medium">Invoice No.</th>
                                    <th className="p-4 font-medium text-right">Net Amount</th>
                                    <th className="p-4 font-medium text-right">
                                        VAT ({vatRate ?? 0}%)
                                    </th>
                                    <th className="p-4 font-medium text-right">Gross Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Loading skeleton */}
                                {loading && (
                                    <tr>
                                        <td colSpan={7} className="text-center p-10 text-muted-foreground">
                                            Loading transactions…
                                        </td>
                                    </tr>
                                )}

                                {/* Empty state */}
                                {!loading && filteredTransactions.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center p-10 text-muted-foreground">
                                            <div className="space-y-2">
                                                <div>No transactions found for the selected period.</div>
                                                <div className="text-sm opacity-75">
                                                    Querying: {getDateRangeHint()}
                                                </div>
                                                <div className="text-sm opacity-75">
                                                    Try selecting a different month/year (e.g., December 2025 has data)
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {/* Data rows */}
                                {!loading && filteredTransactions.map(tx => (
                                    <tr
                                        key={tx.id}
                                        className="border-b border-border last:border-0 hover:bg-[#E4B315]/3"
                                    >
                                        {/* Date → posting_date (GL Entry) */}
                                        <td className="p-4 whitespace-nowrap">
                                            {formatDate(tx.posting_date)}
                                        </td>

                                        {/* Type → voucher_type (GL Entry) */}
                                        <td className="p-4">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                                tx.voucher_type === 'Sales Invoice'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {tx.voucher_type === 'Sales Invoice' ? 'Sale' : 'Purchase'}
                                            </span>
                                        </td>

                                        {/*
                                          Reference → conditional on voucher_type (per spec):
                                            Sales Invoice   → "Sales"
                                            Purchase Invoice→ "Invoice"
                                        */}
                                        <td className="p-4 text-muted-foreground">
                                            {tx.reference}
                                        </td>

                                        {/* Invoice No. → voucher_no (GL Entry) */}
                                        <td className="p-4 font-medium text-[#C69A11]">
                                            {tx.voucher_no}
                                        </td>

                                        {/* Net Amount → voucher.total */}
                                        <td className="p-4 text-right">
                                            {formatCurrency(tx.net_amount)}
                                        </td>

                                        {/* VAT → taxes row.base_tax_amount where account_head='VAT - QR' */}
                                        <td className="p-4 text-right text-purple-600 font-medium">
                                            {formatCurrency(tx.vat_amount)}
                                        </td>

                                        {/* Gross Amount → taxes row.base_total where account_head='VAT - QR' */}
                                        <td className="p-4 text-right font-semibold">
                                            {formatCurrency(tx.gross_amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                            {/* Totals footer */}
                            {!loading && filteredTransactions.length > 0 && (
                                <tfoot className="bg-muted/30 border-t-2 border-border font-semibold">
                                    <tr>
                                        <td colSpan={4} className="p-4">
                                            Totals ({filteredTransactions.length} records)
                                        </td>
                                        <td className="p-4 text-right">
                                            {formatCurrency(
                                                filteredTransactions.reduce((s, t) => s + t.net_amount, 0)
                                            )}
                                        </td>
                                        <td className="p-4 text-right text-purple-600">
                                            {formatCurrency(
                                                filteredTransactions.reduce((s, t) => s + t.vat_amount, 0)
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            {formatCurrency(
                                                filteredTransactions.reduce((s, t) => s + t.gross_amount, 0)
                                            )}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                        </div>
                    </div>
                </div>

            {/* ── VAT Calculator Modal ──────────────────────────────────────── */}
            {showCalculator && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={e => { if (e.target === e.currentTarget) setShowCalculator(false); }}
                >
                    <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md p-6">
                        {/* Modal header */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <Calculator className="h-5 w-5" />
                                <h3 className="font-semibold text-lg">
                                    VAT Calculator ({vatRate ?? 0}%)
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowCalculator(false)}
                                className="text-muted-foreground hover:bg-muted p-1 rounded"
                                aria-label="Close"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2"
                                    strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                                </svg>
                            </button>
                        </div>

                        <p className="text-sm text-muted-foreground mb-5">
                            Enter either the gross or net amount — the other will be calculated
                            automatically using the live VAT rate from Item Tax Template.
                        </p>

                        <div className="space-y-4">
                            {/* Gross input */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Gross Amount <span className="text-xs font-bold uppercase tracking-wider text-[#C69A11]">(Including VAT)</span>
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter gross amount"
                                    value={calcGross}
                                    onChange={handleCalcGrossChange}
                                    className="w-full p-2 border border-gray-200 rounded-xl"
                                />
                            </div>

                            <div className="text-center text-sm text-muted-foreground font-medium">— OR —</div>

                            {/* Net input */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Net Amount <span className="text-xs font-bold uppercase tracking-wider text-[#C69A11]">(Excluding VAT)</span>
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter net amount"
                                    value={calcNet}
                                    onChange={handleCalcNetChange}
                                    className="w-full p-2 border border-gray-200 rounded-xl"
                                />
                            </div>
                        </div>

                        {/* Result card */}
                        {calcVatAmount !== null && (
                            <div className="mt-5 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                <div className="text-sm text-purple-700 font-medium">
                                    VAT Amount ({vatRate}%)
                                </div>
                                <div className="text-2xl font-bold text-purple-700 mt-0.5">
                                    {formatCurrency(parseFloat(calcVatAmount))}
                                </div>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="grid grid-cols-2 gap-3 mt-6">
                            <button
                                onClick={clearCalculator}
                                className="py-2 px-4 border border-gray-200 rounded-xl hover:border-[#E4B315]/40 hover:text-[#C69A11] bg-white text-gray-600 transition-colors font-medium text-sm"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => setShowCalculator(false)}
                                className="py-2 px-4 bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white rounded-xl shadow-md shadow-[#E4B315]/20 hover:opacity-90 transition-opacity font-medium text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </div>
    );
};

export default VATManager;