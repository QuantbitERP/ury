import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, AlertTriangle, ChefHat, BookOpen, Settings, Download, X, Star, ArrowLeft } from 'lucide-react';
import { getURYMenus, createMenuItem, updateMenuItem, searchItems, URYMenuItem, NewMenuItem, ItemSearchResult } from '../lib/menu-api';
import PageLayout from '../components/PageLayout';
interface MenuItemDisplay {
  id: string;
  name: string;
  price: number;
  category: string;
  enabled: boolean;
  image?: string;
  special_dish: boolean;
}

// Categories Content Component
const CategoriesContent: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState<{
    type: 'usage' | 'error';
    categoryName: string;
    menuItems?: string[];
    message?: string;
  } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    course: '',
    custom_serving_priority: 0,
    custom_indicate_in_kds: false
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Fetch URY Menu Course documents
      const response = await fetch('/api/resource/URY Menu Course?fields=["*"]');
      const data = await response.json();
      setCategories(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    try {
      // First check which menu items are using this category
      const checkResponse = await fetch(`/api/resource/URY Menu Item?filters=[["course","=","${categoryName}"]]&fields=["item_name","name"]`);

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();

        if (checkData.data && checkData.data.length > 0) {
          const menuItems = checkData.data.map((item: any) => item.item_name || item.name);
          // Show custom alert with usage information
          setAlertData({
            type: 'usage',
            categoryName,
            menuItems
          });
          setShowAlert(true);
          return;
        }
      }

      // If no menu items are using this category, proceed with deletion
      if (!confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
        return;
      }

      // Delete the category using Frappe API
      const response = await fetch(`/api/resource/URY Menu Course/${categoryName}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle LinkExistsError specifically
        if (errorData.exc_type === 'LinkExistsError') {
          const message = errorData.exception || errorData._server_messages;
          // Extract the linked menu name from the error message
          const linkedMenuMatch = message.match(/linked with URY Menu <[^>]*>([^<]+)</);
          const linkedMenu = linkedMenuMatch ? linkedMenuMatch[1] : 'menu items';

          // Show custom alert for linked error
          setAlertData({
            type: 'error',
            categoryName,
            message: `Cannot delete category "${categoryName}" because it is being used by ${linkedMenu}.`
          });
          setShowAlert(true);
          return;
        }

        throw new Error(errorData.message || 'Failed to delete category');
      }

      // Refresh the categories list
      fetchCategories();
    } catch (err: any) {
      if (err.message.includes('Cannot delete or cancel because')) {
        // Handle the case where the error is already formatted
        setAlertData({
          type: 'error',
          categoryName,
          message: err.message
        });
        setShowAlert(true);
      } else {
        setAlertData({
          type: 'error',
          categoryName,
          message: `Error deleting category: ${err.message}`
        });
        setShowAlert(true);
      }
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.course.trim()) {
      alert('Please enter a category name');
      return;
    }

    try {
      setIsCreating(true);

      // Create new category using Frappe API
      const response = await fetch('/api/resource/URY Menu Course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course: newCategory.course.trim(),
          custom_serving_priority: newCategory.custom_serving_priority,
          custom_indicate_in_kds: newCategory.custom_indicate_in_kds ? 1 : 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create category');
      }

      const result = await response.json();

      // Refresh the categories list
      fetchCategories();

      // Reset form and close modal
      setNewCategory({
        course: '',
        custom_serving_priority: 0,
        custom_indicate_in_kds: false
      });
      setShowAddModal(false);

      // Show success message
      alert('Category created successfully!');

    } catch (err: any) {
      alert(`Error creating category: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Error loading categories</p>
          <p className="text-gray-600 text-sm mt-2">{error}</p>
          <button
            onClick={fetchCategories}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your restaurant's menu categories
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              <span className="font-medium">{categories.length}</span> categories
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="px-6 mt-6 pb-6">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serving Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Show in KDS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {category.course}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {category.custom_serving_priority || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.custom_indicate_in_kds
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {category.custom_indicate_in_kds ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteCategory(category.name)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {categories.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                <p className="text-gray-500">
                  Get started by adding your first category
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Alert Modal */}
      {showAlert && alertData && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 p-2 rounded-full ${alertData.type === 'usage' ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                {alertData.type === 'usage' ? (
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {alertData.type === 'usage' ? 'Category in Use' : 'Cannot Delete Category'}
                </h3>

                {alertData.type === 'usage' && alertData.menuItems && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-3">
                      Category "<span className="font-medium">{alertData.categoryName}</span>" is being used by the following menu items:
                    </p>
                    <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                      {alertData.menuItems.map((item, index) => (
                        <div key={index} className="text-sm text-gray-700 py-1">
                          • {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {alertData.type === 'error' && (
                  <p className="text-sm text-gray-600 mb-4">
                    {alertData.message}
                  </p>
                )}

                <div className="flex gap-3">
                  {alertData.type === 'usage' ? (
                    <>
                      <button
                        onClick={() => {
                          setShowAlert(false);
                          // Redirect to Menu Items section
                          window.location.hash = 'menu-items';
                          // Force a reload to switch sections
                          setTimeout(() => {
                            window.location.reload();
                          }, 100);
                        }}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Go to Menu Items
                      </button>
                      <button
                        onClick={() => setShowAlert(false)}
                        className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setShowAlert(false)}
                      className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      OK
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Add New Category</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={newCategory.course}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, course: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serving Priority</label>
                <input
                  type="number"
                  value={newCategory.custom_serving_priority}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, custom_serving_priority: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showInKDS"
                  checked={newCategory.custom_indicate_in_kds}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, custom_indicate_in_kds: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showInKDS" className="ml-2 block text-sm text-gray-700">
                  Show in KDS
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={isCreating || !newCategory.course.trim()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Export Content Component
const ExportContent: React.FC<{
  onExportMenuItems: () => void;
  onExportCategories: () => void;
  loading: boolean;
}> = ({ onExportMenuItems, onExportCategories, loading }) => {
  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Export Menu</h1>
            <p className="text-sm text-gray-600 mt-1">
              Export your restaurant's menu data to CSV files
            </p>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="px-6 mt-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Menu Items Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Download className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Export Menu Items</h3>
                <p className="text-sm text-gray-600">Download all menu items with details</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Item Name and Code
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Price and Category
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Special Dish Status
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Enable/Disable Status
              </div>
            </div>

            <button
              onClick={onExportMenuItems}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Exporting...' : 'Export Menu Items'}
            </button>
          </div>

          {/* Export Categories Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Download className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Export Categories</h3>
                <p className="text-sm text-gray-600">Download all categories with settings</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Category Names
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Serving Priority
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                KDS Display Settings
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Creation Details
              </div>
            </div>

            <button
              onClick={onExportCategories}
              disabled={loading}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Exporting...' : 'Export Categories'}
            </button>
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Download className="h-5 w-5 text-blue-600 mt-0.5" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-semibold text-blue-800">Export Information</h4>
              <div className="mt-2 text-sm text-blue-700">
                <p className="mb-2">• Files will be downloaded in CSV format</p>
                <p className="mb-2">• Filename includes current date (e.g., menu_items_2025-03-07.csv)</p>
                <p className="mb-2">• Data can be opened in Excel, Google Sheets, or other spreadsheet applications</p>
                <p>• Export includes all current data from the system</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const MenuManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [menuItems, setMenuItems] = useState<MenuItemDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeSection, setActiveSection] = useState('menu-items');
  const [exportData, setExportData] = useState<{
    menuItems: any[];
    categories: any[];
  }>({
    menuItems: [],
    categories: []
  });
  const [exportLoading, setExportLoading] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState<NewMenuItem>({
    item: '',
    item_name: '',
    rate: 0,
    course: '',
    special_dish: false
  });
  const [isCreating, setIsCreating] = useState(false);
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [itemSearchResults, setItemSearchResults] = useState<ItemSearchResult[]>([]);
  const [showItemSearch, setShowItemSearch] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemDisplay | null>(null);
  const [editFormData, setEditFormData] = useState<{
    name: string;
    price: number;
    category: string;
    special_dish: boolean;
  }>({
    name: '',
    price: 0,
    category: '',
    special_dish: false
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const subMenuItems = [
    { id: 'menu-items', name: 'Menu Items', icon: ChefHat },
    { id: 'categories', name: 'Categories', icon: Settings },
    { id: 'export', name: 'Export Menu', icon: Download }
  ];

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      setError(null);
      const menus = await getURYMenus();

      // Flatten all menu items from all menus and extract unique categories
      const allItems: MenuItemDisplay[] = [];
      const uniqueCategories = new Set<string>(['All']);

      menus.forEach(menu => {
        if (menu.items && Array.isArray(menu.items)) {
          menu.items.forEach((item: URYMenuItem) => {
            const category = item.course || 'Uncategorized';
            uniqueCategories.add(category);

            allItems.push({
              id: item.name,
              name: item.item_name || item.item,
              price: item.rate,
              category: category,
              enabled: item.disabled === 0,
              special_dish: item.special_dish === 1
            });
          });
        }
      });

      setMenuItems(allItems);
      setCategories(Array.from(uniqueCategories));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch menu data');
      console.error('Error fetching menu data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleItemStatus = (itemId: string) => {
    setMenuItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const deleteItem = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      // Delete from backend using custom API method
      const response = await fetch('/api/method/quantbit_ury_customization.ury_customization.menu_api.delete_menu_item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: itemId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle LinkExistsError specifically
        if (errorData.exc_type === 'LinkExistsError') {
          const message = errorData.exception || errorData._server_messages;
          alert(`Cannot delete menu item because it is linked to other records. ${message}`);
          return;
        }

        throw new Error(errorData.message || 'Failed to delete menu item');
      }

      const result = await response.json();

      // Remove from frontend UI only after successful backend deletion
      setMenuItems(items => items.filter(item => item.id !== itemId));

      // Show success message
      if (result.message) {
        alert(result.message);
      }

    } catch (err: any) {
      alert(`Error deleting menu item: ${err.message}`);
    }
  };

  const handleEditItem = (item: MenuItemDisplay) => {
    setEditingItem(item);
    setEditFormData({
      name: item.name,
      price: item.price,
      category: item.category,
      special_dish: item.special_dish
    });
    setShowEditModal(true);
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      setIsUpdating(true);

      // Call backend API to update the menu item
      const updatedItem = await updateMenuItem(editingItem.id, {
        item_name: editFormData.name,
        rate: editFormData.price,
        course: editFormData.category,
        special_dish: editFormData.special_dish
      });

      // Update local state with the response from backend
      setMenuItems(items =>
        items.map(item =>
          item.id === editingItem.id
            ? {
              ...item,
              name: updatedItem.item_name || editFormData.name,
              price: updatedItem.rate || editFormData.price,
              category: updatedItem.course || editFormData.category,
              special_dish: updatedItem.special_dish === 1 || editFormData.special_dish
            }
            : item
        )
      );

      setShowEditModal(false);
      setEditingItem(null);
    } catch (error: any) {
      console.error('Error updating menu item:', error);
      alert('Failed to update menu item: ' + (error.message || 'Unknown error'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddMenuItem = async () => {
    try {
      setIsCreating(true);
      const createdItem = await createMenuItem(newMenuItem);

      // Add the new item to the local state
      const displayItem: MenuItemDisplay = {
        id: createdItem.name,
        name: createdItem.item_name,
        price: createdItem.rate,
        category: createdItem.course || 'Uncategorized',
        enabled: createdItem.disabled === 0,
        special_dish: createdItem.special_dish === 1
      };

      setMenuItems(prev => [...prev, displayItem]);

      // Reset form and close modal
      setNewMenuItem({
        item: '',
        item_name: '',
        rate: 0,
        course: '',
        special_dish: false
      });
      setShowAddModal(false);

    } catch (error: any) {
      console.error('Error creating menu item:', error);
      alert('Failed to create menu item: ' + (error.message || 'Unknown error'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleItemSearch = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setItemSearchResults([]);
      return;
    }

    try {
      const results = await searchItems(searchTerm);
      setItemSearchResults(results);
    } catch (error: any) {
      console.error('Error searching items:', error);
      setItemSearchResults([]);
    }
  };

  const selectItem = (item: ItemSearchResult) => {
    setNewMenuItem(prev => ({
      ...prev,
      item: item.name,
      item_name: item.item_name
    }));
    setShowItemSearch(false);
    setItemSearchTerm('');
    setItemSearchResults([]);
  };

  const handleExportMenuItems = async () => {
    try {
      setExportLoading(true);

      // Use the existing menu data that's already loaded
      if (menuItems.length === 0) {
        throw new Error('No menu items data available. Please ensure menu items are loaded first.');
      }

      // Transform the data for export
      const exportData = menuItems.map((item) => ({
        item_name: item.name,
        item: item.name, // Using name as item code since we don't have separate item code
        rate: item.price,
        course: item.category,
        special_dish: item.special_dish ? 1 : 0,
        disabled: item.enabled ? 0 : 1
      }));

      downloadCSV(exportData, 'menu_items', [
        { key: 'item_name', label: 'Item Name' },
        { key: 'item', label: 'Item Code' },
        { key: 'rate', label: 'Price' },
        { key: 'course', label: 'Category' },
        { key: 'special_dish', label: 'Special Dish' },
        { key: 'disabled', label: 'Enabled' }
      ]);

    } catch (err: any) {
      console.error('Export error:', err);
      alert('Error exporting menu items: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportCategories = async () => {
    try {
      setExportLoading(true);

      // Fetch all categories for export
      const response = await fetch('/api/resource/URY Menu Course?fields=["*"]');
      const data = await response.json();

      if (data.data) {
        setExportData(prev => ({ ...prev, categories: data.data }));
        downloadCSV(data.data, 'categories', [
          { key: 'course', label: 'Category Name' },
          { key: 'custom_serving_priority', label: 'Serving Priority' },
          { key: 'custom_indicate_in_kds', label: 'Show in KDS' }
        ]);
      } else {
        throw new Error('No categories data found');
      }
    } catch (err: any) {
      console.error('Categories export error:', err);
      alert('Error exporting categories: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  const downloadCSV = (data: any[], filename: string, columns: { key: string; label: string }[]) => {
    // Create CSV content
    const headers = columns.map(col => col.label).join(',');
    const rows = data.map(item =>
      columns.map(col => {
        const value = item[col.key];
        // Handle special characters and formatting
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    );

    const csvContent = [headers, ...rows].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading menu items...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">Error loading menu data</p>
            <p className="text-gray-600 text-sm mt-2">{error}</p>
            <button
              onClick={fetchMenuData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageLayout title="Menu Management" subtitle="Manage your restaurant's menus and categories">
      <div className="flex h-full bg-gray-50">
        {/* Left Sidebar - Sub Menu */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
            Menu Management
          </h3>
          <nav className="space-y-1">
            {subMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeSection === item.id
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {activeSection === 'menu-items' ? (
            <>
              {/* Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Menu Items</h1>
                    <p className="text-sm text-gray-600 mt-1">
                      Manage your restaurant's menu items
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => window.location.href = '/pos'}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to POS
                    </button>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">{filteredItems.length}</span> items
                    </div>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Menu Item
                    </button>
                  </div>
                </div>
              </div>

              {/* Alert */}
              <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-red-800">
                    Missing Recipes for Inventory Tracking
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    7 menu items don't have recipes configured. Stock usage won't be tracked for orders containing these items.
                    <a href="#" className="underline font-medium">
                      Go to the Recipes tab to add recipes for these items to enable proper Inventory tracking.
                    </a>
                  </p>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="px-6 mt-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search menu items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Category Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Menu Items Grid */}
              <div className="px-6 mt-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            {item.special_dish && (
                              <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                <Star className="h-3 w-3 fill-current" />
                                Special
                              </div>
                            )}
                          </div>
                          <p className="text-lg font-bold text-gray-900 mt-1">KSh {item.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleItemStatus(item.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.enabled ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.enabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {item.category}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredItems.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-500">
                      <ChefHat className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items found</h3>
                      <p className="text-gray-500">
                        {searchTerm || selectedCategory !== 'All'
                          ? 'Try adjusting your search or filter criteria'
                          : 'Get started by adding your first menu item'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : activeSection === 'categories' ? (
            <CategoriesContent />
          ) : activeSection === 'export' ? (
            <ExportContent
              onExportMenuItems={handleExportMenuItems}
              onExportCategories={handleExportCategories}
              loading={exportLoading}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {subMenuItems.find(item => item.id === activeSection)?.name || 'Section'}
                </h3>
                <p className="text-gray-500">This section is coming soon</p>
              </div>
            </div>
          )}
        </div>

        {/* Add Menu Item Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Add New Menu Item</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newMenuItem.item_name || itemSearchTerm}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNewMenuItem(prev => ({ ...prev, item: value, item_name: value }));
                        setItemSearchTerm(value);
                        handleItemSearch(value);
                      }}
                      onFocus={() => setShowItemSearch(true)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter item name or search"
                    />
                    {showItemSearch && itemSearchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {itemSearchResults.map((item) => (
                          <div
                            key={item.name}
                            onClick={() => selectItem(item)}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{item.item_name}</div>
                            <div className="text-sm text-gray-500">{item.item_group} • {item.stock_uom}</div>
                            {item.description && (
                              <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    value={newMenuItem.rate}
                    onChange={(e) => setNewMenuItem(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter price"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newMenuItem.course}
                    onChange={(e) => setNewMenuItem(prev => ({ ...prev, course: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {categories.filter(cat => cat !== 'All').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Dish</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newMenuItem.special_dish}
                      onChange={(e) => setNewMenuItem(prev => ({ ...prev, special_dish: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Mark as special dish</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMenuItem}
                  disabled={isCreating || !newMenuItem.item_name.trim() || newMenuItem.rate <= 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Menu Item Modal */}
        {showEditModal && editingItem && (
          <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Edit Menu Item</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter item name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    value={editFormData.price}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter price"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {categories.filter(cat => cat !== 'All').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Dish</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editFormData.special_dish}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, special_dish: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Mark as special dish</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateItem}
                  disabled={isUpdating || !editFormData.name.trim() || editFormData.price <= 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUpdating ? 'Updating...' : 'Update Item'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default MenuManagement;
