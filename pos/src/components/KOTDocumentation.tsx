import React from 'react';
import { X, BookOpen, ChefHat, Clock, Search, RefreshCw, CheckCircle2, UtensilsCrossed, AlertTriangle, LayoutGrid } from 'lucide-react';

interface KOTDocumentationProps {
  isOpen: boolean;
  onClose: () => void;
}

const KOTDocumentation: React.FC<KOTDocumentationProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">KOT System Documentation</h2>
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
              The Kitchen Order Ticket (KOT) System is designed for efficient kitchen workflow management. 
              It provides a real-time view of all orders in the kitchen with status tracking, elapsed time monitoring, 
              and easy status transitions from pending to served.
            </p>
          </section>

          {/* Key Features */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-orange-600" />
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<Clock className="w-5 h-5" />}
                title="Real-Time Status Tracking"
                description="Track orders through three stages: Pending, Preparing, and Ready to Serve"
              />
              <FeatureCard
                icon={<AlertTriangle className="w-5 h-5" />}
                title="Elapsed Time Monitoring"
                description="Visual indicators show how long orders have been in each stage with overdue warnings"
              />
              <FeatureCard
                icon={<Search className="w-5 h-5" />}
                title="Search Functionality"
                description="Quickly search orders by customer name, invoice number, or item name"
              />
              <FeatureCard
                icon={<RefreshCw className="w-5 h-5" />}
                title="Auto-Refresh"
                description="Orders automatically refresh every 30 seconds to keep the display current"
              />
              <FeatureCard
                icon={<CheckCircle2 className="w-5 h-5" />}
                title="One-Click Status Updates"
                description="Easily move orders between stages with single-click action buttons"
              />
              <FeatureCard
                icon={<UtensilsCrossed className="w-5 h-5" />}
                title="Order Details"
                description="View complete order information including items, quantities, and special comments"
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
                title="View Incoming Orders"
                description="Orders appear in the Pending column when received from the POS system"
                icon={<Clock className="w-5 h-5" />}
              />
              <StepCard
                step="2"
                title="Start Preparing"
                description="Click 'Start Preparing' on a pending order to move it to the Preparing column"
                icon={<ChefHat className="w-5 h-5" />}
              />
              <StepCard
                step="3"
                title="Monitor Progress"
                description="Watch the elapsed time badge - orders turn orange after 15 minutes and red after 30 minutes"
                icon={<AlertTriangle className="w-5 h-5" />}
              />
              <StepCard
                step="4"
                title="Mark as Ready"
                description="When food is ready, click 'Mark Ready' to move to the Ready to Serve column"
                icon={<CheckCircle2 className="w-5 h-5" />}
              />
              <StepCard
                step="5"
                title="Mark as Served"
                description="When order is delivered, click 'Mark Served' to complete the order"
                icon={<UtensilsCrossed className="w-5 h-5" />}
              />
              <StepCard
                step="6"
                title="Back to Pending (Optional)"
                description="If needed, click the back arrow to return an order from Preparing to Pending"
                icon={<RefreshCw className="w-5 h-5" />}
              />
            </div>
          </section>

          {/* Order Status Flow */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-orange-600" />
              Order Status Flow
            </h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <StatusBadge status="Ready For Prepare" color="red" description="New orders awaiting preparation" />
                <ArrowIcon />
                <StatusBadge status="Preparing" color="gold" description="Currently being prepared by kitchen staff" />
                <ArrowIcon />
                <StatusBadge status="Ready" color="green" description="Food ready for service" />
                <ArrowIcon />
                <StatusBadge status="Served" color="gray" description="Order completed and served" />
              </div>
            </div>
          </section>

          {/* Time Indicators */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Time Indicators
            </h3>
            <div className="bg-orange-50 rounded-xl p-4 space-y-3">
              <TimeIndicator color="gray" time="0-15 min" description="Normal processing time" />
              <TimeIndicator color="orange" time="15-30 min" description="Order taking longer than usual" />
              <TimeIndicator color="red" time="30+ min" description="Order overdue - requires attention" />
            </div>
          </section>

          {/* Tips */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-orange-600" />
              Tips & Best Practices
            </h3>
            <div className="bg-blue-50 rounded-xl p-4 space-y-2">
              <TipItem text="Use the search bar to quickly find specific orders by customer or item name" />
              <TipItem text="Pay attention to the elapsed time badges - red badges indicate overdue orders" />
              <TipItem text="Click the refresh button to manually update the order list if needed" />
              <TipItem text="Read item comments carefully - they contain special preparation instructions" />
              <TipItem text="Orders auto-refresh every 30 seconds to keep the display current" />
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

const StatusBadge: React.FC<{ status: string; color: string; description: string }> = ({ status, color, description }) => {
  const colors = {
    red: 'bg-red-100 text-red-700 border-red-300',
    gold: 'bg-[#E4B315]/10 text-[#C69A11] border-[#E4B315]/30',
    green: 'bg-green-100 text-green-700 border-green-300',
    gray: 'bg-gray-100 text-gray-700 border-gray-300',
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

const TimeIndicator: React.FC<{ color: string; time: string; description: string }> = ({ color, time, description }) => {
  const colors = {
    gray: 'bg-gray-100 text-gray-700',
    orange: 'bg-orange-100 text-orange-700',
    red: 'bg-red-100 text-red-700',
  };
  return (
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${colors[color as keyof typeof colors]}`} />
      <div className="flex-1">
        <span className="font-semibold text-gray-900">{time}</span>
        <span className="text-gray-500 ml-2">- {description}</span>
      </div>
    </div>
  );
};

const TipItem: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-start gap-2 text-sm text-gray-700">
    <span className="text-orange-600 font-bold">•</span>
    <span>{text}</span>
  </div>
);

export default KOTDocumentation;
