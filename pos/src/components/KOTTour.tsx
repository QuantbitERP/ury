import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, ArrowLeft, Search, RefreshCw, ChefHat, CheckCircle2, UtensilsCrossed } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  icon: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface KOTTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const KOTTour: React.FC<KOTTourProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightPosition, setHighlightPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const tourSteps: TourStep[] = [
    {
      id: 'header',
      title: 'KOT Header',
      description: 'View the header section with navigation back to EPOS, order count, and search/refresh controls',
      target: '[data-tour="kot-header"]',
      icon: <ArrowLeft className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'search',
      title: 'Search Orders',
      description: 'Use the search bar to quickly find orders by customer name, invoice number, or item name',
      target: '[data-tour="kot-search"]',
      icon: <Search className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'refresh',
      title: 'Refresh Orders',
      description: 'Click refresh to manually update the order list. Orders also auto-refresh every 30 seconds',
      target: '[data-tour="kot-refresh"]',
      icon: <RefreshCw className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'pending-column',
      title: 'Pending Column',
      description: 'View all new orders awaiting preparation. Orders appear here when received from POS',
      target: '[data-tour="pending-column"]',
      icon: <ChefHat className="w-5 h-5" />,
      position: 'right'
    },
    {
      id: 'preparing-column',
      title: 'Preparing Column',
      description: 'Track orders currently being prepared by kitchen staff',
      target: '[data-tour="preparing-column"]',
      icon: <ChefHat className="w-5 h-5" />,
      position: 'left'
    },
    {
      id: 'ready-column',
      title: 'Ready Column',
      description: 'View orders that are ready to be served to customers',
      target: '[data-tour="ready-column"]',
      icon: <CheckCircle2 className="w-5 h-5" />,
      position: 'left'
    },
    {
      id: 'kot-card',
      title: 'KOT Card',
      description: 'Each card shows order details including items, quantities, special comments, and elapsed time',
      target: '[data-tour="kot-card"]',
      icon: <UtensilsCrossed className="w-5 h-5" />,
      position: 'top'
    },
    {
      id: 'status-buttons',
      title: 'Status Action Buttons',
      description: 'Use action buttons to move orders between stages: Start Preparing, Mark Ready, or Mark Served',
      target: '[data-tour="status-buttons"]',
      icon: <CheckCircle2 className="w-5 h-5" />,
      position: 'top'
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
          className="fixed border-4 border-orange-500 rounded-lg shadow-2xl z-[100] transition-all duration-300 pointer-events-none"
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
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
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
          className="bg-orange-600 h-1.5 rounded-full transition-all duration-300"
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
          className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
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

export default KOTTour;
