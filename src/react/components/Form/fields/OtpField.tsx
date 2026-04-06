import { useRef, useCallback, type KeyboardEvent, type ClipboardEvent } from 'react';
import type { FieldSchema } from '../../../../shared/types/schema';

interface OtpFieldProps {
    schema: FieldSchema;
    value: unknown;
    onChange: (value: unknown) => void;
}

export function OtpField({ schema, value, onChange }: OtpFieldProps) {
    const length = (schema as Record<string, unknown>).length as number ?? 6;
    const numericOnly = (schema as Record<string, unknown>).numericOnly as boolean ?? true;
    const digits = String(value ?? '').padEnd(length, '').slice(0, length).split('');
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    const updateValue = useCallback((newDigits: string[]) => {
        onChange(newDigits.join(''));
    }, [onChange]);

    const handleInput = useCallback((index: number, char: string) => {
        if (numericOnly && !/^\d$/.test(char)) return;
        if (!numericOnly && !/^[a-zA-Z0-9]$/.test(char)) return;

        const newDigits = [...digits];
        newDigits[index] = char;
        updateValue(newDigits);

        // Auto-focus next
        if (index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    }, [digits, length, numericOnly, updateValue]);

    const handleKeyDown = useCallback((index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            const newDigits = [...digits];
            if (newDigits[index]) {
                newDigits[index] = '';
                updateValue(newDigits);
            } else if (index > 0) {
                newDigits[index - 1] = '';
                updateValue(newDigits);
                inputsRef.current[index - 1]?.focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputsRef.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    }, [digits, length, updateValue]);

    const handlePaste = useCallback((e: ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').slice(0, length);
        const filtered = numericOnly ? pasted.replace(/\D/g, '') : pasted.replace(/[^a-zA-Z0-9]/g, '');
        const newDigits = filtered.padEnd(length, '').slice(0, length).split('');
        updateValue(newDigits);
        inputsRef.current[Math.min(filtered.length, length - 1)]?.focus();
    }, [length, numericOnly, updateValue]);

    return (
        <div className="flex gap-2" onPaste={handlePaste}>
            {Array.from({ length }, (_, i) => (
                <input
                    key={i}
                    ref={(el) => { inputsRef.current[i] = el; }}
                    type="text"
                    inputMode={numericOnly ? 'numeric' : 'text'}
                    maxLength={1}
                    value={digits[i] || ''}
                    onChange={(e) => {
                        const char = e.target.value.slice(-1);
                        if (char) handleInput(i, char);
                    }}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    className="w-10 h-11 text-center text-lg font-mono font-semibold rounded-lg border border-s-border-strong bg-s-input text-s-text focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30 transition-colors"
                    autoComplete="one-time-code"
                />
            ))}
        </div>
    );
}
