import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/data/types';

interface QuoteCartStore {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
}

export const useQuoteCart = create<QuoteCartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item, quantity = 1) => {
                set((state) => {
                    const existingItem = state.items.find((i) => i.productId === item.productId);

                    if (existingItem) {
                        // Update quantity if item already exists
                        return {
                            items: state.items.map((i) =>
                                i.productId === item.productId
                                    ? { ...i, quantity: i.quantity + quantity }
                                    : i
                            ),
                        };
                    } else {
                        // Add new item
                        return {
                            items: [...state.items, { ...item, quantity }],
                        };
                    }
                });
            },

            removeItem: (productId) => {
                set((state) => ({
                    items: state.items.filter((item) => item.productId !== productId),
                }));
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }

                set((state) => ({
                    items: state.items.map((item) =>
                        item.productId === productId ? { ...item, quantity } : item
                    ),
                }));
            },

            clearCart: () => {
                set({ items: [] });
            },

            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },
        }),
        {
            name: 'stepvision-quote-cart',
        }
    )
);
