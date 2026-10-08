'use client';

import { useEffect, useState } from 'react';
import { CatalogProductList, Category, Product } from '@/data/types';
import {
    CatalogProductQuery,
    fetchCategories,
    fetchProduct,
    fetchProducts,
    isCancelledRequest,
} from './catalog';

// Loads every category once per page view.
export function useCategories() {
    const [state, setState] = useState<{ categories?: Category[]; error?: string }>({});

    useEffect(() => {
        let active = true;
        fetchCategories()
            .then((categories) => active && setState({ categories }))
            .catch((err: Error) => active && setState({ error: err.message }));
        return () => {
            active = false;
        };
    }, []);

    return {
        categories: state.categories ?? [],
        loading: !state.categories && !state.error,
        error: state.error,
    };
}

// Loads one page of products matching `query`; search and filters run on the
// server. Pass null to wait (e.g. until the category is known). The last
// results stay on screen while a newer query loads, and a newer query aborts
// the one in flight so stale results never replace newer ones.
export function useCatalogProducts(query: CatalogProductQuery | null) {
    const [state, setState] = useState<{ result?: CatalogProductList; error?: string; loading: boolean }>({
        loading: true,
    });
    const queryKey = query ? JSON.stringify(query) : null;

    useEffect(() => {
        if (!queryKey) return;
        const controller = new AbortController();

        setState((prev) => ({ ...prev, loading: true, error: undefined }));
        fetchProducts(JSON.parse(queryKey), controller.signal)
            .then((result) => setState({ result, loading: false }))
            .catch((err: Error) => {
                if (isCancelledRequest(err)) return;
                setState((prev) => ({ ...prev, error: err.message, loading: false }));
            });

        return () => controller.abort();
    }, [queryKey]);

    return {
        products: state.result?.products,
        pagination: state.result?.pagination,
        loading: state.loading,
        error: state.error,
    };
}

// Loads one product. `product` is null when it does not exist.
export function useCatalogProduct(id: string) {
    const [state, setState] = useState<{ product?: Product | null; error?: string }>({});

    useEffect(() => {
        const controller = new AbortController();
        setState({});
        fetchProduct(id, controller.signal)
            .then((product) => setState({ product }))
            .catch((err: Error) => {
                if (!isCancelledRequest(err)) setState({ error: err.message });
            });
        return () => controller.abort();
    }, [id]);

    return {
        product: state.product,
        loading: state.product === undefined && !state.error,
        error: state.error,
    };
}

// `value`, but only once it has stopped changing for `delayMs`.
export function useDebouncedValue<T>(value: T, delayMs: number) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(timer);
    }, [value, delayMs]);

    return debounced;
}
