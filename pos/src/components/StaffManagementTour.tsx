import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Users, UserCheck, Clock, TriangleAlert, Search, UserPlus, Eye, Edit2, FileText, Briefcase, Plus } from 'lucide-react';

interface StaffManagementTourProps {
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

const StaffManagementTour: React.FC<StaffManagementTourProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0, width: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const steps: TourStep[] = [
    {
      target: 'staff-dashboard-stats',
      title: 'Dashboard Statistics',
      description: 'View an overview of all staff onboarding records including total records, completed, in-process, and pending status counts.',
    },
    {
      target: 'staff-search',
      title: 'Search Staff Records',
      description: 'Quickly find specific staff records by searching for employee name, department, designation, or record ID.',
    },
    {
      target: 'staff-filter',
      title: 'Filter by Status',
      description: 'Filter staff records by their onboarding status: Pending, In Process, Completed, or Not Started.',
    },
    {
      target: 'staff-add-record',
      title: 'Add Staff Record',
      description: 'Click this button to create a new staff onboarding record. This will open the onboarding form where you can enter employee details.',
    },
    {
      target: 'staff-table',
      title: 'Staff Records Table',
      description: 'View all staff onboarding records in a table format with employee information, department, designation, status, dates, and actions.',
    },
    {
      target: 'staff-view-details',
      title: 'View Staff Details',
      description: 'Click the Eye icon to view comprehensive details about a staff record including basic information, employment details, and system information.',
    },
    {
      target: 'staff-edit-record',
      title: 'Edit Staff Record',
      description: 'Click the Edit icon to modify an existing staff record. You can update any information in the onboarding form.',
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
              <Users className="w-4 h-4 text-white" />
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

export default StaffManagementTour;
