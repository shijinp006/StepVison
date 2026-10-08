'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

const MENU_MAX_HEIGHT = 240;
const MENU_GAP = 4; // space between the trigger and the list
const VIEWPORT_MARGIN = 8; // keep the list off the screen edges

export interface SelectMenuOption {
    value: string;
    label: string;
}

interface SelectMenuProps {
    id?: string;
    value: string;
    options: SelectMenuOption[];
    placeholder: string;
    disabled?: boolean;
    onChange: (value: string) => void;
}

// Places the list below the trigger, or above it when there is more room
// there, sized to fit the viewport.
const menuPosition = (trigger: HTMLElement): React.CSSProperties => {
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP - VIEWPORT_MARGIN;
    const spaceAbove = rect.top - MENU_GAP - VIEWPORT_MARGIN;
    const openUp = spaceBelow < Math.min(MENU_MAX_HEIGHT, 160) && spaceAbove > spaceBelow;
    const position: React.CSSProperties = {
        left: rect.left,
        width: rect.width,
        maxHeight: Math.min(MENU_MAX_HEIGHT, openUp ? spaceAbove : spaceBelow),
    };
    if (openUp) position.bottom = window.innerHeight - rect.top + MENU_GAP;
    else position.top = rect.bottom + MENU_GAP;
    return position;
};

// A dropdown with a fixed-height, scrollable list. Native <select> popups
// cannot be sized, so long category lists would otherwise fill the screen.
// The list is portalled to <body> so a scrolling modal never clips it.
export const SelectMenu: React.FC<SelectMenuProps> = ({ id, value, options, placeholder, disabled, onChange }) => {
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const selected = options.find((o) => o.value === value);

    // Position the list before paint and follow the trigger on scroll/resize.
    useLayoutEffect(() => {
        if (!open) return;
        const update = () => {
            if (triggerRef.current) setMenuStyle(menuPosition(triggerRef.current));
        };
        update();
        const onScroll = (e: Event) => {
            if (e.target !== listRef.current) update();
        };
        window.addEventListener('resize', update);
        window.addEventListener('scroll', onScroll, true);
        return () => {
            window.removeEventListener('resize', update);
            window.removeEventListener('scroll', onScroll, true);
        };
    }, [open]);

    // Close when clicking anywhere outside the trigger and the list.
    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: PointerEvent) => {
            const target = e.target as Node;
            if (!rootRef.current?.contains(target) && !listRef.current?.contains(target)) setOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [open]);

    // Keep the highlighted option visible while using the arrow keys.
    useEffect(() => {
        if (open && activeIndex >= 0) {
            listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
        }
    }, [open, activeIndex]);

    const openMenu = () => {
        setActiveIndex(Math.max(0, options.findIndex((o) => o.value === value)));
        setOpen(true);
    };

    const choose = (option: SelectMenuOption) => {
        onChange(option.value);
        setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;
        if (!open) {
            if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
                e.preventDefault();
                openMenu();
            }
            return;
        }
        if (e.key === 'Escape') {
            // Close only the menu, not the surrounding modal.
            e.stopPropagation();
            setOpen(false);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(options.length - 1, i + 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(0, i - 1));
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (options[activeIndex]) choose(options[activeIndex]);
        } else if (e.key === 'Tab') {
            setOpen(false);
        }
    };

    return (
        <div ref={rootRef} className="relative" onKeyDown={handleKeyDown}>
            <button
                ref={triggerRef}
                id={id}
                type="button"
                disabled={disabled}
                onClick={() => (open ? setOpen(false) : openMenu())}
                aria-haspopup="listbox"
                aria-expanded={open}
                className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border bg-white text-left outline-none transition-all disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed ${
                    open ? 'border-primary-500 ring-2 ring-primary-200' : 'border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                }`}
            >
                <span className={`truncate ${selected ? 'text-neutral-900' : 'text-neutral-500'}`}>
                    {selected?.label ?? placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 flex-shrink-0 text-neutral-500 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open &&
                createPortal(
                    <ul
                        ref={listRef}
                        role="listbox"
                        style={menuStyle}
                        className="fixed z-[60] overflow-y-auto scrollbar-thin rounded-lg border border-neutral-200 bg-white py-1 shadow-lg"
                    >
                        {options.length === 0 && <li className="px-4 py-2 text-sm text-neutral-500">No options</li>}
                        {options.map((option, index) => {
                            const isSelected = option.value === value;
                            return (
                                <li
                                    key={option.value}
                                    role="option"
                                    aria-selected={isSelected}
                                    onPointerEnter={() => setActiveIndex(index)}
                                    onClick={() => choose(option)}
                                    className={`flex items-center justify-between gap-2 px-4 py-2 text-sm cursor-pointer ${
                                        index === activeIndex ? 'bg-primary-50' : ''
                                    } ${isSelected ? 'font-medium text-primary-700' : 'text-neutral-800'}`}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
                                </li>
                            );
                        })}
                    </ul>,
                    document.body,
                )}
        </div>
    );
};
