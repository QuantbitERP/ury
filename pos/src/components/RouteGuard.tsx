import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRootStore } from '../store/root-store';

interface Props {
  children: React.ReactNode;
}

// Helper function to check if user has required role
const hasRole = (userRoles: string[], requiredRoles: string[]): boolean => {
  return requiredRoles.some(role => userRoles.includes(role));
};

const RouteGuard: React.FC<Props> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useRootStore();

  useEffect(() => {
    if (!user?.roles) return;

    const userRoles = user.roles;
    const currentPath = location.pathname;

    // PRIORITY: Check if user has Finance roles (Accounts Manager, Accounts User, Analytics, Auditor)
    const hasFinanceRoles = hasRole(userRoles, ['Accounts Manager', 'Accounts User', 'Analytics', 'Auditor']);
    
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

    // Check if user has ALL roles (has roles from all categories)
    const hasAllRoles = hasRestrictedRoles && hasManagerCashierRoles && hasHRRoles && 
                       hasPurchaseRoles && hasStockRoles && hasManufacturingRoles && hasFinanceRoles;

    // Define allowed routes for different role groups
    const financeAllowedRoutes = [
      '/dashboard',
      '/finance/accounting',
      '/finance/accounting/financial-dashboard',
      '/finance/accounting/chart-of-accounts',
      '/finance/accounting/budgets',
      '/finance/accounting/gl-entry',
      '/finance/accounting/journal-entry',
      '/finance/accounting/accounts-payable',
      '/finance/accounting/accounts-receivable',
      '/finance/accounting/bank-accounts',
      '/finance/accounting/bank-transactions',
      '/finance/accounting/petty-cash',
      '/finance/accounting/vat-manager',
      '/finance/accounting/catering-levy',
      '/finance/accounting/financial-reports',
      '/finance/accounting/tax-configuration',
      '/finance/accounting/payment-analysis',
      '/'  // Root/home route
    ];

    const hrAllowedRoutes = [
      '/dashboard',
      '/hr',
      '/staff-management',
      '/workspace-management',
      '/payroll',
      '/'  // Root/home route
    ];

    const purchaseStockAllowedRoutes = [
      '/dashboard',
      '/inventory',
      '/suppliers',
      '/categories',
      '/units',
      '/stock-transfers',
      '/stock-tracking',
      '/purchase-orders',
      '/goods-receipts',
      '/supplier-returns',
      '/'  // Root/home route
    ];

    const restrictedAllowedRoutes = [
      '/pos',
      '/kot', 
      '/bar-display',
      '/'  // Root/home route
    ];

    const extendedAllowedRoutes = [
      '/pos',
      '/kot',
      '/bar-display',
      '/orders',
      '/payment',
      '/menu',
      '/recipes',
      '/manufacturing',
      '/reservations',
      '/'  // Root/home route
    ];

    // HIGHEST PRIORITY: Users with ALL roles across all categories - full access, no restrictions
    if (hasAllRoles) {
      // Full access - no route restrictions
      return;
    }

    // PRIORITY: Finance roles take precedence - restrict to finance routes only
    if (hasFinanceRoles) {
      const isAllowed = financeAllowedRoutes.some(route => 
        currentPath === route || currentPath.startsWith(route + '/')
      );

      if (!isAllowed && currentPath !== '/') {
        // Redirect to dashboard if trying to access restricted page
        navigate('/dashboard', { replace: true });
        return;
      }
      return;
    }

    // PRIORITY: HR roles take precedence - restrict to HR and finance routes only
    else if (hasHRRoles) {
      const isAllowed = hrAllowedRoutes.some(route => 
        currentPath === route || currentPath.startsWith(route + '/')
      );

      if (!isAllowed && currentPath !== '/') {
        // Redirect to dashboard if trying to access restricted page
        navigate('/dashboard', { replace: true });
        return;
      }
      return;
    }

    // PRIORITY: Purchase/Stock roles take precedence when present with Finance roles (for sale-pur case)
    else if ((hasPurchaseRoles || hasStockRoles) && hasFinanceRoles && !hasHRRoles) {
      const isAllowed = purchaseStockAllowedRoutes.some(route => 
        currentPath === route || currentPath.startsWith(route + '/')
      );

      if (!isAllowed && currentPath !== '/') {
        // Redirect to dashboard if trying to access restricted page
        navigate('/dashboard', { replace: true });
        return;
      }
      return;
    }

    // PRIORITY: Purchase/Stock roles take precedence - restrict to inventory routes only
    else if (hasPurchaseRoles || hasStockRoles) {
      const isAllowed = purchaseStockAllowedRoutes.some(route => 
        currentPath === route || currentPath.startsWith(route + '/')
      );

      if (!isAllowed && currentPath !== '/') {
        // Redirect to dashboard if trying to access restricted page
        navigate('/dashboard', { replace: true });
        return;
      }
      return;
    }

    // For users with ALL URY roles (restricted + manager/cashier) - full access, no restrictions
    else if (hasRestrictedRoles && hasManagerCashierRoles) {
      // Full access - no route restrictions
      return;
    }
    // For users with only restricted roles (Captain, System Manager, Customer) - NO manager/cashier roles
    else if (hasRestrictedRoles && !hasManagerCashierRoles) {
      // Check if current path is allowed
      const isAllowed = restrictedAllowedRoutes.some(route => 
        currentPath === route || currentPath.startsWith(route + '/')
      );

      if (!isAllowed && currentPath !== '/') {
        // Redirect to POS if trying to access restricted page
        navigate('/pos', { replace: true });
        return;
      }
    }
    // For users with only manager/cashier roles but no restricted roles
    else if (hasManagerCashierRoles && !hasRestrictedRoles) {
      // Check if current path is allowed
      const isAllowed = extendedAllowedRoutes.some(route => 
        currentPath === route || currentPath.startsWith(route + '/')
      );

      if (!isAllowed && currentPath !== '/') {
        // Redirect to POS if trying to access restricted page
        navigate('/pos', { replace: true });
        return;
      }
    }
    // Users with other roles have full access - no restrictions needed

  }, [user, location.pathname, navigate]);

  return <>{children}</>;
};

export default RouteGuard;
