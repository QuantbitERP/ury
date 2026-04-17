import React from 'react';
import { X, Clock, Users, UserCheck, BarChart2, Calendar, Coffee, Sun, Hash, LogIn, LogOut, RefreshCw, Plus, Eye, CheckCircle, XCircle } from 'lucide-react';

interface WorkspaceManagementDocumentationProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorkspaceManagementDocumentation: React.FC<WorkspaceManagementDocumentationProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" style={{ fontFamily: 'DM Sans, sans-serif' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#E4B315]/5 to-[#C69A11]/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E4B315] to-[#C69A11] flex items-center justify-center shadow-md">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Workspace Management Documentation</h2>
              <p className="text-xs text-gray-500">Attendance, Shifts, Leaves & HRMS Dashboard</p>
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
                <Clock className="w-4 h-4" /> Overview
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Workspace Management provides a comprehensive HRMS dashboard for managing employee attendance, shift assignments, leave applications, holiday lists, and check-in/out logs. Track workforce activities, manage schedules, and streamline HR operations in one centralized interface.
              </p>
            </section>

            {/* Key Features */}
            <section>
              <h3 className="text-sm font-bold text-[#C69A11] mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" /> Key Features
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Dashboard Statistics:</strong> Real-time overview of total employees, present today, shift assignments, and pending leaves</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Quick Check In/Out:</strong> Fast employee check-in and check-out functionality with employee selection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Attendance Management:</strong> View, mark, and manage employee attendance records by month and year</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Shift Management:</strong> Create shift types, assign shifts to employees, and manage shift schedules</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Leave Management:</strong> Apply for leaves, approve/reject requests, allocate leave quotas, and track leave balances</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Holiday Management:</strong> Create holiday lists, import local holidays, set weekly offs, and manage holiday schedules</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Check-in Log:</strong> View detailed check-in/out logs with timestamps, shifts, and device information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Real-time Clock:</strong> Live clock display showing current time in the header</span>
                </li>
              </ul>
            </section>

            {/* How to Use */}
            <section>
              <h3 className="text-sm font-bold text-[#C69A11] mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> How to Use
              </h3>
              <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
                <li><strong>Navigate to Workspace Management</strong> from the sidebar menu</li>
                <li><strong>View Dashboard Statistics</strong> at the top for quick overview of workforce status</li>
                <li><strong>Use Quick Check In/Out</strong> to record employee check-ins and check-outs quickly</li>
                <li><strong>Navigate Between Tabs</strong> to access different HRMS modules (Attendance, Shifts, Leaves, Holidays, Check-in Log)</li>
                <li><strong>Attendance Tab:</strong> View attendance records, filter by month/year, mark attendance manually</li>
                <li><strong>Shifts Tab:</strong> Create shift types, assign shifts to employees, view shift assignments</li>
                <li><strong>Leaves Tab:</strong> Apply for leaves, approve/reject requests, allocate leave quotas, view leave balances</li>
                <li><strong>Holidays Tab:</strong> Create holiday lists, import local holidays, set weekly offs, view holiday schedules</li>
                <li><strong>Check-in Log Tab:</strong> View detailed check-in/out history with timestamps and shift information</li>
                <li><strong>Refresh Data</strong> by clicking the Refresh button to reload all data from ERPNext</li>
              </ol>
            </section>

            {/* Dashboard Metrics Explained */}
            <section>
              <h3 className="text-sm font-bold text-[#C69A11] mb-3 flex items-center gap-2">
                <BarChart2 className="w-4 h-4" /> Dashboard Metrics Explained
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-3 bg-[#E4B315]/5 rounded-lg p-3 border border-[#E4B315]/20">
                  <Users className="w-4 h-4 text-[#C69A11]" />
                  <div>
                    <strong className="text-gray-700">Total Employees:</strong> Total number of active employees in the system
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-green-50 rounded-lg p-3 border border-green-100">
                  <UserCheck className="w-4 h-4 text-green-600" />
                  <div>
                    <strong className="text-gray-700">Present Today:</strong> Number of employees marked as present today out of total employees
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-sky-50 rounded-lg p-3 border border-sky-100">
                  <BarChart2 className="w-4 h-4 text-sky-600" />
                  <div>
                    <strong className="text-gray-700">Shift Assignments:</strong> Total number of active shift assignments for employees
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-[#E4B315]/5 rounded-lg p-3 border border-[#E4B315]/20">
                  <Calendar className="w-4 h-4 text-[#C69A11]" />
                  <div>
                    <strong className="text-gray-700">Pending Leaves:</strong> Number of leave applications with Open or Pending status
                  </div>
                </div>
              </div>
            </section>

            {/* Attendance Tab */}
            <section>
              <h3 className="text-sm font-bold text-[#C69A11] mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Attendance Tab
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                The Attendance tab allows you to view and manage employee attendance records.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Month/Year Filter:</strong> Select month and year to view attendance for specific periods</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Attendance Table:</strong> View all attendance records with employee details, status, check-in/out times, and working hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Mark Attendance:</strong> Manually mark attendance for employees (Present, Absent, Half Day, On Leave)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Status Colors:</strong> Green (Present), Red (Absent), Amber (Half Day), Blue (On Leave)</span>
                </li>
              </ul>
            </section>

            {/* Shifts Tab */}
            <section>
              <h3 className="text-sm font-bold text-[#C69A11] mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Shifts Tab
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Manage shift types and assign shifts to employees.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Shift Types:</strong> Create and manage shift types with start/end times, check-in windows, and auto-attendance settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Shift Assignments:</strong> Assign shift types to employees with start and end dates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Active Assignments:</strong> View all active shift assignments with employee details and shift information</span>
                </li>
              </ul>
            </section>

            {/* Leaves Tab */}
            <section>
              <h3 className="text-sm font-bold text-[#C69A11] mb-3 flex items-center gap-2">
                <Coffee className="w-4 h-4" /> Leaves Tab
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Comprehensive leave management system for applications, allocations, and approvals.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Leave Applications:</strong> View all leave applications with status, dates, and employee details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Apply for Leave:</strong> Submit leave applications with leave type, dates, and description</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Approve/Reject:</strong> Approve or reject leave applications with a single click</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Leave Allocations:</strong> Allocate leave quotas to employees with detailed balance tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Leave Balances:</strong> View detailed leave balances including allocated, used, available, pending, and carry-forward leaves</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Leave Types:</strong> Create custom leave types with maximum leave limits and configuration options</span>
                </li>
              </ul>
            </section>

            {/* Holidays Tab */}
            <section>
              <h3 className="text-sm font-bold text-[#C69A11] mb-3 flex items-center gap-2">
                <Sun className="w-4 h-4" /> Holidays Tab
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Create and manage holiday lists with local holiday imports and weekly off configuration.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Create Holiday List:</strong> Create new holiday lists with name, date range, and holiday configuration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Import Local Holidays:</strong> Automatically import local holidays by selecting country and subdivision</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Weekly Offs:</strong> Set weekly off days (e.g., Saturday, Sunday) and automatically generate weekly off dates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Manual Holidays:</strong> Add custom holidays manually with date and description</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>View Holidays:</strong> View detailed holiday lists with all holidays and their descriptions</span>
                </li>
              </ul>
            </section>

            {/* Check-in Log Tab */}
            <section>
              <h3 className="text-sm font-bold text-[#C69A11] mb-3 flex items-center gap-2">
                <Hash className="w-4 h-4" /> Check-in Log Tab
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                View detailed check-in/out logs for all employees with timestamps and shift information.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Check-in/out History:</strong> View all employee check-in and check-out records with timestamps</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Log Type:</strong> Distinguish between IN and OUT logs with color-coded indicators</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Shift Information:</strong> View shift associated with each check-in/out</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Device ID:</strong> Track which device was used for check-in/out</span>
                </li>
              </ul>
            </section>

            {/* Quick Check In/Out */}
            <section>
              <h3 className="text-sm font-bold text-[#C69A11] mb-3 flex items-center gap-2">
                <LogIn className="w-4 h-4" /> Quick Check In/Out
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Fast and efficient check-in/out functionality for recording employee attendance.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Employee Selection:</strong> Select employee from dropdown to check-in or check-out</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Check In:</strong> Record employee check-in with current timestamp and shift (if assigned)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Check Out:</strong> Record employee check-out with current timestamp</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span><strong>Automatic Timestamp:</strong> System automatically records current date and time</span>
                </li>
              </ul>
            </section>

            {/* Tips & Best Practices */}
            <section>
              <h3 className="text-sm font-bold text-[#E4B315] mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Tips & Best Practices
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span>Use Quick Check In/Out for fast attendance recording instead of manual marking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span>Assign shifts to employees to enable automatic attendance calculation based on shift times</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span>Import local holidays to automatically populate holiday lists for your region</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span>Set weekly offs to automatically generate recurring weekly off dates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span>Regularly approve or reject pending leave applications to keep leave management up-to-date</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span>Monitor leave balances to ensure employees have adequate leave allocation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span>Use month/year filters to view attendance for specific periods when analyzing trends</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span>Refresh data regularly to ensure you're viewing the latest information from ERPNext</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span>Review check-in logs to identify attendance patterns and potential issues</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4B315] mt-1.5 flex-shrink-0" />
                  <span>Create holiday lists in advance to ensure accurate attendance calculations</span>
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

export default WorkspaceManagementDocumentation;
