import type { ReactNode } from 'react';

interface TabPanelProps {
    active: boolean;
    children: ReactNode;
}

export function TabPanel({ active, children }: TabPanelProps) {
    if (!active) {
        return null;
    }

    return (
        <div role="tabpanel">
            {children}
        </div>
    );
}
