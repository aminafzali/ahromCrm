import React, { useState } from 'react';
import Button from '../Button/Button';

interface Step {
  id: string;
  title: string;
  content: React.ReactNode;
  optional?: boolean;
}

interface StepperProps {
  steps: Step[];
  activeStep?: number;
  onChange?: (step: number) => void;
  orientation?: 'horizontal' | 'vertical';
  showNavigation?: boolean;
  className?: string;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStep: controlledActiveStep,
  onChange,
  orientation = 'horizontal',
  showNavigation = true,
  className = ''
}) => {
  const [internalActiveStep, setInternalActiveStep] = useState(0);
  const activeStep = controlledActiveStep ?? internalActiveStep;

  const handleNext = () => {
    const nextStep = activeStep + 1;
    if (nextStep < steps.length) {
      if (onChange) {
        onChange(nextStep);
      } else {
        setInternalActiveStep(nextStep);
      }
    }
  };

  const handleBack = () => {
    const prevStep = activeStep - 1;
    if (prevStep >= 0) {
      if (onChange) {
        onChange(prevStep);
      } else {
        setInternalActiveStep(prevStep);
      }
    }
  };

  const handleStepClick = (index: number) => {
    if (onChange) {
      onChange(index);
    } else {
      setInternalActiveStep(index);
    }
  };

  return (
    <div className={`${orientation === 'vertical' ? 'flex gap-8' : ''} ${className}`}>
      <div className={`
        flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row'}
        ${orientation === 'horizontal' ? 'w-full' : 'min-w-[200px]'}
      `}>
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`
              flex ${orientation === 'vertical' ? 'flex-row' : 'flex-col'}
              items-center
              ${orientation === 'horizontal' ? 'flex-1' : ''}
              ${index !== steps.length - 1 ? 'mb-4' : ''}
            `}
          >
            <div className="flex items-center">
              <button
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${index === activeStep ? 'bg-primary text-primary-content' : 
                    index < activeStep ? 'bg-success text-success-content' : 'bg-base-300'}
                `}
                onClick={() => handleStepClick(index)}
              >
                {index < activeStep ? '✓' : index + 1}
              </button>
              {step.title && (
                <span className={`ml-2 ${step.optional ? 'text-base-content/70' : ''}`}>
                  {step.title}
                  {step.optional && <span className="text-sm"> (Optional)</span>}
                </span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`
                ${orientation === 'vertical' ? 'w-0.5 h-8 ml-4' : 'h-0.5 w-full mt-4'}
                bg-base-300
              `} />
            )}
          </div>
        ))}
      </div>

      <div className="flex-1">
        {steps[activeStep].content}

        {showNavigation && (
          <div className="mt-8 flex justify-between">
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={activeStep === steps.length - 1}
            >
              {activeStep === steps.length - 2 ? 'Finish' : 'Next'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stepper;