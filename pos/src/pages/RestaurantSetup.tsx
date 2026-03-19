import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Utensils,
  Save,
  X,
  Plus,
  Trash2,
  RefreshCw,
  Settings,
  Building
} from 'lucide-react';
import { Button } from '../components/ui';
import { showToast } from '../components/ui/toast';

// Types based on URY Restaurant doctype
interface MenuForRoom {
  menu?: string;
  room?: string;
}

interface OrderTypeMenu {
  order_type?: string;
  menu?: string;
}

interface URYRestaurant {
  name?: string;
  company?: string;
  invoice_series_prefix?: string;
  branch?: string;
  default_tax_template?: string;
  active_menu?: string;
  room_wise_menu?: number;
  default_room?: string;
  order_type_wise_menu?: number;
  menu_for_room?: MenuForRoom[];
  order_type_menu?: OrderTypeMenu[];
}

const RestaurantSetup: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [restaurants, setRestaurants] = useState<URYRestaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<URYRestaurant | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<URYRestaurant>({
    name: '',
    company: '',
    invoice_series_prefix: '',
    branch: '',
    default_tax_template: '',
    active_menu: '',
    room_wise_menu: 0,
    default_room: '',
    order_type_wise_menu: 0,
    menu_for_room: [],
    order_type_menu: []
  });

  // Tab configuration
  const tabs = [
    { id: 'basic', label: 'Basic Information', icon: Building },
    { id: 'menu', label: 'Menu Configuration', icon: Utensils },
    { id: 'order', label: 'Order Type Menu', icon: Settings },
  ];

  // Fetch existing restaurants
  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/method/frappe.client.get_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctype: 'URY Restaurant',
          fields: ['name', 'company', 'branch', 'default_tax_template', 'active_menu'],
          limit_page_length: 100
        })
      });

      if (response.ok) {
        const data = await response.json();
        setRestaurants(data.message || []);
      } else {
        showToast.error('Failed to fetch restaurants');
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      showToast.error('Error fetching restaurants');
    } finally {
      setLoading(false);
    }
  };

  // Fetch full restaurant details with confirmation
  const fetchRestaurantDetails = async (restaurantName: string) => {
    // Check if there are unsaved changes
    if (selectedRestaurant && JSON.stringify(formData) !== JSON.stringify(selectedRestaurant)) {
      const confirmSwitch = window.confirm(
        'You have unsaved changes. Do you want to discard them and switch to another restaurant?'
      );
      if (!confirmSwitch) {
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch('/api/method/frappe.client.get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctype: 'URY Restaurant',
          name: restaurantName
        })
      });

      if (response.ok) {
        const data = await response.json();
        const restaurantData = data.message;
        setSelectedRestaurant(restaurantData);
        setFormData(restaurantData);
        showToast.success(`Loaded restaurant: ${restaurantData.company || restaurantData.name}`);
      } else {
        showToast.error('Failed to fetch restaurant details');
      }
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      showToast.error('Error fetching restaurant details');
    } finally {
      setLoading(false);
    }
  };

  // Save restaurant data
  const saveRestaurant = async () => {
    setSaving(true);
    try {
      const isUpdate = selectedRestaurant?.name;
      
      let response;
      
      if (isUpdate) {
        // Update existing restaurant
        response = await fetch('/api/method/frappe.client.save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            doc: formData
          })
        });
      } else {
        // Create new restaurant
        response = await fetch('/api/method/frappe.client.insert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            doc: {
              ...formData,
              doctype: 'URY Restaurant'
            }
          })
        });
      }

      if (response.ok) {
        const data = await response.json();
        showToast.success(isUpdate ? 'Restaurant updated successfully!' : 'Restaurant created successfully!');
        
        if (!isUpdate) {
          setSelectedRestaurant(data.message);
          setFormData(prev => ({ ...prev, name: data.message.name }));
        }
        
        fetchRestaurants(); // Refresh the list
      } else {
        const errorData = await response.json();
        showToast.error(errorData.message || 'Failed to save restaurant');
      }
    } catch (error) {
      console.error('Error saving restaurant:', error);
      showToast.error('Error saving restaurant');
    } finally {
      setSaving(false);
    }
  };

  // Handle form field changes
  const handleInputChange = (field: keyof URYRestaurant, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fetch companies for dropdown
  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/method/frappe.client.get_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctype: 'Company',
          fields: ['name', 'company_name'],
          limit_page_length: 100
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.message || [];
      } else {
        console.error('Failed to fetch companies');
        return [];
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
  };

  // Fetch branches for dropdown
  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/method/frappe.client.get_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctype: 'Branch',
          fields: ['name', 'branch'],
          limit_page_length: 100
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.message || [];
      } else {
        console.error('Failed to fetch branches');
        return [];
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      return [];
    }
  };

  // Fetch tax templates for dropdown
  const fetchTaxTemplates = async () => {
    try {
      const response = await fetch('/api/method/frappe.client.get_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctype: 'Sales Taxes and Charges Template',
          fields: ['name', 'title'],
          // filters: { disabled: 0 },
          limit_page_length: 100
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.message || [];
      } else {
        console.error('Failed to fetch tax templates');
        return [];
      }
    } catch (error) {
      console.error('Error fetching tax templates:', error);
      return [];
    }
  };

  // Fetch menus for dropdown
  const fetchMenus = async () => {
    try {
      const response = await fetch('/api/method/frappe.client.get_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctype: 'URY Menu',
          fields: ['name', 'name'],
          // filters: { disabled: 0 },
          limit_page_length: 100
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.message || [];
      } else {
        console.error('Failed to fetch menus');
        return [];
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
      return [];
    }
  };

  // Fetch rooms for dropdown
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
        return data.message || [];
      } else {
        console.error('Failed to fetch rooms');
        return [];
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return [];
    }
  };

  // Fetch order types for dropdown
  const fetchOrderTypes = async () => {
    // Since URY Order Type DocType doesn't exist, return hardcoded order types
    return [
      { name: 'Phone In', order_type: 'Phone In' },
      { name: 'Take Away', order_type: 'Take Away' },
      { name: 'Delivery', order_type: 'Delivery' }
    ];
  };

  // State for dropdown options
  const [companyOptions, setCompanyOptions] = useState<any[]>([]);
  const [branchOptions, setBranchOptions] = useState<any[]>([]);
  const [taxTemplateOptions, setTaxTemplateOptions] = useState<any[]>([]);
  const [menuOptions, setMenuOptions] = useState<any[]>([]);
  const [roomOptions, setRoomOptions] = useState<any[]>([]);
  const [orderTypeOptions, setOrderTypeOptions] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Load dropdown options on component mount
  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [companies, branches, taxTemplates, menus, rooms, orderTypes] = await Promise.all([
          fetchCompanies(),
          fetchBranches(),
          fetchTaxTemplates(),
          fetchMenus(),
          fetchRooms(),
          fetchOrderTypes()
        ]);
        setCompanyOptions(companies);
        setBranchOptions(branches);
        setTaxTemplateOptions(taxTemplates);
        setMenuOptions(menus);
        setRoomOptions(rooms);
        setOrderTypeOptions(orderTypes);
      } catch (error) {
        console.error('Error loading dropdown options:', error);
      } finally {
        setLoadingOptions(false);
      }
    };
    loadOptions();
  }, []);

  // Add menu for room
  const addMenuForRoom = () => {
    setFormData(prev => ({
      ...prev,
      menu_for_room: [
        ...(prev.menu_for_room || []),
        { menu: '', room: '' }
      ]
    }));
  };

  // Update menu for room
  const updateMenuForRoom = (index: number, field: keyof MenuForRoom, value: string) => {
    setFormData(prev => ({
      ...prev,
      menu_for_room: prev.menu_for_room?.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ) || []
    }));
  };

  // Remove menu for room
  const removeMenuForRoom = (index: number) => {
    setFormData(prev => ({
      ...prev,
      menu_for_room: prev.menu_for_room?.filter((_, i) => i !== index) || []
    }));
  };

  // Add order type menu
  const addOrderTypeMenu = () => {
    setFormData(prev => ({
      ...prev,
      order_type_menu: [
        ...(prev.order_type_menu || []),
        { order_type: '', menu: '' }
      ]
    }));
  };

  // Update order type menu
  const updateOrderTypeMenu = (index: number, field: keyof OrderTypeMenu, value: string) => {
    setFormData(prev => ({
      ...prev,
      order_type_menu: prev.order_type_menu?.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ) || []
    }));
  };

  // Remove order type menu
  const removeOrderTypeMenu = (index: number) => {
    setFormData(prev => ({
      ...prev,
      order_type_menu: prev.order_type_menu?.filter((_, i) => i !== index) || []
    }));
  };

  // Reset form with confirmation
  const resetForm = () => {
    // Check if there are unsaved changes
    if (selectedRestaurant && JSON.stringify(formData) !== JSON.stringify(selectedRestaurant)) {
      const confirmReset = window.confirm(
        'You have unsaved changes. Are you sure you want to reset and create a new restaurant?'
      );
      if (!confirmReset) {
        return;
      }
    }

    setSelectedRestaurant(null);
    setFormData({
      name: '',
      company: '',
      invoice_series_prefix: '',
      branch: '',
      default_tax_template: '',
      active_menu: '',
      room_wise_menu: 0,
      default_room: '',
      order_type_wise_menu: 0,
      menu_for_room: [],
      order_type_menu: []
    });
    showToast.info('Form reset. Ready to create a new restaurant.');
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto h-screen flex flex-col overflow-y-auto">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Utensils className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Setup</h1>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="flex items-center space-x-2"
        >
          <X className="w-4 h-4" />
          <span>Close</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Restaurant List */}
        <div className="lg:col-span-1 flex flex-col">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Restaurants</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchRestaurants}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant.name}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedRestaurant?.name === restaurant.name ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => fetchRestaurantDetails(restaurant.name || '')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {restaurant.company || restaurant.name}
                        {selectedRestaurant?.name === restaurant.name && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Editing</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{restaurant.branch}</div>
                    </div>
                    {selectedRestaurant?.name === restaurant.name && (
                      <div className="text-blue-500">
                        <Utensils className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {restaurants.length === 0 && !loading && (
                <div className="p-4 text-center text-gray-500">No restaurants found</div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <Button
                onClick={resetForm}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10"
                variant={selectedRestaurant ? "outline" : "default"}
              >
                <Plus className="w-4 h-4 mr-2" />
                {selectedRestaurant ? 'Create New Restaurant' : 'Add New Restaurant'}
              </Button>
              {selectedRestaurant && (
                <div className="mt-2 text-xs text-gray-500 text-center bg-blue-50 p-2 rounded">
                  Currently editing: <strong>{selectedRestaurant.company || selectedRestaurant.name}</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Restaurant Form */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedRestaurant ? 'Edit Restaurant' : 'Create New Restaurant'}
                </h2>
                {!selectedRestaurant && (
                  <div className="text-sm text-gray-500">
                    Fill in the details below to create a new restaurant
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 flex-shrink-0">
                <div className="overflow-x-auto">
                  <nav className="flex space-x-8 px-6 min-w-max" aria-label="Tabs">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                            activeTab === tab.id
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Basic Information Tab */}
                {activeTab === 'basic' && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                      <Building className="w-5 h-5 mr-2 text-blue-600" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Restaurant Name *
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter restaurant name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.company || ''}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                        >
                          <option value="">Select Company</option>
                          {companyOptions.map((company) => (
                            <option key={company.name} value={company.name}>
                              {company.company_name || company.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Branch
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.branch || ''}
                          onChange={(e) => handleInputChange('branch', e.target.value)}
                        >
                          <option value="">Select Branch</option>
                          {branchOptions.map((branch) => (
                            <option key={branch.name} value={branch.name}>
                              {branch.branch || branch.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Invoice Series Prefix
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.invoice_series_prefix || ''}
                          onChange={(e) => handleInputChange('invoice_series_prefix', e.target.value)}
                          placeholder="Enter invoice series prefix"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default Tax Template
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.default_tax_template || ''}
                          onChange={(e) => handleInputChange('default_tax_template', e.target.value)}
                        >
                          <option value="">Select Tax Template</option>
                          {taxTemplateOptions.map((template) => (
                            <option key={template.name} value={template.name}>
                              {template.title || template.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Active Menu
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.active_menu || ''}
                          onChange={(e) => handleInputChange('active_menu', e.target.value)}
                        >
                          <option value="">Select Menu</option>
                          {menuOptions.map((menu) => (
                            <option key={menu.name} value={menu.name}>
                              {menu.name || menu.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default Room
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.default_room || ''}
                          onChange={(e) => handleInputChange('default_room', e.target.value)}
                        >
                          <option value="">Select Room</option>
                          {roomOptions.map((room) => (
                            <option key={room.name} value={room.name}>
                              {room.name || room.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={formData.room_wise_menu === 1}
                          onChange={(e) => handleInputChange('room_wise_menu', e.target.checked ? 1 : 0)}
                        />
                        <label className="text-sm font-medium text-gray-700">
                          Room Wise Menu
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={formData.order_type_wise_menu === 1}
                          onChange={(e) => handleInputChange('order_type_wise_menu', e.target.checked ? 1 : 0)}
                        />
                        <label className="text-sm font-medium text-gray-700">
                          Order Type Wise Menu
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Menu Configuration Tab */}
                {activeTab === 'menu' && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <Utensils className="w-5 h-5 mr-2 text-blue-600" />
                        Menu for Room Configuration
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addMenuForRoom}
                        className="flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Menu for Room</span>
                      </Button>
                    </div>
                    {loadingOptions ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mr-2" />
                        <span className="text-gray-600">Loading options...</span>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {formData.menu_for_room?.map((item, index) => (
                          <div key={index} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Menu
                                </label>
                                <select
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  value={item.menu || ''}
                                  onChange={(e) => updateMenuForRoom(index, 'menu', e.target.value)}
                                >
                                  <option value="">Select Menu</option>
                                  {menuOptions.map((menu) => (
                                    <option key={menu.name} value={menu.name}>
                                      {menu.name || menu.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Room
                                </label>
                                <select
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  value={item.room || ''}
                                  onChange={(e) => updateMenuForRoom(index, 'room', e.target.value)}
                                >
                                  <option value="">Select Room</option>
                                  {roomOptions.map((room) => (
                                    <option key={room.name} value={room.name}>
                                      {room.name || room.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMenuForRoom(index)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        {(!formData.menu_for_room || formData.menu_for_room.length === 0) && (
                          <div className="text-center py-8 text-gray-500">
                            No menu-room configurations added. Click "Add Menu for Room" to add one.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Order Type Menu Tab */}
                {activeTab === 'order' && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-blue-600" />
                        Order Type Menu Configuration
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addOrderTypeMenu}
                        className="flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Order Type Menu</span>
                      </Button>
                    </div>
                    {loadingOptions ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mr-2" />
                        <span className="text-gray-600">Loading options...</span>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {formData.order_type_menu?.map((item, index) => (
                          <div key={index} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Order Type
                                </label>
                                <select
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  value={item.order_type || ''}
                                  onChange={(e) => updateOrderTypeMenu(index, 'order_type', e.target.value)}
                                >
                                  <option value="">Select Order Type</option>
                                  {orderTypeOptions.map((orderType) => (
                                    <option key={orderType.name} value={orderType.name}>
                                      {orderType.order_type || orderType.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Menu
                                </label>
                                <select
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  value={item.menu || ''}
                                  onChange={(e) => updateOrderTypeMenu(index, 'menu', e.target.value)}
                                >
                                  <option value="">Select Menu</option>
                                  {menuOptions.map((menu) => (
                                    <option key={menu.name} value={menu.name}>
                                      {menu.name || menu.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOrderTypeMenu(index)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        {(!formData.order_type_menu || formData.order_type_menu.length === 0) && (
                          <div className="text-center py-8 text-gray-500">
                            No order type menu configurations added. Click "Add Order Type Menu" to add one.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </Button>
                  <Button
                    onClick={saveRestaurant}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Restaurant'}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSetup;
