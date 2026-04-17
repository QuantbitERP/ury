import React from 'react';
import { X, BookOpen, Users, Search, Plus, Edit2, FileText, Briefcase, Shield, CreditCard, Phone, Calendar, MapPin, ChevronRight } from 'lucide-react';

interface HRDocumentationProps {
  isOpen: boolean;
  onClose: () => void;
}

const HRDocumentation: React.FC<HRDocumentationProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Human Resources Documentation</h2>
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
              <Users className="w-5 h-5 text-amber-600" />
              Overview
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              The Human Resources module allows you to manage employees, track their employment details,
              and oversee employment contracts. Maintain comprehensive employee records, manage compliance
              information, and monitor contract lifecycles all in one place.
            </p>
          </section>

          {/* Key Features */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-600" />
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<Search className="w-5 h-5" />}
                title="Search Employees"
                description="Search employees by name, email, phone, or employee ID with real-time filtering"
              />
              <FeatureCard
                icon={<Plus className="w-5 h-5" />}
                title="Add Employees"
                description="Create new employee records with a guided 6-step form covering all essential information"
              />
              <FeatureCard
                icon={<Edit2 className="w-5 h-5" />}
                title="Edit Employees"
                description="Update employee information at any time through the edit modal"
              />
              <FeatureCard
                icon={<FileText className="w-5 h-5" />}
                title="Employee Details"
                description="View comprehensive employee profiles with organized sections for personal, employment, contact, and compliance details"
              />
              <FeatureCard
                icon={<Briefcase className="w-5 h-5" />}
                title="Manage Contracts"
                description="Create, edit, and track employment contracts with fulfilment tracking and status monitoring"
              />
              <FeatureCard
                icon={<Shield className="w-5 h-5" />}
                title="Compliance Tracking"
                description="Track KRA PIN, NSSF, NHIF, and other compliance information for each employee"
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
                title="Navigate to HR"
                description="Click 'Human Resources' in the sidebar to access the HR management view"
                icon={<Users className="w-5 h-5" />}
              />
              <StepCard
                step="2"
                title="View Dashboard Stats"
                description="Review summary statistics showing total employees, active employees, on leave, pending leaves, today present, and monthly salary"
                icon={<FileText className="w-5 h-5" />}
              />
              <StepCard
                step="3"
                title="Use Tabs"
                description="Switch between 'Employees' tab for employee management and 'Contracts' tab for contract management"
                icon={<Briefcase className="w-5 h-5" />}
              />
              <StepCard
                step="4"
                title="Search and Filter"
                description="Use the search bar to find employees and filters to narrow by department, status, or employment type"
                icon={<Search className="w-5 h-5" />}
              />
              <StepCard
                step="5"
                title="Add Employee"
                description="Click 'Add Employee' to open the guided 6-step form to create a new employee record"
                icon={<Plus className="w-5 h-5" />}
              />
              <StepCard
                step="6"
                title="View Employee Details"
                description="Click the eye icon to view comprehensive employee information in the detail modal"
                icon={<FileText className="w-5 h-5" />}
              />
              <StepCard
                step="7"
                title="Edit Employee"
                description="Click the edit icon to modify employee information through the same 6-step form"
                icon={<Edit2 className="w-5 h-5" />}
              />
            </div>
          </section>

          {/* Employee Form Steps */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-600" />
              Employee Form - 6 Steps
            </h3>
            <div className="space-y-4">
              <StepDetailCard
                step="1"
                title="Personal Information"
                description="Basic employee details including name, date of birth, gender, and nationality"
                fields={['Employee Number (auto-generated)', 'First Name (required)', 'Last Name (required)', 'Middle Name', 'Date of Birth', 'Gender', 'Nationality']}
                icon={<Users className="w-5 h-5" />}
              />
              <StepDetailCard
                step="2"
                title="Compliance Information"
                description="Tax and social security identification numbers"
                fields={['KRA PIN / PAN', 'NSSF / PF Number', 'NHIF / ESI Number']}
                icon={<Shield className="w-5 h-5" />}
              />
              <StepDetailCard
                step="3"
                title="Banking Details"
                description="Bank account information for salary payments"
                fields={['Bank Name', 'Account Number', 'IFSC / Branch Code']}
                icon={<CreditCard className="w-5 h-5" />}
              />
              <StepDetailCard
                step="4"
                title="Contact Information"
                description="Email and phone contact details"
                fields={['Personal Email', 'Company Email', 'Phone / Cell']}
                icon={<Phone className="w-5 h-5" />}
              />
              <StepDetailCard
                step="5"
                title="Employment Details"
                description="Organizational structure and employment information"
                fields={['Company', 'Department', 'Designation', 'Branch', 'Holiday List', 'Employment Type', 'Date of Joining (required)', 'Reports To']}
                icon={<Briefcase className="w-5 h-5" />}
              />
              <StepDetailCard
                step="6"
                title="Contract Information"
                description="Contract terms and notice period"
                fields={['Contract Type', 'Contract End Date', 'Notice Period (days)']}
                icon={<FileText className="w-5 h-5" />}
              />
            </div>
          </section>

          {/* Contracts Tab */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-600" />
              Contracts Management
            </h3>
            <div className="space-y-4">
              <FieldCard
                title="Contract Sub-Tabs"
                description="Filter contracts by status: Active Contracts, Probation Period, Expiring Soon, or Terminated"
                required={false}
              />
              <FieldCard
                title="New Contract Button"
                description="Click to create a new employment contract for an employee"
                required={false}
              />
              <FieldCard
                title="Contract Table"
                description="View all contracts with employee name, contract number, dates, fulfilment status, and actions"
                required={false}
              />
              <FieldCard
                title="View Contract"
                description="Click the eye icon to view contract details, terms, and fulfilment checklist"
                required={false}
              />
              <FieldCard
                title="Edit Contract"
                description="Click the edit icon to modify contract details (disabled for terminated contracts)"
                required={false}
              />
              <FieldCard
                title="Terminate Contract"
                description="Click 'Terminate Contract' in the detail modal to end a contract (requires confirmation)"
                required={false}
              />
            </div>
          </section>

          {/* Employee Status Explained */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              Employee Status Explained
            </h3>
            <div className="space-y-3">
              <TypeCard
                title="Active"
                description="Employee is currently employed and active"
                color="green"
              />
              <TypeCard
                title="Left"
                description="Employee has left the organization"
                color="red"
              />
              <TypeCard
                title="Suspended"
                description="Employee is temporarily suspended"
                color="gray"
              />
            </div>
          </section>

          {/* Contract Status Explained */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              Contract Status Explained
            </h3>
            <div className="space-y-3">
              <TypeCard
                title="Active"
                description="Contract is currently active and in effect"
                color="green"
              />
              <TypeCard
                title="Probation"
                description="Employee is on probation period"
                color="blue"
              />
              <TypeCard
                title="Expiring Soon"
                description="Contract is expiring within the next 30 days"
                color="orange"
              />
              <TypeCard
                title="Terminated"
                description="Contract has been terminated"
                color="red"
              />
            </div>
          </section>

          {/* Dashboard Metrics */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              Dashboard Metrics Explained
            </h3>
            <div className="space-y-3">
              <PropertyCard
                title="Total Employees"
                description="Total number of employees in the system across all statuses"
                example="Total Employees: 150 (all employees)"
              />
              <PropertyCard
                title="Active"
                description="Number of employees currently active and employed"
                example="Active: 142 (currently employed)"
              />
              <PropertyCard
                title="On Leave"
                description="Number of employees currently on leave"
                example="On Leave: 5 (currently on leave)"
              />
              <PropertyCard
                title="Pending Leaves"
                description="Number of pending leave requests awaiting approval"
                example="Pending Leaves: 3 (awaiting approval)"
              />
              <PropertyCard
                title="Today Present"
                description="Number of employees marked present today"
                example="Today Present: 137 (marked present today)"
              />
              <PropertyCard
                title="Monthly Salary"
                description="Total monthly salary payout for all active employees"
                example="Monthly Salary: KSh 4,500,000 (total monthly payout)"
              />
            </div>
          </section>

          {/* Tips */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-600" />
              Tips & Best Practices
            </h3>
            <div className="bg-amber-50 rounded-xl p-4 space-y-2">
              <TipItem text="Complete all 6 steps of the employee form to ensure comprehensive records" />
              <TipItem text="Use the search bar to quickly find employees by name, email, or phone" />
              <TipItem text="Filter by department to view employees in specific teams" />
              <TipItem text="Track contract expiry dates to ensure timely renewals" />
              <TipItem text="Use the fulfilment checklist to track contract requirements" />
              <TipItem text="Keep compliance information up to date for regulatory compliance" />
              <TipItem text="Set appropriate reports-to relationships for organizational clarity" />
              <TipItem text="Monitor employee status changes for accurate payroll processing" />
              <TipItem text="Review contract terms before signing to ensure legal compliance" />
              <TipItem text="Use holiday lists to track company-specific holidays for each employee" />
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

const StepDetailCard: React.FC<{ step: string; title: string; description: string; fields: string[]; icon: React.ReactNode }> = ({ step, title, description, fields, icon }) => (
  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
    <div className="flex items-start gap-4 mb-3">
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
    <div className="ml-12 space-y-1">
      {fields.map(field => (
        <div key={field} className="text-xs text-gray-500 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          {field}
        </div>
      ))}
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
    gray: 'bg-gray-50 border-gray-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    blue: 'bg-blue-50 border-blue-200',
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

export default HRDocumentation;
