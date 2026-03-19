import React from 'react';
import { SquarePen, Trash2, TriangleAlert } from 'lucide-react';
import { cn } from '../lib/utils';

export interface StockItemProps {
    item_code: string;
    item_name: string;
    item_group: string;
    department?: string;
    in_stock: boolean;
    actual_qty: number;
    min_order_qty: number;
    valuation_rate: number;
    currency?: string;
    disabled?: number;
    onAdjustStock?: (item_code: string) => void;
    onEdit?: (item_code: string) => void;
    onDelete?: (item_code: string) => void;
}

const StockItemCard: React.FC<StockItemProps> = ({
    item_code,
    item_name,
    item_group,
    department,
    in_stock,
    actual_qty,
    min_order_qty,
    valuation_rate,
    currency = 'KSh',
    disabled = 0,
    onAdjustStock,
    onEdit,
    onDelete,
}) => {
    return (
        <div className={cn(
            "flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors",
            disabled === 1 && "opacity-60 grayscale-[50%]"
        )}>
            <div className="flex-1">
                <div className="flex items-center gap-3">
                    <div>
                        <h3 className="font-medium text-foreground">{item_name}</h3>
                        <p className="text-sm text-muted-foreground">{item_code}</p>
                    </div>

                    {in_stock ? (
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500 text-white hover:bg-green-500/80">
                            In Stock
                        </div>
                    ) : (
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80">
                            <TriangleAlert className="h-3 w-3 mr-1" />
                            Out of Stock
                        </div>
                    )}

                    {item_group && (
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                            {item_group}
                        </div>
                    )}

                    {department && (
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-primary text-primary">
                            {department}
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-2 mt-2">
                    <div className="flex gap-6 text-sm text-muted-foreground">
                        <span>Total: {actual_qty.toFixed(2)}</span>
                        <span>Min: {min_order_qty.toFixed(2)}</span>
                        <span>Cost: {currency} {valuation_rate.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}/pc</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onEdit?.(item_code)}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
                >
                    <SquarePen className="h-4 w-4" />
                </button>
                <button
                    onClick={() => onDelete?.(item_code)}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent h-9 rounded-md px-3 text-destructive hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default StockItemCard;
