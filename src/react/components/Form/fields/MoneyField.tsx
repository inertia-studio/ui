import { cn } from '../../../../shared/utils/cn';
import type { MoneyFieldSchema } from '../../../../shared/types/schema';

interface MoneyFieldProps {
    schema: MoneyFieldSchema;
    value: number | null;
    onChange: (value: number | null) => void;
    error?: string | null;
}

const inputClasses =
    'w-full rounded-lg border border-s-border-strong bg-s-input px-3 py-2 text-sm text-s-text focus:border-s-accent focus:ring-1 focus:ring-s-accent/30 disabled:opacity-50 disabled:cursor-not-allowed';

const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '\u20AC',
    GBP: '\u00A3',
    JPY: '\u00A5',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'CHF',
    CNY: '\u00A5',
    INR: '\u20B9',
    BRL: 'R$',
};

export function MoneyField({ schema, value, onChange, error }: MoneyFieldProps) {
    const symbol = currencySymbols[schema.currency] ?? schema.currency;

    return (
        <div className="flex">
            <span className="inline-flex items-center rounded-l-studio border border-r-0 border-s-border-strong bg-s-bg px-3 text-sm text-s-text-muted">
                {symbol}
            </span>
            <input
                id={schema.name}
                type="number"
                value={value ?? ''}
                onChange={(e) => {
                    const raw = e.target.value;
                    onChange(raw === '' ? null : Number(raw));
                }}
                placeholder={schema.placeholder ?? '0.00'}
                disabled={schema.disabled}
                step="0.01"
                className={cn(
                    inputClasses,
                    'rounded-l-none',
                    error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                )}
            />
        </div>
    );
}
