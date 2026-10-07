'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/Button';

interface ConfirmDeleteModalProps {
    productName: string; // name of the item being deleted
    title?: string;
    message?: string; // shown after the name; defaults to the product wording
    deleting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
    productName,
    title = 'Delete product?',
    message = 'and its image will be permanently removed. This cannot be undone.',
    deleting,
    onConfirm,
    onCancel,
}) => {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !deleting) onCancel();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [deleting, onCancel]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => !deleting && onCancel()} />
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="delete-title"
                className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6"
            >
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="min-w-0">
                        <h2 id="delete-title" className="text-xl font-bold text-neutral-900 mb-2">
                            {title}
                        </h2>
                        <p className="text-neutral-600">
                            <span className="font-semibold text-neutral-900 break-words">{productName}</span> {message}
                        </p>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={onCancel} disabled={deleting} autoFocus>
                        Cancel
                    </Button>
                    <button
                        onClick={onConfirm}
                        disabled={deleting}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                    >
                        {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};
