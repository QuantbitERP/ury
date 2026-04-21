import { db } from './frappe-sdk';

export interface KOTItem {
  name: string;
  owner: string;
  creation: string;
  modified: string;
  modified_by: string;
  docstatus: number;
  idx: number;
  item: string;
  item_name: string;
  quantity: string;
  comments: string;
  parent: string;
  parentfield: string;
  parenttype: string;
  doctype: string;
}

export interface KOTOrder {
  name: string;
  owner: string;
  creation: string;
  modified: string;
  modified_by: string;
  docstatus: number;
  idx: number;
  invoice: string;
  customer_name: string;
  date: string;
  time: string;
  type: string;
  order_status: string;
  production: string;
  start_time_prep: string;
  naming_series: string;
  pos_profile: string;
  branch: string;
  verified: number;
  order_no: number;
  customer_group: string;
  table_takeaway: number;
  user: string;
  doctype: string;
  kot_items: KOTItem[];
  __last_sync_on?: string;
}

export interface KOTStatusUpdate {
  name: string;
  order_status: string;
  start_time_prep?: string;
  end_time_prep?: string;
}

export interface BOMItem {
  name: string;
  item_code: string;
  item_name: string;
  qty: number;
  uom: string;
  stock_uom: string;
  conversion_factor: number;
  basic_rate: number;
  amount: number;
}

export interface BOM {
  name: string;
  item: string;
  item_name: string;
  is_default: number;
  is_active: number;
  items: BOMItem[];
}

export interface StockEntryItem {
  s_warehouse?: string;
  t_warehouse?: string;
  item_code: string;
  item_name: string;
  qty: number;
  uom: string;
  stock_uom: string;
  conversion_factor: number;
  basic_rate: number;
  amount: number;
  expense_account: string;
  cost_center: string;
  is_finished_item?: number;
  is_scrap_item?: number;
}

export interface StockEntry {
  stock_entry_type: string;
  purpose: string;
  from_warehouse: string;
  to_warehouse: string;
  items: StockEntryItem[];
  company: string;
  posting_date: string;
  posting_time: string;
}

export const kotAPI = {
  // Get all KOT orders
  getAllKOTs: async (): Promise<KOTOrder[]> => {
    try {
      const response = await db.getDocList('URY KOT', {
        fields: [
          'name', 'invoice', 'customer_name', 'date', 'time', 'type', 
          'order_status', 'production', 'start_time_prep', 'table_takeaway', 
          'user', 'order_no'
        ],
        limit: 99999
      });
      
      // Fetch complete KOT documents with child table data
      const kotsWithItems = await Promise.all(
        (response || []).map(async (kot: any) => {
          try {
            const kotDoc = await db.getDoc('URY KOT', kot.name);
            return {
              ...kot,
              kot_items: kotDoc.kot_items || []
            };
          } catch (error) {
            console.error(`Error fetching KOT document ${kot.name}:`, error);
            return { ...kot, kot_items: [] };
          }
        })
      );
      
      return kotsWithItems;
    } catch (error) {
      console.error('Error fetching KOTs:', error);
      return [];
    }
  },

  // Get KOTs by status
  getKOTsByStatus: async (status: string): Promise<KOTOrder[]> => {
    try {
      const response = await db.getDocList('URY KOT', {
        fields: [
          'name', 'invoice', 'customer_name', 'date', 'time', 'type', 
          'order_status', 'production', 'start_time_prep', 'table_takeaway', 
          'user', 'order_no'
        ],
        filters: [['order_status', '=', status]],
        limit: 99999
      });
      
      // Fetch complete KOT documents with child table data
      const kotsWithItems = await Promise.all(
        (response || []).map(async (kot: any) => {
          try {
            const kotDoc = await db.getDoc('URY KOT', kot.name);
            return {
              ...kot,
              kot_items: kotDoc.kot_items || []
            };
          } catch (error) {
            console.error(`Error fetching KOT document ${kot.name}:`, error);
            return { ...kot, kot_items: [] };
          }
        })
      );
      
      return kotsWithItems;
    } catch (error) {
      console.error('Error fetching KOTs by status:', error);
      return [];
    }
  },

  // Update KOT status
  updateKOTStatus: async (kotData: KOTStatusUpdate): Promise<boolean> => {
    try {
      await db.updateDoc('URY KOT', kotData.name, kotData);
      return true;
    } catch (error) {
      console.error('Error updating KOT status:', error);
      return false;
    }
  },

  // Start preparing KOT
  startPreparing: async (kotName: string): Promise<boolean> => {
    return await kotAPI.updateKOTStatus({
      name: kotName,
      order_status: 'Preparing'
    });
  },

  // Mark KOT as ready
  markReady: async (kotName: string): Promise<boolean> => {
    return await kotAPI.updateKOTStatus({
      name: kotName,
      order_status: 'Ready'
    });
  },

  // Mark KOT as served
  markServed: async (kotName: string): Promise<boolean> => {
    try {
      // First create Manufacturing Stock Entry for the KOT
      await kotAPI.createManufacturingStockEntryForKOT(kotName);
      
      // Then update KOT status to Served
      return await kotAPI.updateKOTStatus({
        name: kotName,
        order_status: 'Served'
      });
    } catch (error) {
      console.error('Error in markServed:', error);
      return false;
    }
  },

  // Back to pending
  backToPending: async (kotName: string): Promise<boolean> => {
    return await kotAPI.updateKOTStatus({
      name: kotName,
      order_status: 'Ready For Prepare'
    });
  },

  // Get BOM for an item (filter by is_default and is_active)
  getBOMForItem: async (itemCode: string): Promise<BOM | null> => {
    try {
      const response = await db.getDocList('BOM', {
        filters: [
          ['item', '=', itemCode],
          ['is_default', '=', 1],
          ['is_active', '=', 1]
        ],
        limit: 1
      });

      if (response && response.length > 0) {
        const bomDoc = await db.getDoc('BOM', response[0].name);
        return {
          ...response[0],
          items: bomDoc.items || []
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching BOM for item ${itemCode}:`, error);
      return null;
    }
  },

  // Create Manufacturing Stock Entry
  createManufacturingStockEntry: async (stockEntryData: StockEntry): Promise<boolean> => {
    try {
      const now = new Date();
      const postingDate = now.toISOString().split('T')[0];
      const postingTime = now.toTimeString().split(' ')[0];

      const stockEntryPayload = {
        ...stockEntryData,
        stock_entry_type: 'Manufacture',
        purpose: 'Manufacture',
        posting_date: postingDate,
        posting_time: postingTime,
        company: stockEntryData.company || 'Quantbit Restro',
        from_warehouse: stockEntryData.from_warehouse || 'Stores - QR',
        to_warehouse: stockEntryData.to_warehouse || 'Work In Progress - QR',
        add_to_transit: 0,
        inspection_required: 0,
        apply_putaway_rule: 0,
        from_bom: 0,
        use_multi_level_bom: 1,
        fg_completed_qty: 0,
        process_loss_percentage: 0,
        process_loss_qty: 0,
        total_outgoing_value: stockEntryData.items.reduce((sum, item) => sum + (item.amount || 0), 0),
        total_incoming_value: stockEntryData.items.reduce((sum, item) => sum + (item.amount || 0), 0),
        value_difference: 0,
        total_additional_costs: 0,
        is_opening: 'No',
        per_transferred: 0,
        total_amount: 0,
        is_return: 0,
        docstatus: 1,
        additional_costs: []
      };

      await db.createDoc('Stock Entry', stockEntryPayload);
      return true;
    } catch (error) {
      console.error('Error creating Manufacturing Stock Entry:', error);
      return false;
    }
  },

  // Create Manufacturing Stock Entry for KOT items
  createManufacturingStockEntryForKOT: async (kotName: string): Promise<boolean> => {
    try {
      // Get KOT details
      const kotDoc = await db.getDoc('URY KOT', kotName);
      if (!kotDoc || !kotDoc.kot_items) {
        console.error('KOT not found or has no items');
        return false;
      }

      // Process each item in the KOT
      for (const kotItem of kotDoc.kot_items) {
        const quantity = parseFloat(kotItem.quantity) || 1;
        
        // Get BOM for the item
        const bom = await kotAPI.getBOMForItem(kotItem.item);
        if (!bom) {
          console.warn(`No BOM found for item ${kotItem.item}, skipping stock entry`);
          continue;
        }

        // Prepare Stock Entry items
        const stockEntryItems: StockEntryItem[] = [];

        // Add raw materials (from Stores to Work In Progress)
        bom.items.forEach(bomItem => {
          stockEntryItems.push({
            s_warehouse: 'Stores - QR',
            t_warehouse: 'Work In Progress - QR',
            item_code: bomItem.item_code,
            item_name: bomItem.item_name,
            qty: bomItem.qty * quantity,
            uom: bomItem.uom,
            stock_uom: bomItem.stock_uom,
            conversion_factor: bomItem.conversion_factor,
            basic_rate: bomItem.basic_rate,
            amount: bomItem.amount * quantity,
            expense_account: '5119 - Stock Adjustment - QR',
            cost_center: 'Main - QR',
            is_finished_item: 0,
            is_scrap_item: 0
          });
        });

        // Add finished goods (from Work In Progress to Finished Goods)
        stockEntryItems.push({
          s_warehouse: 'Work In Progress - QR',
          t_warehouse: 'Finished Goods - QR',
          item_code: kotItem.item,
          item_name: kotItem.item_name,
          qty: quantity,
          uom: 'Nos',
          stock_uom: 'Nos',
          conversion_factor: 1,
          basic_rate: 10, // Default rate, should be fetched from item master
          amount: 10 * quantity, // Default amount
          expense_account: '5119 - Stock Adjustment - QR',
          cost_center: 'Main - QR',
          is_finished_item: 1,
          is_scrap_item: 0
        });

        // Create Stock Entry
        const stockEntryData: StockEntry = {
          stock_entry_type: 'Manufacture',
          purpose: 'Manufacture',
          from_warehouse: 'Stores - QR',
          to_warehouse: 'Work In Progress - QR',
          items: stockEntryItems,
          company: 'Quantbit Restro',
          posting_date: new Date().toISOString().split('T')[0],
          posting_time: new Date().toTimeString().split(' ')[0]
        };

        await kotAPI.createManufacturingStockEntry(stockEntryData);
      }

      return true;
    } catch (error) {
      console.error('Error creating Manufacturing Stock Entry for KOT:', error);
      return false;
    }
  }
};
