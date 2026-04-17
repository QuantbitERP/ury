import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Truck, Search, Plus, Edit, Trash2, Building, ChevronRight as ChevronRightIcon } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  icon: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void; // Optional action to perform before highlighting
}

interface InventoryManagementSuppliersTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const InventoryManagementSuppliersTour: React.FC<InventoryManagementSuppliersTourProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightPosition, setHighlightPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const tourSteps: TourStep[] = [
    {
      id: 'search-bar',
      title: 'Search Bar',
      description: 'Search suppliers by name, email, phone, or contact person. Results update in real-time.',
      target: '[data-tour="suppliers-search"]',
      icon: <Search className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'add-supplier',
      title: 'Add Supplier',
      description: 'Click to open the Add Supplier modal to create a new supplier profile.',
      target: '[data-tour="add-supplier"]',
      icon: <Plus className="w-5 h-5" />,
      position: 'bottom',
      action: () => {
        const addButton = document.querySelector('[data-tour="add-supplier"]') as HTMLButtonElement;
        if (addButton) addButton.click();
      }
    },
    {
      id: 'refresh-button',
      title: 'Refresh Button',
      description: 'Click to refresh the suppliers list and fetch latest data from the server.',
      target: '[data-tour="suppliers-refresh"]',
      icon: <Truck className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'supplier-name',
      title: 'Supplier Name',
      description: 'Enter the supplier\'s business name (required). This is the primary identifier.',
      target: '[data-tour="supplier-name"]',
      icon: <Truck className="w-5 h-5" />,
      position: 'bottom',
      action: () => {
        const modal = document.querySelector('[data-tour="supplier-name"]');
        if (!modal) {
          const addButton = document.querySelector('[data-tour="add-supplier"]') as HTMLButtonElement;
          if (addButton) addButton.click();
        }
      }
    },
    {
      id: 'contact-person',
      title: 'Contact Person',
      description: 'Enter the name of the primary contact person at the supplier.',
      target: '[data-tour="contact-person"]',
      icon: <Building className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'supplier-email',
      title: 'Email',
      description: 'Enter the supplier\'s email address for communication.',
      target: '[data-tour="supplier-email"]',
      icon: <Building className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'supplier-phone',
      title: 'Phone',
      description: 'Enter the supplier\'s phone number for quick contact.',
      target: '[data-tour="supplier-phone"]',
      icon: <Building className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'supplier-address',
      title: 'Address',
      description: 'Enter the supplier\'s street address.',
      target: '[data-tour="supplier-address"]',
      icon: <Building className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'supplier-city',
      title: 'City',
      description: 'Enter the city where the supplier is located.',
      target: '[data-tour="supplier-city"]',
      icon: <Building className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'supplier-country',
      title: 'Country',
      description: 'Enter the country where the supplier is located.',
      target: '[data-tour="supplier-country"]',
      icon: <Building className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'tax-id',
      title: 'Tax ID',
      description: 'Enter the supplier\'s tax identification number for invoicing and compliance.',
      target: '[data-tour="tax-id"]',
      icon: <Building className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'supplier-group',
      title: 'Supplier Group',
      description: 'Select a supplier group to categorize suppliers for better organization.',
      target: '[data-tour="supplier-group"]',
      icon: <Building className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'financial-tab',
      title: 'Financial Terms Tab',
      description: 'Click to access financial settings like payment terms, credit limit, and price lists.',
      target: '[data-tour="financial-tab"]',
      icon: <Building className="w-5 h-5" />,
      position: 'bottom',
      action: () => {
        const tab = document.querySelector('[data-tour="financial-tab"]') as HTMLElement;
        if (tab) tab.click();
      }
    },
    {
      id: 'payment-terms',
      title: 'Payment Terms',
      description: 'Select payment terms (e.g., 30 days). This determines when payment is due.',
      target: '[data-tour="payment-terms"]',
      icon: <Building className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'credit-limit',
      title: 'Credit Limit',
      description: 'Set the maximum credit limit for this supplier in KES.',
      target: '[data-tour="credit-limit"]',
      icon: <Building className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'price-list',
      title: 'Default Price List',
      description: 'Select the default price list for this supplier.',
      target: '[data-tour="price-list"]',
      icon: <Building className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'operations-tab',
      title: 'Operations Tab',
      description: 'Click to access operational settings like lead time and addresses.',
      target: '[data-tour="operations-tab"]',
      icon: <Truck className="w-5 h-5" />,
      position: 'bottom',
      action: () => {
        const tab = document.querySelector('[data-tour="operations-tab"]') as HTMLElement;
        if (tab) tab.click();
      }
    },
    {
      id: 'lead-time',
      title: 'Lead Time',
      description: 'Enter the average lead time in days for deliveries from this supplier.',
      target: '[data-tour="lead-time"]',
      icon: <Truck className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'enable-supplier',
      title: 'Enable Supplier',
      description: 'Check to make this supplier active and available for purchase orders.',
      target: '[data-tour="enable-supplier"]',
      icon: <Truck className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'billing-address',
      title: 'Billing Address',
      description: 'Enter the specific billing address for invoices and payments.',
      target: '[data-tour="billing-address"]',
      icon: <Building className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'shipping-address',
      title: 'Shipping Address',
      description: 'Enter the shipping address where goods should be delivered.',
      target: '[data-tour="shipping-address"]',
      icon: <Truck className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'save-supplier',
      title: 'Save Supplier',
      description: 'Click to save the supplier. The button is disabled until required fields are filled.',
      target: '[data-tour="save-supplier"]',
      icon: <Plus className="w-5 h-5" />,
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
      const modalSteps = ['supplier-name', 'contact-person', 'supplier-email', 'supplier-phone', 'supplier-address', 'supplier-city', 'supplier-country', 'tax-id', 'supplier-group', 'payment-terms', 'credit-limit', 'price-list', 'lead-time', 'enable-supplier', 'billing-address', 'shipping-address', 'save-supplier'];
      const tabSteps = ['payment-terms', 'credit-limit', 'price-list', 'lead-time', 'enable-supplier', 'billing-address', 'shipping-address', 'save-supplier'];
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

export default InventoryManagementSuppliersTour;
