import React from 'react';
import { X, BookOpen, ShoppingCart, Search, Plus, Edit, Trash2, FileText, ChevronRight } from 'lucide-react';

interface InventoryManagementPurchaseOrdersDocumentationProps {
  isOpen: boolean;
  onClose: () => void;
}

const InventoryManagementPurchaseOrdersDocumentation: React.FC<InventoryManagementPurchaseOrdersDocumentationProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Purchase Orders Documentation</h2>
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
              <ShoppingCart className="w-5 h-5 text-amber-600" />
              Overview
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              The Purchase Orders section allows you to create and manage purchase orders for your suppliers. 
              Track orders from creation to delivery, manage supplier relationships, and maintain accurate inventory records. 
              Purchase orders help streamline procurement, ensure timely deliveries, and maintain proper documentation for accounting.
            </p>
          </section>

          {/* Key Features */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-600" />
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<Search className="w-5 h-5" />}
                title="Search Orders"
                description="Search purchase orders by PO number, supplier, or status with real-time filtering"
              />
              <FeatureCard
                icon={<Plus className="w-5 h-5" />}
                title="Create Orders"
                description="Create new purchase orders with detailed order information and item lists"
              />
              <FeatureCard
                icon={<Edit className="w-5 h-5" />}
                title="Edit Orders"
                description="Modify draft orders before submission to suppliers"
              />
              <FeatureCard
                icon={<FileText className="w-5 h-5" />}
                title="Track Status"
                description="Monitor order status from Draft to Completed with visual status badges"
              />
              <FeatureCard
                icon={<ShoppingCart className="w-5 h-5" />}
                title="Dashboard Metrics"
                description="View total orders, pending orders, monthly spend, and delivery performance"
              />
              <FeatureCard
                icon={<Trash2 className="w-5 h-5" />}
                title="Delete Orders"
                description="Remove draft orders with confirmation prompts"
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
                title="Navigate to Purchase Orders"
                description="Click 'Purchase Orders' in the sidebar to access the purchase orders management view"
                icon={<ShoppingCart className="w-5 h-5" />}
              />
              <StepCard
                step="2"
                title="View Dashboard"
                description="Review dashboard metrics showing total orders, pending orders, monthly spend, and on-time delivery percentage"
                icon={<FileText className="w-5 h-5" />}
              />
              <StepCard
                step="3"
                title="Search Orders"
                description="Use the search bar to find specific orders by PO number or supplier name"
                icon={<Search className="w-5 h-5" />}
              />
              <StepCard
                step="4"
                title="Create Order"
                description="Click 'Create Purchase Order' to open the order creation modal"
                icon={<Plus className="w-5 h-5" />}
              />
              <StepCard
                step="5"
                title="Fill Order Details"
                description="Complete the Order Details tab with PO number, supplier, company, dates, and costs"
                icon={<FileText className="w-5 h-5" />}
              />
              <StepCard
                step="6"
                title="Add Items"
                description="Switch to Items tab and add items with quantity, rate, and discount information"
                icon={<ShoppingCart className="w-5 h-5" />}
              />
              <StepCard
                step="7"
                title="Submit Order"
                description="Review the summary and submit the purchase order to the supplier"
                icon={<FileText className="w-5 h-5" />}
              />
            </div>
          </section>

          {/* Order Details Tab */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              Order Details Tab
            </h3>
            <div className="space-y-4">
              <FieldCard
                title="PO Number"
                description="Enter the unique purchase order number (required). This is the primary identifier for the order."
                required={true}
              />
              <FieldCard
                title="Supplier"
                description="Select the supplier from the dropdown (required). This determines who will fulfill the order."
                required={true}
              />
              <FieldCard
                title="Company"
                description="Select the company for this purchase order (required). Ensures proper company association."
                required={true}
              />
              <FieldCard
                title="Expected Delivery Date"
                description="Select the date when goods are expected to be delivered. Maps to schedule_date field."
                required={false}
              />
              <FieldCard
                title="Order Date"
                description="Select the date when the purchase order was created. Maps to transaction_date field."
                required={false}
              />
              <FieldCard
                title="Tax Amount"
                description="Enter any applicable tax amount for this order. Added to the total cost."
                required={false}
              />
              <FieldCard
                title="Shipping Cost"
                description="Enter shipping or delivery charges for this order. Added to the total cost."
                required={false}
              />
              <FieldCard
                title="Notes"
                description="Add any additional notes or instructions for the supplier regarding this order."
                required={false}
              />
            </div>
          </section>

          {/* Items Tab */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-600" />
              Items Tab
            </h3>
            <div className="space-y-4">
              <FieldCard
                title="Add Item Button"
                description="Click to add a new item row to the purchase order. At least one item is required."
                required={true}
              />
              <FieldCard
                title="Ingredient"
                description="Select the item from the dropdown. This is the product being ordered."
                required={true}
              />
              <FieldCard
                title="Quantity"
                description="Enter the quantity of the item being ordered. Must be a positive number."
                required={true}
              />
              <FieldCard
                title="Rate"
                description="Enter the unit price per item. This is the cost per unit from the supplier."
                required={true}
              />
              <FieldCard
                title="Discount Type"
                description="Select discount type: Percent or Amount. Determines how discount is calculated."
                required={false}
              />
              <FieldCard
                title="Discount Value"
                description="Enter the discount amount or percentage. Applied to the item total."
                required={false}
              />
              <FieldCard
                title="Total"
                description="Automatically calculated as (Quantity × Rate) - Discount. Read-only field."
                required={false}
              />
              <FieldCard
                title="Notes"
                description="Add item-specific notes or instructions for the supplier."
                required={false}
              />
            </div>
          </section>

          {/* Order Status Explained */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              Order Status Explained
            </h3>
            <div className="space-y-3">
              <TypeCard
                title="Draft"
                description="Order is created but not yet submitted. Can be edited or deleted."
                color="gray"
              />
              <TypeCard
                title="To Receive and Bill"
                description="Order submitted but goods not received and not billed. Pending delivery and invoicing."
                color="yellow"
              />
              <TypeCard
                title="To Bill"
                description="Goods received but not yet billed. Payment pending."
                color="blue"
              />
              <TypeCard
                title="To Receive"
                description="Order billed but goods not yet received. Delivery pending."
                color="purple"
              />
              <TypeCard
                title="Completed"
                description="Order fully processed. Goods received and billed. Transaction complete."
                color="green"
              />
              <TypeCard
                title="Cancelled"
                description="Order cancelled. No further action required."
                color="red"
              />
            </div>
          </section>

          {/* Dashboard Metrics */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              Dashboard Metrics Explained
            </h3>
            <div className="space-y-3">
              <PropertyCard
                title="Total Orders"
                description="Total number of purchase orders in the system, including all statuses."
                example="Total Orders: 150 (all orders ever created)"
              />
              <PropertyCard
                title="Pending Orders"
                description="Number of orders that are not yet completed. Includes Draft, To Receive, and To Bill statuses."
                example="Pending Orders: 25 (orders awaiting completion)"
              />
              <PropertyCard
                title="Monthly Spend"
                description="Total amount spent on purchase orders in the current month."
                example="Monthly Spend: KSh 500,000 (this month's spending)"
              />
              <PropertyCard
                title="On-Time Delivery %"
                description="Percentage of orders delivered on or before the expected delivery date."
                example="On-Time Delivery: 85% (85% of orders delivered on time)"
              />
            </div>
          </section>

          {/* Tips */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-600" />
              Tips & Best Practices
            </h3>
            <div className="bg-amber-50 rounded-xl p-4 space-y-2">
              <TipItem text="Use descriptive PO numbers for easy identification and tracking" />
              <TipItem text="Set realistic expected delivery dates based on supplier performance" />
              <TipItem text="Review and verify supplier details before creating orders" />
              <TipItem text="Add detailed notes to avoid misunderstandings with suppliers" />
              <TipItem text="Monitor pending orders regularly to ensure timely delivery" />
              <TipItem text="Keep accurate records of tax and shipping costs for accounting" />
              <TipItem text="Use discount fields strategically to negotiate better prices" />
              <TipItem text="Review dashboard metrics to identify trends and improve procurement" />
              <TipItem text="Cancel orders only when necessary to maintain supplier relationships" />
              <TipItem text="Double-check item quantities and rates before submitting orders" />
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
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${required ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'}`}>
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
    gray: 'bg-gray-50 border-gray-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
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

const PropertyCard: React.FC<{ title: string; description: string; example: string }> = ({ title, description, example }) => (
  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
    <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
    <p className="text-sm text-gray-600 mb-2">{description}</p>
    <div className="bg-amber-100 rounded-lg p-3">
      <p className="text-xs font-mono text-amber-800">
        <strong>Example:</strong> {example}
      </p>
    </div>
  </div>
);

const TipItem: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-start gap-2 text-sm text-gray-700">
    <span className="text-amber-600 font-bold">•</span>
    <span>{text}</span>
  </div>
);

export default InventoryManagementPurchaseOrdersDocumentation;
