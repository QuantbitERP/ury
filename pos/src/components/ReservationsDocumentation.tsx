import React from 'react';
import { X, BookOpen, Calendar, List, Users, Clock, Settings, Plus, ChevronRight } from 'lucide-react';

interface ReservationsDocumentationProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReservationsDocumentation: React.FC<ReservationsDocumentationProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Reservation System Documentation</h2>
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
              <Calendar className="w-5 h-5 text-amber-600" />
              Overview
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              The Reservation System allows you to manage table reservations, bookings, and waitlist efficiently. 
              View reservations by date, manage table status, handle waitlist entries, and configure booking rules. 
              The system supports calendar view, reservation list, table status tracking, and customizable settings.
            </p>
          </section>

          {/* Key Features */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<Calendar className="w-5 h-5" />}
                title="Calendar View"
                description="Visual calendar to view and manage reservations by date"
              />
              <FeatureCard
                icon={<List className="w-5 h-5" />}
                title="Reservation List"
                description="Comprehensive list view with search and filtering capabilities"
              />
              <FeatureCard
                icon={<Users className="w-5 h-5" />}
                title="Table Status"
                description="Track table availability, occupancy, and reservation status"
              />
              <FeatureCard
                icon={<Clock className="w-5 h-5" />}
                title="Waitlist Management"
                description="Manage waitlist entries and seat customers when tables become available"
              />
              <FeatureCard
                icon={<Settings className="w-5 h-5" />}
                title="Configurable Settings"
                description="Customize operating hours, booking rules, and time slots"
              />
              <FeatureCard
                icon={<Plus className="w-5 h-5" />}
                title="Easy CRUD Operations"
                description="Create, edit, and delete reservations with simple forms"
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
                title="Navigate Tabs"
                description="Switch between Calendar View, Reservations, Table Status, Waitlist, and Settings tabs using the tab bar"
                icon={<Calendar className="w-5 h-5" />}
              />
              <StepCard
                step="2"
                title="View Calendar"
                description="Use the mini calendar to select a date and view reservations for that specific date"
                icon={<Calendar className="w-5 h-5" />}
              />
              <StepCard
                step="3"
                title="Create Reservation"
                description="Click 'Add' or 'New' button to create a new reservation with customer details, party size, date, time, and table assignment"
                icon={<Plus className="w-5 h-5" />}
              />
              <StepCard
                step="4"
                title="Manage Waitlist"
                description="Add customers to waitlist when tables are full, and seat them when tables become available"
                icon={<Clock className="w-5 h-5" />}
              />
              <StepCard
                step="5"
                title="Configure Settings"
                description="Customize operating hours, booking rules, maximum party size, and other preferences"
                icon={<Settings className="w-5 h-5" />}
              />
            </div>
          </section>

          {/* Tab Descriptions */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <List className="w-5 h-5 text-amber-600" />
              Tab Descriptions
            </h3>
            <div className="space-y-4">
              <TabCard
                title="Calendar View"
                description="Visual calendar interface to view reservations by date. Select a date to see all reservations for that day and add new reservations."
                icon={<Calendar className="w-5 h-5" />}
              />
              <TabCard
                title="Reservations"
                description="List view of all reservations with search by name, phone, or email. Filter by status (Pending, Confirmed, Completed, Cancelled, No Show) and date range."
                icon={<List className="w-5 h-5" />}
              />
              <TabCard
                title="Table Status"
                description="View all tables with their current status (Available, Reserved, Occupied) and seating capacity. Tables are color-coded for quick identification."
                icon={<Users className="w-5 h-5" />}
              />
              <TabCard
                title="Waitlist"
                description="Manage customers waiting for tables. Filter by status (All, Waiting, Seated), add new entries, mark as seated, or remove from waitlist."
                icon={<Clock className="w-5 h-5" />}
              />
              <TabCard
                title="Settings"
                description="Configure operating hours, default duration, time slot intervals, maximum party size, and booking rules including toggles for same-day booking, phone requirement, auto-confirmation, and waitlist."
                icon={<Settings className="w-5 h-5" />}
              />
            </div>
          </section>

          {/* New Reservation Modal Fields */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-600" />
              New Reservation Modal Fields
            </h3>
            <div className="space-y-4">
              <FieldCard
                title="Customer Name"
                description="Enter the full name of the customer making the reservation (required)."
                required={true}
              />
              <FieldCard
                title="Phone Number"
                description="Enter the customer's phone number for contact purposes (optional)."
                required={false}
              />
              <FieldCard
                title="Email Address"
                description="Enter the customer's email address for confirmation and notifications (optional)."
                required={false}
              />
              <FieldCard
                title="Party Size"
                description="Select the number of guests in the party (1-10 guests)."
                required={false}
              />
              <FieldCard
                title="Date"
                description="Select the reservation date from the calendar (required)."
                required={true}
              />
              <FieldCard
                title="Time"
                description="Select the reservation time from available time slots (required). Time slots are generated based on settings."
                required={true}
              />
              <FieldCard
                title="Duration"
                description="Select the duration of the reservation (1-3 hours)."
                required={false}
              />
              <FieldCard
                title="Status"
                description="Set the reservation status (Pending, Confirmed, Completed, Cancelled, No Show)."
                required={false}
              />
              <FieldCard
                title="Assigned Table"
                description="Select a specific table for the reservation or leave as 'No preference'."
                required={false}
              />
              <FieldCard
                title="Special Requests"
                description="Add any special requirements or notes for this reservation (optional)."
                required={false}
              />
            </div>
          </section>

          {/* Reservation Status */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Reservation Status Flow
            </h3>
            <div className="bg-amber-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#E4B315]"></span>
                <span className="text-sm font-semibold text-gray-700">Pending</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-sm font-semibold text-gray-700">Confirmed</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-sm font-semibold text-gray-700">Completed</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                <span className="text-sm font-semibold text-gray-700">Cancelled</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-sm font-semibold text-gray-700">No Show</span>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              Tips & Best Practices
            </h3>
            <div className="bg-amber-50 rounded-xl p-4 space-y-2">
              <TipItem text="Use the calendar view for quick date-based reservation management" />
              <TipItem text="Enable phone number requirement for better customer communication" />
              <TipItem text="Configure operating hours to match restaurant schedule" />
              <TipItem text="Use waitlist to capture customers when tables are fully booked" />
              <TipItem text="Assign tables in advance to optimize seating arrangements" />
              <TipItem text="Set appropriate time slot intervals for efficient scheduling" />
              <TipItem text="Regularly update reservation status to reflect actual customer attendance" />
              <TipItem text="Use special requests field to note dietary restrictions or special occasions" />
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

const TabCard: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => (
  <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
    <div className="text-amber-600 mt-0.5">{icon}</div>
    <div className="flex-1">
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
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
    <span className="text-amber-600 font-bold">•</span>
    <span>{text}</span>
  </div>
);

export default ReservationsDocumentation;
