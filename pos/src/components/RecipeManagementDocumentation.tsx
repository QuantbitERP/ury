import React from 'react';
import { X, BookOpen, Package, Search, Plus, Edit2, Trash2, Printer, LayoutGrid, ChevronRight, DollarSign, TrendingUp } from 'lucide-react';

interface RecipeManagementDocumentationProps {
  isOpen: boolean;
  onClose: () => void;
}

const RecipeManagementDocumentation: React.FC<RecipeManagementDocumentationProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Recipe Management Documentation</h2>
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
              <LayoutGrid className="w-5 h-5 text-green-600" />
              Overview
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              The Recipe Management system allows you to create and manage Bill of Materials (BOM) for your menu items. 
              Define recipes with ingredients, calculate costs, set sell prices, and track gross margins. Link recipes to menu items 
              for proper inventory tracking and cost management.
            </p>
          </section>

          {/* Key Features */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-green-600" />
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<Package className="w-5 h-5" />}
                title="BOM Management"
                description="Create, edit, and delete Bill of Materials with ingredient lists"
              />
              <FeatureCard
                icon={<DollarSign className="w-5 h-5" />}
                title="Cost Calculation"
                description="Automatic cost calculation based on ingredient quantities and rates"
              />
              <FeatureCard
                icon={<TrendingUp className="w-5 h-5" />}
                title="Gross Margin Tracking"
                description="Track gross margin percentage between cost and sell price"
              />
              <FeatureCard
                icon={<Search className="w-5 h-5" />}
                title="Item Search"
                description="Search and select ingredients from Item doctype with rates"
              />
              <FeatureCard
                icon={<Plus className="w-5 h-5" />}
                title="Multi-Ingredient Recipes"
                description="Add multiple ingredients with quantities and units of measure"
              />
              <FeatureCard
                icon={<Printer className="w-5 h-5" />}
                title="Print Recipes"
                description="Print recipe list for kitchen reference or documentation"
              />
            </div>
          </section>

          {/* How to Use */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-green-600" />
              How to Use
            </h3>
            <div className="space-y-4">
              <StepCard
                step="1"
                title="View All Recipes"
                description="Browse all recipes in a table with recipe name, menu item link, cost, sell price, gross margin, and ingredient count"
                icon={<LayoutGrid className="w-5 h-5" />}
              />
              <StepCard
                step="2"
                title="Search Recipes"
                description="Use the search bar to quickly find recipes by name, item code, or description"
                icon={<Search className="w-5 h-5" />}
              />
              <StepCard
                step="3"
                title="Add New Recipe"
                description="Click 'Add Recipe' to create a new BOM with ingredients and pricing"
                icon={<Plus className="w-5 h-5" />}
              />
              <StepCard
                step="4"
                title="Edit Recipes"
                description="Click 'Edit' to modify recipe details, ingredients, or pricing"
                icon={<Edit2 className="w-5 h-5" />}
              />
              <StepCard
                step="5"
                title="Delete Recipes"
                description="Click 'Delete' to remove recipes (requires confirmation)"
                icon={<Trash2 className="w-5 h-5" />}
              />
              <StepCard
                step="6"
                title="Print Recipes"
                description="Click 'Print' to print the recipe list for reference"
                icon={<Printer className="w-5 h-5" />}
              />
            </div>
          </section>

          {/* Recipe Modal Fields */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              Recipe Modal Fields
            </h3>
            <div className="space-y-4">
              <FieldCard
                title="Recipe Name"
                description="Enter a descriptive name for the recipe (e.g., Grilled Chicken)"
                required={true}
              />
              <FieldCard
                title="Link to Menu Item"
                description="Search and select a menu item to link this recipe to. This links the BOM to a menu item for inventory tracking."
                required={false}
              />
              <FieldCard
                title="Company"
                description="Select the company this recipe belongs to. This ensures proper company association for reporting and permissions."
                required={true}
              />
              <FieldCard
                title="Description"
                description="Add a short description of the recipe for reference (optional)"
                required={false}
              />
              <FieldCard
                title="Sell Price"
                description="Enter the selling price for this recipe. Used to calculate gross margin."
                required={false}
              />
              <FieldCard
                title="Ingredients"
                description="Add ingredients to the recipe by searching items, entering quantities, and specifying units of measure. The system automatically calculates line costs and total cost."
                required={true}
              />
            </div>
          </section>

          {/* Ingredients Section */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              Managing Ingredients
            </h3>
            <div className="space-y-4">
              <StepCard
                step="1"
                title="Add Ingredient Row"
                description="Click 'Add Row' to add a new ingredient line to the recipe"
                icon={<Plus className="w-5 h-5" />}
              />
              <StepCard
                step="2"
                title="Search Ingredient"
                description="Type in the item search field to find ingredients from the Item doctype. The search shows item name, code, and rate."
                icon={<Search className="w-5 h-5" />}
              />
              <StepCard
                step="3"
                title="Enter Quantity"
                description="Enter the quantity of the ingredient needed for this recipe"
                icon={<LayoutGrid className="w-5 h-5" />}
              />
              <StepCard
                step="4"
                title="Specify UOM"
                description="Enter the unit of measure (e.g., kg, pcs, liters) for the ingredient"
                icon={<LayoutGrid className="w-5 h-5" />}
              />
              <StepCard
                step="5"
                title="View Line Cost"
                description="The system automatically calculates line cost as quantity × rate"
                icon={<DollarSign className="w-5 h-5" />}
              />
              <StepCard
                step="6"
                title="Remove Ingredient"
                description="Click the X button to remove an ingredient row"
                icon={<Trash2 className="w-5 h-5" />}
              />
            </div>
          </section>

          {/* Tips */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-green-600" />
              Tips & Best Practices
            </h3>
            <div className="bg-green-50 rounded-xl p-4 space-y-2">
              <TipItem text="Always link recipes to menu items for proper inventory tracking" />
              <TipItem text="Set sell prices to track gross margins and profitability" />
              <TipItem text="Use descriptive recipe names for easy identification" />
              <TipItem text="Regularly review and update ingredient rates for accurate cost calculation" />
              <TipItem text="Use the company field to maintain data integrity across multi-company setups" />
              <TipItem text="Print recipe lists for kitchen staff reference" />
              <TipItem text="Review gross margins to identify high and low profitability items" />
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
      <div className="text-green-600 mt-0.5">{icon}</div>
      <div>
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </div>
);

const StepCard: React.FC<{ step: string; title: string; description: string; icon: React.ReactNode }> = ({ step, title, description, icon }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
      {step}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <div className="text-green-600">{icon}</div>
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

const TipItem: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-start gap-2 text-sm text-gray-700">
    <span className="text-green-600 font-bold">•</span>
    <span>{text}</span>
  </div>
);

export default RecipeManagementDocumentation;
