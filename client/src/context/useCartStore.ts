import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalAmount: 0,

      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);

          let updatedItems: CartItem[];
          if (existingItem) {
            // If item already exists, increment quantity
            updatedItems = state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            );
          } else {
            // Add new item with quantity 1
            updatedItems = [...state.items, { ...item, quantity: 1 }];
          }

          // Calculate total amount
          const totalAmount = updatedItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          return { items: updatedItems, totalAmount };
        });
      },

      removeItem: (id) => {
        set((state) => {
          const updatedItems = state.items.filter((item) => item.id !== id);
          const totalAmount = updatedItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
          return { items: updatedItems, totalAmount };
        });
      },

      updateQuantity: (id, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            const updatedItems = state.items.filter((item) => item.id !== id);
            const totalAmount = updatedItems.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            );
            return { items: updatedItems, totalAmount };
          }

          const updatedItems = state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          );
          const totalAmount = updatedItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
          return { items: updatedItems, totalAmount };
        });
      },

      clearCart: () => {
        set({ items: [], totalAmount: 0 });
      },

      getTotalItems: () => {
        const state = get();
        return state.items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
