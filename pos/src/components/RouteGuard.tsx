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

const FINANCE_ONLY_ROLES = [
  'Accounts Manager',
  'Accounts User',
  'Auditor',
  'Analytics',
];

const RouteGuard: React.FC<Props> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useRootStore();

  useEffect(() => {
    if (!user?.roles) return;

    const userRoles = user.roles;
    const currentPath = location.pathname;

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

    // Finance roles take priority over all other role combinations.
    const hasFinanceOnlyRoles = hasRole(userRoles, FINANCE_ONLY_ROLES);
    const hasInventoryRoles = hasPurchaseRoles || hasStockRoles || hasManufacturingRoles;
    const hasUryCoreRoles = hasRole(userRoles, ['URY Captain', 'URY Cashier', 'URY Manager']);

    // Check if user has ALL roles (has roles from all categories)
    const hasAllRoles = hasRestrictedRoles && hasManagerCashierRoles && hasHRRoles && 
                       hasPurchaseRoles && hasStockRoles && hasManufacturingRoles;

    // Define allowed routes for different role groups
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

    const hrUryAllowedRoutes = [
      '/',
      '/pos',
      '/kot',
      '/bar-display',
      '/orders',
      '/payment',
      '/menu',
      '/recipes',
      '/manufacturing',
      '/reservations',
      '/hr',
      '/staff-management',
      '/workspace-management',
      '/payroll',
    ];

    const salesOpsAllowedRoutes = [
      '/',
      '/pos',
      '/kot',
      '/bar-display',
      '/orders',
      '/payment',
      '/menu',
      '/recipes',
      '/manufacturing',
      '/reservations',
      '/inventory',
      '/stock-transfers',
      '/stock-tracking',
      '/suppliers',
      '/purchase-orders',
    ];

    const financeUryAllowedRoutes = [
      '/',
      '/pos',
      '/kot',
      '/bar-display',
      '/orders',
      '/payment',
      '/menu',
      '/recipes',
      '/manufacturing',
      '/reservations',
      '/finance',
      '/finance/accounting',
      '/payroll',
      '/bank-accounts',
      '/bank-transactions',
    ];

    const uryOpsAllowedRoutes = [
      '/',
      '/pos',
      '/kot',
      '/bar-display',
      '/orders',
      '/payment',
      '/menu',
      '/recipes',
      '/manufacturing',
      '/reservations',
    ];

    const financeOnlyAllowedRoutes = [
      '/finance',
      '/finance/accounting',
      '/payroll',
      '/bank-accounts',
      '/bank-transactions',
      '/',
    ];

    const hrOnlyAllowedRoutes = [
      '/',
      '/hr',
      '/staff-management',
      '/workspace-management',
      '/payroll',
    ];

    const inventoryOnlyAllowedRoutes = [
      '/',
      '/inventory',
      '/stock-transfers',
      '/stock-tracking',
      '/suppliers',
      '/purchase-orders',
      '/manufacturing',
    ];

    const nonUryAllowedRoutes = [
      '/',
      ...(hasHRRoles ? ['/hr', '/staff-management', '/workspace-management', '/payroll'] : []),
      ...(hasFinanceOnlyRoles ? ['/finance', '/finance/accounting', '/payroll', '/bank-accounts', '/bank-transactions'] : []),
      ...(hasInventoryRoles ? ['/inventory', '/stock-transfers', '/stock-tracking', '/suppliers', '/purchase-orders', '/manufacturing'] : []),
    ];

    // If no URY core roles are present, allow only role-mapped non-POS modules.
    if (!hasUryCoreRoles) {
      if (hasHRRoles && !hasFinanceOnlyRoles && !hasInventoryRoles) {
        const isAllowed = hrOnlyAllowedRoutes.some(route =>
          currentPath === route || currentPath.startsWith(route + '/')
        );
        if (!isAllowed && currentPath !== '/') {
          navigate('/hr', { replace: true });
        }
        return;
      }

      if (!hasHRRoles && hasFinanceOnlyRoles && !hasInventoryRoles) {
        const isAllowed = financeOnlyAllowedRoutes.some(route =>
          currentPath === route || currentPath.startsWith(route + '/')
        );
        if (!isAllowed && currentPath !== '/') {
          navigate('/finance/accounting/financial-dashboard', { replace: true });
        }
        return;
      }

      if (!hasHRRoles && !hasFinanceOnlyRoles && hasInventoryRoles) {
        const isAllowed = inventoryOnlyAllowedRoutes.some(route =>
          currentPath === route || currentPath.startsWith(route + '/')
        );
        if (!isAllowed && currentPath !== '/') {
          navigate('/inventory', { replace: true });
        }
        return;
      }

      if (hasHRRoles || hasFinanceOnlyRoles || hasInventoryRoles) {
        const isAllowed = nonUryAllowedRoutes.some(route =>
          currentPath === route || currentPath.startsWith(route + '/')
        );
        if (!isAllowed && currentPath !== '/') {
          if (hasHRRoles) navigate('/hr', { replace: true });
          else if (hasFinanceOnlyRoles) navigate('/finance/accounting/financial-dashboard', { replace: true });
          else navigate('/inventory', { replace: true });
        }
        return;
      }
    }

    // For users with ALL roles across all categories - full access, no restrictions
    if (hasAllRoles) {
      // Full access - no route restrictions
      return;
    }
    // HR + URY combo users should only access POS, Restaurant Operations and HR modules.
    else if (hasHRRoles && hasRestrictedRoles && hasManagerCashierRoles && !hasPurchaseRoles && !hasStockRoles && !hasManufacturingRoles) {
      const isAllowed = hrUryAllowedRoutes.some(route =>
        currentPath === route || currentPath.startsWith(route + '/')
      );

      if (!isAllowed && currentPath !== '/') {
        navigate('/hr', { replace: true });
      }
      return;
    }
    // Sales/Purchase/Stock + URY users should only access POS, Restaurant, and Inventory modules.
    else if (hasRestrictedRoles && hasManagerCashierRoles && hasPurchaseRoles && hasStockRoles && !hasHRRoles) {
      const isAllowed = salesOpsAllowedRoutes.some(route =>
        currentPath === route || currentPath.startsWith(route + '/')
      );

      if (!isAllowed && currentPath !== '/') {
        navigate('/pos', { replace: true });
      }
      return;
    }
    // Finance + URY combo users should access POS, Restaurant, and Finance modules.
    else if (hasFinanceOnlyRoles && hasRestrictedRoles && hasManagerCashierRoles && !hasHRRoles && !hasPurchaseRoles && !hasStockRoles && !hasManufacturingRoles) {
      const isAllowed = financeUryAllowedRoutes.some(route =>
        currentPath === route || currentPath.startsWith(route + '/')
      );

      if (!isAllowed && currentPath !== '/') {
        navigate('/finance/accounting/financial-dashboard', { replace: true });
      }
      return;
    }
    // Users with only URY role groups should access POS + Restaurant modules only.
    else if (hasRestrictedRoles && hasManagerCashierRoles && !hasHRRoles && !hasPurchaseRoles && !hasStockRoles && !hasManufacturingRoles) {
      const isAllowed = uryOpsAllowedRoutes.some(route =>
        currentPath === route || currentPath.startsWith(route + '/')
      );

      if (!isAllowed && currentPath !== '/') {
        navigate('/pos', { replace: true });
      }
      return;
    }
    // Finance-only users get finance-only routes. This check must run
    // after full-access combinations so multi-role users are not restricted.
    else if (hasFinanceOnlyRoles) {
      const isAllowed = financeOnlyAllowedRoutes.some(route =>
        currentPath === route || currentPath.startsWith(route + '/')
      );

      if (!isAllowed && currentPath !== '/') {
        navigate('/finance/accounting/financial-dashboard', { replace: true });
      }
      return;
    }
    // For users with HR roles only (HR Manager, HR User) - NO other roles
    else if (hasHRRoles && !hasRestrictedRoles && !hasManagerCashierRoles && 
             !hasPurchaseRoles && !hasStockRoles && !hasManufacturingRoles) {
      // Check if current path is allowed for HR
      const isAllowed = hrOnlyAllowedRoutes.some(route => 
        currentPath === route || currentPath.startsWith(route + '/')
      );

      if (!isAllowed && currentPath !== '/') {
        // Redirect to HR dashboard if trying to access restricted page
        navigate('/hr', { replace: true });
        return;
      }
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
