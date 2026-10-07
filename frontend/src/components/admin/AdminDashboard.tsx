'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    LogOut,
    Package,
    Boxes,
    Wallet,
    AlertTriangle,
    Loader2,
    Smartphone,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    X,
} from 'lucide-react';
import { Button } from '@/components/Button';
import { ProductFormModal } from './ProductFormModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { CategoryManager } from './CategoryManager';
import { AdminPageHeading } from './AdminPageHeading';
import { AdminSidebar, AdminView } from './AdminSidebar';
import { useToast } from '@/store/useToast';
import {
    adminApi,
    ApiError,
    AdminCategoryOption,
    AdminProduct,
    AdminSessionInfo,
    ProductListResponse,
    RequestCancelledError,
} from '@/lib/adminApi';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;
const SEARCH_MAX_LENGTH = 100; // matches the backend limit
const LOW_STOCK_THRESHOLD = 5;

// "Tabletop & Dining › Glassware" from the stored ids.
function categoryLabel(categories: AdminCategoryOption[], categoryId?: string, subcategoryId?: string) {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return categoryId ?? 'No category';
    const subcategory = category.subcategories.find((s) => s.id === subcategoryId);
    return subcategory ? `${category.name} › ${subcategory.name}` : category.name;
}

const currency = new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' });
const number = new Intl.NumberFormat('en-AE');
const dateFormat = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

interface AdminDashboardProps {
    session: AdminSessionInfo;
    onLoggedOut: () => void;
}

type ModalState = { type: 'none' } | { type: 'form'; product: AdminProduct | null } | { type: 'delete'; product: AdminProduct };

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ session, onLoggedOut }) => {
    const addToast = useToast((state) => state.addToast);
    const [data, setData] = useState<ProductListResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [modal, setModal] = useState<ModalState>({ type: 'none' });
    const [deleting, setDeleting] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [tab, setTab] = useState<AdminView>('products');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [categories, setCategories] = useState<AdminCategoryOption[]>([]);

    // A 401 from any call means the session (device) was removed or expired.
    const handleApiError = useCallback(
        (err: unknown, fallback: string) => {
            if (err instanceof ApiError && err.status === 401) {
                addToast('Your session has expired. Please sign in again.', 'warning');
                onLoggedOut();
                return;
            }
            addToast(err instanceof Error ? err.message : fallback, 'error');
        },
        [addToast, onLoggedOut]
    );

    // The request in flight. A newer load (another search or page) aborts it,
    // so a slow, stale response can never overwrite a newer one.
    const productsRequest = useRef<AbortController | null>(null);

    const loadProducts = useCallback(async () => {
        productsRequest.current?.abort();
        const controller = new AbortController();
        productsRequest.current = controller;

        setLoading(true);
        setLoadError('');
        try {
            const result = await adminApi.listProducts({ search, page, limit: PAGE_SIZE }, controller.signal);
            // Deleting the last item on a page leaves it empty; step back one page.
            if (result.products.length === 0 && page > 1) {
                setPage(page - 1);
                return;
            }
            setData(result);
        } catch (err) {
            if (err instanceof RequestCancelledError) return;
            if (err instanceof ApiError && err.status === 401) return handleApiError(err, '');
            setLoadError(err instanceof Error ? err.message : 'Could not load products');
        } finally {
            // Only the latest request decides when loading is over.
            if (productsRequest.current === controller) setLoading(false);
        }
    }, [search, page, handleApiError]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // Cancel any request still running when the dashboard closes.
    useEffect(() => () => productsRequest.current?.abort(), []);

    // Every category, for the product form selects, the table labels and the
    // parent picker on the Categories page (which loads its own paged list).
    const loadCategories = useCallback(async () => {
        try {
            const result = await adminApi.listAllCategories();
            setCategories(result.categories);
        } catch (err) {
            handleApiError(err, 'Could not load categories');
        }
    }, [handleApiError]);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    // Search once typing pauses. Clearing the box applies straight away, and
    // the page only resets when the search actually changes.
    const pendingSearch = searchInput.trim();
    const applySearch = useCallback((next: string) => {
        setSearch(next);
        setPage(1);
    }, []);

    useEffect(() => {
        if (pendingSearch === search) return;
        const timer = setTimeout(() => applySearch(pendingSearch), pendingSearch ? SEARCH_DEBOUNCE_MS : 0);
        return () => clearTimeout(timer);
    }, [pendingSearch, search, applySearch]);

    // True while the typed text is waiting to be searched, or its results are loading.
    const searching = pendingSearch !== search || (loading && Boolean(data));

    // The sidebar starts open on desktop and as an icon rail on tablet and mobile.
    useEffect(() => {
        setSidebarOpen(window.matchMedia('(min-width: 1024px)').matches);
    }, []);

    const handleSidebarSelect = (view: AdminView) => {
        setTab(view);
        // Below desktop the open sidebar covers the content, so close it.
        if (!window.matchMedia('(min-width: 1024px)').matches) setSidebarOpen(false);
    };

    const closeModal = useCallback(() => setModal({ type: 'none' }), []);

    const handleSave = async (form: FormData) => {
        if (modal.type !== 'form') return;
        try {
            const isNew = !modal.product;
            if (modal.product) {
                await adminApi.updateProduct(modal.product._id, form);
                addToast('Product updated', 'success');
            } else {
                await adminApi.createProduct(form);
                addToast('Product added', 'success');
            }
            closeModal();
            loadCategories();
            // New products appear first, so jump to page 1 (which triggers a reload).
            if (isNew && page !== 1) setPage(1);
            else await loadProducts();
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) return handleApiError(err, '');
            addToast(err instanceof Error ? err.message : 'Could not save product', 'error');
            throw err; // also shown inside the form
        }
    };

    const handleDelete = async () => {
        if (modal.type !== 'delete') return;
        setDeleting(true);
        try {
            await adminApi.deleteProduct(modal.product._id);
            addToast('Product deleted', 'success');
            closeModal();
            loadCategories();
            await loadProducts();
        } catch (err) {
            handleApiError(err, 'Could not delete product');
        } finally {
            setDeleting(false);
        }
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await adminApi.logout();
        } catch {
            // Cookies are cleared server-side when reachable; either way leave the dashboard.
        }
        addToast('Signed out', 'info');
        onLoggedOut();
    };

    const stats = data?.stats;
    const products = data?.products ?? [];
    const pagination = data?.pagination;

    const statCards = [
        { label: 'Total Products', value: stats ? number.format(stats.count) : '—', icon: Package },
        { label: 'Units in Stock', value: stats ? number.format(stats.totalQuantity) : '—', icon: Boxes },
        { label: 'Inventory Value', value: stats ? currency.format(stats.inventoryValue) : '—', icon: Wallet },
        { label: 'Low Stock', value: stats ? number.format(stats.lowStock) : '—', icon: AlertTriangle, warn: true },
    ];

    // The dashboard fills the window exactly, so the page itself never
    // scrolls; the product table scrolls inside its own panel.
    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Top bar */}
            <header className="bg-black border-b-2 border-primary-500 flex-shrink-0">
                <div className="max-w-[1600px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl font-extrabold text-white tracking-tight">StepVision</span>
                    </div>

                    <div className="flex items-center gap-3 lg:gap-5">
                        <div
                            className="hidden md:flex items-center gap-2 text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5"
                            title={`Device ID: ${session.deviceId}`}
                        >
                            <Smartphone className="w-3.5 h-3.5 text-primary-500" />
                            <span>Device</span>
                            <code className="text-neutral-200 font-mono">{session.deviceId.slice(0, 8)}</code>
                        </div>
                        <span className="hidden lg:block text-sm text-neutral-300 truncate max-w-[220px]">{session.admin.email}</span>
                        <Link
                            href="/"
                            target="_blank"
                            className="hidden sm:inline-flex items-center text-sm text-neutral-300 hover:text-primary-400"
                        >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View site
                        </Link>
                        <button
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="inline-flex items-center text-sm font-medium text-white border border-neutral-700 hover:border-primary-500 hover:text-primary-400 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                        >
                            {loggingOut ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <LogOut className="w-4 h-4 mr-1.5" />}
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 min-h-0 flex">
                <AdminSidebar
                    active={tab}
                    expanded={sidebarOpen}
                    onToggle={() => setSidebarOpen((open) => !open)}
                    onSelect={handleSidebarSelect}
                />

                <main className="flex-1 min-w-0 overflow-hidden">
                    <div className="h-full max-w-[1600px] mx-auto px-4 lg:px-8 py-6 flex flex-col">
                        {tab === 'categories' ? (
                            <CategoryManager
                                allCategories={categories}
                                onCategoriesChanged={loadCategories}
                                onApiError={handleApiError}
                            />
                        ) : (
                            <>
                            <AdminPageHeading
                                title="Products"
                                description="Add, edit and remove products in your catalogue."
                                actions={
                                    <Button variant="primary" size="lg" onClick={() => setModal({ type: 'form', product: null })}>
                                        <Plus className="w-5 h-5 mr-2" />
                                        Add Product
                                    </Button>
                                }
                            />

                            {/* Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                                {statCards.map(({ label, value, icon: Icon, warn }) => (
                                    <div key={label} className="bg-white rounded-xl border border-neutral-200 shadow-sm px-5 py-3 flex items-center gap-4">
                                        <div
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                warn ? 'bg-red-50 text-red-600' : 'bg-primary-100 text-primary-700'
                                            }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-neutral-500">{label}</p>
                                            <p className="text-xl lg:text-2xl font-bold text-neutral-900 truncate">{value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Table card */}
                            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm flex-1 min-h-0 flex flex-col">
                                <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="relative w-full sm:max-w-sm">
                                        {searching ? (
                                            <Loader2
                                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500 animate-spin"
                                                aria-label="Searching"
                                            />
                                        ) : (
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                        )}
                                        <input
                                            type="text"
                                            inputMode="search"
                                            value={searchInput}
                                            maxLength={SEARCH_MAX_LENGTH}
                                            onChange={(e) => setSearchInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                // Enter searches now instead of waiting; Escape clears.
                                                if (e.key === 'Enter' && pendingSearch !== search) applySearch(pendingSearch);
                                                if (e.key === 'Escape') setSearchInput('');
                                            }}
                                            placeholder="Search products by name..."
                                            aria-label="Search products"
                                            className="w-full pl-10 pr-10 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition-all"
                                        />
                                        {searchInput && (
                                            <button
                                                type="button"
                                                onClick={() => setSearchInput('')}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                                                aria-label="Clear search"
                                                title="Clear search"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    {pagination && (
                                        <p className="text-sm text-neutral-500">
                                            {number.format(pagination.total)} {pagination.total === 1 ? 'product' : 'products'}
                                            {search && ` matching "${search}"`}
                                        </p>
                                    )}
                                </div>

                                {loadError ? (
                                    <div className="p-12 text-center">
                                        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                                        <p className="text-neutral-700 mb-4">{loadError}</p>
                                        <Button variant="outline" onClick={loadProducts}>
                                            Try again
                                        </Button>
                                    </div>
                                ) : loading && !data ? (
                                    <div className="p-16 flex justify-center">
                                        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" aria-label="Loading products" />
                                    </div>
                                ) : products.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Package className="w-8 h-8 text-neutral-400" />
                                        </div>
                                        <h2 className="text-lg font-bold text-neutral-900 mb-1">
                                            {search ? 'No matching products' : 'No products yet'}
                                        </h2>
                                        <p className="text-neutral-500 mb-6">
                                            {search ? 'Try a different search term.' : 'Add your first product to get started.'}
                                        </p>
                                        {!search && (
                                            <Button variant="primary" onClick={() => setModal({ type: 'form', product: null })}>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Product
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    // Rows scroll inside the table under a fixed header, in whatever
                                    // height is left in the window.
                                    <div
                                        className={`flex-1 min-h-0 overflow-auto scrollbar-thin transition-opacity ${
                                            loading ? 'opacity-60' : ''
                                        }`}
                                    >
                                        <table className="w-full text-left">
                                            <thead className="sticky top-0 z-10 bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500 shadow-[inset_0_-1px_0_theme(colors.neutral.200)]">
                                                <tr>
                                                    <th className="px-4 py-3 font-semibold">Product</th>
                                                    <th className="px-4 py-3 font-semibold text-right">Price</th>
                                                    <th className="px-4 py-3 font-semibold text-right">Quantity</th>
                                                    <th className="px-4 py-3 font-semibold hidden md:table-cell">Updated</th>
                                                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-200">
                                                {products.map((product) => {
                                                    const lowStock = product.quantity <= LOW_STOCK_THRESHOLD;
                                                    return (
                                                        <tr key={product._id} className="hover:bg-neutral-50 transition-colors">
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-3 min-w-[220px]">
                                                                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0 border border-neutral-200">
                                                                        <Image src={product.image.url} alt={product.name} fill sizes="56px" className="object-cover" />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <span className="font-semibold text-neutral-900 line-clamp-2">{product.name}</span>
                                                                        <span className="block text-xs text-neutral-500 mt-0.5">
                                                                            {categoryLabel(categories, product.category, product.subcategory)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-medium text-neutral-900 whitespace-nowrap">
                                                                {currency.format(product.price)}
                                                            </td>
                                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                                <span
                                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold ${
                                                                        product.quantity === 0
                                                                            ? 'bg-red-100 text-red-700'
                                                                            : lowStock
                                                                            ? 'bg-amber-100 text-amber-800'
                                                                            : 'bg-green-100 text-green-800'
                                                                    }`}
                                                                >
                                                                    {product.quantity === 0 ? 'Out of stock' : number.format(product.quantity)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-neutral-500 whitespace-nowrap hidden md:table-cell">
                                                                {dateFormat.format(new Date(product.updatedAt))}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        onClick={() => setModal({ type: 'form', product })}
                                                                        className="p-2 rounded-lg text-neutral-600 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                                                                        aria-label={`Edit ${product.name}`}
                                                                        title="Edit"
                                                                    >
                                                                        <Pencil className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setModal({ type: 'delete', product })}
                                                                        className="p-2 rounded-lg text-neutral-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                                        aria-label={`Delete ${product.name}`}
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
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
                            </>
                        )}
                    </div>
                </main>
            </div>

            {modal.type === 'form' && (
                <ProductFormModal
                    key={modal.product?._id ?? 'new'}
                    product={modal.product}
                    categories={categories}
                    onSubmit={handleSave}
                    onClose={closeModal}
                />
            )}
            {modal.type === 'delete' && (
                <ConfirmDeleteModal
                    productName={modal.product.name}
                    deleting={deleting}
                    onConfirm={handleDelete}
                    onCancel={closeModal}
                />
            )}
        </div>
    );
};
