import React from 'react';
import { X, Users, UserCheck, Clock, TriangleAlert, Search, UserPlus, Eye, Edit2, FileText, Briefcase, Calendar, Mail, Phone, Building, Plus } from 'lucide-react';

interface StaffManagementDocumentationProps {
  isOpen: boolean;
  onClose: () => void;
}

const StaffManagementDocumentation: React.FC<StaffManagementDocumentationProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" style={{ fontFamily: 'DM Sans, sans-serif' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#E4B315]/5 to-[#C69A11]/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E4B315] to-[#C69A11] flex items-center justify-center shadow-md">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Staff Management Documentation</h2>
              <p className="text-xs text-gray-500">Employee Onboarding & Staff Records</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-6">
            {/* Overview */}
            <section>
              <h3 className="text-sm font-bold text-[#C69A11] mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Overview
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Staff Management allows you to manage employee onboarding processes and staff records through the ERPNext Employee Onboarding doctype. Track new hires from job applicants to fully onboarded employees with comprehensive status tracking and detailed record management.
              </p>
            </section>

            {/* Key Features */}
            <section>
              <h3 className="text-sm font-bold text-[#C69A11] mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Key Features
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Dashboard Statistics:</strong> View total records, completed, in-process, and pending onboarding status at a glance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Search & Filter:</strong> Quickly find staff records by employee name, department, designation, or filter by onboarding status</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Add Staff Record:</strong> Create new onboarding records with comprehensive employee information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Edit Staff Records:</strong> Update existing onboarding records with new information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>View Details:</strong> View comprehensive staff record details including basic info, employment details, and system information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Quick Create Job Offer:</strong> Create job offers directly from the onboarding form without leaving the modal</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Quick Create Designation:</strong> Create designations on-the-fly when none exist in the system</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Status Tracking:</strong> Track onboarding progress through Pending, In Process, Completed, and Not Started statuses</span>
                </li>
              </ul>
            </section>

            {/* How to Use */}
            <section>
              <h3 className="text-sm font-bold text-[#C69A11] mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> How to Use
              </h3>
              <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
                <li><strong>Navigate to Staff Management</strong> from the sidebar menu</li>
                <li><strong>View Dashboard Statistics</strong> at the top to see overview of all onboarding records</li>
                <li><strong>Use the Search Bar</strong> to find specific staff records by employee name, department, or designation</li>
                <li><strong>Filter by Status</strong> using the dropdown to view records by onboarding status (Pending, In Process, Completed, Not Started)</li>
                <li><strong>Add Staff Record</strong> by clicking the "Add Staff Record" button and filling in the onboarding form</li>
                <li><strong>View Details</strong> by clicking the Eye icon on any staff record to see comprehensive information</li>
                <li><strong>Edit Records</strong> by clicking the Edit icon to update staff information</li>
                <li><strong>Refresh Data</strong> by clicking the Refresh button to reload records from ERPNext</li>
              </ol>
            </section>

            {/* Onboarding Form Fields */}
            <section>
              <h3 className="text-sm font-bold text-[#C69A11] mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Onboarding Form Fields
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h4 className="font-semibold text-gray-700 mb-2">Basic Information</h4>
                  <ul className="space-y-1 text-xs text-gray-600">
                    <li><strong>Employee Name:</strong> Full name of the employee (required)</li>
                    <li><strong>Job Applicant:</strong> Link to the job applicant record</li>
                    <li><strong>Job Offer:</strong> Link to the job offer record with quick create option</li>
                    <li><strong>Company:</strong> Select the company for the employee</li>
                    <li><strong>Boarding Status:</strong> Current onboarding status (Pending, In Process, Completed, Not Started)</li>
                    <li><strong>Project:</strong> Project assignment (if applicable)</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h4 className="font-semibold text-gray-700 mb-2">Employment Details</h4>
                  <ul className="space-y-1 text-xs text-gray-600">
                    <li><strong>Department:</strong> Select the department for the employee</li>
                    <li><strong>Designation:</strong> Select the designation with quick create option if none exist</li>
                    <li><strong>Holiday List:</strong> Select the holiday list for the employee</li>
                    <li><strong>Date of Joining:</strong> Employee's official start date (required)</li>
                    <li><strong>Boarding Begins On:</strong> Date when onboarding process begins</li>
                    <li><strong>Notify Users by Email:</strong> Checkbox to send email notifications</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Quick Create Job Offer */}
            <section>
              <h3 className="text-sm font-bold text-[#C69A11] mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Quick Create Job Offer
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                When creating or editing a staff record, you can quickly create a new Job Offer without leaving the onboarding modal:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span>Select "+ Create New Job Offer" from the Job Offer dropdown</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span>Fill in the Job Applicant, Offer Date, Valid Till, Designation, and Company fields</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span>Click "Create Job Offer" to create the offer and automatically select it in the form</span>
                </li>
              </ul>
            </section>

            {/* Quick Create Designation */}
            <section>
              <h3 className="text-sm font-bold text-[#C69A11] mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Quick Create Designation
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                If no designations exist in the system, you can quickly create one:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span>Click "No designations found — Quick Create Designation" button</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span>Enter the designation name (e.g., Accountant, Software Engineer)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span>Click "Create Designation" to add it to the system and select it in the form</span>
                </li>
              </ul>
            </section>

            {/* Boarding Status Explained */}
            <section>
              <h3 className="text-sm font-bold text-[#C69A11] mb-3 flex items-center gap-2">
                <TriangleAlert className="w-4 h-4" /> Boarding Status Explained
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-3 bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                  <span className="w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-700">Pending:</strong> Onboarding process has not yet started
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <span className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-700">In Process:</strong> Onboarding is currently in progress
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-green-50 rounded-lg p-3 border border-green-100">
                  <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-700">Completed:</strong> Onboarding process has been successfully completed
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <span className="w-3 h-3 rounded-full bg-gray-400 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-700">Not Started:</strong> Onboarding has not been initiated
                  </div>
                </div>
              </div>
            </section>

            {/* Document Status Explained */}
            <section>
              <h3 className="text-sm font-bold text-[#C69A11] mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Document Status Explained
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <span className="w-3 h-3 rounded-full bg-gray-400 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-700">Draft:</strong> Document is saved as a draft and not yet submitted
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-green-50 rounded-lg p-3 border border-green-100">
                  <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-700">Submitted:</strong> Document has been submitted to ERPNext
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-red-50 rounded-lg p-3 border border-red-100">
                  <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-700">Cancelled:</strong> Document has been cancelled
                  </div>
                </div>
              </div>
            </section>

            {/* Dashboard Metrics Explained */}
            <section>
              <h3 className="text-sm font-bold text-[#C69A11] mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" /> Dashboard Metrics Explained
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <Users className="w-4 h-4 text-gray-700" />
                  <div>
                    <strong className="text-gray-700">Total Records:</strong> Total number of staff onboarding records in the system
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-green-50 rounded-lg p-3 border border-green-100">
                  <UserCheck className="w-4 h-4 text-green-600" />
                  <div>
                    <strong className="text-gray-700">Completed:</strong> Number of employees who have completed onboarding
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <div>
                    <strong className="text-gray-700">In Process:</strong> Number of employees currently in the onboarding process
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-orange-50 rounded-lg p-3 border border-orange-100">
                  <TriangleAlert className="w-4 h-4 text-orange-500" />
                  <div>
                    <strong className="text-gray-700">Pending:</strong> Number of employees with pending onboarding status
                  </div>
                </div>
              </div>
            </section>

            {/* Tips & Best Practices */}
            <section>
              <h3 className="text-sm font-bold text-[#E4B315] mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Tips & Best Practices
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span>Always fill in the Employee Name and Date of Joining as these are required fields</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span>Use the Quick Create features to add Job Offers and Designations on-the-fly without leaving the form</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span>Enable "Notify Users by Email" to send automatic notifications to relevant stakeholders</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span>Regularly update the Boarding Status to reflect the actual progress of onboarding</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span>Use the search bar to quickly find specific staff records by name, department, or designation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span>Filter by status to focus on specific onboarding stages (e.g., only pending or in-process records)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span>Click the Refresh button to ensure you're viewing the latest data from ERPNext</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span>View detailed information using the Eye icon to see all aspects of a staff record</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span>Set appropriate Boarding Begins On dates to track when onboarding actually starts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span>Assign correct Holiday Lists to ensure employees follow the correct holiday schedule</span>
                </li>
              </ul>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="w-full py-2.5 bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-md">
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffManagementDocumentation;
