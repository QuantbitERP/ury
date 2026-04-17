import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Users, Search, Plus, Edit2, FileText, Briefcase, ChevronRight as ChevronRightIcon } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  icon: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void; // Optional action to perform before highlighting
}

interface HRTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const HRTour: React.FC<HRTourProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightPosition, setHighlightPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const tourSteps: TourStep[] = [
    {
      id: 'dashboard-stats',
      title: 'Dashboard Statistics',
      description: 'View key HR metrics: Total Employees, Active, On Leave, Pending Leaves, Today Present, and Monthly Salary.',
      target: '[data-tour="hr-dashboard-stats"]',
      icon: <FileText className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'tabs',
      title: 'Main Tabs',
      description: 'Switch between Employees tab for employee management and Contracts tab for contract management.',
      target: '[data-tour="hr-tabs"]',
      icon: <Briefcase className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'search',
      title: 'Search Bar',
      description: 'Search employees by name, email, phone, or employee ID. Results update in real-time.',
      target: '[data-tour="hr-search"]',
      icon: <Search className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'filters',
      title: 'Filters',
      description: 'Filter employees by Department, Status, or Employment Type to narrow down the list.',
      target: '[data-tour="hr-filters"]',
      icon: <FileText className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'add-employee',
      title: 'Add Employee',
      description: 'Click to open the 6-step employee form to create a new employee record.',
      target: '[data-tour="hr-add-employee"]',
      icon: <Plus className="w-5 h-5" />,
      position: 'bottom',
      action: () => {
        const addButton = document.querySelector('[data-tour="hr-add-employee"]') as HTMLButtonElement;
        if (addButton) addButton.click();
      }
    },
    {
      id: 'employee-step-1',
      title: 'Step 1: Personal Information',
      description: 'Enter basic employee details: First Name (required), Last Name (required), Middle Name, Date of Birth, Gender, and Nationality.',
      target: '[data-tour="hr-step-1"]',
      icon: <Users className="w-5 h-5" />,
      position: 'bottom',
      action: () => {
        const modal = document.querySelector('[data-tour="hr-step-1"]');
        if (!modal) {
          const addButton = document.querySelector('[data-tour="hr-add-employee"]') as HTMLButtonElement;
          if (addButton) addButton.click();
        }
      }
    },
    {
      id: 'employee-step-2',
      title: 'Step 2: Compliance Information',
      description: 'Enter tax and social security numbers: KRA PIN / PAN, NSSF / PF Number, and NHIF / ESI Number.',
      target: '[data-tour="hr-step-2"]',
      icon: <FileText className="w-5 h-5" />,
      position: 'bottom',
      action: () => {
        const nextButton = document.querySelector('[data-tour="hr-next-button"]') as HTMLButtonElement;
        if (nextButton) nextButton.click();
      }
    },
    {
      id: 'employee-step-3',
      title: 'Step 3: Banking Details',
      description: 'Enter bank account information: Bank Name, Account Number, and IFSC / Branch Code.',
      target: '[data-tour="hr-step-3"]',
      icon: <FileText className="w-5 h-5" />,
      position: 'bottom',
      action: () => {
        const nextButton = document.querySelector('[data-tour="hr-next-button"]') as HTMLButtonElement;
        if (nextButton) nextButton.click();
      }
    },
    {
      id: 'employee-step-4',
      title: 'Step 4: Contact Information',
      description: 'Enter contact details: Personal Email, Company Email, and Phone / Cell.',
      target: '[data-tour="hr-step-4"]',
      icon: <FileText className="w-5 h-5" />,
      position: 'bottom',
      action: () => {
        const nextButton = document.querySelector('[data-tour="hr-next-button"]') as HTMLButtonElement;
        if (nextButton) nextButton.click();
      }
    },
    {
      id: 'employee-step-5',
      title: 'Step 5: Employment Details',
      description: 'Enter organizational information: Company, Department, Designation, Branch, Holiday List, Employment Type, Date of Joining (required), and Reports To.',
      target: '[data-tour="hr-step-5"]',
      icon: <Briefcase className="w-5 h-5" />,
      position: 'bottom',
      action: () => {
        const nextButton = document.querySelector('[data-tour="hr-next-button"]') as HTMLButtonElement;
        if (nextButton) nextButton.click();
      }
    },
    {
      id: 'employee-step-6',
      title: 'Step 6: Contract Information',
      description: 'Enter contract details: Contract Type, Contract End Date, and Notice Period (days).',
      target: '[data-tour="hr-step-6"]',
      icon: <FileText className="w-5 h-5" />,
      position: 'bottom',
      action: () => {
        const nextButton = document.querySelector('[data-tour="hr-next-button"]') as HTMLButtonElement;
        if (nextButton) nextButton.click();
      }
    },
    {
      id: 'save-employee',
      title: 'Save Employee',
      description: 'Click to save the employee record. The button is disabled until required fields are filled.',
      target: '[data-tour="hr-save-employee"]',
      icon: <FileText className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'employee-table',
      title: 'Employee Directory',
      description: 'View all employees in a table with their department, designation, status, join date, email, and phone.',
      target: '[data-tour="hr-employee-table"]',
      icon: <Users className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'view-employee',
      title: 'View Employee Details',
      description: 'Click the eye icon to view comprehensive employee information in the detail modal.',
      target: '[data-tour="hr-view-employee"]',
      icon: <FileText className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'edit-employee',
      title: 'Edit Employee',
      description: 'Click the edit icon to modify employee information through the 6-step form.',
      target: '[data-tour="hr-edit-employee"]',
      icon: <Edit2 className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'contracts-tab',
      title: 'Contracts Tab',
      description: 'Click to switch to the Contracts management view.',
      target: '[data-tour="hr-contracts-tab"]',
      icon: <Briefcase className="w-5 h-5" />,
      position: 'bottom',
      action: () => {
        const contractsTab = document.querySelector('[data-tour="hr-contracts-tab"]') as HTMLElement;
        if (contractsTab) contractsTab.click();
      }
    },
    {
      id: 'contract-sub-tabs',
      title: 'Contract Sub-Tabs',
      description: 'Filter contracts by status: Active Contracts, Probation Period, Expiring Soon, or Terminated.',
      target: '[data-tour="hr-contract-sub-tabs"]',
      icon: <FileText className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'new-contract',
      title: 'New Contract',
      description: 'Click to create a new employment contract for an employee.',
      target: '[data-tour="hr-new-contract"]',
      icon: <Plus className="w-5 h-5" />,
      position: 'bottom',
      action: () => {
        const newContractButton = document.querySelector('[data-tour="hr-new-contract"]') as HTMLButtonElement;
        if (newContractButton) newContractButton.click();
      }
    },
    {
      id: 'contract-table',
      title: 'Contract Table',
      description: 'View all contracts with employee name, contract number, dates, fulfilment status, and actions.',
      target: '[data-tour="hr-contract-table"]',
      icon: <Briefcase className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'view-contract',
      title: 'View Contract Details',
      description: 'Click the eye icon to view contract details, terms, and fulfilment checklist.',
      target: '[data-tour="hr-view-contract"]',
      icon: <FileText className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'edit-contract',
      title: 'Edit Contract',
      description: 'Click the edit icon to modify contract details (disabled for terminated contracts).',
      target: '[data-tour="hr-edit-contract"]',
      icon: <Edit2 className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'terminate-contract',
      title: 'Terminate Contract',
      description: 'Click Terminate Contract in the detail modal to end a contract (requires confirmation).',
      target: '[data-tour="hr-terminate-contract"]',
      icon: <FileText className="w-5 h-5" />,
      position: 'bottom'
    }
  ];

  const currentTourStep = tourSteps[currentStep];

  useEffect(() => {
    if (isOpen && currentTourStep) {
      // Execute action if present (e.g., open modal, switch tab)
      if (currentTourStep.action) {
        currentTourStep.action();
      }
      // Wait a bit for modal to open or tab to switch if needed
      const modalSteps = ['employee-step-1', 'employee-step-2', 'employee-step-3', 'employee-step-4', 'employee-step-5', 'employee-step-6', 'save-employee', 'new-contract', 'contract-table', 'view-contract', 'edit-contract', 'terminate-contract'];
      const tabSteps = ['contracts-tab', 'contract-sub-tabs', 'new-contract', 'contract-table', 'view-contract', 'edit-contract', 'terminate-contract'];
      const delay = (modalSteps.includes(currentTourStep.id) || tabSteps.includes(currentTourStep.id)) ? 600 : 0;
      setTimeout(() => {
        highlightElement(currentTourStep.target);
      }, delay);
    }
  }, [isOpen, currentStep, currentTourStep]);

  const highlightElement = (selector: string) => {
    const element = document.querySelector(selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      });
    } else {
      setHighlightPosition(null);
    }
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setCurrentStep(0);
    setHighlightPosition(null);
    onClose();
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = () => {
    setCurrentStep(0);
    setHighlightPosition(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Spotlight overlay */}
      <div className="fixed inset-0 bg-black/60 z-[100] pointer-events-none" />
      
      {/* Highlighted element spotlight */}
      {highlightPosition && (
        <div
          className="fixed border-4 border-amber-500 rounded-lg shadow-2xl z-[100] transition-all duration-300 pointer-events-none"
          style={{
            top: highlightPosition.top - 4,
            left: highlightPosition.left - 4,
            width: highlightPosition.width + 8,
            height: highlightPosition.height + 8,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)'
          }}
        />
      )}

      {/* Tour tooltip */}
      {currentTourStep && (
        <TourTooltip
          step={currentTourStep}
          currentStep={currentStep}
          totalSteps={tourSteps.length}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSkip={handleSkip}
          position={currentTourStep.position || 'bottom'}
          targetPosition={highlightPosition}
        />
      )}
    </>
  );
};

interface TourTooltipProps {
  step: TourStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  targetPosition: { top: number; left: number; width: number; height: number } | null;
}

const TourTooltip: React.FC<TourTooltipProps> = ({
  step,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  position,
  targetPosition
}) => {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (targetPosition) {
      const tooltipWidth = 400;
      const tooltipHeight = 200;
      const padding = 20;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = targetPosition.top - tooltipHeight - padding;
          left = targetPosition.left + targetPosition.width / 2 - tooltipWidth / 2;
          break;
        case 'bottom':
          top = targetPosition.top + targetPosition.height + padding;
          left = targetPosition.left + targetPosition.width / 2 - tooltipWidth / 2;
          break;
        case 'left':
          top = targetPosition.top + targetPosition.height / 2 - tooltipHeight / 2;
          left = targetPosition.left - tooltipWidth - padding;
          break;
        case 'right':
          top = targetPosition.top + targetPosition.height / 2 - tooltipHeight / 2;
          left = targetPosition.left + targetPosition.width + padding;
          break;
        case 'center':
          top = windowHeight / 2 - tooltipHeight / 2;
          left = windowWidth / 2 - tooltipWidth / 2;
          break;
      }

      // Ensure tooltip stays within viewport
      if (left < padding) left = padding;
      if (left + tooltipWidth > windowWidth - padding) left = windowWidth - tooltipWidth - padding;
      if (top < padding) top = padding;
      if (top + tooltipHeight > windowHeight - padding) top = windowHeight - tooltipHeight - padding;

      setTooltipPosition({ top, left });
    }
  }, [position, targetPosition]);

  return (
    <div
      className="fixed bg-white rounded-2xl shadow-2xl z-[110] w-96 p-6 transition-all duration-300"
      style={{
        top: tooltipPosition.top,
        left: tooltipPosition.left
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
            {step.icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{step.title}</h3>
            <p className="text-xs text-gray-500">
              Step {currentStep + 1} of {totalSteps}
            </p>
          </div>
        </div>
        <button
          onClick={onSkip}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm leading-relaxed mb-6">
        {step.description}
      </p>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
        <div
          className="bg-amber-600 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrevious}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
        >
          {currentStep === totalSteps - 1 ? (
            <>
              <MapPin className="w-4 h-4" />
              Finish
            </>
          ) : (
            <>
              Next
              <ChevronRightIcon className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Skip button */}
      {currentStep < totalSteps - 1 && (
        <button
          onClick={onSkip}
          className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Skip Tour
        </button>
      )}
    </div>
  );
};

export default HRTour;
