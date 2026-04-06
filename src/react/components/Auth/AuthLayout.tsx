import { useState, useEffect, useCallback, type ReactNode } from 'react';
import type { PanelSchema } from '../../../shared/types/schema';

interface AuthLayoutProps {
    panel: PanelSchema;
    children: ReactNode;
}

export function AuthLayout({ panel, children }: AuthLayoutProps) {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('studio-color-mode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = stored === 'dark' || (stored !== 'light' && prefersDark);

        setDarkMode(isDark);
        const el = document.querySelector('[data-studio-panel]');
        if (el) el.classList.toggle('dark', isDark);
    }, []);

    const toggleDark = useCallback(() => {
        const next = !darkMode;
        setDarkMode(next);
        localStorage.setItem('studio-color-mode', next ? 'dark' : 'light');
        const el = document.querySelector('[data-studio-panel]');
        if (el) el.classList.toggle('dark', next);
    }, [darkMode]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-s-bg px-4">
            <div className="w-full max-w-md">
                {/* Brand */}
                <div className="mb-8 text-center">
                    {panel.brandLogo ? (
                        <img
                            src={darkMode && (panel as Record<string, unknown>).brandLogoDark ? String((panel as Record<string, unknown>).brandLogoDark) : panel.brandLogo}
                            alt={panel.brandName}
                            className="mx-auto h-10 w-auto"
                        />
                    ) : (
                        <h1 className="text-2xl font-bold text-s-text tracking-tight">
                            {panel.brandName}
                        </h1>
                    )}
                </div>

                {children}

                {/* Theme toggle — right after card */}
                <div className="flex items-center justify-center mt-6">
                    <button
                        type="button"
                        onClick={toggleDark}
                        className="group flex items-center gap-2.5 rounded-full px-3 py-1.5"
                        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        <span className="text-[11px] text-s-text-faint group-hover:text-s-text-muted transition-colors">
                            {darkMode ? 'Dark' : 'Light'}
                        </span>

                        {/* Switch track */}
                        <div
                            className="relative w-9 h-5 rounded-full transition-colors"
                            style={{ background: darkMode ? 'rgb(var(--s-accent))' : 'rgb(var(--s-border-strong))' }}
                        >
                            {/* Switch thumb */}
                            <div
                                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform"
                                style={{ transform: darkMode ? 'translateX(18px)' : 'translateX(2px)' }}
                            >
                                {/* Icon inside thumb */}
                                {darkMode ? (
                                    <svg className="w-2.5 h-2.5 m-[3px] text-s-accent" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                                    </svg>
                                ) : (
                                    <svg className="w-2.5 h-2.5 m-[3px] text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
