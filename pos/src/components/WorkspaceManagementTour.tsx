import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Clock, Users, UserCheck, BarChart2, Calendar, Coffee, Sun, Hash, LogIn, LogOut, Plus } from 'lucide-react';

interface WorkspaceManagementTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface TourStep {
  target: string;
  title: string;
  description: string;
  action?: () => void;
}

const WorkspaceManagementTour: React.FC<WorkspaceManagementTourProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0, width: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const steps: TourStep[] = [
    {
      target: 'workspace-dashboard-stats',
      title: 'Dashboard Statistics',
      description: 'View real-time overview of workforce status including total employees, present today, shift assignments, and pending leaves.',
    },
    {
      target: 'workspace-quick-checkin',
      title: 'Quick Check In/Out',
      description: 'Fast and efficient check-in/out functionality. Select an employee and record their check-in or check-out with automatic timestamp.',
    },
    {
      target: 'workspace-tabs',
      title: 'Navigation Tabs',
      description: 'Navigate between different HRMS modules: Attendance, Shifts, Leaves, Holidays, and Check-in Log.',
    },
    {
      target: 'workspace-attendance-tab',
      title: 'Attendance Tab',
      description: 'View and manage employee attendance records. Filter by month/year, mark attendance manually, and view check-in/out times.',
    },
    {
      target: 'workspace-shifts-tab',
      title: 'Shifts Tab',
      description: 'Create shift types, assign shifts to employees, and manage shift schedules with start/end times and configuration options.',
    },
    {
      target: 'workspace-leaves-tab',
      title: 'Leaves Tab',
      description: 'Comprehensive leave management. Apply for leaves, approve/reject requests, allocate leave quotas, and track detailed leave balances.',
    },
    {
      target: 'workspace-holidays-tab',
      title: 'Holidays Tab',
      description: 'Create holiday lists, import local holidays by country, set weekly offs, and manage holiday schedules.',
    },
    {
      target: 'workspace-checkins-tab',
      title: 'Check-in Log Tab',
      description: 'View detailed check-in/out history with timestamps, shift information, and device IDs for all employees.',
    },
    {
      target: 'workspace-refresh',
      title: 'Refresh Button',
      description: 'Click to reload all data from ERPNext. Use this to ensure youre viewing the latest information.',
    },
  ];

  const calculateTooltipPosition = (targetSelector: string) => {
    const target = document.querySelector(`[data-tour="${targetSelector}"]`);
    if (target) {
      const rect = target.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + 10,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (isOpen && steps[currentStep]) {
      setTimeout(() => {
        calculateTooltipPosition(steps[currentStep].target);
      }, 100);
    }
  }, [isOpen, currentStep]);

  const handleNext = () => {
    if (steps[currentStep].action) {
      steps[currentStep].action!();
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-[95]" onClick={handleSkip} />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[100] bg-white rounded-2xl shadow-2xl p-5 max-w-sm transition-all duration-300"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: 'translateY(10px)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E4B315] to-[#C69A11] flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">{step.title}</h3>
              <p className="text-[10px] text-gray-400">Step {currentStep + 1} of {steps.length}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{step.description}</p>

        {/* Progress Bar */}
        <div className="h-1.5 rounded-full bg-gray-100 mb-4">
          <div className="h-1.5 rounded-full bg-gradient-to-r from-[#E4B315] to-[#C69A11] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleSkip}
              className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-1.5 text-xs font-medium bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkspaceManagementTour;
