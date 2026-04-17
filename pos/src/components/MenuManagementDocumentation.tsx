import React from 'react';
import { X, BookOpen, ChefHat, Settings, Download, Search, Plus, Edit2, Trash2, Star, LayoutGrid, ChevronRight } from 'lucide-react';

interface MenuManagementDocumentationProps {
  isOpen: boolean;
  onClose: () => void;
}

const MenuManagementDocumentation: React.FC<MenuManagementDocumentationProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Menu Management Documentation</h2>
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
              <LayoutGrid className="w-5 h-5 text-purple-600" />
              Overview
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              The Menu Management system provides comprehensive tools to manage your restaurant's menu items, categories, and export data. 
              You can add, edit, enable/disable menu items, manage categories with serving priorities, and export menu data for reporting or backup purposes.
            </p>
          </section>

          {/* Key Features */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-purple-600" />
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<ChefHat className="w-5 h-5" />}
                title="Menu Items Management"
                description="Add, edit, enable/disable menu items with price, category, and special dish status"
              />
              <FeatureCard
                icon={<Settings className="w-5 h-5" />}
                title="Categories Management"
                description="Manage menu categories with serving priority and KDS display settings"
              />
              <FeatureCard
                icon={<Search className="w-5 h-5" />}
                title="Search & Filter"
                description="Search menu items by name and filter by category for quick access"
              />
              <FeatureCard
                icon={<Download className="w-5 h-5" />}
                title="Export Data"
                description="Export menu items and categories to CSV for backup or external reporting"
              />
              <FeatureCard
                icon={<Star className="w-5 h-5" />}
                title="Special Dishes"
                description="Mark items as special dishes to highlight them in the POS"
              />
              <FeatureCard
                icon={<Plus className="w-5 h-5" />}
                title="Item Search Integration"
                description="Search existing items from Item doctype when adding new menu items"
              />
            </div>
          </section>

          {/* How to Use - Menu Items */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-purple-600" />
              Menu Items Section
            </h3>
            <div className="space-y-4">
              <StepCard
                step="1"
                title="View All Menu Items"
                description="Browse all menu items in a grid view with name, price, category, and special dish status"
                icon={<LayoutGrid className="w-5 h-5" />}
              />
              <StepCard
                step="2"
                title="Search Items"
                description="Use the search bar to quickly find menu items by name"
                icon={<Search className="w-5 h-5" />}
              />
              <StepCard
                step="3"
                title="Filter by Category"
                description="Click category chips to filter items by specific categories"
                icon={<Settings className="w-5 h-5" />}
              />
              <StepCard
                step="4"
                title="Enable/Disable Items"
                description="Toggle the switch to enable or disable menu items from appearing in POS"
                icon={<ChefHat className="w-5 h-5" />}
              />
              <StepCard
                step="5"
                title="Add New Item"
                description="Click 'Add Menu Item' to add a new menu item with search integration for existing items"
                icon={<Plus className="w-5 h-5" />}
              />
              <StepCard
                step="6"
                title="Edit Items"
                description="Click the edit icon to modify item name, price, category, or special dish status"
                icon={<Edit2 className="w-5 h-5" />}
              />
              <StepCard
                step="7"
                title="Delete Items"
                description="Click the trash icon to delete menu items (checks for linked records before deletion)"
                icon={<Trash2 className="w-5 h-5" />}
              />
            </div>
          </section>

          {/* How to Use - Categories */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              Categories Section
            </h3>
            <div className="space-y-4">
              <StepCard
                step="1"
                title="View Categories"
                description="See all menu categories with their serving priority and KDS display settings"
                icon={<LayoutGrid className="w-5 h-5" />}
              />
              <StepCard
                step="2"
                title="Add Category"
                description="Click 'Add Category' to create a new menu category with name, serving priority, and KDS settings"
                icon={<Plus className="w-5 h-5" />}
              />
              <StepCard
                step="3"
                title="Delete Category"
                description="Delete categories with protection - system checks if category is in use before deletion"
                icon={<Trash2 className="w-5 h-5" />}
              />
              <StepCard
                step="4"
                title="Serving Priority"
                description="Set serving priority to control the order in which categories appear in the kitchen"
                icon={<Settings className="w-5 h-5" />}
              />
              <StepCard
                step="5"
                title="KDS Display"
                description="Toggle 'Show in KDS' to control whether category items appear in Kitchen Display System"
                icon={<ChefHat className="w-5 h-5" />}
              />
            </div>
          </section>

          {/* How to Use - Export */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-purple-600" />
              Export Menu Section
            </h3>
            <div className="space-y-4">
              <StepCard
                step="1"
                title="Export Menu Items"
                description="Download all menu items with details including name, code, price, category, special dish status, and enable status"
                icon={<Download className="w-5 h-5" />}
              />
              <StepCard
                step="2"
                title="Export Categories"
                description="Download all categories with settings including name, serving priority, and KDS display settings"
                icon={<Download className="w-5 h-5" />}
              />
              <StepCard
                step="3"
                title="CSV Format"
                description="Files are downloaded in CSV format with current date in filename (e.g., menu_items_2025-03-07.csv)"
                icon={<Download className="w-5 h-5" />}
              />
            </div>
          </section>

          {/* Tips */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-purple-600" />
              Tips & Best Practices
            </h3>
            <div className="bg-purple-50 rounded-xl p-4 space-y-2">
              <TipItem text="Use the item search when adding menu items to link to existing items from the Item doctype" />
              <TipItem text="Mark popular items as 'Special Dish' to highlight them in the POS interface" />
              <TipItem text="Set serving priority to control the order in which courses appear in the kitchen" />
              <TipItem text="Enable 'Show in KDS' for categories that should appear in the Kitchen Display System" />
              <TipItem text="Regularly export menu data to maintain backups of your menu configuration" />
              <TipItem text="Disable items temporarily instead of deleting them if they might be needed later" />
              <TipItem text="Use category filters to quickly manage items within specific categories" />
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
      <div className="text-purple-600 mt-0.5">{icon}</div>
      <div>
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </div>
);

const StepCard: React.FC<{ step: string; title: string; description: string; icon: React.ReactNode }> = ({ step, title, description, icon }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
      {step}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <div className="text-purple-600">{icon}</div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
      </div>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  </div>
);

const TipItem: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-start gap-2 text-sm text-gray-700">
    <span className="text-purple-600 font-bold">•</span>
    <span>{text}</span>
  </div>
);

export default MenuManagementDocumentation;
