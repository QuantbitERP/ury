import React from 'react';
import { X, BookOpen, Truck, Search, Plus, Edit, Trash2, Building, ChevronRight } from 'lucide-react';

interface InventoryManagementSuppliersDocumentationProps {
  isOpen: boolean;
  onClose: () => void;
}

const InventoryManagementSuppliersDocumentation: React.FC<InventoryManagementSuppliersDocumentationProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Suppliers Documentation</h2>
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
              <Truck className="w-5 h-5 text-amber-600" />
              Overview
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              The Suppliers section allows you to manage your vendor and supplier information. Create detailed supplier profiles 
              with contact information, financial terms, and operational details. Track supplier relationships, set payment terms, 
              and manage credit limits for effective procurement and inventory management.
            </p>
          </section>

          {/* Key Features */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-600" />
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<Search className="w-5 h-5" />}
                title="Search Suppliers"
                description="Search suppliers by name, email, phone, or contact person with real-time filtering"
              />
              <FeatureCard
                icon={<Plus className="w-5 h-5" />}
                title="Add Suppliers"
                description="Create new supplier profiles with comprehensive contact and business information"
              />
              <FeatureCard
                icon={<Edit className="w-5 h-5" />}
                title="Edit Suppliers"
                description="Update supplier details, financial terms, and operational settings"
              />
              <FeatureCard
                icon={<Trash2 className="w-5 h-5" />}
                title="Delete Suppliers"
                description="Remove supplier records with confirmation prompts"
              />
              <FeatureCard
                icon={<Building className="w-5 h-5" />}
                title="Financial Terms"
                description="Set payment terms, credit limits, and price lists for each supplier"
              />
              <FeatureCard
                icon={<Truck className="w-5 h-5" />}
                title="Operations"
                description="Configure lead times, billing/shipping addresses, and enable/disable status"
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
                title="Navigate to Suppliers"
                description="Click 'Suppliers' in the sidebar to access the suppliers management view"
                icon={<Truck className="w-5 h-5" />}
              />
              <StepCard
                step="2"
                title="Search Suppliers"
                description="Use the search bar to find specific suppliers by name, email, phone, or contact person"
                icon={<Search className="w-5 h-5" />}
              />
              <StepCard
                step="3"
                title="Add Supplier"
                description="Click 'Add Supplier' to create a new supplier profile with detailed information"
                icon={<Plus className="w-5 h-5" />}
              />
              <StepCard
                step="4"
                title="Fill Supplier Details"
                description="Complete the Basic Info, Financial Terms, and Operations tabs with required information"
                icon={<Building className="w-5 h-5" />}
              />
              <StepCard
                step="5"
                title="Edit Supplier"
                description="Click the edit icon to modify existing supplier information"
                icon={<Edit className="w-5 h-5" />}
              />
              <StepCard
                step="6"
                title="Delete Supplier"
                description="Click the delete icon to remove a supplier (with confirmation)"
                icon={<Trash2 className="w-5 h-5" />}
              />
            </div>
          </section>

          {/* Add Supplier Modal - Basic Info */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-600" />
              Basic Information Tab
            </h3>
            <div className="space-y-4">
              <FieldCard
                title="Supplier Name"
                description="Enter the supplier's business name (required). This is the primary identifier."
                required={true}
              />
              <FieldCard
                title="Contact Person"
                description="Enter the name of the primary contact person at the supplier."
                required={false}
              />
              <FieldCard
                title="Email"
                description="Enter the supplier's email address for communication."
                required={false}
              />
              <FieldCard
                title="Phone"
                description="Enter the supplier's phone number for quick contact."
                required={false}
              />
              <FieldCard
                title="Address"
                description="Enter the supplier's street address."
                required={false}
              />
              <FieldCard
                title="City"
                description="Enter the city where the supplier is located."
                required={false}
              />
              <FieldCard
                title="Country"
                description="Enter the country where the supplier is located."
                required={false}
              />
              <FieldCard
                title="Tax ID"
                description="Enter the supplier's tax identification number for invoicing and compliance."
                required={false}
              />
              <FieldCard
                title="Supplier Group"
                description="Select a supplier group to categorize suppliers for better organization."
                required={false}
              />
            </div>
          </section>

          {/* Add Supplier Modal - Financial Terms */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-600" />
              Financial Terms Tab
            </h3>
            <div className="space-y-4">
              <FieldCard
                title="Payment Terms"
                description="Select the payment terms template (e.g., 30 days, 45 days). This determines when payment is due."
                required={false}
              />
              <FieldCard
                title="Credit Limit (KES)"
                description="Set the maximum credit limit for this supplier. The system will warn when approaching this limit."
                required={false}
              />
              <FieldCard
                title="Default Price List"
                description="Select the default price list for this supplier. Used when creating purchase orders."
                required={false}
              />
            </div>
          </section>

          {/* Add Supplier Modal - Operations */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-600" />
              Operations Tab
            </h3>
            <div className="space-y-4">
              <FieldCard
                title="Lead Time (days)"
                description="Enter the average lead time in days for deliveries from this supplier. Helps in inventory planning."
                required={false}
              />
              <FieldCard
                title="Enable Supplier"
                description="Check to make this supplier active and available for purchase orders. Uncheck to disable."
                required={false}
              />
              <FieldCard
                title="Billing Address"
                description="Enter the specific billing address for invoices and payments."
                required={false}
              />
              <FieldCard
                title="Shipping Address"
                description="Enter the shipping address where goods should be delivered."
                required={false}
              />
            </div>
          </section>

          {/* Supplier Groups */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-600" />
              Supplier Groups Explained
            </h3>
            <div className="space-y-3">
              <TypeCard
                title="Supplier Groups"
                description="Organize suppliers into logical groups for easier management and reporting. Examples: Food Suppliers, Beverage Suppliers, Equipment Suppliers, Service Providers."
                color="blue"
              />
              <TypeCard
                title="Benefits of Grouping"
                description="Groups help in bulk operations, reporting, and filtering. You can analyze performance by group and apply group-specific policies."
                color="green"
              />
            </div>
          </section>

          {/* Financial Terms Explained */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-600" />
              Financial Terms Explained
            </h3>
            <div className="space-y-3">
              <PropertyCard
                title="Payment Terms"
                description="Defines when payment is due after invoice receipt. Common terms include Net 30 (payment due in 30 days) or Net 45."
                example="Net 30: Payment due 30 days after invoice date"
              />
              <PropertyCard
                title="Credit Limit"
                description="Maximum outstanding balance allowed for this supplier. Prevents over-borrowing and maintains financial control."
                example="Credit Limit: KES 500,000 - Cannot exceed this outstanding balance"
              />
              <PropertyCard
                title="Price List"
                description="Default pricing structure for this supplier. Different suppliers may have different price lists for the same items."
                example="Standard Price List vs. Bulk Purchase Price List"
              />
            </div>
          </section>

          {/* Tips */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-600" />
              Tips & Best Practices
            </h3>
            <div className="bg-amber-50 rounded-xl p-4 space-y-2">
              <TipItem text="Keep supplier information up-to-date with current contact details" />
              <TipItem text="Set appropriate credit limits based on your financial policies" />
              <TipItem text="Use supplier groups to organize vendors by type or importance" />
              <TipItem text="Record accurate lead times for better inventory planning" />
              <TipItem text="Set default price lists to streamline purchase order creation" />
              <TipItem text="Disable inactive suppliers instead of deleting to maintain history" />
              <TipItem text="Regularly review supplier performance and update terms accordingly" />
              <TipItem text="Keep billing and shipping addresses separate if they differ" />
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
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
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

export default InventoryManagementSuppliersDocumentation;
