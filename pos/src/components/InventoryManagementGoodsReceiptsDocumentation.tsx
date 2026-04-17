import React from 'react';
import { X, BookOpen, Package, Search, Plus, Edit, Trash2, FileText, ChevronRight } from 'lucide-react';

interface InventoryManagementGoodsReceiptsDocumentationProps {
  isOpen: boolean;
  onClose: () => void;
}

const InventoryManagementGoodsReceiptsDocumentation: React.FC<InventoryManagementGoodsReceiptsDocumentationProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Goods Receipts Documentation</h2>
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
              The Goods Receipts section allows you to record and manage incoming goods from suppliers. 
              Track receipts, update inventory levels, and document supplier deliveries. 
              Goods receipts ensure accurate inventory records and proper accounting for purchased items.
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
                title="Search Receipts"
                description="Search goods receipts by supplier, purchase order, or status with real-time filtering"
              />
              <FeatureCard
                icon={<Plus className="w-5 h-5" />}
                title="Create Receipts"
                description="Create new goods receipts with detailed delivery information and item lists"
              />
              <FeatureCard
                icon={<Edit className="w-5 h-5" />}
                title="Link to Purchase Orders"
                description="Link receipts to existing purchase orders to auto-populate items and track fulfillment"
              />
              <FeatureCard
                icon={<FileText className="w-5 h-5" />}
                title="Track Status"
                description="Monitor receipt status from Draft to Completed with visual status badges"
              />
              <FeatureCard
                icon={<Package className="w-5 h-5" />}
                title="Dashboard Metrics"
                description="View total receipts, pending receipts, monthly receipts, and total value"
              />
              <FeatureCard
                icon={<Trash2 className="w-5 h-5" />}
                title="Delete Receipts"
                description="Remove draft receipts with confirmation prompts"
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
                title="Navigate to Goods Receipts"
                description="Click 'Goods Receipts' in the sidebar to access the goods receipts management view"
                icon={<Package className="w-5 h-5" />}
              />
              <StepCard
                step="2"
                title="View Dashboard"
                description="Review dashboard metrics showing total receipts, pending receipts, monthly receipts, and total value"
                icon={<FileText className="w-5 h-5" />}
              />
              <StepCard
                step="3"
                title="Search Receipts"
                description="Use the search bar to find specific receipts by supplier or purchase order"
                icon={<Search className="w-5 h-5" />}
              />
              <StepCard
                step="4"
                title="Create Receipt"
                description="Click 'Receive Goods' to open the receipt creation modal"
                icon={<Plus className="w-5 h-5" />}
              />
              <StepCard
                step="5"
                title="Fill Receipt Details"
                description="Complete the Receipt Details tab with supplier, purchase order, company, warehouse, and delivery information"
                icon={<FileText className="w-5 h-5" />}
              />
              <StepCard
                step="6"
                title="Add Items"
                description="Switch to Receipt Items tab and add items with received quantity, rate, and batch information"
                icon={<Package className="w-5 h-5" />}
              />
              <StepCard
                step="7"
                title="Submit Receipt"
                description="Review the summary and submit the goods receipt to update inventory"
                icon={<FileText className="w-5 h-5" />}
              />
            </div>
          </section>

          {/* Receipt Details Tab */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              Receipt Details Tab
            </h3>
            <div className="space-y-4">
              <FieldCard
                title="Supplier"
                description="Select the supplier from the dropdown (required). This is who delivered the goods."
                required={true}
              />
              <FieldCard
                title="Purchase Order"
                description="Select the linked purchase order (optional). Auto-populates items from the PO for faster receipt creation."
                required={false}
              />
              <FieldCard
                title="Company"
                description="Select the company for this goods receipt (required). Ensures proper company association."
                required={true}
              />
              <FieldCard
                title="Requesting Department (Warehouse)"
                description="Select the warehouse where goods will be stored (required). Updates inventory in this location."
                required={true}
              />
              <FieldCard
                title="Delivery Note Number"
                description="Enter the supplier's delivery note number. Maps to supplier_delivery_note field."
                required={false}
              />
              <FieldCard
                title="Supplier Invoice Number"
                description="Enter the supplier's invoice number for reference and accounting."
                required={false}
              />
              <FieldCard
                title="Invoice Date"
                description="Select the date on the supplier's invoice. Maps to posting_date field."
                required={false}
              />
              <FieldCard
                title="Overall Notes (Supplier Performance)"
                description="Add notes about supplier performance, delivery quality, or any issues with the shipment."
                required={false}
              />
            </div>
          </section>

          {/* Receipt Items Tab */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" />
              Receipt Items Tab
            </h3>
            <div className="space-y-4">
              <FieldCard
                title="Add Item Button"
                description="Click to add a new item row to the goods receipt. At least one item is required."
                required={true}
              />
              <FieldCard
                title="Ingredient"
                description="Select the item from the dropdown. This is the product being received."
                required={true}
              />
              <FieldCard
                title="Received Qty"
                description="Enter the quantity of items actually received. Must be a positive number."
                required={true}
              />
              <FieldCard
                title="Rate"
                description="Enter the unit price per item. This is the cost from the supplier invoice."
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
                title="Batch No"
                description="Enter the batch number for tracking (if applicable). Required for items with batch tracking."
                required={false}
              />
              <FieldCard
                title="VAT Exempt Item"
                description="Check if this item is VAT exempt. VAT is not calculated for exempt items."
                required={false}
              />
              <FieldCard
                title="Notes"
                description="Add item-specific notes about the received goods, quality, or condition."
                required={false}
              />
            </div>
          </section>

          {/* Receipt Status Explained */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              Receipt Status Explained
            </h3>
            <div className="space-y-3">
              <TypeCard
                title="Draft"
                description="Receipt is created but not yet submitted. Can be edited or deleted."
                color="gray"
              />
              <TypeCard
                title="Completed"
                description="Receipt submitted and processed. Inventory updated, accounting entries created."
                color="green"
              />
              <TypeCard
                title="Cancelled"
                description="Receipt cancelled. Inventory reverted if applicable."
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
                title="Total Receipts"
                description="Total number of goods receipts in the system, including all statuses."
                example="Total Receipts: 200 (all receipts ever created)"
              />
              <PropertyCard
                title="Pending Receipts"
                description="Number of receipts in Draft status. Not yet submitted to update inventory."
                example="Pending Receipts: 15 (receipts awaiting submission)"
              />
              <PropertyCard
                title="Monthly Receipts"
                description="Total number of goods receipts created in the current month."
                example="Monthly Receipts: 45 (this month's receipts)"
              />
              <PropertyCard
                title="Total Value"
                description="Total monetary value of all goods receipts in the system."
                example="Total Value: KSh 2,500,000 (cumulative receipt value)"
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
              <TipItem text="Always link receipts to purchase orders when possible for better tracking" />
              <TipItem text="Verify received quantities match the purchase order before submitting" />
              <TipItem text="Record batch numbers for items requiring batch tracking" />
              <TipItem text="Use delivery note numbers from suppliers for proper documentation" />
              <TipItem text="Check item quality before recording receipt in the system" />
              <TipItem text="Add notes about any discrepancies or damaged goods" />
              <TipItem text="Mark VAT exempt items correctly to avoid tax calculation errors" />
              <TipItem text="Review supplier performance notes to improve future procurement" />
              <TipItem text="Submit receipts promptly to keep inventory accurate" />
              <TipItem text="Use warehouse selection to ensure inventory updates in the correct location" />
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

export default InventoryManagementGoodsReceiptsDocumentation;
