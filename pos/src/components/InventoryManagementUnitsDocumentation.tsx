import React from 'react';
import { X, BookOpen, Ruler, Search, Plus, Edit, Trash2, ChevronRight } from 'lucide-react';

interface InventoryManagementUnitsDocumentationProps {
  isOpen: boolean;
  onClose: () => void;
}

const InventoryManagementUnitsDocumentation: React.FC<InventoryManagementUnitsDocumentationProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Units Documentation</h2>
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
              <Ruler className="w-5 h-5 text-amber-600" />
              Overview
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              The Units section allows you to manage measurement units (UOM - Units of Measure) for your inventory items. 
              Create custom units, define their properties, and organize them by categories like Weight, Volume, Count, and Custom. 
              Units are essential for accurate inventory tracking, recipe calculations, and stock management.
            </p>
          </section>

          {/* Key Features */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Ruler className="w-5 h-5 text-amber-600" />
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<Search className="w-5 h-5" />}
                title="Search Units"
                description="Search units by code, name, or description with real-time filtering"
              />
              <FeatureCard
                icon={<Plus className="w-5 h-5" />}
                title="Add Custom Units"
                description="Create new units with specific properties and validation rules"
              />
              <FeatureCard
                icon={<Edit className="w-5 h-5" />}
                title="Edit Units"
                description="Modify existing unit properties and settings"
              />
              <FeatureCard
                icon={<Trash2 className="w-5 h-5" />}
                title="Delete Units"
                description="Remove unused units with safety checks for linked items"
              />
              <FeatureCard
                icon={<Ruler className="w-5 h-5" />}
                title="Category Filtering"
                description="Filter units by Weight, Volume, Count, or Custom categories"
              />
              <FeatureCard
                icon={<Ruler className="w-5 h-5" />}
                title="Unit Properties"
                description="Configure whole numbers, fractional quantities, and enable/disable status"
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
                title="Navigate to Units"
                description="Click 'Units' in the sidebar to access the units management view"
                icon={<Ruler className="w-5 h-5" />}
              />
              <StepCard
                step="2"
                title="Search Units"
                description="Use the search bar to find specific units by code, name, or description"
                icon={<Search className="w-5 h-5" />}
              />
              <StepCard
                step="3"
                title="Filter by Category"
                description="Use the category dropdown to filter units by Weight, Volume, Count, or Custom"
                icon={<Ruler className="w-5 h-5" />}
              />
              <StepCard
                step="4"
                title="Add Unit"
                description="Click 'Add Custom Unit' to create a new measurement unit"
                icon={<Plus className="w-5 h-5" />}
              />
              <StepCard
                step="5"
                title="Edit Unit"
                description="Click the edit icon to modify existing unit properties"
                icon={<Edit className="w-5 h-5" />}
              />
              <StepCard
                step="6"
                title="Delete Unit"
                description="Click the delete icon to remove units (with safety checks)"
                icon={<Trash2 className="w-5 h-5" />}
              />
            </div>
          </section>

          {/* Add Unit Modal Fields */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-600" />
              Add Unit Modal Fields
            </h3>
            <div className="space-y-4">
              <FieldCard
                title="Unit Code"
                description="Enter the unique unit code (required). This is the internal identifier used in calculations and API calls. Examples: kg, l, pcs."
                required={true}
              />
              <FieldCard
                title="Unit Name"
                description="Enter the display name for the unit (required). This is shown to users throughout the system. Examples: Kilogram, Liter, Pieces."
                required={true}
              />
              <FieldCard
                title="Description"
                description="Add an optional description to provide more details about the unit's purpose or usage."
                required={false}
              />
              <FieldCard
                title="Must be Whole Numbers"
                description="Check if this unit only accepts whole numbers (no fractions). Useful for count-based units like pieces or boxes."
                required={false}
              />
              <FieldCard
                title="Allow Fractional Quantities"
                description="Check if this unit accepts fractional values (e.g., 1.5 kg, 0.75 l). Useful for weight and volume units."
                required={false}
              />
              <FieldCard
                title="Enable This Unit"
                description="Check to make this unit available for use in inventory items and transactions. Uncheck to disable without deleting."
                required={false}
              />
            </div>
          </section>

          {/* Edit Unit Modal Fields */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Edit className="w-5 h-5 text-amber-600" />
              Edit Unit Modal Fields
            </h3>
            <div className="space-y-4">
              <FieldCard
                title="Unit Code"
                description="The unit code (read-only). Cannot be changed after creation as it's used in calculations and references."
                required={true}
              />
              <FieldCard
                title="Unit Name"
                description="Update the display name shown to users throughout the system."
                required={true}
              />
              <FieldCard
                title="Description"
                description="Update the unit description with additional details about usage."
                required={false}
              />
              <FieldCard
                title="Must be Whole Numbers"
                description="Toggle whether this unit accepts only whole numbers or allows fractions."
                required={false}
              />
              <FieldCard
                title="Allow Fractional Quantities"
                description="Toggle whether this unit accepts fractional values like 1.5 or 0.75."
                required={false}
              />
              <FieldCard
                title="Enable This Unit"
                description="Toggle the unit's availability status. Disabled units cannot be used in new items."
                required={false}
              />
            </div>
          </section>

          {/* Unit Categories */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Ruler className="w-5 h-5 text-amber-600" />
              Unit Categories Explained
            </h3>
            <div className="space-y-3">
              <TypeCard
                title="Weight"
                description="Units for measuring weight and mass. Common examples: grams (g), kilograms (kg), pounds (lb), ounces (oz). Typically allow fractional quantities."
                color="blue"
              />
              <TypeCard
                title="Volume"
                description="Units for measuring volume and capacity. Common examples: milliliters (ml), liters (l), gallons (gal). Typically allow fractional quantities."
                color="green"
              />
              <TypeCard
                title="Count"
                description="Units for counting discrete items. Common examples: pieces (pcs), pairs, dozen, pack. Typically require whole numbers only."
                color="purple"
              />
              <TypeCard
                title="Custom"
                description="Specialized units that don't fit into standard categories. Can be any custom measurement unit your business needs."
                color="orange"
              />
            </div>
          </section>

          {/* Unit Properties */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Ruler className="w-5 h-5 text-amber-600" />
              Unit Properties Explained
            </h3>
            <div className="space-y-3">
              <PropertyCard
                title="Whole Numbers Only"
                description="When checked, the unit only accepts integer values (1, 2, 3). Used for count-based units where fractions don't make sense."
                example="Pieces: 5 pcs (valid), 2.5 pcs (invalid)"
              />
              <PropertyCard
                title="Fractional Quantities Allowed"
                description="When checked, the unit accepts decimal values (1.5, 0.75, 2.25). Used for weight and volume measurements."
                example="Weight: 1.5 kg (valid), 2.75 lb (valid)"
              />
              <PropertyCard
                title="Enabled Status"
                description="Controls whether the unit can be selected for new inventory items. Disabled units remain in system but cannot be used."
                example="Active: Available for new items | Disabled: Only existing items can use it"
              />
            </div>
          </section>

          {/* Tips */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Ruler className="w-5 h-5 text-amber-600" />
              Tips & Best Practices
            </h3>
            <div className="bg-amber-50 rounded-xl p-4 space-y-2">
              <TipItem text="Use descriptive unit names that are easily understood by all users" />
              <TipItem text="Set appropriate fractional/whole number rules based on how the unit is actually used" />
              <TipItem text="Keep unit codes short and standardized (kg, l, pcs) for easier data entry" />
              <TipItem text="Use descriptions to clarify when units might be confused (e.g., 'Large pack vs Small pack')" />
              <TipItem text="Disable unused units instead of deleting them to maintain historical data integrity" />
              <TipItem text="Regular categories help users find the right units quickly" />
              <TipItem text="Test new units with sample inventory items before deploying to production" />
              <TipItem text="Consider conversion factors when creating related units (e.g., kg to g)" />
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
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200',
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

export default InventoryManagementUnitsDocumentation;
