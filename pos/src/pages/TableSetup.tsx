import React, { useState, useEffect } from 'react';
import {
  Table as TableIcon,
  Save,
  X,
  Trash2,
  RefreshCw,
  Edit,
  Plus,
  Users,
  MapPin,
  Square,
  Circle,
  Box
} from 'lucide-react';
import { Button } from '../components/ui';
import { showToast } from '../components/ui/toast';
import PageLayout from '../components/PageLayout';

// Types based on URY Table doctype
interface URYTable {
  name?: string;
  owner?: string;
  creation?: string;
  modified?: string;
  modified_by?: string;
  docstatus?: number;
  idx?: number;
  no_of_seats?: number;
  minimum_seating?: number;
  table_shape?: string;
  restaurant?: string;
  restaurant_room?: string;
  branch?: string;
  is_take_away?: number;
  occupied?: number;
  latest_invoice_time?: string;
  doctype?: string;
}

const TableSetup: React.FC = () => {
  const [loading, setLoading] = useState(false);

  // ── Enhanced CSS animations injected at component level ──────────────────
  React.useEffect(() => {
    const id = 'qs-setup-styles';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = `
        @keyframes qs-fadeIn    { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        @keyframes qs-slideRight{ from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:none; } }
        @keyframes qs-popIn     { from { opacity:0; transform:scale(.95); } to { opacity:1; transform:scale(1); } }
        .qs-card       { animation: qs-fadeIn .28s ease both; }
        .qs-slide-r    { animation: qs-slideRight .25s ease both; }
        .qs-pop        { animation: qs-popIn .22s cubic-bezier(.34,1.56,.64,1) both; }
        .qs-row        { transition: background .15s, box-shadow .15s; }
        .qs-row:hover  { box-shadow: inset 3px 0 0 #E4B315; }
        .qs-input:focus{ box-shadow: 0 0 0 3px rgba(228,179,21,.15); }
        ::-webkit-scrollbar       { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#f0e8c8; border-radius:99px; }
        ::-webkit-scrollbar-thumb:hover { background:#E4B315; }
      `;
      document.head.appendChild(s);
    }
    return () => { };
  }, []);

  const [saving, setSaving] = useState(false);
  const [tables, setTables] = useState<URYTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<URYTable | null>(null);
  const [showCreateTableForm, setShowCreateTableForm] = useState(false);
  const [availableRestaurants, setAvailableRestaurants] = useState<any[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [availableBranches, setAvailableBranches] = useState<any[]>([]);
  const [newTable, setNewTable] = useState<URYTable>({
    name: '',
    no_of_seats: 4,
    minimum_seating: 2,
    table_shape: 'Square',
    restaurant: '',
    restaurant_room: '',
    branch: '00',
    is_take_away: 0,
    occupied: 0
  });

  // Fetch existing tables
  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/method/frappe.client.get_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctype: 'URY Table',
          fields: ['name', 'no_of_seats', 'minimum_seating', 'table_shape', 'restaurant', 'restaurant_room', 'branch', 'is_take_away', 'occupied', 'latest_invoice_time', 'creation', 'modified', 'modified_by', 'owner'],
          limit_page_length: 100
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTables(data.message || []);
      } else {
        showToast.error('Failed to fetch tables');
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      showToast.error('Error fetching tables');
    } finally {
      setLoading(false);
    }
  };

  // Handle table input changes
  const handleTableInputChange = (field: keyof URYTable, value: any) => {
    setNewTable(prev => ({ ...prev, [field]: value }));
  };

  // Create or update table
  const saveTable = async () => {
    if (!newTable.name?.trim()) {
      showToast.error('Table name is required');
      return;
    }

    setSaving(true);
    try {
      const isUpdate = !!selectedTable?.name;
      const endpoint = isUpdate
        ? '/api/method/frappe.client.save'
        : '/api/method/frappe.client.save';

      // Create payload without name for new documents
      const createPayload = { ...newTable };
      delete createPayload.name;  // Remove name for new documents

      const payload = isUpdate
        ? {
          doc: {
            ...newTable,
            doctype: 'URY Table',
            name: selectedTable.name
          }
        }
        : {
          doc: {
            ...createPayload,
            doctype: 'URY Table'
          }
        };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();

        if (result.message && !result.message.exc) {
          showToast.success(isUpdate ? 'Table updated successfully' : 'Table created successfully');
          fetchTables();
          resetForm();
        } else {
          showToast.error(result.message?.exc || 'Failed to save table');
        }
      } else {
        const errorData = await response.json();
        showToast.error(errorData.message || 'Failed to save table');
      }
    } catch (error) {
      console.error('Error saving table:', error);
      showToast.error('Error saving table');
    } finally {
      setSaving(false);
    }
  };

  // Delete table
  const deleteTable = async (tableName: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;

    console.log('Attempting to delete table:', tableName); // Debug log

    try {
      const response = await fetch('/api/method/frappe.client.delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctype: 'URY Table',
          name: tableName
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Delete result:', result); // Debug log

        if (result.message && !result.message.exc) {
          showToast.success('Table deleted successfully');
          fetchTables();
          if (selectedTable?.name === tableName) {
            resetForm();
          }
        } else {
          // Check if it's a DoesNotExistError and provide a better message
          const errorMsg = result.message?.exc || result.message || 'Failed to delete table';
          if (errorMsg.includes('DoesNotExistError')) {
            showToast.error(`Table "${tableName}" not found. It may have been already deleted or the name is incorrect.`);
          } else {
            showToast.error(errorMsg);
          }
        }
      } else {
        const errorData = await response.json();
        console.error('Delete error response:', errorData); // Debug log
        showToast.error(errorData.message || 'Failed to delete table');
      }
    } catch (error) {
      console.error('Error deleting table:', error);
      showToast.error('Error deleting table');
    }
  };

  // Edit table
  const editTable = (table: URYTable) => {
    setSelectedTable(table);
    setNewTable({
      name: table.name || '',
      no_of_seats: table.no_of_seats || 4,
      minimum_seating: table.minimum_seating || 2,
      table_shape: table.table_shape || 'Square',
      restaurant: table.restaurant || '',
      restaurant_room: table.restaurant_room || '',
      branch: table.branch || '00',
      is_take_away: table.is_take_away || 0,
      occupied: table.occupied || 0
    });
    setShowCreateTableForm(true);
  };

  // Reset form
  const resetForm = () => {
    setNewTable({
      name: '',
      no_of_seats: 4,
      minimum_seating: 2,
      table_shape: 'Square',
      restaurant: '',
      restaurant_room: '',
      branch: '00',
      is_take_away: 0,
      occupied: 0
    });
    setSelectedTable(null);
    setShowCreateTableForm(false);
  };

  // Get table shape icon
  const getTableShapeIcon = (shape: string) => {
    switch (shape) {
      case 'Square':
        return <Square className="w-4 h-4" />;
      case 'Circle':
        return <Circle className="w-4 h-4" />;
      case 'Rectangle':
        return <Box className="w-4 h-4" />;
      default:
        return <Square className="w-4 h-4" />;
    }
  };

  // Initialize
  useEffect(() => {
    fetchTables();
  }, []);

  // Fetch available restaurants
  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/method/frappe.client.get_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctype: 'URY Restaurant',
          fields: ['name', 'name'],
          limit_page_length: 100
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableRestaurants(data.message || []);
      } else {
        console.error('Failed to fetch restaurants');
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  // Fetch available rooms
  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/method/frappe.client.get_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctype: 'URY Room',
          fields: ['name', 'name'],
          limit_page_length: 100
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableRooms(data.message || []);
      } else {
        console.error('Failed to fetch rooms');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  // Fetch available branches
  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/method/frappe.client.get_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctype: 'Branch',
          fields: ['name', 'name', 'branch'],
          limit_page_length: 100
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableBranches(data.message || []);
      } else {
        console.error('Failed to fetch branches');
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  // Fetch dropdown data when form opens
  useEffect(() => {
    if (showCreateTableForm) {
      fetchRestaurants();
      fetchRooms();
      fetchBranches();
    }
  }, [showCreateTableForm]);

  return (
    <PageLayout
      title="Table Setup & Management"
      actions={
        <>
          <Button
            variant="outline"
            onClick={fetchTables}
            disabled={loading}
            className="flex items-center space-x-2 border-gray-200 text-gray-600 hover:border-[#E4B315]/40 hover:text-[#C69A11]"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setShowCreateTableForm(true);
            }}
            className="flex items-center space-x-2 bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white font-bold rounded-xl shadow-md shadow-[#E4B315]/20 hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Table</span>
          </Button>
        </>
      }
    >
      <div className="flex flex-col h-full bg-gray-50/80 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 qs-card flex-1 min-h-0 overflow-hidden">
          {/* Tables List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#C69A11]">Tables</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Table Name
                      </th>
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Seats
                      </th>
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Shape
                      </th>
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {tables.map((table) => (
                      <tr key={table.name} className="hover:bg-[#E4B315]/3 transition-all duration-200 group qs-row">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-[#E4B315]/15 rounded-full flex items-center justify-center">
                              <TableIcon className="w-4 h-4 text-[#C69A11]" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-bold text-[#2D2A26]">{table.name}</div>
                              <div className="text-xs text-gray-400">Created: {new Date(table.creation || '').toLocaleDateString()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1 text-gray-400" />
                            {table.no_of_seats || 0} (Min: {table.minimum_seating || 0})
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getTableShapeIcon(table.table_shape || 'Square')}
                            <span className="ml-2 text-sm text-gray-900">{table.table_shape || 'Square'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="space-y-1">
                            {table.restaurant && (
                              <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                                {table.restaurant}
                              </div>
                            )}
                            {table.restaurant_room && (
                              <div className="text-xs text-gray-500">Room: {table.restaurant_room}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {table.occupied ? (
                              <span className="inline-flex px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-700 border border-red-200">
                                Occupied
                              </span>
                            ) : (
                              <span className="inline-flex px-2.5 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-700 border border-green-200">
                                Available
                              </span>
                            )}
                            {table.is_take_away && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-[#E4B315]/15 text-[#C69A11]">
                                Takeaway
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => editTable(table)}
                              className="border-gray-200 text-gray-600 hover:border-[#E4B315]/40 hover:text-[#C69A11]"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                console.log('Delete button clicked for table:', table.name, table);
                                deleteTable(table.name!);
                              }}
                              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {tables.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <TableIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No tables found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table Form */}
          <div className="lg:col-span-1">
            {showCreateTableForm && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#C69A11]">
                    {selectedTable ? 'Edit Table' : 'New Table'}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetForm}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">
                      Table Name *
                    </label>
                    <input
                      type="text"
                      value={newTable.name}
                      onChange={(e) => handleTableInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                      required
                      disabled={!!selectedTable}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">
                        Number of Seats *
                      </label>
                      <input
                        type="number"
                        value={newTable.no_of_seats}
                        onChange={(e) => handleTableInputChange('no_of_seats', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                        min="1"
                        step="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">
                        Minimum Seating *
                      </label>
                      <input
                        type="number"
                        value={newTable.minimum_seating}
                        onChange={(e) => handleTableInputChange('minimum_seating', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                        min="1"
                        step="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">
                      Table Shape
                    </label>
                    <select
                      value={newTable.table_shape}
                      onChange={(e) => handleTableInputChange('table_shape', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                    >
                      <option value="Square">Square</option>
                      <option value="Circle">Circle</option>
                      <option value="Rectangle">Rectangle</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">
                      Restaurant
                    </label>
                    <select
                      value={newTable.restaurant}
                      onChange={(e) => handleTableInputChange('restaurant', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                    >
                      <option value="">Select Restaurant</option>
                      {availableRestaurants.map((restaurant: any) => (
                        <option key={restaurant.name} value={restaurant.name}>
                          {restaurant.name || restaurant.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">
                      Restaurant Room
                    </label>
                    <select
                      value={newTable.restaurant_room}
                      onChange={(e) => handleTableInputChange('restaurant_room', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                    >
                      <option value="">Select Room</option>
                      {availableRooms.map((room: any) => (
                        <option key={room.name} value={room.name}>
                          {room.name || room.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-1.5">
                      Branch
                    </label>
                    <select
                      value={newTable.branch}
                      onChange={(e) => handleTableInputChange('branch', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                    >
                      <option value="">Select Branch</option>
                      {availableBranches.map((branch: any) => (
                        <option key={branch.name} value={branch.name}>
                          {branch.name || branch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newTable.is_take_away === 1}
                        onChange={(e) => handleTableInputChange('is_take_away', e.target.checked ? 1 : 0)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Takeaway Table</span>
                    </label>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={saveTable}
                      disabled={saving}
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white font-bold rounded-xl shadow-md shadow-[#E4B315]/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : (selectedTable ? 'Update Table' : 'Create Table')}</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default TableSetup;