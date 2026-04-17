import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Package, Search, Plus, Edit, Trash2, FileText, ChevronRight as ChevronRightIcon } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  icon: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void; // Optional action to perform before highlighting
}

interface InventoryManagementGoodsReceiptsTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const InventoryManagementGoodsReceiptsTour: React.FC<InventoryManagementGoodsReceiptsTourProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightPosition, setHighlightPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const tourSteps: TourStep[] = [
    {
      id: 'dashboard-metrics',
      title: 'Dashboard Metrics',
      description: 'View key metrics: Total Receipts, Pending Receipts, Monthly Receipts, and Total Value.',
      target: '[data-tour="gr-dashboard-metrics"]',
      icon: <FileText className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'search-bar',
      title: 'Search Bar',
      description: 'Search goods receipts by supplier or purchase order. Results update in real-time.',
      target: '[data-tour="gr-search"]',
      icon: <Search className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'create-gr',
      title: 'Receive Goods',
      description: 'Click to open the Receive Goods modal to create a new goods receipt.',
      target: '[data-tour="create-gr"]',
      icon: <Plus className="w-5 h-5" />,
      position: 'bottom',
      action: () => {
        const addButton = document.querySelector('[data-tour="create-gr"]') as HTMLButtonElement;
        if (addButton) addButton.click();
      }
    },
    {
      id: 'supplier',
      title: 'Supplier',
      description: 'Select the supplier from the dropdown (required). This is who delivered the goods.',
      target: '[data-tour="gr-supplier"]',
      icon: <Package className="w-5 h-5" />,
      position: 'bottom',
      action: () => {
        const modal = document.querySelector('[data-tour="gr-supplier"]');
        if (!modal) {
          const addButton = document.querySelector('[data-tour="create-gr"]') as HTMLButtonElement;
          if (addButton) addButton.click();
        }
      }
    },
    {
      id: 'purchase-order',
      title: 'Purchase Order',
      description: 'Select the linked purchase order (optional). Auto-populates items from the PO.',
      target: '[data-tour="gr-purchase-order"]',
      icon: <FileText className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'company',
      title: 'Company',
      description: 'Select the company for this goods receipt (required). Ensures proper company association.',
      target: '[data-tour="gr-company"]',
      icon: <FileText className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'warehouse',
      title: 'Requesting Department (Warehouse)',
      description: 'Select the warehouse where goods will be stored (required). Updates inventory in this location.',
      target: '[data-tour="gr-warehouse"]',
      icon: <Package className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'delivery-note',
      title: 'Delivery Note Number',
      description: 'Enter the suppliers delivery note number. Maps to supplier_delivery_note field.',
      target: '[data-tour="gr-delivery-note"]',
      icon: <FileText className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'supplier-invoice',
      title: 'Supplier Invoice Number',
      description: 'Enter the suppliers invoice number for reference and accounting.',
      target: '[data-tour="gr-supplier-invoice"]',
      icon: <FileText className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'invoice-date',
      title: 'Invoice Date',
      description: 'Select the date on the suppliers invoice. Maps to posting_date field.',
      target: '[data-tour="gr-invoice-date"]',
      icon: <FileText className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'overall-notes',
      title: 'Overall Notes',
      description: 'Add notes about supplier performance, delivery quality, or any issues with the shipment.',
      target: '[data-tour="gr-overall-notes"]',
      icon: <FileText className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'items-tab',
      title: 'Receipt Items Tab',
      description: 'Click to access the Receipt Items tab where you add and manage receipt items.',
      target: '[data-tour="gr-items-tab"]',
      icon: <Package className="w-5 h-5" />,
      position: 'bottom',
      action: () => {
        const tab = document.querySelector('[data-tour="gr-items-tab"]') as HTMLElement;
        if (tab) tab.click();
      }
    },
    {
      id: 'add-item',
      title: 'Add Item',
      description: 'Click to add a new item row to the goods receipt. At least one item is required.',
      target: '[data-tour="gr-add-item"]',
      icon: <Plus className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'item-ingredient',
      title: 'Item Ingredient',
      description: 'Select the item from the dropdown. This is the product being received.',
      target: '[data-tour="gr-item-ingredient"]',
      icon: <Package className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'item-qty',
      title: 'Received Qty',
      description: 'Enter the quantity of items actually received. Must be a positive number.',
      target: '[data-tour="gr-item-qty"]',
      icon: <Package className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'item-rate',
      title: 'Rate',
      description: 'Enter the unit price per item. This is the cost from the supplier invoice.',
      target: '[data-tour="gr-item-rate"]',
      icon: <FileText className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'item-discount-type',
      title: 'Discount Type',
      description: 'Select discount type: Percent or Amount. Determines how discount is calculated.',
      target: '[data-tour="gr-item-discount-type"]',
      icon: <FileText className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'item-discount-value',
      title: 'Discount Value',
      description: 'Enter the discount amount or percentage. Applied to the item total.',
      target: '[data-tour="gr-item-discount-value"]',
      icon: <FileText className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'item-batch',
      title: 'Batch No',
      description: 'Enter the batch number for tracking (if applicable). Required for items with batch tracking.',
      target: '[data-tour="gr-item-batch"]',
      icon: <FileText className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'item-vat-exempt',
      title: 'VAT Exempt Item',
      description: 'Check if this item is VAT exempt. VAT is not calculated for exempt items.',
      target: '[data-tour="gr-item-vat-exempt"]',
      icon: <FileText className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'item-notes',
      title: 'Item Notes',
      description: 'Add item-specific notes about the received goods, quality, or condition.',
      target: '[data-tour="gr-item-notes"]',
      icon: <FileText className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'delete-item',
      title: 'Delete Item',
      description: 'Click to remove this item from the goods receipt.',
      target: '[data-tour="gr-delete-item"]',
      icon: <Trash2 className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'submit-gr',
      title: 'Submit Goods Receipt',
      description: 'Click to submit the goods receipt. The button is disabled until required fields are filled and at least one item is added.',
      target: '[data-tour="gr-submit"]',
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
      const modalSteps = ['supplier', 'purchase-order', 'company', 'warehouse', 'delivery-note', 'supplier-invoice', 'invoice-date', 'overall-notes', 'add-item', 'item-ingredient', 'item-qty', 'item-rate', 'item-discount-type', 'item-discount-value', 'item-batch', 'item-vat-exempt', 'item-notes', 'delete-item', 'submit-gr'];
      const tabSteps = ['items-tab', 'add-item', 'item-ingredient', 'item-qty', 'item-rate', 'item-discount-type', 'item-discount-value', 'item-batch', 'item-vat-exempt', 'item-notes', 'delete-item', 'submit-gr'];
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

export default InventoryManagementGoodsReceiptsTour;
