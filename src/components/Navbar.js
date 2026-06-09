'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--dark)', borderBottom: '1px solid #333',
        padding: '0 20px'
      }}>
        <div className="container" style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', height: 70
        }}>

          {/* اللوجو */}
          <Link href="/" style={{ textDecoration: 'none' }}>
  <img
    src="/logo.png"
    alt="تفصيلة"
    style={{
      height: 150,
      width: 'auto',
      objectFit: 'contain',
      /* يحول الأسود لأبيض على الخلفية الداكنة */
    }}
  />
</Link>

          {/* الروابط */}
          <div style={{ display: 'flex', gap: 32 }}>
            {[['/', 'الرئيسية'], ['/products', 'المنتجات'], ['/about', 'من نحن']].map(([href, label]) => (
              <Link key={href} href={href} style={{
                textDecoration: 'none', color: 'white',
                fontSize: '0.9rem', fontWeight: 500
              }}>{label}</Link>
            ))}
          </div>

          {/* دخول + سلة */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {user ? (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Link href="/account" style={{ color: '#aaa', fontSize: '0.85rem', textDecoration: 'none' }}>
                  حسابي
                </Link>
                <button onClick={logout} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#aaa', fontSize: '0.85rem', fontFamily: 'Cairo, sans-serif'
                }}>خروج</button>
              </div>
            ) : (
              <Link href="/login" style={{ color: '#aaa', fontSize: '0.85rem', textDecoration: 'none' }}>
                دخول
              </Link>
            )}

            <button onClick={() => setDrawerOpen(true)} style={{
              position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 4
            }}>
              <svg width="22" height="22" fill="none" stroke="white" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {count > 0 && (
                <span style={{
                  position: 'absolute', top: -4, left: -4, background: 'var(--gold)',
                  color: 'white', borderRadius: '50%', width: 18, height: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 700
                }}>{count}</span>
              )}
            </button>
          </div>

        </div>
      </nav>

      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}