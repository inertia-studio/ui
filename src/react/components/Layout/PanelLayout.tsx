import { useState, useCallback, type ReactNode } from 'react';
import { usePanel } from '../../hooks/usePanel';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../Toast';
import { LoadingBar } from '../LoadingBar';

interface PanelLayoutProps {
    children: ReactNode;
}

function getStoredCollapsed(fallback: boolean): boolean {
    if (typeof localStorage === 'undefined') return fallback;
    const stored = localStorage.getItem('studio-sidebar-collapsed');
    if (stored === null) return fallback;
    return stored === 'true';
}

export function PanelLayout({ children }: PanelLayoutProps) {
    const { layout } = usePanel();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(
        () => getStoredCollapsed(layout?.sidebar?.defaultCollapsed ?? false),
    );
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleToggleCollapse = useCallback(() => {
        setSidebarCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('studio-sidebar-collapsed', String(next));
            return next;
        });
    }, []);

    return (
        <div className="flex h-screen overflow-hidden bg-s-bg relative">
            <LoadingBar />
            {/* Sidebar */}
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggleCollapse={handleToggleCollapse}
                mobileOpen={mobileOpen}
                onCloseMobile={() => setMobileOpen(false)}
            />

            {/* Main area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <Topbar onToggleMobile={() => setMobileOpen(prev => !prev)} />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {children}
                </main>
                <ToastContainer />
            </div>
        </div>
    );
}
