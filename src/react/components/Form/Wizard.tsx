import { useState, type ReactNode } from 'react';
import { cn } from '../../../shared/utils/cn';

interface WizardStep {
    label: string;
    description?: string | null;
    icon?: string | null;
    columns: number;
    schema: unknown[];
}

interface WizardSchema {
    type: 'wizard';
    showStepNumbers: boolean;
    allowSkip: boolean;
    steps: WizardStep[];
}

interface WizardProps {
    schema: WizardSchema;
    children: (stepSchema: unknown[], stepColumns: number) => ReactNode;
}

export function Wizard({ schema, children }: WizardProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const { steps, showStepNumbers, allowSkip } = schema;
    const step = steps[currentStep];
    const isFirst = currentStep === 0;
    const isLast = currentStep === steps.length - 1;

    return (
        <div className="col-span-full">
            {/* Step indicator */}
            <nav className="mb-8">
                <ol className="flex items-center">
                    {steps.map((s, i) => {
                        const isActive = i === currentStep;
                        const isCompleted = i < currentStep;

                        return (
                            <li key={i} className={cn('flex items-center', i < steps.length - 1 && 'flex-1')}>
                                <button
                                    type="button"
                                    onClick={() => { if (allowSkip || i <= currentStep) setCurrentStep(i); }}
                                    disabled={!allowSkip && i > currentStep}
                                    className={cn(
                                        'flex items-center gap-3 group',
                                        (!allowSkip && i > currentStep) && 'cursor-not-allowed',
                                    )}
                                >
                                    {/* Circle */}
                                    <div className={cn(
                                        'flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold shrink-0 transition-colors',
                                        isActive && 'bg-s-accent text-s-accent-fg',
                                        isCompleted && 'bg-s-accent/10 text-s-accent',
                                        !isActive && !isCompleted && 'bg-s-surface-alt text-s-text-faint',
                                    )}>
                                        {isCompleted ? (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                            </svg>
                                        ) : showStepNumbers ? (
                                            i + 1
                                        ) : (
                                            <div className="w-2 h-2 rounded-full bg-current" />
                                        )}
                                    </div>

                                    {/* Label */}
                                    <div className="hidden sm:block text-left">
                                        <p className={cn(
                                            'text-sm font-medium transition-colors',
                                            isActive ? 'text-s-text' : 'text-s-text-muted',
                                        )}>{s.label}</p>
                                        {s.description && (
                                            <p className="text-xs text-s-text-faint">{s.description}</p>
                                        )}
                                    </div>
                                </button>

                                {/* Connector line */}
                                {i < steps.length - 1 && (
                                    <div className={cn(
                                        'flex-1 h-px mx-4 transition-colors',
                                        i < currentStep ? 'bg-s-accent/30' : 'bg-s-border',
                                    )} />
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>

            {/* Step content */}
            <div className={cn(
                'grid gap-4',
                step.columns === 1 && 'grid-cols-1',
                step.columns === 2 && 'grid-cols-2',
                step.columns === 3 && 'grid-cols-3',
                step.columns === 4 && 'grid-cols-4',
            )}>
                {children(step.schema, step.columns)}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-s-border col-span-full">
                <button
                    type="button"
                    onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                    disabled={isFirst}
                    className={cn(
                        'inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                        isFirst
                            ? 'text-s-text-faint cursor-not-allowed'
                            : 'text-s-text-secondary border border-s-border hover:bg-s-hover',
                    )}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                    Back
                </button>

                {isLast ? (
                    // Submit button is handled by the parent form — this is just a visual indicator
                    <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-s-accent px-4 py-2 text-sm font-medium text-s-accent-fg hover:opacity-90 transition-opacity"
                    >
                        Submit
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => setCurrentStep((s) => Math.min(steps.length - 1, s + 1))}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-s-accent px-4 py-2 text-sm font-medium text-s-accent-fg hover:opacity-90 transition-opacity"
                    >
                        Next
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}
