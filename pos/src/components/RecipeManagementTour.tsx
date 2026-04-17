import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Search, Plus, Package, Edit2, Trash2, DollarSign, TrendingUp, ChevronRight as ChevronRightIcon } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  icon: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void; // Optional action to perform before highlighting
}

interface RecipeManagementTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const RecipeManagementTour: React.FC<RecipeManagementTourProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightPosition, setHighlightPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const tourSteps: TourStep[] = [
    {
      id: 'search',
      title: 'Search Recipes',
      description: 'Search recipes by name, item code, or description to quickly find specific recipes',
      target: '[data-tour="recipe-search"]',
      icon: <Search className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'add-recipe',
      title: 'Add Recipe Button',
      description: 'Click to open the Add New Recipe modal to create a new BOM',
      target: '[data-tour="add-recipe"]',
      icon: <Plus className="w-5 h-5" />,
      position: 'bottom',
      action: () => {
        const addButton = document.querySelector('[data-tour="add-recipe"]') as HTMLButtonElement;
        if (addButton) addButton.click();
      }
    },
    {
      id: 'recipe-table',
      title: 'Recipe Table',
      description: 'View all recipes with recipe name, menu item link, cost, sell price, gross margin, ingredient count, and actions',
      target: '[data-tour="recipe-table"]',
      icon: <Package className="w-5 h-5" />,
      position: 'top'
    },
    {
      id: 'recipe-name',
      title: 'Recipe Name',
      description: 'Enter a descriptive name for the recipe (e.g., Grilled Chicken). This field is required.',
      target: '[data-tour="recipe-name"]',
      icon: <Package className="w-5 h-5" />,
      position: 'bottom',
      action: () => {
        // Ensure modal is open
        const modal = document.querySelector('[data-tour="recipe-name"]');
        if (!modal) {
          const addButton = document.querySelector('[data-tour="add-recipe"]') as HTMLButtonElement;
          if (addButton) addButton.click();
        }
      }
    },
    {
      id: 'link-menu-item',
      title: 'Link to Menu Item',
      description: 'Search and select a menu item to link this recipe to. This links the BOM to a menu item for inventory tracking.',
      target: '[data-tour="link-menu-item"]',
      icon: <Package className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'company',
      title: 'Company Selection',
      description: 'Select the company this recipe belongs to. This field is required and ensures proper company association.',
      target: '[data-tour="recipe-company"]',
      icon: <Package className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'description',
      title: 'Description',
      description: 'Add a short description of the recipe for reference (optional)',
      target: '[data-tour="recipe-description"]',
      icon: <Package className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'sell-price',
      title: 'Sell Price',
      description: 'Enter the selling price for this recipe. Used to calculate gross margin and track profitability.',
      target: '[data-tour="sell-price"]',
      icon: <DollarSign className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'ingredients',
      title: 'Ingredients Section',
      description: 'Add ingredients to the recipe. Search items, enter quantities, specify units of measure. The system automatically calculates line costs and total cost.',
      target: '[data-tour="ingredients-section"]',
      icon: <Package className="w-5 h-5" />,
      position: 'top'
    },
    {
      id: 'add-ingredient',
      title: 'Add Ingredient Row',
      description: 'Click to add a new ingredient line to the recipe',
      target: '[data-tour="add-ingredient"]',
      icon: <Plus className="w-5 h-5" />,
      position: 'bottom'
    },
    {
      id: 'margin-summary',
      title: 'Margin Summary',
      description: 'View the cost, sell price, and gross margin percentage. Green indicates positive margin, red indicates negative margin.',
      target: '[data-tour="margin-summary"]',
      icon: <TrendingUp className="w-5 h-5" />,
      position: 'top'
    },
    {
      id: 'save-recipe',
      title: 'Save Recipe',
      description: 'Click to save the recipe. The button is disabled until recipe name and company are filled.',
      target: '[data-tour="save-recipe"]',
      icon: <Package className="w-5 h-5" />,
      position: 'top'
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
      const modalSteps = ['recipe-name', 'link-menu-item', 'company', 'description', 'sell-price', 'ingredients', 'add-ingredient', 'margin-summary', 'save-recipe'];
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
          className="fixed border-4 border-green-500 rounded-lg shadow-2xl z-[100] transition-all duration-300 pointer-events-none"
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
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
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
          className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
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
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
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

export default RecipeManagementTour;
