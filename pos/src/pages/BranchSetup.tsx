import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building,
  Save,
  X,
  Plus,
  Trash2,
  RefreshCw,
  MapPin,
  User,
  Settings,
  Users,
  CreditCard
} from 'lucide-react';
import { Button } from '../components/ui';
import { showToast } from '../components/ui/toast';
import PageLayout from '../components/PageLayout';

// Types based on Branch doctype
interface AggregatorSettings {
  customer: string;
  price_list: string;
  mode_of_payments: string;
}

interface URYUser {
  user: string;
  room: string;
}

interface Branch {
  name?: string;
  branch?: string;
  custom_make_unpaid?: number;
  custom_no_taxes?: number;
  custom_branch_code?: string;
  custom_pin?: string;
  custom_county_name?: string;
  custom_tax_locality_name?: string;
  custom_manager_name?: string;
  custom_manager_email?: string;
  custom_branch_name?: string;
  custom_branch_status_code?: string;
  custom_manager_contact?: string;
  custom_is_head_office?: string;
  custom_is_etims_branch?: number;
  custom_aggregator_settings?: AggregatorSettings[];
  user?: URYUser[];
}

const BranchSetup: React.FC = () => {
  const navigate = useNavigate();
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
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<Branch>({
    custom_make_unpaid: 0,
    custom_no_taxes: 0,
    custom_is_etims_branch: 0,
    custom_aggregator_settings: [],
    user: []
  });

  // Tab configuration
  const tabs = [
    { id: 'basic', label: 'Basic Information', icon: Building },
    { id: 'location', label: 'Location Information', icon: MapPin },
    { id: 'manager', label: 'Manager Information', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'aggregator', label: 'Aggregator Settings', icon: CreditCard },
    { id: 'users', label: 'Users', icon: Users },
  ];

  // Fetch existing branches
  const fetchBranches = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/method/frappe.client.get_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctype: 'Branch',
          fields: ['name', 'branch', 'custom_branch_code', 'custom_branch_name'],
          limit_page_length: 100
        })
      });

      if (response.ok) {
        const data = await response.json();
        setBranches(data.message || []);
      } else {
        showToast.error('Failed to fetch branches');
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      showToast.error('Error fetching branches');
    } finally {
      setLoading(false);
    }
  };

  // Fetch full branch details with confirmation
  const fetchBranchDetails = async (branchName: string) => {
    // Check if there are unsaved changes
    if (selectedBranch && JSON.stringify(formData) !== JSON.stringify(selectedBranch)) {
      const confirmSwitch = window.confirm(
        'You have unsaved changes. Do you want to discard them and switch to another branch?'
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
          doctype: 'Branch',
          name: branchName
        })
      });

      if (response.ok) {
        const data = await response.json();
        const branchData = data.message;
        setSelectedBranch(branchData);
        setFormData(branchData);
        showToast.success(`Loaded branch: ${branchData.custom_branch_name || branchData.branch}`);
      } else {
        showToast.error('Failed to fetch branch details');
      }
    } catch (error) {
      console.error('Error fetching branch details:', error);
      showToast.error('Error fetching branch details');
    } finally {
      setLoading(false);
    }
  };

  // Save branch data
  const saveBranch = async () => {
    setSaving(true);
    try {
      const isUpdate = selectedBranch?.name;

      let response;

      if (isUpdate) {
        // Update existing branch
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
        // Create new branch
        response = await fetch('/api/method/frappe.client.insert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            doc: {
              ...formData,
              doctype: 'Branch'
            }
          })
        });
      }

      if (response.ok) {
        const data = await response.json();
        showToast.success(isUpdate ? 'Branch updated successfully!' : 'Branch created successfully!');

        if (!isUpdate) {
          setSelectedBranch(data.message);
          setFormData(prev => ({ ...prev, name: data.message.name }));
        }

        fetchBranches(); // Refresh the list
      } else {
        const errorData = await response.json();
        showToast.error(errorData.message || 'Failed to save branch');
      }
    } catch (error) {
      console.error('Error saving branch:', error);
      showToast.error('Error saving branch');
    } finally {
      setSaving(false);
    }
  };

  // Handle form field changes
  const handleInputChange = (field: keyof Branch, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add aggregator setting
  const addAggregatorSetting = () => {
    setFormData(prev => ({
      ...prev,
      custom_aggregator_settings: [
        ...(prev.custom_aggregator_settings || []),
        { customer: '', price_list: '', mode_of_payments: '' }
      ]
    }));
  };

  // Update aggregator setting
  const updateAggregatorSetting = (index: number, field: keyof AggregatorSettings, value: string) => {
    setFormData(prev => ({
      ...prev,
      custom_aggregator_settings: prev.custom_aggregator_settings?.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ) || []
    }));
  };

  // Remove aggregator setting
  const removeAggregatorSetting = (index: number) => {
    setFormData(prev => ({
      ...prev,
      custom_aggregator_settings: prev.custom_aggregator_settings?.filter((_, i) => i !== index) || []
    }));
  };

  // Fetch users for dropdown
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/method/frappe.client.get_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctype: 'User',
          fields: ['name', 'full_name', 'email'],
          filters: { enabled: 1 },
          limit_page_length: 100
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.message || [];
      } else {
        console.error('Failed to fetch users');
        return [];
      }
    } catch (error) {
      console.error('Error fetching users:', error);
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

  // Fetch customers for dropdown
  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/method/frappe.client.get_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctype: 'Customer',
          fields: ['name', 'customer_name'],
          filters: { disabled: 0 },
          limit_page_length: 100
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.message || [];
      } else {
        console.error('Failed to fetch customers');
        return [];
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
  };

  // Fetch price lists for dropdown
  const fetchPriceLists = async () => {
    try {
      const response = await fetch('/api/method/frappe.client.get_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctype: 'Price List',
          fields: ['name', 'price_list_name'],
          filters: { enabled: 1 },
          limit_page_length: 100
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.message || [];
      } else {
        console.error('Failed to fetch price lists');
        return [];
      }
    } catch (error) {
      console.error('Error fetching price lists:', error);
      return [];
    }
  };

  // Fetch mode of payments for dropdown
  const fetchModeOfPayments = async () => {
    try {
      const response = await fetch('/api/method/frappe.client.get_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctype: 'Mode of Payment',
          fields: ['name', 'mode_of_payment'],
          filters: { enabled: 1 },
          limit_page_length: 100
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.message || [];
      } else {
        console.error('Failed to fetch mode of payments');
        return [];
      }
    } catch (error) {
      console.error('Error fetching mode of payments:', error);
      return [];
    }
  };

  // State for dropdown options
  const [userOptions, setUserOptions] = useState<any[]>([]);
  const [roomOptions, setRoomOptions] = useState<any[]>([]);
  const [customerOptions, setCustomerOptions] = useState<any[]>([]);
  const [priceListOptions, setPriceListOptions] = useState<any[]>([]);
  const [modeOfPaymentOptions, setModeOfPaymentOptions] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Load dropdown options on component mount
  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [users, rooms, customers, priceLists, modeOfPayments] = await Promise.all([
          fetchUsers(),
          fetchRooms(),
          fetchCustomers(),
          fetchPriceLists(),
          fetchModeOfPayments()
        ]);
        setUserOptions(users);
        setRoomOptions(rooms);
        setCustomerOptions(customers);
        setPriceListOptions(priceLists);
        setModeOfPaymentOptions(modeOfPayments);
      } catch (error) {
        console.error('Error loading dropdown options:', error);
      } finally {
        setLoadingOptions(false);
      }
    };
    loadOptions();
  }, []);

  // Add user with dropdown selections
  const addUser = () => {
    setFormData(prev => ({
      ...prev,
      user: [
        ...(prev.user || []),
        { user: '', room: '' }
      ]
    }));
  };

  // Update user
  const updateUser = (index: number, field: keyof URYUser, value: string) => {
    setFormData(prev => ({
      ...prev,
      user: prev.user?.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ) || []
    }));
  };

  // Remove user
  const removeUser = (index: number) => {
    setFormData(prev => ({
      ...prev,
      user: prev.user?.filter((_, i) => i !== index) || []
    }));
  };

  // Reset form with confirmation
  const resetForm = () => {
    // Check if there are unsaved changes
    if (selectedBranch && JSON.stringify(formData) !== JSON.stringify(selectedBranch)) {
      const confirmReset = window.confirm(
        'You have unsaved changes. Are you sure you want to reset and create a new branch?'
      );
      if (!confirmReset) {
        return;
      }
    }

    setSelectedBranch(null);
    setFormData({
      custom_make_unpaid: 0,
      custom_no_taxes: 0,
      custom_is_etims_branch: 0,
      custom_aggregator_settings: [],
      user: []
    });
    showToast.info('Form reset. Ready to create a new branch.');
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  return (
    <PageLayout title="Branch Setup">
      <div className="p-6 max-w-7xl mx-auto w-full flex flex-col h-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Branch List */}
        <div className="lg:col-span-1 flex flex-col">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-extrabold text-[#2D2A26]">Branches</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchBranches}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {branches.map((branch) => (
                <div
                  key={branch.name}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedBranch?.name === branch.name ? 'bg-[#E4B315]/8 border-l-4 border-l-[#E4B315]' : ''
                    }`}
                  onClick={() => fetchBranchDetails(branch.name || '')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {branch.custom_branch_name || branch.branch}
                        {selectedBranch?.name === branch.name && (
                          <span className="ml-2 text-xs bg-[#E4B315]/15 text-[#C69A11] px-2 py-1 rounded">Editing</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">{branch.custom_branch_code}</div>
                    </div>
                    {selectedBranch?.name === branch.name && (
                      <div className="text-[#C69A11]">
                        <Building className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {branches.length === 0 && !loading && (
                <div className="p-4 text-center text-gray-500">No branches found</div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <Button
                onClick={resetForm}
                className="w-full bg-[#E4B315]/12 hover:bg-[#E4B315]/12 text-white h-10"
                variant={selectedBranch ? "outline" : "default"}
              >
                <Plus className="w-4 h-4 mr-2" />
                {selectedBranch ? 'Create New Branch' : 'Add New Branch'}
              </Button>
              {selectedBranch && (
                <div className="mt-2 text-xs text-gray-500 text-center bg-[#E4B315]/8 p-2 rounded">
                  Currently editing: <strong>{selectedBranch.custom_branch_name || selectedBranch.branch}</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Branch Form */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedBranch ? 'Edit Branch' : 'Create New Branch'}
                </h2>
                {!selectedBranch && (
                  <div className="text-xs text-gray-400">
                    Fill in the details below to create a new branch
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
                          className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                              ? 'border-[#E4B315] text-[#C69A11]'
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
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#C69A11] mb-6 flex items-center">
                      <Building className="w-5 h-5 mr-2 text-[#C69A11]" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-2">
                          Branch Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                          value={formData.custom_branch_name || ''}
                          onChange={(e) => handleInputChange('custom_branch_name', e.target.value)}
                          placeholder="Enter branch name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-2">
                          Branch Code
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                          value={formData.custom_branch_code || ''}
                          onChange={(e) => handleInputChange('custom_branch_code', e.target.value)}
                          placeholder="Enter branch code"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-2">
                          Branch
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                          value={formData.branch || ''}
                          onChange={(e) => handleInputChange('branch', e.target.value)}
                          placeholder="Enter branch"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-2">
                          PIN
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                          value={formData.custom_pin || ''}
                          onChange={(e) => handleInputChange('custom_pin', e.target.value)}
                          placeholder="Enter PIN"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Location Information Tab */}
                {activeTab === 'location' && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#C69A11] mb-6 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-[#C69A11]" />
                      Location Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-2">
                          County Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                          value={formData.custom_county_name || ''}
                          onChange={(e) => handleInputChange('custom_county_name', e.target.value)}
                          placeholder="Enter county name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-2">
                          Tax Locality Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                          value={formData.custom_tax_locality_name || ''}
                          onChange={(e) => handleInputChange('custom_tax_locality_name', e.target.value)}
                          placeholder="Enter tax locality name"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Manager Information Tab */}
                {activeTab === 'manager' && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#C69A11] mb-6 flex items-center">
                      <User className="w-5 h-5 mr-2 text-[#C69A11]" />
                      Manager Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-2">
                          Manager Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                          value={formData.custom_manager_name || ''}
                          onChange={(e) => handleInputChange('custom_manager_name', e.target.value)}
                          placeholder="Enter manager name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-2">
                          Manager Email
                        </label>
                        <input
                          type="email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                          value={formData.custom_manager_email || ''}
                          onChange={(e) => handleInputChange('custom_manager_email', e.target.value)}
                          placeholder="Enter manager email"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-2">
                          Manager Contact
                        </label>
                        <input
                          type="tel"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                          value={formData.custom_manager_contact || ''}
                          onChange={(e) => handleInputChange('custom_manager_contact', e.target.value)}
                          placeholder="Enter manager contact"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-2">
                          Branch Status Code
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                          value={formData.custom_branch_status_code || ''}
                          onChange={(e) => handleInputChange('custom_branch_status_code', e.target.value)}
                          placeholder="Enter branch status code"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#C69A11] mb-6 flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-[#C69A11]" />
                      Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-[#C69A11] border-gray-300 rounded focus:ring-[#E4B315]/40"
                          checked={formData.custom_make_unpaid === 1}
                          onChange={(e) => handleInputChange('custom_make_unpaid', e.target.checked ? 1 : 0)}
                        />
                        <label className="text-sm font-medium text-gray-700">
                          Make Unpaid
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-[#C69A11] border-gray-300 rounded focus:ring-[#E4B315]/40"
                          checked={formData.custom_no_taxes === 1}
                          onChange={(e) => handleInputChange('custom_no_taxes', e.target.checked ? 1 : 0)}
                        />
                        <label className="text-sm font-medium text-gray-700">
                          No Taxes
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-[#C69A11] border-gray-300 rounded focus:ring-[#E4B315]/40"
                          checked={formData.custom_is_head_office === 'Y'}
                          onChange={(e) => handleInputChange('custom_is_head_office', e.target.checked ? 'Y' : 'N')}
                        />
                        <label className="text-sm font-medium text-gray-700">
                          Is Head Office
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-[#C69A11] border-gray-300 rounded focus:ring-[#E4B315]/40"
                          checked={formData.custom_is_etims_branch === 1}
                          onChange={(e) => handleInputChange('custom_is_etims_branch', e.target.checked ? 1 : 0)}
                        />
                        <label className="text-sm font-medium text-gray-700">
                          Is ETIMS Branch
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Aggregator Settings Tab */}
                {activeTab === 'aggregator' && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#C69A11] mb-6 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2 text-[#C69A11]" />
                      Aggregator Settings
                    </h3>
                    {loadingOptions ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin text-[#C69A11] mr-2" />
                        <span className="text-gray-600">Loading options...</span>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {formData.custom_aggregator_settings?.map((setting, index) => (
                          <div key={index} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-2">
                                  Customer
                                </label>
                                <select
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                                  value={setting.customer}
                                  onChange={(e) => updateAggregatorSetting(index, 'customer', e.target.value)}
                                >
                                  <option value="">Select Customer</option>
                                  {customerOptions.map((customerOption) => (
                                    <option key={customerOption.name} value={customerOption.name}>
                                      {customerOption.customer_name || customerOption.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-2">
                                  Price List
                                </label>
                                <select
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                                  value={setting.price_list}
                                  onChange={(e) => updateAggregatorSetting(index, 'price_list', e.target.value)}
                                >
                                  <option value="">Select Price List</option>
                                  {priceListOptions.map((priceListOption) => (
                                    <option key={priceListOption.name} value={priceListOption.name}>
                                      {priceListOption.price_list_name || priceListOption.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-2">
                                  Mode of Payment
                                </label>
                                <select
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                                  value={setting.mode_of_payments}
                                  onChange={(e) => updateAggregatorSetting(index, 'mode_of_payments', e.target.value)}
                                >
                                  <option value="">Select Mode of Payment</option>
                                  {modeOfPaymentOptions.map((modeOfPaymentOption) => (
                                    <option key={modeOfPaymentOption.name} value={modeOfPaymentOption.name}>
                                      {modeOfPaymentOption.mode_of_payment || modeOfPaymentOption.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeAggregatorSetting(index)}
                              className="text-red-600 hover:text-red-700 mt-6"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={addAggregatorSetting}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Aggregator Setting
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#C69A11] mb-6 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-[#C69A11]" />
                      Users
                    </h3>
                    {loadingOptions ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin text-[#C69A11] mr-2" />
                        <span className="text-gray-600">Loading options...</span>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {formData.user?.map((user, index) => (
                          <div key={index} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-2">
                                  User
                                </label>
                                <select
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                                  value={user.user}
                                  onChange={(e) => updateUser(index, 'user', e.target.value)}
                                >
                                  <option value="">Select User</option>
                                  {userOptions.map((userOption) => (
                                    <option key={userOption.name} value={userOption.name}>
                                      {userOption.full_name || userOption.email} ({userOption.email})
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#C69A11] mb-2">
                                  Room
                                </label>
                                <select
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E4B315]/40"
                                  value={user.room}
                                  onChange={(e) => updateUser(index, 'room', e.target.value)}
                                >
                                  <option value="">Select Room</option>
                                  {roomOptions.map((roomOption) => (
                                    <option key={roomOption.name} value={roomOption.name}>
                                      {roomOption.name || roomOption.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeUser(index)}
                              className="text-red-600 hover:text-red-700 mt-6"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={addUser}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add User
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-200 bg-gray-50 p-4 flex-shrink-0">
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    disabled={saving}
                    className="px-6 py-2 h-10"
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={saveBranch}
                    disabled={saving}
                    className="px-6 py-2 h-10 bg-[#E4B315]/12 hover:bg-[#E4B315]/12 text-white"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        <span>{selectedBranch ? 'Updating...' : 'Creating...'}</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        <span>{selectedBranch ? 'Update Branch' : 'Create Branch'}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default BranchSetup;