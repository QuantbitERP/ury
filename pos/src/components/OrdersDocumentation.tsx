import React from 'react';
import { X, BookOpen, ShoppingCart, Search, Filter, DollarSign, Clock, TrendingUp, Users, Layers, Download, Eye, Printer, Pencil, Ban, LayoutGrid, ChevronRight } from 'lucide-react';

interface OrdersDocumentationProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrdersDocumentation: React.FC<OrdersDocumentationProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Order Management Documentation</h2>
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
              The Order Management system provides a comprehensive view of all restaurant orders with powerful filtering, 
              searching, and management capabilities. Track order status, process payments, transfer orders between waiters, 
              and merge bills efficiently.
            </p>
          </section>

          {/* Key Features */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-blue-600" />
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<Search className="w-5 h-5" />}
                title="Advanced Search"
                description="Search orders by order number, customer name, phone number, or table"
              />
              <FeatureCard
                icon={<Filter className="w-5 h-5" />}
                title="Multi-Level Filtering"
                description="Filter by date range, service type, order status, and payment status"
              />
              <FeatureCard
                icon={<DollarSign className="w-5 h-5" />}
                title="Revenue Tracking"
                description="View daily revenue, order counts, and average order value in real-time"
              />
              <FeatureCard
                icon={<Clock className="w-5 h-5" />}
                title="Pending Orders Alert"
                description="Visual indicator for orders that need attention (Draft, Unbilled, Pending)"
              />
              <FeatureCard
                icon={<Users className="w-5 h-5" />}
                title="Waiter Transfer"
                description="Transfer orders between waiters with bulk selection capability"
              />
              <FeatureCard
                icon={<Layers className="w-5 h-5" />}
                title="Bill Merging"
                description="Merge multiple orders into a single consolidated bill"
              />
              <FeatureCard
                icon={<Download className="w-5 h-5" />}
                title="Export to CSV"
                description="Export filtered orders to CSV for external reporting"
              />
              <FeatureCard
                icon={<Eye className="w-5 h-5" />}
                title="Order Details"
                description="View complete order information including items, taxes, and totals"
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
                title="View Dashboard Statistics"
                description="Monitor key metrics at a glance: Revenue Today, Today's Orders, Pending Orders, and Average Order Value"
                icon={<TrendingUp className="w-5 h-5" />}
              />
              <StepCard
                step="2"
                title="Filter Orders"
                description="Use quick date filters (Today, Yesterday, Last 7 Days, etc.) or advanced filters to narrow down orders"
                icon={<Filter className="w-5 h-5" />}
              />
              <StepCard
                step="3"
                title="Search Orders"
                description="Type in the search bar to find orders by order #, customer name, phone, or table number"
                icon={<Search className="w-5 h-5" />}
              />
              <StepCard
                step="4"
                title="View Order Details"
                description="Click on an order number to view complete details including items, taxes, and totals"
                icon={<Eye className="w-5 h-5" />}
              />
              <StepCard
                step="5"
                title="Process Actions"
                description="Use action buttons to print receipt, process payment, edit, or cancel orders"
                icon={<ChevronRight className="w-5 h-5" />}
              />
              <StepCard
                step="6"
                title="Transfer Waiters"
                description="Click 'Transfer Waiter' to bulk select orders and transfer to another waiter"
                icon={<Users className="w-5 h-5" />}
              />
              <StepCard
                step="7"
                title="Merge Bills"
                description="Click 'Merge Bills' to select multiple orders and combine them into one bill"
                icon={<Layers className="w-5 h-5" />}
              />
            </div>
          </section>

          {/* Order Status Flow */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-blue-600" />
              Order Status Flow
            </h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <StatusBadge status="Draft" description="Order created but not finalized" color="gray" />
                <ArrowIcon />
                <StatusBadge status="Unbilled" description="Order finalized, awaiting payment" color="orange" />
                <ArrowIcon />
                <StatusBadge status="Paid" description="Payment completed" color="green" />
                <ArrowIcon />
                <StatusBadge status="Completed" description="Order fully processed" color="green" />
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-blue-600" />
              Action Buttons
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ActionButton
                icon={<Eye className="w-4 h-4" />}
                title="View"
                description="View order details in a modal popup"
              />
              <ActionButton
                icon={<Printer className="w-4 h-4" />}
                title="Print Receipt"
                description="Print order receipt for customer"
              />
              <ActionButton
                icon={<DollarSign className="w-4 h-4" />}
                title="Process Payment"
                description="Open payment dialog to collect payment"
              />
              <ActionButton
                icon={<Pencil className="w-4 h-4" />}
                title="Edit Order"
                description="Edit order and send back to POS for modification"
              />
              <ActionButton
                icon={<Ban className="w-4 h-4" />}
                title="Cancel Order"
                description="Cancel order with reason (requires confirmation)"
              />
              <ActionButton
                icon={<Download className="w-4 h-4" />}
                title="Export CSV"
                description="Export filtered orders to CSV file"
              />
            </div>
          </section>

          {/* Tips */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-blue-600" />
              Tips & Best Practices
            </h3>
            <div className="bg-blue-50 rounded-xl p-4 space-y-2">
              <TipItem text="Use quick date filters to quickly view orders from specific time periods" />
              <TipItem text="Combine multiple filters to narrow down to specific order types or statuses" />
              <TipItem text="Click on order numbers to view complete details before taking action" />
              <TipItem text="Use Transfer Waiter to reassign multiple orders to a different staff member" />
              <TipItem text="Merge Bills when customers want to combine multiple orders into one payment" />
              <TipItem text="Export to CSV for external reporting or analysis" />
              <TipItem text="Pay attention to Pending Orders alert - these need immediate attention" />
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

const StatusBadge: React.FC<{ status: string; description: string; color: string }> = ({ status, description, color }) => {
  const colors = {
    gray: 'bg-gray-100 text-gray-700 border-gray-300',
    orange: 'bg-orange-100 text-orange-700 border-orange-300',
    green: 'bg-green-100 text-green-700 border-green-300',
  };
  return (
    <div className="text-center">
      <div className={`px-4 py-2 rounded-lg border ${colors[color as keyof typeof colors]} font-semibold text-sm mb-1`}>
        {status}
      </div>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
};

const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ActionButton: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="flex items-start gap-3">
    <div className="text-blue-600 mt-0.5">{icon}</div>
    <div>
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
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

export default OrdersDocumentation;
