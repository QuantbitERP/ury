import { create } from 'zustand';
import { createAuthSlice, AuthSlice } from './slices/auth-slice';
import { createConfigSlice, ConfigSlice } from './slices/config-slice';
import { createOrdersSlice, OrdersSlice } from './slices/orders-slice';
import { createInventorySlice, InventorySlice } from './slices/inventory-slice';

export type RootState = AuthSlice & ConfigSlice & OrdersSlice & InventorySlice;

export const useRootStore = create<RootState>()((...args) => ({
  ...createAuthSlice(...args),
  ...createConfigSlice(...args),
  ...createOrdersSlice(...args),
  ...createInventorySlice(...args),
})); 