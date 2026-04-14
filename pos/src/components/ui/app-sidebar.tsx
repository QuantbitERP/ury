import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useRootStore } from '../../store/root-store';
import {
    House, Store, Monitor, ChefHat, Wine, CreditCard,
    UtensilsCrossed, BookOpen, Factory, Calendar,
    Package, UsersRound, ChartColumn, Boxes, Truck,
    ShoppingCart, FileText, TrendingUp, DollarSign,
    Receipt, BarChart3, ArrowRightLeft, ArrowUpDown,
    ChevronDown, Building, Building2, PieChart, Users,
    ExternalLink, Banknote, Wallet2, Rocket,
    Settings, UserCog
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Section colour palette — mustard/gold primary theme
// ─────────────────────────────────────────────────────────────────────────────
const SECTION_COLORS: Record<string, {
    iconBg: string;
    headerOpen: string;
    headerHover: string;
    itemActive: string;
    itemHover: string;
    dot: string;
    accentBar: string;
}> = {
    dashboard: {
        iconBg: 'bg-[#E4B315]/15 text-[#C69A11]',
        headerOpen: 'bg-[#E4B315]/10 border-[#E4B315]/30 text-[#2D2A26]',
        headerHover: 'hover:bg-[#E4B315]/6 hover:text-[#2D2A26]',
        itemActive: 'bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white shadow-sm shadow-[#E4B315]/30',
        itemHover: 'hover:bg-[#E4B315]/8 hover:text-[#C69A11]',
        dot: 'bg-[#E4B315]',
        accentBar: 'bg-white/70',
    },
    pos: {
        iconBg: 'bg-orange-100 text-orange-600',
        headerOpen: 'bg-orange-50 border-orange-200 text-[#2D2A26]',
        headerHover: 'hover:bg-orange-50/60 hover:text-[#2D2A26]',
        itemActive: 'bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white shadow-sm shadow-[#E4B315]/30',
        itemHover: 'hover:bg-orange-50 hover:text-orange-700',
        dot: 'bg-orange-400',
        accentBar: 'bg-white/70',
    },
    restaurant: {
        iconBg: 'bg-rose-100 text-rose-600',
        headerOpen: 'bg-rose-50 border-rose-200 text-[#2D2A26]',
        headerHover: 'hover:bg-rose-50/60 hover:text-[#2D2A26]',
        itemActive: 'bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white shadow-sm shadow-[#E4B315]/30',
        itemHover: 'hover:bg-rose-50 hover:text-rose-700',
        dot: 'bg-rose-400',
        accentBar: 'bg-white/70',
    },
    inventory: {
        iconBg: 'bg-emerald-100 text-emerald-600',
        headerOpen: 'bg-emerald-50 border-emerald-200 text-[#2D2A26]',
        headerHover: 'hover:bg-emerald-50/60 hover:text-[#2D2A26]',
        itemActive: 'bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white shadow-sm shadow-[#E4B315]/30',
        itemHover: 'hover:bg-emerald-50 hover:text-emerald-700',
        dot: 'bg-emerald-400',
        accentBar: 'bg-white/70',
    },
    hr: {
        iconBg: 'bg-indigo-100 text-indigo-600',
        headerOpen: 'bg-indigo-50 border-indigo-200 text-[#2D2A26]',
        headerHover: 'hover:bg-indigo-50/60 hover:text-[#2D2A26]',
        itemActive: 'bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white shadow-sm shadow-[#E4B315]/30',
        itemHover: 'hover:bg-indigo-50 hover:text-indigo-700',
        dot: 'bg-indigo-400',
        accentBar: 'bg-white/70',
    },
    finance: {
        iconBg: 'bg-teal-100 text-teal-600',
        headerOpen: 'bg-teal-50 border-teal-200 text-[#2D2A26]',
        headerHover: 'hover:bg-teal-50/60 hover:text-[#2D2A26]',
        itemActive: 'bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white shadow-sm shadow-[#E4B315]/30',
        itemHover: 'hover:bg-teal-50 hover:text-teal-700',
        dot: 'bg-teal-400',
        accentBar: 'bg-white/70',
    },
    reports: {
        iconBg: 'bg-purple-100 text-purple-600',
        headerOpen: 'bg-purple-50 border-purple-200 text-[#2D2A26]',
        headerHover: 'hover:bg-purple-50/60 hover:text-[#2D2A26]',
        itemActive: 'bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white shadow-sm shadow-[#E4B315]/30',
        itemHover: 'hover:bg-purple-50 hover:text-purple-700',
        dot: 'bg-purple-400',
        accentBar: 'bg-white/70',
    },
    events: {
        iconBg: 'bg-sky-100 text-sky-600',
        headerOpen: 'bg-sky-50 border-sky-200 text-[#2D2A26]',
        headerHover: 'hover:bg-sky-50/60 hover:text-[#2D2A26]',
        itemActive: 'bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white shadow-sm shadow-[#E4B315]/30',
        itemHover: 'hover:bg-sky-50 hover:text-sky-700',
        dot: 'bg-sky-400',
        accentBar: 'bg-white/70',
    },
    setup: {
        iconBg: 'bg-slate-100 text-slate-600',
        headerOpen: 'bg-slate-50 border-slate-200 text-[#2D2A26]',
        headerHover: 'hover:bg-slate-50/60 hover:text-[#2D2A26]',
        itemActive: 'bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white shadow-sm shadow-[#E4B315]/30',
        itemHover: 'hover:bg-slate-50 hover:text-slate-700',
        dot: 'bg-slate-400',
        accentBar: 'bg-white/70',
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// NavItem
// ─────────────────────────────────────────────────────────────────────────────

interface NavProps {
    icon: React.ReactNode;
    label: string;
    href?: string;
    external?: boolean;
    badge?: string;
    sectionId: string;
}

function NavItem({ icon, label, href, external, badge, sectionId }: NavProps) {
    const location = useLocation();
    const colors = SECTION_COLORS[sectionId] ?? SECTION_COLORS.dashboard;

    const isActive = !external && href && (
        location.pathname === href ||
        (href !== '/' && location.pathname.startsWith(href))
    );

    const baseClass = `
        group relative w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl
        transition-all duration-200 cursor-pointer select-none
    `;

    const content = (
        <>
            {/* Left gold accent bar when active */}
            {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-r-full bg-white/80" />
            )}

            {/* Icon */}
            <span className={`flex items-center justify-center h-6 w-6 rounded-lg shrink-0 transition-all duration-200 ${isActive
                    ? 'bg-white/20 text-white'
                    : `${colors.iconBg}`
                }`}>
                {icon}
            </span>

            {/* Label */}
            <span className={`flex-1 font-medium leading-none truncate transition-colors duration-150 ${isActive ? 'text-white' : 'text-foreground/75'
                }`}>
                {label}
            </span>

            {/* Badge */}
            {badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none shrink-0 ${isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#E4B315]/15 text-[#C69A11]'
                    }`}>
                    {badge}
                </span>
            )}

            {external && (
                <ExternalLink className={`h-3 w-3 shrink-0 ${isActive ? 'text-white/70' : 'text-muted-foreground/50'}`} />
            )}
        </>
    );

    if (external && href) {
        return (
            <li>
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${baseClass} ${isActive ? colors.itemActive : `${colors.itemHover} text-muted-foreground`}`}
                >
                    {content}
                </a>
            </li>
        );
    }

    return (
        <li>
            <Link
                to={href || '/'}
                className={`${baseClass} ${isActive ? colors.itemActive : `${colors.itemHover} text-muted-foreground`}`}
            >
                {content}
            </Link>
        </li>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Smooth animated collapse/expand — height transition
// ─────────────────────────────────────────────────────────────────────────────

function SectionContent({ open, children }: { open: boolean; children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number | 'auto'>(open ? 'auto' : 0);
    const [overflow, setOverflow] = useState<'hidden' | 'visible'>(open ? 'visible' : 'hidden');

    useEffect(() => {
        if (!ref.current) return;
        if (open) {
            setOverflow('hidden');
            setHeight(ref.current.scrollHeight);
            const t = setTimeout(() => { setHeight('auto'); setOverflow('visible'); }, 300);
            return () => clearTimeout(t);
        } else {
            setOverflow('hidden');
            setHeight(ref.current.scrollHeight);
            ref.current.getBoundingClientRect(); // force repaint
            const t = setTimeout(() => setHeight(0), 10);
            return () => clearTimeout(t);
        }
    }, [open]);

    return (
        <div
            ref={ref}
            style={{
                height: height === 'auto' ? 'auto' : height,
                overflow,
                transition: 'height 280ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
        >
            {children}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section header + collapsible group
// ─────────────────────────────────────────────────────────────────────────────

interface SectionProps {
    id: string;
    title: string;
    Icon: React.ElementType;
    open: boolean;
    onToggle: () => void;
    hasActiveChild: boolean;
    children: React.ReactNode;
}

function Section({ id, title, Icon, open, onToggle, hasActiveChild, children }: SectionProps) {
    const colors = SECTION_COLORS[id] ?? SECTION_COLORS.dashboard;

    return (
        <div className="mb-1">
            {/* Section header button */}
            <button
                type="button"
                onClick={onToggle}
                className={`
                    w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl
                    text-xs font-bold uppercase tracking-wider
                    transition-all duration-200 cursor-pointer select-none border
                    ${open
                        ? colors.headerOpen
                        : `border-transparent text-muted-foreground ${colors.headerHover}`
                    }
                `}
            >
                {/* Icon badge */}
                <span className={`
                    flex items-center justify-center h-6 w-6 rounded-lg shrink-0
                    transition-all duration-200
                    ${open || hasActiveChild ? colors.iconBg : 'bg-muted/60 text-muted-foreground'}
                `}>
                    <Icon className="h-3.5 w-3.5" />
                </span>

                <span className="flex-1 text-left">{title}</span>

                {/* Active dot when collapsed but has active child */}
                {!open && hasActiveChild && (
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 animate-pulse ${colors.dot}`} />
                )}

                {/* Chevron with smooth rotate */}
                <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 transition-transform duration-280 ease-[cubic-bezier(0.4,0,0.2,1)] ${open ? 'rotate-180' : 'rotate-0'
                        }`}
                />
            </button>

            {/* Animated item list */}
            <SectionContent open={open}>
                <ul className="mt-0.5 space-y-0.5 px-1 pb-1 pt-0.5">
                    {children}
                </ul>
            </SectionContent>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar header: logo + brand
// ─────────────────────────────────────────────────────────────────────────────

function SidebarBrand() {
    return (
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border/50">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-[#E4B315] to-[#C69A11] shadow-md shadow-[#E4B315]/25 shrink-0">
                <UtensilsCrossed className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
                <div className="text-sm font-extrabold tracking-tight text-[#2D2A26] leading-none">QuantPOS</div>
                <div className="text-[10px] text-muted-foreground font-medium mt-0.5 leading-none">Restaurant ERP</div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Role-based menu filtering
// ─────────────────────────────────────────────────────────────────────────────

interface MenuItem {
    icon: React.ReactNode;
    label: string;
    href?: string;
    external?: boolean;
    badge?: string;
    sectionId: string;
}

interface Section {
    id: string;
    title: string;
    Icon: React.ElementType;
    items: MenuItem[];
}

// Helper function to check if user has required role
const hasRole = (userRoles: string[], requiredRoles: string[]): boolean => {
    return requiredRoles.some(role => userRoles.includes(role));
};

// ─────────────────────────────────────────────────────────────────────────────
// Main AppSidebar
// ─────────────────────────────────────────────────────────────────────────────

export function AppSidebar() {
    const location = useLocation();
    const { user } = useRootStore();

    const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => ({
        dashboard: false,
        pos: false,
        restaurant: false,
        inventory: false,
        hr: false,
        finance: false,
        reports: false,
        events: false,
        setup: false,
    }));

    // Define all sections with their menu items
    const allSections: Section[] = [
        {
            id: 'dashboard',
            title: 'Dashboard',
            Icon: House,
            items: [
                { icon: <House className="h-3.5 w-3.5" />, label: 'Dashboard Home', href: '/dashboard', badge: 'Home', sectionId: 'dashboard' },
                // { icon: <Rocket className="h-3.5 w-3.5" />, label: 'CloudClic Landing', href: '/dashboard/landing', sectionId: 'dashboard' },
            ]
        },
        {
            id: 'pos',
            title: 'Point of Sale',
            Icon: Store,
            items: [
                { icon: <Monitor className="h-3.5 w-3.5" />, label: 'EPOS Terminal', href: '', badge: 'POS', sectionId: 'pos' },
                { icon: <ChefHat className="h-3.5 w-3.5" />, label: 'Kitchen Order Ticket', href: '/kot', sectionId: 'pos' },
                { icon: <Wine className="h-3.5 w-3.5" />, label: 'Bar Order', href: '/bar-display', sectionId: 'pos' },
                { icon: <ChefHat className="h-3.5 w-3.5" />, label: 'Order Management', href: '/orders', sectionId: 'pos' },
                { icon: <CreditCard className="h-3.5 w-3.5" />, label: 'Payment Processing', href: '/payment', sectionId: 'pos' },
            ]
        },
        {
            id: 'restaurant',
            title: 'Restaurant Operations',
            Icon: UtensilsCrossed,
            items: [
                { icon: <UtensilsCrossed className="h-3.5 w-3.5" />, label: 'Menu Management', href: '/menu', sectionId: 'restaurant' },
                { icon: <BookOpen className="h-3.5 w-3.5" />, label: 'Recipe Management', href: '/recipes', sectionId: 'restaurant' },
                { icon: <Factory className="h-3.5 w-3.5" />, label: 'Manufacturing', href: '/manufacturing', sectionId: 'restaurant' },
                { icon: <Calendar className="h-3.5 w-3.5" />, label: 'Reservations', href: '/reservations', sectionId: 'restaurant' },
            ]
        },
        {
            id: 'inventory',
            title: 'Inventory & Suppliers',
            Icon: Package,
            items: [
                { icon: <Boxes className="h-3.5 w-3.5" />, label: 'Inventory', href: '/inventory', sectionId: 'inventory' },
                { icon: <ArrowRightLeft className="h-3.5 w-3.5" />, label: 'Stock Transfers', href: '/stock-transfers', sectionId: 'inventory' },
                { icon: <TrendingUp className="h-3.5 w-3.5" />, label: 'Stock Tracking', href: '/stock-tracking', sectionId: 'inventory' },
                { icon: <Truck className="h-3.5 w-3.5" />, label: 'Suppliers', href: '/suppliers', sectionId: 'inventory' },
                { icon: <ShoppingCart className="h-3.5 w-3.5" />, label: 'Purchase Orders', href: '/purchase-orders', sectionId: 'inventory' },
            ]
        },
        {
            id: 'hr',
            title: 'Human Resources',
            Icon: UsersRound,
            items: [
                { icon: <UsersRound className="h-3.5 w-3.5" />, label: 'HR Dashboard', href: '/hr', sectionId: 'hr' },
                { icon: <Users className="h-3.5 w-3.5" />, label: 'Staff Management', href: '/staff-management', sectionId: 'hr' },
                { icon: <Building className="h-3.5 w-3.5" />, label: 'Workspace Management', href: '/workspace-management', sectionId: 'hr' },
            ]
        },
        {
            id: 'finance',
            title: 'Finance & Accounting',
            Icon: Banknote,
            items: [
                { icon: <UsersRound className="h-3.5 w-3.5" />, label: 'Payroll', href: '/payroll', sectionId: 'finance' },
                { icon: <BarChart3 className="h-3.5 w-3.5" />, label: 'Financial Accounting', href: '/finance/accounting/financial-dashboard', sectionId: 'finance' },
                { icon: <Building className="h-3.5 w-3.5" />, label: 'Bank Accounts', href: '/bank-accounts', sectionId: 'finance' },
                { icon: <ArrowUpDown className="h-3.5 w-3.5" />, label: 'Bank Transactions', href: '/bank-transactions', sectionId: 'finance' },
                { icon: <Receipt className="h-3.5 w-3.5" />, label: 'Accounts Payable', href: '/finance/accounting/accounts-payable', sectionId: 'finance' },
                { icon: <DollarSign className="h-3.5 w-3.5" />, label: 'Accounts Receivable', href: '/finance/accounting/accounts-receivable', sectionId: 'finance' },
                { icon: <Building2 className="h-3.5 w-3.5" />, label: 'Corporate Billing', href: '/finance/accounting/corporate-billing', sectionId: 'finance' },
                { icon: <PieChart className="h-3.5 w-3.5" />, label: 'Loyalty Programme', href: '/app/loyalty-program', external: true, sectionId: 'finance' },
            ]
        },
        {
            id: 'reports',
            title: 'Reports & Analytics',
            Icon: ChartColumn,
            items: [
                { icon: <FileText className="h-3.5 w-3.5" />, label: 'Sales Report', href: '/reports/sales-report', sectionId: 'reports' },
                { icon: <Package className="h-3.5 w-3.5" />, label: 'Inventory Valuation', href: '/app/query-report/General%20Ledger?company=Quantbit+Restro&from_date=2025-12-26&to_date=2025-12-26&categorize_by=Categorize+by+Voucher+%28Consolidated%29&include_dimensions=1&include_default_book_entries=1', external: true, sectionId: 'reports' },
                { icon: <TrendingUp className="h-3.5 w-3.5" />, label: 'Purchase Analysis', href: '/app/query-report/Purchase%20Order%20Analysis?company=Quantbit+Restro&from_date=2025-10-01&to_date=2026-03-07', external: true, sectionId: 'reports' },
                { icon: <DollarSign className="h-3.5 w-3.5" />, label: 'Profit & Loss', href: '/app/query-report/Profit%20and%20Loss%20Statement?company=Quantbit+Restro&filter_based_on=Fiscal+Year&period_start_date=2025-07-01&period_end_date=2026-06-30&from_fiscal_year=2025-2026&to_fiscal_year=2025-2026&periodicity=Yearly&selected_view=Report&accumulated_values=1&include_default_book_entries=1', external: true, sectionId: 'reports' },
                { icon: <FileText className="h-3.5 w-3.5" />, label: 'VAT Summary', href: '/reports/vat-summary', sectionId: 'reports' },
                { icon: <ArrowRightLeft className="h-3.5 w-3.5" />, label: 'Stock Movement', href: '/app/query-report/Stock%20Ledger?company=Quantbit+Restro&from_date=2026-02-07&to_date=2026-03-07&valuation_field_type=Currency', external: true, sectionId: 'reports' },
            ]
        },
        {
            id: 'events',
            title: 'Event Management',
            Icon: Calendar,
            items: [
                { icon: <Calendar className="h-3.5 w-3.5" />, label: 'Calendar', href: '/events/calendar', sectionId: 'events' },
                { icon: <FileText className="h-3.5 w-3.5" />, label: 'All Events', href: '/events/all-events', sectionId: 'events' },
                { icon: <Package className="h-3.5 w-3.5" />, label: 'Event Types', href: '/events/event-types', sectionId: 'events' },
                { icon: <UtensilsCrossed className="h-3.5 w-3.5" />, label: 'Menu Packages', href: '/events/menu-packages', sectionId: 'events' },
                { icon: <ChartColumn className="h-3.5 w-3.5" />, label: 'Reports', href: '/events/reports', sectionId: 'events' },
            ]
        },
        {
            id: 'setup',
            title: 'Set Up',
            Icon: Settings,
            items: [
                { icon: <Building2 className="h-3.5 w-3.5" />, label: 'Branch Setup', href: '/branch-setup', sectionId: 'setup' },
                { icon: <Store className="h-3.5 w-3.5" />, label: 'Restaurant Setup', href: '/restaurant-setup', sectionId: 'setup' },
                { icon: <UserCog className="h-3.5 w-3.5" />, label: 'User Setup', href: '/user-setup', sectionId: 'setup' },
                { icon: <Building className="h-3.5 w-3.5" />, label: 'Room Setup', href: '/room-setup', sectionId: 'setup' },
                { icon: <UtensilsCrossed className="h-3.5 w-3.5" />, label: 'Table Setup', href: '/table-setup', sectionId: 'setup' },
            ]
        },
    ];

    // Filter sections and items based on user roles
    const getFilteredSections = (): Section[] => {
        if (!user?.roles) return [];

        const userRoles = user.roles;

        // Check if user has restricted roles (URY Captain, System Manager, Customer)
        const hasRestrictedRoles = hasRole(userRoles, ['URY Captain', 'System Manager', 'Customer']);

        // Check if user has manager/cashier roles (URY Manager, URY Cashier)
        const hasManagerCashierRoles = hasRole(userRoles, ['URY Manager', 'URY Cashier']);

        // Check if user has HR roles (HR Manager, HR User)
        const hasHRRoles = hasRole(userRoles, ['HR Manager', 'HR User']);

        // Check if user has Purchase roles (Purchase Manager, Purchase Master Manager, Purchase User)
        const hasPurchaseRoles = hasRole(userRoles, ['Purchase Manager', 'Purchase Master Manager', 'Purchase User']);

        // Check if user has Stock roles (Stock Manager, Stock User, Supplier)
        const hasStockRoles = hasRole(userRoles, ['Stock Manager', 'Stock User', 'Supplier']);

        // Check if user has Manufacturing roles (Manufacturing Manager, Manufacturing User)
        const hasManufacturingRoles = hasRole(userRoles, ['Manufacturing Manager', 'Manufacturing User']);

        // Check if user has Finance roles (Accounts Manager, Accounts User, Analytics, Auditor)
        const hasFinanceRoles = hasRole(userRoles, ['Accounts Manager', 'Accounts User', 'Analytics', 'Auditor']);

        // Check if user has ALL roles (has roles from all categories)
        const hasAllRoles = hasRestrictedRoles && hasManagerCashierRoles && hasHRRoles &&
            hasPurchaseRoles && hasStockRoles && hasManufacturingRoles && hasFinanceRoles;

        return allSections.map(section => {
            let filteredItems = section.items;

            // HIGHEST PRIORITY: Users with ALL roles across all categories - show everything
            if (hasAllRoles) {
                // Show all sections and items - full access
                filteredItems = section.items;
            }
            // PRIORITY: Purchase/Stock roles take precedence when present with Finance roles (for sale-pur case)
            else if ((hasPurchaseRoles || hasStockRoles) && hasFinanceRoles && !hasHRRoles) {
                if (section.id === 'inventory') {
                    // Show all items in Inventory & Suppliers section
                    filteredItems = section.items;
                } else {
                    // Hide all other sections
                    filteredItems = [];
                }
            }
            // PRIORITY: HR roles take precedence - show ONLY HR modules if user has HR roles (and no finance roles)
            else if (hasHRRoles) {
                if (section.id === 'hr') {
                    // Show all items in Human Resources section
                    filteredItems = section.items;
                } else {
                    // Hide all other sections
                    filteredItems = [];
                }
            }
            // PRIORITY: Purchase/Stock roles take precedence - show ONLY Inventory & Suppliers modules if user has these roles (and no finance/HR roles)
            else if (hasPurchaseRoles || hasStockRoles) {
                if (section.id === 'inventory') {
                    // Show all items in Inventory & Suppliers section
                    filteredItems = section.items;
                } else {
                    // Hide all other sections
                    filteredItems = [];
                }
            }
            // For users with ALL URY roles (restricted + manager/cashier) - show everything
            else if (hasRestrictedRoles && hasManagerCashierRoles) {
                // Show all sections and items - full access
                filteredItems = section.items;
            }
            // For users with HR roles only (HR Manager, HR User, Customer, System Manager) - NO URY/Purchase/Stock/Manufacturing roles
            else if (hasHRRoles && !hasRestrictedRoles && !hasManagerCashierRoles &&
                !hasPurchaseRoles && !hasStockRoles && !hasManufacturingRoles && !hasFinanceRoles) {
                if (section.id === 'hr' || section.id === 'finance') {
                    // Show all items in Human Resources and Finance & Accounting (for Payroll)
                    filteredItems = section.items;
                } else {
                    // Hide all other sections
                    filteredItems = [];
                }
            }
            // For users with only restricted roles (Captain, System Manager, Customer) - NO manager/cashier roles
            else if (hasRestrictedRoles && !hasManagerCashierRoles && !hasFinanceRoles) {
                if (section.id === 'pos') {
                    // Show only EPOS Terminal, KOT, and Bar Order
                    filteredItems = section.items.filter(item =>
                        item.label === 'EPOS Terminal' ||
                        item.label === 'Kitchen Order Ticket' ||
                        item.label === 'Bar Order'
                    );
                } else {
                    // Hide all other sections
                    filteredItems = [];
                }
            }
            // For users with only manager/cashier roles but no restricted roles
            else if (hasManagerCashierRoles && !hasRestrictedRoles && !hasFinanceRoles) {
                if (section.id === 'pos' || section.id === 'restaurant') {
                    // Show all items in Point of Sale and Restaurant Operations
                    filteredItems = section.items;
                } else {
                    // Hide all other sections
                    filteredItems = [];
                }
            }
            // For users with other roles (full access)
            else {
                // Show all sections and items
                filteredItems = section.items;
            }

            return { ...section, items: filteredItems };
        }).filter(section => section.items.length > 0); // Only show sections with items
    };

    const filteredSections = getFilteredSections();

    const toggle = (id: string) => {
        setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const sectionPaths: Record<string, string[]> = {
        dashboard: ['/dashboard'],
        pos: ['/pos', '/kot', '/bar-display', '/orders', '/payment'],
        restaurant: ['/menu', '/recipes', '/manufacturing', '/reservations'],
        inventory: ['/inventory', '/stock-transfers', '/stock-tracking', '/suppliers', '/purchase-orders'],
        hr: ['/hr', '/staff-management', '/workspace-management'],
        finance: ['/payroll', '/finance', '/bank-accounts', '/bank-transactions'],
        reports: ['/reports'],
        events: ['/events'],
        setup: ['/setup', '/room-setup'],
    };

    const hasActiveChild = (id: string) =>
        (sectionPaths[id] ?? []).some(p =>
            location.pathname === p || (p !== '/' && location.pathname.startsWith(p))
        );

    return (
        <div
            data-sidebar="sidebar"
            className="flex flex-col h-full bg-sidebar text-sidebar-foreground"
        >
            {/* Brand header */}
            <SidebarBrand />

            {/* Scrollable nav content */}
            <div
                data-sidebar="content"
                className="
                    flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto overflow-x-hidden
                    px-2 py-3
                    scrollbar-thin scrollbar-thumb-[#E4B315]/20 scrollbar-track-transparent
                    hover:scrollbar-thumb-[#E4B315]/40
                "
            >
                <nav>
                    {filteredSections.map((section) => (
                        <Section key={section.id} id={section.id} title={section.title} Icon={section.Icon}
                            open={openSections[section.id]} onToggle={() => toggle(section.id)}
                            hasActiveChild={hasActiveChild(section.id)}>
                            {section.items.map((item, index) => (
                                <NavItem key={index} {...item} />
                            ))}
                        </Section>
                    ))}
                </nav>

                {/* Bottom spacer */}
                <div className="h-6 shrink-0" />
            </div>

            {/* Sidebar footer */}
            <div className="px-3 py-3 border-t border-border/50">
                <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-[#E4B315]/8">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#E4B315] to-[#C69A11] flex items-center justify-center shrink-0">
                        <span className="text-white text-[9px] font-extrabold">Q</span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-[#2D2A26] truncate">QuantPOS Africa</div>
                        <div className="text-[10px] text-muted-foreground truncate">v2.0 · Cloud ERP</div>
                    </div>
                </div>
            </div>
        </div>
    );
}