'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Package, Tags } from 'lucide-react';

export type AdminView = 'products' | 'categories';

interface AdminSidebarProps {
    active: AdminView;
    expanded: boolean;
    onToggle: () => void;
    onSelect: (view: AdminView) => void;
}

const ITEMS: { view: AdminView; label: string; icon: React.ElementType }[] = [
    { view: 'products', label: 'View Products', icon: Package },
    { view: 'categories', label: 'View Categories', icon: Tags },
];

// A narrow icon rail that opens to show labels. On desktop the open sidebar
// pushes the content aside; on tablet and mobile it slides over the content.
export const AdminSidebar: React.FC<AdminSidebarProps> = ({ active, expanded, onToggle, onSelect }) => {
    return (
        <>
            {/* Dims the content while the sidebar is open over it (below desktop). */}
            {expanded && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onToggle} aria-hidden="true" />}

            {/* Keeps the rail's space in the layout; widens on desktop when open. */}
            <div className={`relative flex-shrink-0 w-16 transition-[width] duration-200 ${expanded ? 'lg:w-64' : ''}`}>
                <nav
                    aria-label="Admin"
                    className={`absolute inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-neutral-200 overflow-y-auto overflow-x-hidden scrollbar-hidden transition-[width] duration-200 ${
                        expanded ? 'w-64 shadow-xl lg:shadow-none' : 'w-16'
                    }`}
                >
                    <div className={`flex items-center h-14 px-3 border-b border-neutral-200 ${expanded ? 'justify-between' : 'justify-center'}`}>
                        {expanded && <span className="pl-1 text-sm font-semibold uppercase tracking-wider text-neutral-500">Menu</span>}
                        <button
                            onClick={onToggle}
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-600 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                            aria-label={expanded ? 'Close sidebar' : 'Open sidebar'}
                            aria-expanded={expanded}
                            title={expanded ? 'Close sidebar' : 'Open sidebar'}
                        >
                            {expanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                    </div>

                    <ul className="flex-1 p-3 space-y-1">
                        {ITEMS.map(({ view, label, icon: Icon }) => (
                            <li key={view}>
                                <button
                                    onClick={() => onSelect(view)}
                                    title={expanded ? undefined : label}
                                    aria-label={label}
                                    aria-current={active === view ? 'page' : undefined}
                                    className={`w-full flex items-center gap-3 rounded-lg py-2.5 font-medium transition-colors ${
                                        expanded ? 'px-3' : 'justify-center'
                                    } ${
                                        active === view
                                            ? 'bg-primary-100 text-primary-800'
                                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                                    }`}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    {expanded && <span className="whitespace-nowrap">{label}</span>}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </>
    );
};
