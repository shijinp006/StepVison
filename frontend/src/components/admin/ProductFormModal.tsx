'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, ImagePlus, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/Button';
import { AdminCategoryOption, AdminProduct } from '@/lib/adminApi';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

interface ProductFormModalProps {
    product: AdminProduct | null; // null = add new
    categories: AdminCategoryOption[];
    onSubmit: (form: FormData) => Promise<void>;
    onClose: () => void;
}

const inputClass =
    'w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all';

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, categories, onSubmit, onClose }) => {
    const isEdit = product !== null;
    const [name, setName] = useState(product?.name ?? '');
    const [price, setPrice] = useState(product ? String(product.price) : '');
    const [quantity, setQuantity] = useState(product ? String(product.quantity) : '');
    const [category, setCategory] = useState(product?.category ?? '');
    const [subcategory, setSubcategory] = useState(product?.subcategory ?? '');
    const subcategories = categories.find((c) => c.id === category)?.subcategories ?? [];
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(product?.image.url ?? null);
    const [dragging, setDragging] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Release blob URLs created for local previews.
    useEffect(() => {
        return () => {
            if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !submitting) onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [submitting, onClose]);

    const selectFile = (file: File | undefined) => {
        if (!file) return;
        if (!ACCEPTED_TYPES.includes(file.type)) {
            setError('Only JPG, PNG, WEBP or GIF images are allowed');
            return;
        }
        if (file.size > MAX_IMAGE_BYTES) {
            setError('Image must be 5 MB or smaller');
            return;
        }
        setError('');
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const priceValue = Number(price);
        const quantityValue = Number(quantity);
        if (!name.trim()) return setError('Product name is required');
        if (price === '' || Number.isNaN(priceValue) || priceValue < 0) return setError('Enter a valid price');
        if (quantity === '' || !Number.isInteger(quantityValue) || quantityValue < 0) {
            return setError('Quantity must be a whole number of 0 or more');
        }
        if (!category) return setError('Category is required');
        if (!isEdit && !imageFile) return setError('Product image is required');

        const form = new FormData();
        form.append('name', name.trim());
        form.append('price', String(priceValue));
        form.append('quantity', String(quantityValue));
        form.append('category', category);
        form.append('subcategory', subcategory);
        if (imageFile) form.append('image', imageFile);

        setSubmitting(true);
        try {
            await onSubmit(form);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not save product');
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => !submitting && onClose()} />
            <form
                onSubmit={handleSubmit}
                role="dialog"
                aria-modal="true"
                aria-labelledby="product-form-title"
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl"
            >
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-black rounded-t-xl border-b-2 border-primary-500">
                    <h2 id="product-form-title" className="text-xl font-bold text-white">
                        {isEdit ? 'Edit Product' : 'Add Product'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="text-neutral-400 hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 grid md:grid-cols-2 gap-6">
                    {/* Image */}
                    <div>
                        <span className="block text-sm font-medium text-neutral-700 mb-2">
                            Product Image {!isEdit && <span className="text-red-500">*</span>}
                        </span>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragging(true);
                            }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragging(false);
                                selectFile(e.dataTransfer.files[0]);
                            }}
                            className={`relative w-full aspect-square rounded-lg border-2 border-dashed overflow-hidden flex items-center justify-center transition-colors ${
                                dragging ? 'border-primary-500 bg-primary-50' : 'border-neutral-300 bg-neutral-50 hover:border-primary-400'
                            }`}
                        >
                            {previewUrl ? (
                                <>
                                    {/* eslint-disable-next-line @next/next/no-img-element -- local blob previews */}
                                    <img src={previewUrl} alt="Product preview" className="absolute inset-0 w-full h-full object-cover" />
                                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-sm py-2">
                                        Click or drop to replace
                                    </span>
                                </>
                            ) : (
                                <span className="flex flex-col items-center text-neutral-500 px-4 text-center">
                                    <ImagePlus className="w-10 h-10 mb-2 text-primary-500" />
                                    <span className="font-medium text-neutral-700">Click to upload</span>
                                    <span className="text-sm">or drag and drop</span>
                                    <span className="text-xs mt-2">JPG, PNG, WEBP or GIF, up to 5 MB</span>
                                </span>
                            )}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={ACCEPTED_TYPES.join(',')}
                            className="hidden"
                            onChange={(e) => {
                                selectFile(e.target.files?.[0]);
                                e.target.value = '';
                            }}
                        />
                    </div>

                    {/* Fields */}
                    <div className="space-y-5">
                        <div>
                            <label htmlFor="product-name" className="block text-sm font-medium text-neutral-700 mb-2">
                                Product Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="product-name"
                                type="text"
                                required
                                maxLength={200}
                                autoFocus
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={inputClass}
                                placeholder="e.g. Egyptian Cotton Bath Towel"
                            />
                        </div>

                        <div>
                            <label htmlFor="product-category" className="block text-sm font-medium text-neutral-700 mb-2">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="product-category"
                                required
                                value={category}
                                onChange={(e) => {
                                    setCategory(e.target.value);
                                    setSubcategory('');
                                }}
                                className={inputClass}
                            >
                                <option value="" disabled>
                                    {categories.length ? 'Select a category' : 'No categories yet. Add one under Categories'}
                                </option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="product-subcategory" className="block text-sm font-medium text-neutral-700 mb-2">
                                Subcategory
                            </label>
                            <select
                                id="product-subcategory"
                                value={subcategory}
                                onChange={(e) => setSubcategory(e.target.value)}
                                disabled={subcategories.length === 0}
                                className={`${inputClass} disabled:bg-neutral-100 disabled:text-neutral-400`}
                            >
                                <option value="">{category ? 'None' : 'Select a category first'}</option>
                                {subcategories.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="product-price" className="block text-sm font-medium text-neutral-700 mb-2">
                                Price (AED) <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="product-price"
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                inputMode="decimal"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className={inputClass}
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label htmlFor="product-quantity" className="block text-sm font-medium text-neutral-700 mb-2">
                                Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="product-quantity"
                                type="number"
                                required
                                min="0"
                                step="1"
                                inputMode="numeric"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className={inputClass}
                                placeholder="0"
                            />
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 bg-red-50 text-red-700 border border-red-200 rounded-lg p-3" role="alert">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 border-t border-neutral-200 bg-neutral-50 rounded-b-xl">
                    <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={submitting}>
                        {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isEdit ? 'Save Changes' : 'Add Product'}
                    </Button>
                </div>
            </form>
        </div>
    );
};
