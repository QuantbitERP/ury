import { useState } from 'react';
import { usePOSStore } from '../store/pos-store';
import { useRootStore } from '../store/root-store';
import { cn } from '../lib/utils';
import { Button } from './ui';
import TableSelectionDialog from './TableSelectionDialog';
import { DEFAULT_ORDER_TYPE, DINE_IN, ORDER_TYPES , type OrderType} from '../data/order-types';
import { HandPlatter } from 'lucide-react';

interface OrderTypeSelectProps {
  disabled?: boolean;
  'data-tour'?: string;
}

const OrderTypeSelect = ({ disabled, 'data-tour': dataTour }: OrderTypeSelectProps) => {
  const { selectedOrderType, setSelectedOrderType, selectedTable, posProfile, isUpdatingOrder } = usePOSStore();
  const { user } = useRootStore();
  const [showTableDialog, setShowTableDialog] = useState(false);

  const handleOrderTypeSelect = (type: OrderType) => {
    setSelectedOrderType(type);
    if (type === DINE_IN) {
      setShowTableDialog(true);
    }
  };

  const handleTableDialogClose = () => {
    setShowTableDialog(false);
    // Use a timeout to allow state to update before checking
    setTimeout(() => {
      const currentState = usePOSStore.getState();
      if (currentState.selectedOrderType === DINE_IN && !currentState.selectedTable) {
        setSelectedOrderType(DEFAULT_ORDER_TYPE);
      }
    }, 100);
  };

  return (
    <div data-tour={dataTour}>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
        {ORDER_TYPES.map(({ label, value, icon: Icon }) => {
          const isDisabled = disabled || isUpdatingOrder;
          
          return (
            <Button
              key={value}
              onClick={() => handleOrderTypeSelect(value)}
              variant={selectedOrderType === value ? 'default' : 'outline'}
              className={cn(
                'h-fit flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap bg-white border transition-colors',
                selectedOrderType === value
                ? 'text-primary-700 bg-primary-50 border-primary-600 hover:bg-primary-50'
                : 'text-gray-700 border-gray-200 hover:bg-gray-50',
                isDisabled && 'opacity-50 cursor-not-allowed'
              )}
              disabled={isDisabled}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          );
        })}
      </div>

      {selectedOrderType === DINE_IN && selectedTable && (
        <Button
          onClick={() => setShowTableDialog(true)}
          variant="ghost"
          className="h-fit w-fit gap-x-2 mt-2 text-sm text-primary-600 hover:text-primary-700"
          disabled={disabled}
        >
          <HandPlatter className="w-4 h-4" /> {selectedTable}
        </Button>
      )}

      {showTableDialog && (
        <TableSelectionDialog onClose={handleTableDialogClose} />
      )}
    </div>
  );
};

export default OrderTypeSelect; 