import { cn } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';

export interface StepperStep {
  id: number;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: StepperStep[];
  currentStep: number; // 1-indexed
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <nav
      aria-label="Progress"
      className={cn('w-full', className)}
    >
      <ol className="flex items-start">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.id}
              className={cn(
                'flex items-start',
                !isLast && 'flex-1'
              )}
            >
              {/* Step circle + label */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-semibold transition-colors',
                    isCompleted &&
                      'bg-[#0F1B2D] border-[#0F1B2D] text-white',
                    isActive &&
                      'bg-white border-[#0F1B2D] text-[#0F1B2D]',
                    !isCompleted &&
                      !isActive &&
                      'bg-white border-slate-300 text-slate-400'
                  )}
                >
                  {isCompleted ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="mt-2 text-center">
                  <span
                    className={cn(
                      'text-xs font-medium block',
                      isActive ? 'text-[#0F1B2D]' : 'text-slate-500'
                    )}
                  >
                    {step.label}
                  </span>
                  {step.description && (
                    <span className="text-xs text-slate-400 hidden sm:block">
                      {step.description}
                    </span>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 pt-4 px-2">
                  <div
                    className={cn(
                      'h-0.5 w-full transition-colors',
                      isCompleted ? 'bg-[#0F1B2D]' : 'bg-slate-200'
                    )}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
