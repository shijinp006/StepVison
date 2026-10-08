'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, FolderPlus, ListPlus, Loader2, Pencil } from 'lucide-react';
import { Button } from '@/components/Button';
import { SelectMenu } from './SelectMenu';

export interface CategoryFormValues {
    name: string;
    description: string;
    parentId: string;
}

interface CategoryFormModalProps {
    title: string;
    submitLabel: string;
    icon: 'category' | 'subcategory' | 'edit';
    initialName?: string;
    initialDescription?: string;
    showDescription: boolean; // only categories have a description
    // When given, a parent category picker is shown (adding a subcategory).
    parents?: { id: string; name: string }[];
    initialParentId?: string;
    saving: boolean;
    error: string;
    onSave: (values: CategoryFormValues) => void;
    onCancel: () => void;
}

const ICONS = { category: FolderPlus, subcategory: ListPlus, edit: Pencil };

const inputClass =
    'w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all';
const labelClass = 'block text-sm font-medium text-neutral-700 mb-2';

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
    title,
    submitLabel,
    icon,
    initialName = '',
    initialDescription = '',
    showDescription,
    parents,
    initialParentId = '',
    saving,
    error,
    onSave,
    onCancel,
}) => {
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);
    const [parentId, setParentId] = useState(initialParentId);
    const Icon = ICONS[icon];

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !saving) onCancel();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [saving, onCancel]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name: name.trim(), description: description.trim(), parentId });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => !saving && onCancel()} />
            <form
                onSubmit={handleSubmit}
                role="dialog"
                aria-modal="true"
                aria-labelledby="category-form-title"
                className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6 space-y-5"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                    </div>
                    <h2 id="category-form-title" className="text-lg font-bold text-neutral-900">
                        {title}
                    </h2>
                </div>
                {parents && (
                    <div>
                        <label htmlFor="category-form-parent" className={labelClass}>
                            Parent Category <span className="text-red-500">*</span>
                        </label>
                        <SelectMenu
                            id="category-form-parent"
                            value={parentId}
                            onChange={setParentId}
                            options={parents.map((parent) => ({ value: parent.id, label: parent.name }))}
                            placeholder="Select a category"
                        />
                    </div>
                )}
                <div>
                    <label htmlFor="category-form-name" className={labelClass}>
                        Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="category-form-name"
                        type="text"
                        maxLength={100}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputClass}
                        autoFocus
                    />
                </div>
                {showDescription && (
                    <div>
                        <label htmlFor="category-form-description" className={labelClass}>
                            Description
                        </label>
                        <textarea
                            id="category-form-description"
                            rows={3}
                            maxLength={500}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={`${inputClass} resize-none`}
                            placeholder="Short description shown with the category"
                        />
                    </div>
                )}
                {error && (
                    <div className="flex items-start gap-2 bg-red-50 text-red-700 border border-red-200 rounded-lg p-3" role="alert">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={saving}>
                        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {submitLabel}
                    </Button>
                </div>
            </form>
        </div>
    );
};
