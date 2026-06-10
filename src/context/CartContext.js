'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('tafseela_cart');
      if (saved) setItems(JSON.parse(saved));
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('tafseela_cart', JSON.stringify(items));
    } catch (e) {}
  }, [items, mounted]);

  const addItem = (product, size, color) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === product.id && i.size === size && i.color === color);
      if (exists) return prev.map(i =>
        i.id === product.id && i.size === size && i.color === color
          ? { ...i, qty: i.qty + 1 } : i
      );
      return [...prev, {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        images: product.images || [],
        colorImages: product.colorImages || {},
        size,
        color,
        qty: 1
      }];
    });
  };

  const removeItem = (id, size, color) =>
    setItems(prev => prev.filter(i => !(i.id === id && i.size === size && i.color === color)));

  const updateQty = (id, size, color, qty) => {
    if (qty <= 0) return removeItem(id, size, color);
    setItems(prev => prev.map(i =>
      i.id === id && i.size === size && i.color === color ? { ...i, qty } : i
    ));
  };

  const clearCart = () => {
    setItems([]);
    try { localStorage.removeItem('tafseela_cart'); } catch (e) {}
  };

  const total = items.reduce((s, i) => s + Number(i.price) * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count, mounted }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};