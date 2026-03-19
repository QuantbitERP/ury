import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Orders from './pages/Orders';
import POS from './pages/POS';
import KOTSystem from './components/KOTSystem';
import MenuManagement from './pages/MenuManagement';
import RecipeManagement from './pages/RecipeManagement';
import Manufacturing from './pages/Manufacturing';
import Suppliers from './pages/Suppliers';
import InventoryManagement from './pages/InventoryManagement';
import CategoriesManagement from './pages/CategoriesManagement';
import UnitsManagement from './pages/UnitsManagement';
import StockTransfers from './pages/StockTransfers';
import StockTracking from './pages/StockTracking';
import SalesReport from './pages/reports/sales-report';
import PurchaseOrders from './pages/PurchaseOrders';
import GoodsReceipts from './pages/GoodsReceipts';
import SupplierReturns from './pages/SupplierReturns';
import FinancialAccounting from './pages/finance/FinancialAccounting';
import AccountsPayable from './pages/AccountsPayable';
import AccountsReceivable from './pages/AccountsReceivable';

import ChartOfAccounts from './pages/finance/ChartOfAccounts';
import FinancialDashboard from './pages/FinancialDashboard';
import GLEntry from './pages/GLEntry';
import JournalEntry from './pages/JournalEntry';
import BankAccount from './pages/BankAccount';
import BankTransaction from './pages/BankTransaction';
import PettyCash from './pages/FinancialAccounting/PettyCash';
import VATManager from './pages/finance/VATManager';
import CateringLevy from './pages/finance/CateringLevy';
import FinancialReports from './pages/finance/FinancialReports';
import TaxConfiguration from './pages/finance/TaxConfiguration';
import PaymentAnalysis from './pages/finance/PaymentAnalysis';
import Payroll from './pages/Payroll';
import HR from './pages/HR';
import StaffManagement from './pages/StaffManagement';
import WorkspaceManagement from './pages/WorkspaceManagement';
import EventCalendar from './pages/events/EventCalendar';
import AllEvents from './pages/events/AllEvents';
import EventTypes from './pages/events/EventTypes';
import EventReports from './pages/events/EventReports';
import EventForm from './pages/events/EventForm';
import Reservations from './pages/Reservations';
import BarDisplay from './pages/BarDisplay';
import BranchSetup from './pages/BranchSetup';
import RestaurantSetup from './pages/RestaurantSetup';
import UserSetup from './pages/UserSetup';
import RoomSetup from './pages/RoomSetup';
import TableSetup from './pages/TableSetup';
import CloudClicLanding from './components/landing ';
import AuthGuard from './components/AuthGuard';
import RouteGuard from './components/RouteGuard';
import POSOpeningProvider from './components/POSOpeningProvider';
import ScreenSizeProvider from './components/ScreenSizeProvider';
import { ToastProvider } from './components/ui/toast';
import { usePOSStore } from './store/pos-store';
import { useEffect } from 'react';
import DashboardHome from './pages/DashboardHome';

function App() {
  const {
    initializeApp
  } = usePOSStore();

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);
  return (
    <>
      <ToastProvider />
      <ScreenSizeProvider>
        <AuthGuard>
          <POSOpeningProvider>
            <Router basename="/pos">
              <div className="flex flex-col bg-gray-100 font-inter">
                <Header />
                <div className="flex-1">
                  <RouteGuard>
                    <Routes>
                      <Route path="/" element={<POS />} />
                      <Route path="/dashboard" element={< DashboardHome/>} />
                      <Route path="/dashboard/landing" element={<CloudClicLanding />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/kot" element={<KOTSystem />} />
                      <Route path="/menu" element={<MenuManagement />} />
                      <Route path="/recipes" element={<RecipeManagement />} />
                      <Route path="/manufacturing" element={<Manufacturing />} />
                      <Route path="/suppliers" element={<Suppliers />} />
                      <Route path="/inventory" element={<InventoryManagement />} />
                      <Route path="/categories" element={<CategoriesManagement />} />
                      <Route path="/units" element={<UnitsManagement />} />
                      <Route path="/stock-transfers" element={<StockTransfers />} />
                      <Route path="/stock-tracking" element={<StockTracking />} />
                      <Route path="/purchase-orders" element={<PurchaseOrders />} />
                      <Route path="/goods-receipts" element={<GoodsReceipts />} />
                      <Route path="/supplier-returns" element={<SupplierReturns />} />
                      <Route path="/reports/sales-report" element={<SalesReport />} />
                      <Route path="/finance/accounting" element={<FinancialAccounting />}>
                        <Route path="chart-of-accounts" element={<ChartOfAccounts />} />
                        <Route path="budgets" element={<ChartOfAccounts />} />
                        <Route path="gl-entry" element={<GLEntry />} />
                        <Route path="journal-entry" element={<JournalEntry />} />
                        <Route path="accounts-payable" element={<AccountsPayable />} />
                        <Route path="accounts-receivable" element={<AccountsReceivable />} />
                        <Route path="bank-accounts" element={<BankAccount />} />
                        <Route path="bank-transactions" element={<BankTransaction />} />
                        <Route path="petty-cash" element={<PettyCash />} />
                        <Route path="vat-manager" element={<VATManager />} />
                        <Route path="catering-levy" element={<CateringLevy />} />
                        <Route path="financial-reports" element={<FinancialReports />} />
                        <Route path="tax-configuration" element={<TaxConfiguration />} />
                        <Route path="payment-analysis" element={<PaymentAnalysis />} />
                      </Route>
                      <Route path="/finance/accounting/financial-dashboard" element={<FinancialDashboard />} />
                      <Route path="/payroll" element={<Payroll />} />
                      <Route path="/hr" element={<HR />} />
                      <Route path="/staff-management" element={<StaffManagement />} />
                      <Route path="/workspace-management" element={<WorkspaceManagement />} />
                      <Route path="/events/calendar" element={<EventCalendar />} />
                      <Route path="/events/all-events" element={<AllEvents />} />
                      <Route path="/events/all-events/:action" element={<EventForm />} />
                      <Route path="/events/all-events/:action/:id" element={<EventForm />} />
                      <Route path="/events/event-types" element={<EventTypes />} />
                      <Route path="/events/reports" element={<EventReports />} />
                      <Route path="/reservations" element={<Reservations />} />
                      <Route path="/bar-display" element={<BarDisplay />} />
                      <Route path="/payment" element={<Orders />} />
                      <Route path="/branch-setup" element={<BranchSetup />} />
                      <Route path="/restaurant-setup" element={<RestaurantSetup />} />
                      <Route path="/user-setup" element={<UserSetup />} />
                      <Route path="/room-setup" element={<RoomSetup />} />
                      <Route path="/table-setup" element={<TableSetup />} />
                    </Routes>
                  </RouteGuard>
                </div>
              </div>
            </Router>
          </POSOpeningProvider>
        </AuthGuard>
      </ScreenSizeProvider>
    </>
  );
}

export default App;
