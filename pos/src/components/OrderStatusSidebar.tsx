import { FileText, ArrowRight, X, Users } from 'lucide-react'; // Import new icons
import { cn } from '../lib/utils';
import { Button } from './ui';
import { getOrderStatusTypes, OrderStatusType } from '../data/order-types';
import { usePOSStore } from '../store/pos-store';

interface OrderStatusSidebarProps {
  disabled?: boolean;
  selectedStatus: OrderStatusType;
  setSelectedStatus: (status: OrderStatusType) => void;
  getStatusCount?: (status: OrderStatusType) => number;
  // --- ADD THESE NEW PROPS ---
  isTransferMode: boolean;
  onToggleTransferMode: () => void;
  onProceedWithTransfer: () => void;
}

const OrderStatusSidebar = ({ 
  disabled,
  selectedStatus,
  setSelectedStatus,
  // --- DESTRUCTURE NEW PROPS ---
  isTransferMode,
  onToggleTransferMode,
  onProceedWithTransfer,
}: OrderStatusSidebarProps) => {
  const { posProfile } = usePOSStore();
  
  const statusTypes = getOrderStatusTypes(posProfile?.view_all_status, posProfile?.paid_limit);

  return (
    <div className={cn(
      "w-64 bg-white border-r border-gray-200 h-full flex flex-col",
      disabled && "opacity-50 pointer-events-none"
    )}>
      <nav className="flex-1 p-6 overflow-y-auto">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 px-1">
            Order Status
          </h2>
          <div className="space-y-1">
            {statusTypes.map((status) => (
              <Button
                key={status.value}
                onClick={() => setSelectedStatus(status.value as OrderStatusType)}
                variant="ghost"
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative',
                  selectedStatus === status.value
                    ? 'bg-white text-gray-900 shadow-sm font-semibold'
                    : 'text-gray-700 hover:bg-white/60 hover:text-gray-900'
                )}
                disabled={disabled || isTransferMode} // Disable status change during transfer mode
              >
                {selectedStatus === status.value && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
                )}
                <div className="flex items-center gap-3 ml-1">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span>{status.label}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* --- ADDED TRANSFER WAITER SECTION --- */}
        <div className="mt-6 space-y-2">
          {isTransferMode ? (
            <>
              <Button
                variant="default"
                className="w-full justify-start gap-3 bg-blue-600 hover:bg-blue-700"
                onClick={onProceedWithTransfer}
              >
                <ArrowRight className="w-4 h-4" />
                <span>Proceed</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-red-600 hover:text-red-700"
                onClick={onToggleTransferMode}
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={onToggleTransferMode}
              disabled={disabled}
            >
              <Users className="w-4 h-4" />
              <span>Transfer Waiter</span>
            </Button>
          )}
        </div>
      </nav>
    </div>
  );
};




export default OrderStatusSidebar;