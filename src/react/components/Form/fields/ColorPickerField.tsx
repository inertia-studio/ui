import { cn } from '../../../../shared/utils/cn';
import type { ColorPickerFieldSchema } from '../../../../shared/types/schema';

interface ColorPickerFieldProps {
    schema: ColorPickerFieldSchema;
    value: string;
    onChange: (value: string) => void;
    error?: string | null;
}

const inputClasses =
    'w-full rounded-lg border border-s-border-strong bg-s-input px-3 py-2 text-sm text-s-text focus:border-s-accent focus:ring-1 focus:ring-s-accent/30 disabled:opacity-50 disabled:cursor-not-allowed';

export function ColorPickerField({ schema, value, onChange, error }: ColorPickerFieldProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={value ?? '#000000'}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={schema.disabled}
                    className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-s-border-strong p-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <input
                    id={schema.name}
                    type="text"
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={schema.format === 'hex' ? '#000000' : schema.format}
                    disabled={schema.disabled}
                    className={cn(
                        inputClasses,
                        error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                    )}
                />
            </div>
            {schema.swatches.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {schema.swatches.map((swatch: string) => (
                        <button
                            key={swatch}
                            type="button"
                            onClick={() => onChange(swatch)}
                            disabled={schema.disabled}
                            className={cn(
                                'h-6 w-6 rounded border-2 transition-transform hover:scale-110',
                                value === swatch ? 'border-s-accent ring-1 ring-s-accent' : 'border-s-border',
                                'disabled:opacity-50 disabled:cursor-not-allowed',
                            )}
                            style={{ backgroundColor: swatch }}
                            title={swatch}
                            aria-label={`Select color ${swatch}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
