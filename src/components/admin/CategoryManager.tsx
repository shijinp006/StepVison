'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Folder, FolderPlus, ListPlus, Loader2, AlertTriangle, Pencil, Tag, Trash2, Tags } from 'lucide-react';
import { Button } from '@/components/Button';
import { AdminPageHeading } from './AdminPageHeading';
import { CategoryFormModal, CategoryFormValues } from './CategoryFormModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { useToast } from '@/store/useToast';
import {
    adminApi,
    ApiError,
    AdminCategory,
    AdminCategoryOption,
    AdminSubcategory,
    CategoryListResponse,
    RequestCancelledError,
} from '@/lib/adminApi';

interface CategoryManagerProps {
    allCategories: AdminCategoryOption[]; // every category, for the parent picker
    onCategoriesChanged: () => Promise<void>; // reloads allCategories
    onApiError: (err: unknown, fallback: string) => void;
}

const PAGE_SIZE = 10;

// The category or subcategory being deleted.
type DeleteTarget =
    | { type: 'category'; category: AdminCategory }
    | { type: 'subcategory'; category: AdminCategory; subcategory: AdminSubcategory };

// Which add/edit form is open.
type FormState =
    | { type: 'add-category' }
    | { type: 'add-subcategory'; parentId: string }
    | { type: 'edit-category'; category: AdminCategory }
    | { type: 'edit-subcategory'; category: AdminCategory; subcategory: AdminSubcategory };

const iconButton = 'p-2 rounded-lg text-neutral-600 transition-colors';
const chipButton = 'p-1.5 rounded-md text-neutral-400 transition-colors';

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

export const CategoryManager: React.FC<CategoryManagerProps> = ({ allCategories, onCategoriesChanged, onApiError }) => {
    const addToast = useToast((state) => state.addToast);

    // The list is paginated on the server, one page at a time.
    const [page, setPage] = useState(1);
    const [data, setData] = useState<CategoryListResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const [form, setForm] = useState<FormState | null>(null);
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
    const [deleting, setDeleting] = useState(false);

    // A newer load aborts the one in flight, so a stale page never replaces a newer one.
    const pageRequest = useRef<AbortController | null>(null);

    const loadPage = useCallback(async () => {
        pageRequest.current?.abort();
        const controller = new AbortController();
        pageRequest.current = controller;

        setLoading(true);
        setLoadError('');
        try {
            const result = await adminApi.listCategories({ page, limit: PAGE_SIZE }, controller.signal);
            // Deleting the last category on a page leaves it empty; step back one page.
            if (result.categories.length === 0 && page > 1) {
                setPage(page - 1);
                return;
            }
            setData(result);
        } catch (err) {
            if (err instanceof RequestCancelledError) return;
            if (err instanceof ApiError && err.status === 401) return onApiError(err, '');
            setLoadError(err instanceof Error ? err.message : 'Could not load categories');
        } finally {
            if (pageRequest.current === controller) setLoading(false);
        }
    }, [page, onApiError]);

    useEffect(() => {
        loadPage();
    }, [loadPage]);

    useEffect(() => () => pageRequest.current?.abort(), []);

    // After a change, refresh both this page and the full list used elsewhere.
    const reloadAll = () => Promise.all([loadPage(), onCategoriesChanged()]);

    const openForm = (next: FormState) => {
        setFormError('');
        setForm(next);
    };

    // Each form saves through one request and closes with a toast.
    const saveForm = async ({ name, description, parentId }: CategoryFormValues) => {
        if (!form) return;
        setFormError('');
        if (form.type === 'add-subcategory' && !parentId) return setFormError('Select a parent category');
        if (!name) return setFormError('Name is required');

        setSaving(true);
        try {
            if (form.type === 'add-category') {
                await adminApi.createCategory({ name, description: description || undefined });
                addToast(`Category "${name}" added`, 'success');
            } else if (form.type === 'add-subcategory') {
                await adminApi.createSubcategory(parentId, name);
                addToast(`Subcategory "${name}" added`, 'success');
            } else if (form.type === 'edit-category') {
                await adminApi.updateCategory(form.category.id, { name, description: description || undefined });
                addToast('Category updated', 'success');
            } else {
                await adminApi.updateSubcategory(form.category.id, form.subcategory.id, name);
                addToast('Subcategory updated', 'success');
            }
            setForm(null);
            await reloadAll();
        } catch (err) {
            // 401s end the session; anything else is shown inside the form and as a toast.
            if (err instanceof ApiError && err.status === 401) {
                onApiError(err, 'Could not save');
            } else {
                const message = err instanceof Error ? err.message : 'Could not save';
                setFormError(message);
                addToast(message, 'error');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            if (deleteTarget.type === 'category') {
                await adminApi.deleteCategory(deleteTarget.category.id);
                addToast('Category deleted', 'success');
            } else {
                const { category, subcategory } = deleteTarget;
                await adminApi.deleteSubcategory(category.id, subcategory.id);
                addToast('Subcategory deleted', 'success');
            }
            setDeleteTarget(null);
            await reloadAll();
        } catch (err) {
            onApiError(err, 'Could not delete');
        } finally {
            setDeleting(false);
        }
    };

    const categories = data?.categories;
    const pagination = data?.pagination;

    return (
        <>
            <AdminPageHeading
                title="Categories"
                description="Add categories and subcategories to organise your products."
                actions={
                    <>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => openForm({ type: 'add-subcategory', parentId: '' })}
                            disabled={allCategories.length === 0}
                        >
                            <ListPlus className="w-5 h-5 mr-2" />
                            Add Subcategory
                        </Button>
                        <Button variant="primary" size="lg" onClick={() => openForm({ type: 'add-category' })}>
                            <FolderPlus className="w-5 h-5 mr-2" />
                            Add Category
                        </Button>
                    </>
                }
            />

            {/* Category list: fills the rest of the window and scrolls inside. */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm flex-1 min-h-0 flex flex-col">
                <div className="p-4 border-b border-neutral-200 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-bold text-neutral-900">All Categories</h2>
                    {pagination && (
                        <p className="text-base text-neutral-500">
                            {pagination.total} {pagination.total === 1 ? 'category' : 'categories'}
                        </p>
                    )}
                </div>

                {loadError ? (
                    <div className="p-12 text-center">
                        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                        <p className="text-neutral-700 mb-4">{loadError}</p>
                        <Button variant="outline" onClick={loadPage}>
                            Try again
                        </Button>
                    </div>
                ) : !categories ? (
                    <div className="p-16 flex justify-center">
                        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" aria-label="Loading categories" />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Tags className="w-8 h-8 text-neutral-400" />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 mb-1">No categories yet</h3>
                        <p className="text-neutral-500 mb-6">Add your first category to get started.</p>
                        <Button variant="primary" onClick={() => openForm({ type: 'add-category' })}>
                            <FolderPlus className="w-4 h-4 mr-2" />
                            Add Category
                        </Button>
                    </div>
                ) : (
                    <ul
                        className={`flex-1 min-h-0 overflow-auto scrollbar-thin divide-y divide-neutral-200 transition-opacity ${
                            loading ? 'opacity-60' : ''
                        }`}
                    >
                        {categories.map((category) => (
                            <li key={category.id} className="p-5">
                                {/* Category */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div className="w-11 h-11 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center flex-shrink-0">
                                            <Folder className="w-6 h-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-lg font-bold text-neutral-900">{category.name}</h3>
                                                <span className="px-2 py-0.5 rounded-md bg-primary-600 text-white text-xs font-semibold uppercase tracking-wide">
                                                    Category
                                                </span>
                                                <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 text-sm">
                                                    {plural(category.productCount, 'product')}
                                                </span>
                                            </div>
                                            {category.description && (
                                                <p className="text-base text-neutral-600 mt-1">{category.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-shrink-0">
                                        <button
                                            onClick={() => openForm({ type: 'add-subcategory', parentId: category.id })}
                                            className={`${iconButton} hover:text-primary-700 hover:bg-primary-50`}
                                            aria-label={`Add subcategory to ${category.name}`}
                                            title="Add subcategory"
                                        >
                                            <ListPlus className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => openForm({ type: 'edit-category', category })}
                                            className={`${iconButton} hover:text-primary-700 hover:bg-primary-50`}
                                            aria-label={`Edit ${category.name}`}
                                            title="Edit category"
                                        >
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget({ type: 'category', category })}
                                            className={`${iconButton} hover:text-red-600 hover:bg-red-50`}
                                            aria-label={`Delete ${category.name}`}
                                            title="Delete category"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Its subcategories, indented under it with a connecting line */}
                                <div className="mt-4 ml-5 pl-6 border-l-2 border-primary-200">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                                        Subcategories ({category.subcategories.length})
                                    </p>
                                    {category.subcategories.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {category.subcategories.map((sub) => (
                                                <span
                                                    key={sub.id}
                                                    className="inline-flex items-center gap-2 pl-3 pr-1 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 text-base text-neutral-800"
                                                >
                                                    <Tag className="w-4 h-4 text-primary-600 flex-shrink-0" />
                                                    {sub.name}
                                                    <span className="text-sm text-neutral-500">{plural(sub.productCount, 'product')}</span>
                                                    <span className="flex">
                                                        <button
                                                            onClick={() => openForm({ type: 'edit-subcategory', category, subcategory: sub })}
                                                            className={`${chipButton} hover:text-primary-700 hover:bg-primary-50`}
                                                            aria-label={`Edit ${sub.name}`}
                                                            title="Edit subcategory"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteTarget({ type: 'subcategory', category, subcategory: sub })}
                                                            className={`${chipButton} hover:text-red-600 hover:bg-red-50`}
                                                            aria-label={`Delete ${sub.name}`}
                                                            title="Delete subcategory"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </span>
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-base text-neutral-400">No subcategories yet</p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between gap-3 p-4 border-t border-neutral-200">
                        <p className="text-sm text-neutral-500">
                            Page {pagination.page} of {pagination.totalPages}
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page <= 1 || loading}>
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={page >= pagination.totalPages || loading}
                            >
                                Next
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {form?.type === 'add-category' && (
                <CategoryFormModal
                    title="Add Category"
                    submitLabel="Add Category"
                    icon="category"
                    showDescription
                    saving={saving}
                    error={formError}
                    onSave={saveForm}
                    onCancel={() => setForm(null)}
                />
            )}
            {form?.type === 'add-subcategory' && (
                <CategoryFormModal
                    title="Add Subcategory"
                    submitLabel="Add Subcategory"
                    icon="subcategory"
                    showDescription={false}
                    parents={allCategories}
                    initialParentId={form.parentId}
                    saving={saving}
                    error={formError}
                    onSave={saveForm}
                    onCancel={() => setForm(null)}
                />
            )}
            {form?.type === 'edit-category' && (
                <CategoryFormModal
                    title="Edit Category"
                    submitLabel="Save Changes"
                    icon="edit"
                    initialName={form.category.name}
                    initialDescription={form.category.description}
                    showDescription
                    saving={saving}
                    error={formError}
                    onSave={saveForm}
                    onCancel={() => setForm(null)}
                />
            )}
            {form?.type === 'edit-subcategory' && (
                <CategoryFormModal
                    title={`Edit Subcategory in ${form.category.name}`}
                    submitLabel="Save Changes"
                    icon="edit"
                    initialName={form.subcategory.name}
                    showDescription={false}
                    saving={saving}
                    error={formError}
                    onSave={saveForm}
                    onCancel={() => setForm(null)}
                />
            )}

            {deleteTarget && (
                <ConfirmDeleteModal
                    title={deleteTarget.type === 'category' ? 'Delete category?' : 'Delete subcategory?'}
                    productName={deleteTarget.type === 'category' ? deleteTarget.category.name : deleteTarget.subcategory.name}
                    message={
                        deleteTarget.type === 'category'
                            ? 'and all its subcategories will be permanently removed. This cannot be undone.'
                            : 'will be permanently removed. This cannot be undone.'
                    }
                    deleting={deleting}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </>
    );
};
