import React from 'react';
import { X, BookOpen, Factory, Plus, Package, BarChart2, Clock, CheckCircle, TrendingUp, LayoutGrid, ChevronRight } from 'lucide-react';

interface ManufacturingDocumentationProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManufacturingDocumentation: React.FC<ManufacturingDocumentationProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Manufacturing Documentation</h2>
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
              <LayoutGrid className="w-5 h-5 text-orange-600" />
              Overview
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              The Manufacturing system allows you to manage batch production, prep work, and production orders. 
              Create production orders based on recipes (BOMs), track stock requirements, and monitor production status. 
              The system automatically calculates ingredient requirements and checks stock availability before creating orders.
            </p>
          </section>

          {/* Key Features */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-orange-600" />
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<Factory className="w-5 h-5" />}
                title="Production Orders"
                description="Create and manage production orders with automatic stock calculation"
              />
              <FeatureCard
                icon={<Package className="w-5 h-5" />}
                title="Stock Validation"
                description="Automatic stock availability check before creating production orders"
              />
              <FeatureCard
                icon={<BarChart2 className="w-5 h-5" />}
                title="Dashboard Stats"
                description="View today's orders, in-progress orders, and completed orders"
              />
              <FeatureCard
                icon={<TrendingUp className="w-5 h-5" />}
                title="Cost Tracking"
                description="Track production costs based on ingredient rates and quantities"
              />
              <FeatureCard
                icon={<Clock className="w-5 h-5" />}
                title="Status Monitoring"
                description="Track production status from In Process to Completed"
              />
              <FeatureCard
                icon={<Plus className="w-5 h-5" />}
                title="Batch Management"
                description="Assign batch numbers and departments for production tracking"
              />
            </div>
          </section>

          {/* How to Use */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-600" />
              How to Use
            </h3>
            <div className="space-y-4">
              <StepCard
                step="1"
                title="View Dashboard Stats"
                description="View production statistics including today's orders, in-progress orders, completed this week, and production efficiency"
                icon={<BarChart2 className="w-5 h-5" />}
              />
              <StepCard
                step="2"
                title="View Production Orders"
                description="Browse all production orders in a table with production number, recipe, quantity, status, department, date, and cost"
                icon={<LayoutGrid className="w-5 h-5" />}
              />
              <StepCard
                step="3"
                title="Create Production Order"
                description="Click 'New Production Order' to create a new production order with recipe selection and stock validation"
                icon={<Plus className="w-5 h-5" />}
              />
            </div>
          </section>

          {/* New Production Order Modal Fields */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Factory className="w-5 h-5 text-orange-600" />
              New Production Order Modal Fields
            </h3>
            <div className="space-y-4">
              <FieldCard
                title="Recipe / Item to Produce"
                description="Select the recipe (BOM) to produce. The system will automatically load ingredients and calculate requirements. Only submitted BOMs are available."
                required={true}
              />
              <FieldCard
                title="Quantity to Produce"
                description="Enter the quantity of items to produce. The system will calculate required ingredient quantities based on this number."
                required={true}
              />
              <FieldCard
                title="Production Date"
                description="Select the date for production planning. Defaults to today's date."
                required={true}
              />
              <FieldCard
                title="Department (Optional)"
                description="Select the department for production tracking. Options include Main Store, Kitchen, Bakery, and Cold Storage."
                required={false}
              />
              <FieldCard
                title="Batch Number (Optional)"
                description="Enter a batch number for production tracking and traceability (e.g., BATCH-001)."
                required={false}
              />
              <FieldCard
                title="Notes"
                description="Add any additional notes or instructions for this production order (optional)."
                required={false}
              />
              <FieldCard
                title="Required Ingredients"
                description="View the required ingredients with quantities, available stock, and cost. The system shows stock availability status (sufficient/insufficient)."
                required={true}
              />
            </div>
          </section>

          {/* Production Order Status */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Production Order Status Flow
            </h3>
            <div className="bg-orange-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                <span className="text-sm font-semibold text-gray-700">Draft</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#E4B315]"></span>
                <span className="text-sm font-semibold text-gray-700">In Process / In Progress</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-sm font-semibold text-gray-700">Completed</span>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-orange-600" />
              Tips & Best Practices
            </h3>
            <div className="bg-orange-50 rounded-xl p-4 space-y-2">
              <TipItem text="Always check stock availability before creating production orders to avoid stockouts" />
              <TipItem text="Use batch numbers for better production tracking and traceability" />
              <TipItem text="Assign departments to organize production workflow" />
              <TipItem text="Monitor production status to track order completion" />
              <TipItem text="Review production costs to ensure profitability" />
              <TipItem text="Only submitted BOMs can be used for production orders" />
              <TipItem text="Use the ingredients table to verify stock before creating orders" />
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
      <div className="text-orange-600 mt-0.5">{icon}</div>
      <div>
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </div>
);

const StepCard: React.FC<{ step: string; title: string; description: string; icon: React.ReactNode }> = ({ step, title, description, icon }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
      {step}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <div className="text-orange-600">{icon}</div>
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
    <span className="text-orange-600 font-bold">•</span>
    <span>{text}</span>
  </div>
);

export default ManufacturingDocumentation;
