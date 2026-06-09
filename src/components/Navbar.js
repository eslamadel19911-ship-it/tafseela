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
  const [menuOpen, setMenuOpen] = useState(false);

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
            <img src="/logo.png" alt="تفصيلة"
              style={{ height: 50, width: 'auto', objectFit: 'contain' }}
            />
          </Link>

          {/* الروابط - Desktop */}
          <div className="nav-links-desktop" style={{ display: 'flex', gap: 32 }}>
            {[['/', 'الرئيسية'], ['/products', 'المنتجات'], ['/about', 'من نحن']].map(([href, label]) => (
              <Link key={href} href={href} style={{
                textDecoration: 'none', color: 'white',
                fontSize: '0.9rem', fontWeight: 500, whiteSpace: 'nowrap'
              }}>{label}</Link>
            ))}
          </div>

          {/* أيقونات اليمين */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

            {/* دخول - Desktop فقط */}
            <div className="nav-login-desktop">
              {user ? (
                <button onClick={logout} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#aaa', fontSize: '0.85rem', fontFamily: 'Cairo, sans-serif'
                }}>خروج</button>
              ) : (
                <Link href="/login" style={{ color: '#aaa', fontSize: '0.85rem', textDecoration: 'none' }}>
                  دخول
                </Link>
              )}
            </div>

            {/* سلة التسوق */}
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

            {/* زر الهامبرجر - Mobile فقط */}
            <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 4,
              display: 'none', flexDirection: 'column', gap: 5
            }}>
              <span style={{ display: 'block', width: 22, height: 2, background: 'white', transition: '0.3s',
                transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}/>
              <span style={{ display: 'block', width: 22, height: 2, background: 'white', transition: '0.3s',
                opacity: menuOpen ? 0 : 1 }}/>
              <span style={{ display: 'block', width: 22, height: 2, background: 'white', transition: '0.3s',
                transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }}/>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="nav-mobile-menu" style={{
            background: '#111', borderTop: '1px solid #333',
            padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16
          }}>
            {[['/', 'الرئيسية'], ['/products', 'المنتجات'], ['/about', 'من نحن']].map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{
                textDecoration: 'none', color: 'white', fontSize: '1rem', fontWeight: 500
              }}>{label}</Link>
            ))}
            {user ? (
              <button onClick={() => { logout(); setMenuOpen(false); }} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#aaa',
                fontSize: '0.9rem', fontFamily: 'Cairo, sans-serif', textAlign: 'right', padding: 0
              }}>خروج</button>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{
                color: '#aaa', fontSize: '0.9rem', textDecoration: 'none'
              }}>دخول</Link>
            )}
          </div>
        )}
      </nav>

      {/* CSS للموبايل */}
      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-login-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>

      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}