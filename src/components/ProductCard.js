'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    addItem(product, product.sizes?.[0], product.colors?.[0]);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Link href={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: 'white', transition: 'transform 0.3s',
          transform: hovered ? 'translateY(-4px)' : 'none',
          boxShadow: hovered ? '0 8px 30px rgba(0,0,0,0.08)' : 'none'
        }}
      >
        <div style={{ position: 'relative', paddingBottom: '130%', overflow: 'hidden', background: '#f5f5f5' }}>
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.5s', transform: hovered ? 'scale(1.05)' : 'scale(1)'
            }} />
          ) : (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '0.8rem'
            }}>لا توجد صورة</div>
          )}
          {product.badge && (
            <span style={{
              position: 'absolute', top: 12, right: 12, background: 'var(--gold)',
              color: 'white', padding: '4px 10px', fontSize: '0.7rem', fontWeight: 700
            }}>{product.badge}</span>
          )}
        </div>
        <div style={{ padding: '16px 12px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--gray)', marginBottom: 4 }}>{product.category}</p>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 8 }}>{product.name}</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: 'var(--dark)' }}>{product.price} جنيه</span>
            <button onClick={handleAdd} className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.75rem' }}>
              {added ? '✓ تمت الإضافة' : 'أضف للسلة'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}