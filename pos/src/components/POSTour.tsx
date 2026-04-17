import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, LayoutGrid, ShoppingCart, User, Table, CreditCard, MessageSquare, Utensils, Filter } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  icon: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface POSTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const POSTour: React.FC<POSTourProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightPosition, setHighlightPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const tourSteps: TourStep[] = [
    {
      id: 'sidebar',
      title: 'Menu Categories',
      description: 'Browse menu items by category. Click on a category to filter items and find what you need quickly.',
      target: '[data-tour="sidebar"]',
      icon: <LayoutGrid className="w-5 h-5" />,
      position: 'right'
    },
    {
      id: 'quick-filters',
      title: 'Quick Filters',
      description: 'Use quick filters to show all items or only special items. This helps you find popular dishes faster.',
      target: '[data-tour="quick-filters"]',
      icon: <Filter className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'menu-items',
      title: 'Menu Items Grid',
      description: 'Browse through menu items displayed as cards. Single-click to add to cart, double-click to customize.',
      target: '[data-tour="menu-items"]',
      icon: <Utensils className="w-5 h-5" />,
      position: 'top'
    },
    {
      id: 'order-type',
      title: 'Order Type Selection',
      description: 'Select the order type: Dine-in, Takeaway, Delivery, or Aggregators. This affects how the order is processed.',
      target: '[data-tour="order-type"]',
      icon: <Table className="w-5 h-5" />,
      position: 'left'
    },
    {
      id: 'customer-select',
      title: 'Customer Selection',
      description: 'Select a customer for the order. For dine-in orders, you also need to select a table number.',
      target: '[data-tour="customer-select"]',
      icon: <User className="w-5 h-5" />,
      position: 'left'
    },
    {
      id: 'order-panel',
      title: 'Order Panel',
      description: 'View and manage items in your cart. Adjust quantities, remove items, or edit customization here.',
      target: '[data-tour="order-panel"]',
      icon: <ShoppingCart className="w-5 h-5" />,
      position: 'left'
    },
    {
      id: 'comment-button',
      title: 'Order Comments',
      description: 'Add special instructions or comments to the entire order. Click the message icon to add notes.',
      target: '[data-tour="comment-button"]',
      icon: <MessageSquare className="w-5 h-5" />,
      position: 'left'
    },
    {
      id: 'submit-order',
      title: 'Submit Order',
      description: 'Review the total amount and click to submit the order. The order will be sent to the kitchen for preparation.',
      target: '[data-tour="submit-order"]',
      icon: <CreditCard className="w-5 h-5" />,
      position: 'left'
    }
  ];

  const currentTourStep = tourSteps[currentStep];

  useEffect(() => {
    if (isOpen && currentTourStep) {
      highlightElement(currentTourStep.target);
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
          className="fixed border-4 border-yellow-500 rounded-lg shadow-2xl z-[100] transition-all duration-300 pointer-events-none"
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
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
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
          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
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
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {currentStep === totalSteps - 1 ? (
            <>
              <MapPin className="w-4 h-4" />
              Finish
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4" />
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

export default POSTour;
