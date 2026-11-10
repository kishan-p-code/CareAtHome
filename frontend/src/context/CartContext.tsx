'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiClient } from '../lib/api';

export interface CartItem {
  id: number;
  item_type: 'test' | 'package';
  name: string;
  price: number;
  sample_type?: string;
  fasting_required: boolean;
  fasting_hours: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number, item_type: 'test' | 'package') => void;
  isInCart: (id: number, item_type: 'test' | 'package') => boolean;
  clearCart: () => void;
  subtotal: number;
  collectionFee: number;
  discountAmount: number;
  totalAmount: number;
  couponCode: string;
  couponMessage: string;
  isApplyingCoupon: boolean;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string>('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('careathome_cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('careathome_cart', JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id && i.item_type === item.item_type);
      if (exists) return prev;
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const removeItem = (id: number, item_type: 'test' | 'package') => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.item_type === item_type)));
  };

  const isInCart = (id: number, item_type: 'test' | 'package') => {
    return items.some((i) => i.id === id && i.item_type === item_type);
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode('');
    setDiscountAmount(0);
    setCouponMessage('');
    localStorage.removeItem('careathome_cart');
  };

  const subtotal = items.reduce((acc, curr) => acc + curr.price, 0);
  // Free home collection for orders >= ₹999; otherwise ₹150
  const collectionFee = subtotal >= 999 || items.length === 0 ? 0 : 150;

  const applyCoupon = async (code: string): Promise<boolean> => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return false;
    setIsApplyingCoupon(true);
    setCouponMessage('');

    try {
      const coupon = await ApiClient.get(`/coupons/validate/${cleanCode}`);
      if (subtotal < coupon.min_order_amount) {
        setCouponMessage(`Minimum order value of ₹${coupon.min_order_amount} required for ${cleanCode}`);
        return false;
      }

      let discount = 0;
      if (coupon.discount_percent > 0) {
        discount = (subtotal * coupon.discount_percent) / 100;
      } else if (coupon.flat_discount > 0) {
        discount = coupon.flat_discount;
      }

      discount = Math.min(discount, subtotal);
      setDiscountAmount(discount);
      setCouponCode(cleanCode);
      setCouponMessage(`Coupon ${cleanCode} applied successfully! Saved ₹${Math.round(discount)}`);
      return true;
    } catch (err: any) {
      setCouponMessage(err.message || 'Invalid coupon code');
      return false;
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountAmount(0);
    setCouponMessage('');
  };

  const totalAmount = Math.max(0, subtotal + collectionFee - discountAmount);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        isInCart,
        clearCart,
        subtotal,
        collectionFee,
        discountAmount,
        totalAmount,
        couponCode,
        couponMessage,
        isApplyingCoupon,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

