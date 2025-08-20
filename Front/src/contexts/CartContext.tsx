
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, PaymentPlan, PriceVariation } from '@/types/cart';

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updatePaymentPlan: (id: string, paymentPlan: PaymentPlan) => void;
  updatePriceVariation: (id: string, priceVariation: PriceVariation) => void;
  getTotalPrice: () => number;
  getItemsByArtisan: () => Record<string, CartItem[]>;
  clearCart: () => void;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('artizaho-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('artizaho-cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setItems(prev => [...prev, { ...item, id }]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const updatePaymentPlan = (id: string, paymentPlan: PaymentPlan) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, paymentPlan } : item
    ));
  };

  const updatePriceVariation = (id: string, priceVariation: PriceVariation) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, priceVariation } : item
    ));
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = item.priceVariation?.discountedPrice || item.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const getItemsByArtisan = () => {
    return items.reduce((acc, item) => {
      if (!acc[item.artisan]) {
        acc[item.artisan] = [];
      }
      acc[item.artisan].push(item);
      return acc;
    }, {} as Record<string, CartItem[]>);
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      updatePaymentPlan,
      updatePriceVariation,
      getTotalPrice,
      getItemsByArtisan,
      clearCart,
      getItemCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
