import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Package, Search, Plus, Edit2, Trash2, SlidersHorizontal, ChevronRight as ChevronRightIcon } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  icon: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void; // Optional action to perform before highlighting
}

interface InventoryManagementStockItemsTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const InventoryManagementStockItemsTour: React.FC<InventoryManagementStockItemsTourProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightPosition, setHighlightPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const tourSteps: TourStep[] = [
    {
      id: 'sidebar-nav',
      title: 'Sidebar Navigation',
      description: 'Navigate between different inventory modules using the sidebar. Stock Items is the default view.',
      target: '[data-tour="sidebar-nav"]',
      icon: <Package className="w-5 h-5" />,
      position: 'right'
    },
    {
      id: 'search-bar',
      title: 'Search Bar',
      description: 'Search stock items by name or code. Results update in real-time as you type.',
      target: '[data-tour="search-bar"]',
      icon: <Search className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'category-filter',
      title: 'Category Filter',
      description: 'Filter items by category to quickly find specific groups of items.',
      target: '[data-tour="category-filter"]',
      icon: <Package className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'department-filter',
      title: 'Department Filter',
      description: 'Filter items by department/warehouse to see stock in specific locations.',
      target: '[data-tour="department-filter"]',
      icon: <Package className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'add-stock-item',
      title: 'Add Stock Item',
      description: 'Click to open the Add Stock Item modal to create a new inventory item.',
      target: '[data-tour="add-stock-item"]',
      icon: <Plus className="w-5 h-5" />,
      position: 'bottom',
      action: () => {
        const addButton = document.querySelector('[data-tour="add-stock-item"]') as HTMLButtonElement;
        if (addButton) addButton.click();
      }
    },
    {
      id: 'refresh-button',
      title: 'Refresh Button',
      description: 'Click to refresh the stock items list and fetch latest data from the server.',
      target: '[data-tour="refresh-button"]',
      icon: <Package className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'item-name',
      title: 'Stock Item Name',
      description: 'Enter the name of the stock item (required). This will also be used as the item code.',
      target: '[data-tour="item-name"]',
      icon: <Package className="w-5 h-5" />,
      position: 'bottom',
      action: () => {
        const modal = document.querySelector('[data-tour="item-name"]');
        if (!modal) {
          const addButton = document.querySelector('[data-tour="add-stock-item"]') as HTMLButtonElement;
          if (addButton) addButton.click();
        }
      }
    },
    {
      id: 'item-description',
      title: 'Description',
      description: 'Add an optional description for the item to provide additional details.',
      target: '[data-tour="item-description"]',
      icon: <Package className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'item-category',
      title: 'Category',
      description: 'Select the item category from the Item Group doctype (required).',
      target: '[data-tour="item-category"]',
      icon: <Package className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'item-unit',
      title: 'Unit',
      description: 'Select the unit of measurement from the UOM doctype (required).',
      target: '[data-tour="item-unit"]',
      icon: <Package className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'item-warehouse',
      title: 'Department (Warehouse)',
      description: 'Select the warehouse/department where the item is stored.',
      target: '[data-tour="item-warehouse"]',
      icon: <Package className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'item-cost',
      title: 'Cost Per Unit',
      description: 'Enter the cost per unit. This is stored as the conversion factor in UOMs.',
      target: '[data-tour="item-cost"]',
      icon: <Package className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'item-opening-stock',
      title: 'Opening Stock',
      description: 'Enter the initial stock quantity. This creates a Stock Entry to add stock to the warehouse.',
      target: '[data-tour="item-opening-stock"]',
      icon: <Package className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'item-min-stock',
      title: 'Minimum Stock',
      description: 'Set the minimum reorder level. When stock falls below this, it triggers reorder alerts.',
      target: '[data-tour="item-min-stock"]',
      icon: <Package className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'item-supplier',
      title: 'Supplier',
      description: 'Select the default supplier for this item from the Supplier doctype.',
      target: '[data-tour="item-supplier"]',
      icon: <Package className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'save-item',
      title: 'Save Stock Item',
      description: 'Click to save the stock item. The button is disabled until required fields are filled.',
      target: '[data-tour="save-item"]',
      icon: <Plus className="w-5 h-5" />,
      position: 'bottom'
    }
  ];

  const currentTourStep = tourSteps[currentStep];

  useEffect(() => {
    if (isOpen && currentTourStep) {
      // Execute action if present (e.g., open modal)
      if (currentTourStep.action) {
        currentTourStep.action();
      }
      // Wait a bit for modal to open if needed
      const modalSteps = ['item-name', 'item-description', 'item-category', 'item-unit', 'item-warehouse', 'item-cost', 'item-opening-stock', 'item-min-stock', 'item-supplier', 'save-item'];
      const delay = modalSteps.includes(currentTourStep.id) ? 600 : 0;
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

export default InventoryManagementStockItemsTour;
