import React from 'react';
import { X, BookOpen, Package, Search, Plus, Edit2, Trash2, SlidersHorizontal, ChevronRight } from 'lucide-react';

interface InventoryManagementStockItemsDocumentationProps {
  isOpen: boolean;
  onClose: () => void;
}

const InventoryManagementStockItemsDocumentation: React.FC<InventoryManagementStockItemsDocumentationProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Stock Items Documentation</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          {/* Overview Section */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" />
              Overview
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              The Stock Items section allows you to manage your restaurant's inventory. View, add, edit, delete, and adjust stock items. 
              Track item quantities, costs, suppliers, and warehouse locations. The system provides real-time stock levels from Bin data 
              and supports bulk operations through search and filtering.
            </p>
          </section>

          {/* Key Features */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" />
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<Search className="w-5 h-5" />}
                title="Search & Filter"
                description="Search items by name or code, filter by category and department/warehouse"
              />
              <FeatureCard
                icon={<Plus className="w-5 h-5" />}
                title="Add Stock Items"
                description="Create new stock items with opening stock, cost, and supplier information"
              />
              <FeatureCard
                icon={<Edit2 className="w-5 h-5" />}
                title="Edit Items"
                description="Update item details, categories, costs, and reorder levels"
              />
              <FeatureCard
                icon={<SlidersHorizontal className="w-5 h-5" />}
                title="Adjust Stock"
                description="Quickly adjust stock levels through Material Receipt, Issue, Transfer, or Reconciliation"
              />
              <FeatureCard
                icon={<Trash2 className="w-5 h-5" />}
                title="Delete Items"
                description="Remove items with safety checks for linked records"
              />
              <FeatureCard
                icon={<Package className="w-5 h-5" />}
                title="Real-time Stock"
                description="View live stock quantities from Bin data with in-stock/out-of-stock status"
              />
            </div>
          </section>

          {/* How to Use */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              How to Use
            </h3>
            <div className="space-y-4">
              <StepCard
                step="1"
                title="View Stock Items"
                description="Navigate to Stock Items to view all inventory with search and filter options"
                icon={<Package className="w-5 h-5" />}
              />
              <StepCard
                step="2"
                title="Add New Item"
                description="Click 'Add Stock Item' to create a new inventory item with details"
                icon={<Plus className="w-5 h-5" />}
              />
              <StepCard
                step="3"
                title="Edit Item"
                description="Click the edit icon on any item card to modify its details"
                icon={<Edit2 className="w-5 h-5" />}
              />
              <StepCard
                step="4"
                title="Adjust Stock"
                description="Use the adjust icon to quickly modify stock levels for any item"
                icon={<SlidersHorizontal className="w-5 h-5" />}
              />
              <StepCard
                step="5"
                title="Delete Item"
                description="Remove items using the delete icon (with safety checks)"
                icon={<Trash2 className="w-5 h-5" />}
              />
            </div>
          </section>

          {/* Add Stock Item Modal Fields */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-600" />
              Add Stock Item Modal Fields
            </h3>
            <div className="space-y-4">
              <FieldCard
                title="Stock Item Name"
                description="Enter the name of the stock item (required). This will also be used as the item code."
                required={true}
              />
              <FieldCard
                title="Description"
                description="Add an optional description for the item to provide additional details."
                required={false}
              />
              <FieldCard
                title="Category"
                description="Select the item category from the Item Group doctype (required)."
                required={true}
              />
              <FieldCard
                title="Unit"
                description="Select the unit of measurement from the UOM doctype (required)."
                required={true}
              />
              <FieldCard
                title="Department (Warehouse)"
                description="Select the warehouse/department where the item is stored."
                required={false}
              />
              <FieldCard
                title="Cost Per Unit"
                description="Enter the cost per unit. This is stored as the conversion factor in UOMs."
                required={false}
              />
              <FieldCard
                title="Opening Stock"
                description="Enter the initial stock quantity. This creates a Stock Entry to add stock to the warehouse."
                required={false}
              />
              <FieldCard
                title="Minimum Stock"
                description="Set the minimum reorder level. When stock falls below this, it triggers reorder alerts."
                required={false}
              />
              <FieldCard
                title="Supplier"
                description="Select the default supplier for this item from the Supplier doctype."
                required={false}
              />
            </div>
          </section>

          {/* Edit Stock Item Modal Fields */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-amber-600" />
              Edit Stock Item Modal Fields
            </h3>
            <div className="space-y-4">
              <FieldCard
                title="Stock Item Name"
                description="Modify the name of the stock item (required)."
                required={true}
              />
              <FieldCard
                title="Description"
                description="Update the item description."
                required={false}
              />
              <FieldCard
                title="Category"
                description="Change the item category (required)."
                required={true}
              />
              <FieldCard
                title="Unit"
                description="Update the unit of measurement (required)."
                required={true}
              />
              <FieldCard
                title="Department (Warehouse)"
                description="Change the warehouse/department for the item."
                required={false}
              />
              <FieldCard
                title="Cost Per Unit"
                description="Update the cost per unit."
                required={false}
              />
              <FieldCard
                title="Current Stock"
                description="View the live stock quantity from Bin data (read-only)."
                required={false}
              />
              <FieldCard
                title="Minimum Stock"
                description="Update the minimum reorder level."
                required={false}
              />
              <FieldCard
                title="Supplier"
                description="Change the default supplier for this item."
                required={false}
              />
            </div>
          </section>

          {/* Adjust Stock Modal Fields */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-amber-600" />
              Adjust Stock Modal Fields
            </h3>
            <div className="space-y-4">
              <FieldCard
                title="Stock Entry Type"
                description="Select the type of stock adjustment: Material Receipt (add stock), Material Issue (remove stock), Material Transfer (move between warehouses), or Stock Reconciliation (set exact quantity)."
                required={true}
              />
              <FieldCard
                title="Quantity"
                description="Enter the quantity to adjust. Positive for receipts, negative for issues."
                required={true}
              />
              <FieldCard
                title="Warehouse"
                description="Select the source or target warehouse based on the entry type."
                required={true}
              />
              <FieldCard
                title="Company"
                description="Select the company for the stock entry (required)."
                required={true}
              />
              <FieldCard
                title="Branch"
                description="Select the branch for the stock entry (required)."
                required={true}
              />
            </div>
          </section>

          {/* Stock Entry Types */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" />
              Stock Entry Types Explained
            </h3>
            <div className="space-y-3">
              <TypeCard
                title="Material Receipt"
                description="Adds stock to a warehouse. Used when receiving items from suppliers or initial stock setup."
                color="green"
              />
              <TypeCard
                title="Material Issue"
                description="Removes stock from a warehouse. Used when items are consumed, used in production, or sent to customers."
                color="red"
              />
              <TypeCard
                title="Material Transfer"
                description="Moves stock from one warehouse to another. Used for internal stock movements."
                color="blue"
              />
              <TypeCard
                title="Stock Reconciliation"
                description="Sets the exact stock quantity in a warehouse. Used for physical inventory counts and corrections."
                color="amber"
              />
            </div>
          </section>

          {/* Tips */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" />
              Tips & Best Practices
            </h3>
            <div className="bg-amber-50 rounded-xl p-4 space-y-2">
              <TipItem text="Use meaningful item names that match your menu items for easy identification" />
              <TipItem text="Set appropriate minimum stock levels to trigger reorder alerts" />
              <TipItem text="Always assign a default supplier for easier purchase order creation" />
              <TipItem text="Use opening stock only when setting up new items" />
              <TipItem text="Regularly reconcile stock with physical inventory counts" />
              <TipItem text="Use stock transfers to move items between warehouses" />
              <TipItem text="Filter by category to find items quickly in large inventories" />
              <TipItem text="Review cost per unit regularly for accurate valuation" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
    <div className="flex items-start gap-3">
      <div className="text-amber-600 mt-0.5">{icon}</div>
      <div>
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </div>
);

const StepCard: React.FC<{ step: string; title: string; description: string; icon: React.ReactNode }> = ({ step, title, description, icon }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
      {step}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <div className="text-amber-600">{icon}</div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
      </div>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  </div>
);

const FieldCard: React.FC<{ title: string; description: string; required: boolean }> = ({ title, description, required }) => (
  <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
    <div className="flex-shrink-0">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${required ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'}`}>
        {required ? '*' : ''}
      </div>
    </div>
    <div className="flex-1">
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

const TypeCard: React.FC<{ title: string; description: string; color: string }> = ({ title, description, color }) => {
  const colorClasses = {
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    blue: 'bg-blue-50 border-blue-200',
    amber: 'bg-amber-50 border-amber-200'
  };
  return (
    <div className={`flex items-start gap-3 rounded-xl p-4 border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
};

const TipItem: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-start gap-2 text-sm text-gray-700">
    <span className="text-amber-600 font-bold">•</span>
    <span>{text}</span>
  </div>
);

export default InventoryManagementStockItemsDocumentation;
