import React, { createContext, useContext, useState } from 'react';
import { CartItem, Dish } from '@/types';

// le type du contexte - ce qu'on expose aux autres composants
interface CartContextType {
    items: CartItem[];
    restaurantId: string | null;
    addItem: (dish: Dish, restId: string) => void;
    removeItem: (dishId: string) => void;
    updateQuantity: (dishId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [restaurantId, setRestaurantId] = useState<string | null>(null);

    const addItem = (dish: Dish, restId: string) => {
        // si l'utilisateur ajoute un plat d'un autre restaurant
        // on vide le panier avant
        if (restaurantId && restaurantId !== restId) {
            setItems([]);
            setRestaurantId(restId);
        }

        if (!restaurantId) {
            setRestaurantId(restId);
        }

        setItems(prev => {
            const existing = prev.find(item => item.dish.id === dish.id);
            if (existing) {
                // si le plat est déjà dans le panier, on augmente la quantité
                return prev.map(item =>
                    item.dish.id === dish.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            // sinon on l'ajoute
            return [...prev, { dish, quantity: 1 }];
        });
    };

    const removeItem = (dishId: string) => {
        setItems(prev => {
            const updated = prev.filter(item => item.dish.id !== dishId);
            if (updated.length === 0) setRestaurantId(null);
            return updated;
        });
    };

    const updateQuantity = (dishId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(dishId);
            return;
        }
        setItems(prev =>
            prev.map(item =>
                item.dish.id === dishId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
        setRestaurantId(null);
    };

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{
            items,
            restaurantId,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            totalItems,
            totalPrice,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart doit être utilisé dans un CartProvider');
    }
    return context;
}