import { StateCreator } from 'zustand';

export type InventoryView = 'stock' | 'categories' | 'units' | 'suppliers' | 'purchase-orders' | 'goods-receipts' | 'supplier-returns' | 'stock-transfers' | 'stock-tracking' | 'requisitions';

export interface InventorySlice {
  currentView: InventoryView;
  setCurrentView: (view: InventoryView) => void;
}

export const createInventorySlice: StateCreator<InventorySlice> = (set, get) => ({
  currentView: 'stock',
  setCurrentView: (view: InventoryView) => set({ currentView: view }),
});
