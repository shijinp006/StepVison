'use client';

import React from 'react';
import { Package, Tags } from 'lucide-react';

export type AdminView = 'products' | 'categories';

interface AdminTabsProps {
    active: AdminView;
    onSelect: (view: AdminView) => void;
}

const ITEMS: { view: AdminView; label: string; icon: React.ElementType }[] = [
    { view: 'products', label: 'Products', icon: Package },
    { view: 'categories', label: 'Categories', icon: Tags },
];

// Switches between the dashboard pages. Sits under the top bar; on mobile the
// tabs share the width equally.
export const AdminTabs: React.FC<AdminTabsProps> = ({ active, onSelect }) => (
    <nav aria-label="Admin" className="bg-white border-b border-neutral-200">
        <ul className="max-w-[1600px] mx-auto px-4 lg:px-8 flex">
            {ITEMS.map(({ view, label, icon: Icon }) => (
                <li key={view} className="flex-1 sm:flex-none">
                    <button
                        onClick={() => onSelect(view)}
                        aria-current={active === view ? 'page' : undefined}
                        className={`w-full flex items-center justify-center gap-2 px-5 py-3 font-medium border-b-2 -mb-px transition-colors ${
                            active === view
                                ? 'border-primary-500 text-primary-800'
                                : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300'
                        }`}
                    >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {label}
                    </button>
                </li>
            ))}
        </ul>
    </nav>
);
