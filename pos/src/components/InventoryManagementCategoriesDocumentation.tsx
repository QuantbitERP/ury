import React from 'react';
import { X, BookOpen, Tags, Search, Plus, Edit, Trash2, ChevronRight } from 'lucide-react';

interface InventoryManagementCategoriesDocumentationProps {
  isOpen: boolean;
  onClose: () => void;
}

const InventoryManagementCategoriesDocumentation: React.FC<InventoryManagementCategoriesDocumentationProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Categories Documentation</h2>
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
              <Tags className="w-5 h-5 text-amber-600" />
              Overview
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              The Categories section allows you to manage item categories to organize your inventory. Create hierarchical category structures,
              add descriptions, and manage parent-child relationships. Categories help organize stock items for easier management and reporting.
            </p>
          </section>

          {/* Key Features */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Tags className="w-5 h-5 text-amber-600" />
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<Search className="w-5 h-5" />}
                title="Search Categories"
                description="Search categories by name, display name, or description"
              />
              <FeatureCard
                icon={<Plus className="w-5 h-5" />}
                title="Add Categories"
                description="Create new categories with names, descriptions, and parent relationships"
              />
              <FeatureCard
                icon={<Edit className="w-5 h-5" />}
                title="Edit Categories"
                description="Update category details, parent relationships, and group settings"
              />
              <FeatureCard
                icon={<Trash2 className="w-5 h-5" />}
                title="Delete Categories"
                description="Remove categories with safety checks for linked items"
              />
              <FeatureCard
                icon={<Tags className="w-5 h-5" />}
                title="Hierarchical Structure"
                description="Create parent-child category relationships for better organization"
              />
              <FeatureCard
                icon={<Tags className="w-5 h-5" />}
                title="Item Counts"
                description="View the number of items in each category"
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
                title="Navigate to Categories"
                description="Click 'Categories' in the sidebar to access the category management view"
                icon={<Tags className="w-5 h-5" />}
              />
              <StepCard
                step="2"
                title="Add Category"
                description="Click 'Add Category' to create a new category with details"
                icon={<Plus className="w-5 h-5" />}
              />
              <StepCard
                step="3"
                title="Edit Category"
                description="Click the edit icon on any category to modify its details"
                icon={<Edit className="w-5 h-5" />}
              />
              <StepCard
                step="4"
                title="Delete Category"
                description="Remove categories using the delete icon (with safety checks)"
                icon={<Trash2 className="w-5 h-5" />}
              />
              <StepCard
                step="5"
                title="Return to Stock Items"
                description="Click 'Back to Stock Items' to return to the main inventory view"
                icon={<Tags className="w-5 h-5" />}
              />
            </div>
          </section>

          {/* Add Category Modal Fields */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-600" />
              Add Category Modal Fields
            </h3>
            <div className="space-y-4">
              <FieldCard
                title="Category Name"
                description="Enter the unique category name (required). This is the internal identifier."
                required={true}
              />
              <FieldCard
                title="Display Name"
                description="Enter the display name shown to users. If not set, uses the category name."
                required={false}
              />
              <FieldCard
                title="Description"
                description="Add an optional description to provide more details about the category."
                required={false}
              />
              <FieldCard
                title="Parent Category"
                description="Select a parent category to create a hierarchical structure. Leave empty for root categories."
                required={false}
              />
              <FieldCard
                title="Is Group Category"
                description="Check if this category can have sub-categories. Group categories are organizational containers."
                required={false}
              />
            </div>
          </section>

          {/* Edit Category Modal Fields */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Edit className="w-5 h-5 text-amber-600" />
              Edit Category Modal Fields
            </h3>
            <div className="space-y-4">
              <FieldCard
                title="Category Name"
                description="The category name (read-only). Cannot be changed after creation."
                required={true}
              />
              <FieldCard
                title="Display Name"
                description="Update the display name shown to users."
                required={false}
              />
              <FieldCard
                title="Description"
                description="Update the category description."
                required={false}
              />
              <FieldCard
                title="Parent Category"
                description="Change the parent category to restructure the hierarchy."
                required={false}
              />
              <FieldCard
                title="Is Group Category"
                description="Toggle whether this category can have sub-categories."
                required={false}
              />
            </div>
          </section>

          {/* Category Types */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Tags className="w-5 h-5 text-amber-600" />
              Category Types Explained
            </h3>
            <div className="space-y-3">
              <TypeCard
                title="Regular Category"
                description="A standard category that contains items. Cannot have sub-categories."
                color="blue"
              />
              <TypeCard
                title="Group Category"
                description="An organizational category that can have sub-categories but typically doesn't contain items directly. Used for creating hierarchical structures."
                color="green"
              />
            </div>
          </section>

          {/* Tips */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Tags className="w-5 h-5 text-amber-600" />
              Tips & Best Practices
            </h3>
            <div className="bg-amber-50 rounded-xl p-4 space-y-2">
              <TipItem text="Use meaningful category names that match your menu structure" />
              <TipItem text="Create hierarchical categories for better organization (e.g., Beverages > Hot Drinks)" />
              <TipItem text="Use group categories to organize related categories together" />
              <TipItem text="Add descriptions to clarify category purpose" />
              <TipItem text="Keep category names short and consistent" />
              <TipItem text="Use display names for user-friendly labels" />
              <TipItem text="Review item counts to identify empty categories" />
              <TipItem text="Avoid deleting categories with items; disable them instead" />
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

const TipItem: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-start gap-2 text-sm text-gray-700">
    <span className="text-amber-600 font-bold">•</span>
    <span>{text}</span>
  </div>
);

export default InventoryManagementCategoriesDocumentation;
