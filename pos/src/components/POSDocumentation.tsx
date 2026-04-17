import React from 'react';
import { X, BookOpen, ShoppingCart, Utensils, Filter, Search, MessageSquare, CreditCard, LayoutGrid, User, Table } from 'lucide-react';

interface POSDocumentationProps {
  isOpen: boolean;
  onClose: () => void;
}

const POSDocumentation: React.FC<POSDocumentationProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">POS System Documentation</h2>
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
              <LayoutGrid className="w-5 h-5 text-blue-600" />
              Overview
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              The Point of Sale (POS) system is designed for efficient order management in restaurants and food service establishments. 
              It provides an intuitive interface for selecting menu items, customizing orders, managing customer details, and processing payments.
            </p>
          </section>

          {/* Key Features */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-600" />
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<ShoppingCart className="w-5 h-5" />}
                title="Menu Browsing"
                description="Browse and search through menu items organized by categories with visual cards"
              />
              <FeatureCard
                icon={<Utensils className="w-5 h-5" />}
                title="Item Customization"
                description="Customize items with variants, addons, and special instructions"
              />
              <FeatureCard
                icon={<Filter className="w-5 h-5" />}
                title="Quick Filters"
                description="Filter items by category or special items for faster selection"
              />
              <FeatureCard
                icon={<Search className="w-5 h-5" />}
                title="Search Functionality"
                description="Quick search menu items by name or item code"
              />
              <FeatureCard
                icon={<User className="w-5 h-5" />}
                title="Customer Management"
                description="Select customers and assign tables for dine-in orders"
              />
              <FeatureCard
                icon={<MessageSquare className="w-5 h-5" />}
                title="Order Comments"
                description="Add special comments and instructions to orders"
              />
            </div>
          </section>

          {/* How to Use */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              How to Use
            </h3>
            <div className="space-y-4">
              <StepCard
                step="1"
                title="Select Order Type"
                description="Choose the order type from the dropdown (Dine-in, Takeaway, Delivery, Aggregators)"
                icon={<Table className="w-5 h-5" />}
              />
              <StepCard
                step="2"
                title="Select Customer"
                description="Choose a customer from the customer list. For dine-in orders, also select a table"
                icon={<User className="w-5 h-5" />}
              />
              <StepCard
                step="3"
                title="Browse Menu"
                description="Navigate through menu categories or use the search bar to find items"
                icon={<LayoutGrid className="w-5 h-5" />}
              />
              <StepCard
                step="4"
                title="Add Items to Cart"
                description="Single-click to add items, double-click to customize with variants and addons"
                icon={<ShoppingCart className="w-5 h-5" />}
              />
              <StepCard
                step="5"
                title="Modify Order"
                description="Adjust quantities, remove items, or add comments to your order"
                icon={<Edit className="w-5 h-5" />}
              />
              <StepCard
                step="6"
                title="Submit Order"
                description="Review the total and click 'Add New Order' to submit the order to the kitchen"
                icon={<CreditCard className="w-5 h-5" />}
              />
            </div>
          </section>

          {/* Order Types */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-blue-600" />
              Order Types
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <OrderTypeItem type="Dine-in" description="Customers dining at the restaurant. Requires table selection." />
              <OrderTypeItem type="Takeaway" description="Customers picking up orders. No table required." />
              <OrderTypeItem type="Delivery" description="Orders delivered to customer location." />
              <OrderTypeItem type="Aggregators" description="Orders from food delivery platforms like Zomato, Swiggy." />
            </div>
          </section>

          {/* Tips */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-600" />
              Tips & Shortcuts
            </h3>
            <div className="bg-blue-50 rounded-xl p-4 space-y-2">
              <TipItem text="Use Ctrl+K to quickly focus the search bar" />
              <TipItem text="Double-click items to open customization options" />
              <TipItem text="Use quick filters to show special items only" />
              <TipItem text="Add comments to orders for special instructions" />
              <TipItem text="Click the comment icon in order panel to add order-level notes" />
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
      <div className="text-blue-600 mt-0.5">{icon}</div>
      <div>
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </div>
);

const StepCard: React.FC<{ step: string; title: string; description: string; icon: React.ReactNode }> = ({ step, title, description, icon }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
      {step}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <div className="text-blue-600">{icon}</div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
      </div>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  </div>
);

const OrderTypeItem: React.FC<{ type: string; description: string }> = ({ type, description }) => (
  <div className="flex items-start gap-3">
    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
    <div>
      <h4 className="font-semibold text-gray-900">{type}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

const TipItem: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-start gap-2 text-sm text-gray-700">
    <span className="text-blue-600 font-bold">•</span>
    <span>{text}</span>
  </div>
);

const Star = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
  </svg>
);

const Edit = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

export default POSDocumentation;
