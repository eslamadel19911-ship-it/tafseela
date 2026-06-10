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
      }}>
        {/* الصف العلوي */}
        <div className="container" style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', height: 64,
          padding: '0 16px'
        }}>

          {/* اللوجو */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <img src="/logo.png" alt="تفصيلة"
              style={{ height: 46, width: 'auto', objectFit: 'contain' }}
            />
          </Link>

          {/* الروابط - Desktop فقط */}
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

            {/* Desktop: طلباتي + دخول/خروج */}
            <div className="nav-login-desktop" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {user ? (
                <>
                  {/* ✅ رابط طلباتي */}
                  <Link href="/my-orders" style={{
                    color: '#ddd', fontSize: '0.85rem', textDecoration: 'none',
                    display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap'
                  }}>
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                      <rect x="9" y="3" width="6" height="4" rx="1"/>
                      <path d="M9 12h6M9 16h4"/>
                    </svg>
                    طلباتي
                  </Link>
                  <button onClick={logout} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#aaa', fontSize: '0.85rem', fontFamily: 'Cairo, sans-serif'
                  }}>خروج</button>
                </>
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

            {/* هامبرجر - Mobile */}
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

        {/* شريط روابط موبايل */}
        <div className="nav-mobile-bar" style={{ display: 'none' }}>
          <div style={{
            display: 'flex', borderTop: '1px solid #2a2a2a',
            background: '#111'
          }}>
            {[['/', 'الرئيسية'], ['/products', 'المنتجات'], ['/about', 'من نحن']].map(([href, label]) => (
              <Link key={href} href={href} style={{
                flex: 1, textAlign: 'center', padding: '12px 4px',
                textDecoration: 'none', color: 'white',
                fontSize: '0.82rem', fontWeight: 500,
                borderLeft: '1px solid #2a2a2a',
              }}>{label}</Link>
            ))}
          </div>

          {/* Sub-categories */}
          <div style={{
            display: 'flex', gap: 8, padding: '10px 16px',
            background: '#0d0d0d', overflowX: 'auto',
            borderTop: '1px solid #222',
          }}>
            {[
              'تيشرتات رجالي', 'هوديز رجالي', 'بناطيل رجالي',
              'هوديز نسائي', 'جيب نسائي'
            ].map(cat => (
              <Link key={cat} href={`/products?category=${encodeURIComponent(cat)}`} style={{
                textDecoration: 'none', color: '#aaa',
                fontSize: '0.75rem', whiteSpace: 'nowrap',
                padding: '5px 12px', border: '1px solid #333',
                borderRadius: 20, flexShrink: 0,
              }}>{cat}</Link>
            ))}
          </div>
        </div>

        {/* Mobile Dropdown — دخول / خروج / طلباتي */}
        {menuOpen && (
          <div style={{
            background: '#111', borderTop: '1px solid #333',
            padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 4
          }}>
            {user ? (
              <>
                {/* ✅ طلباتي في الموبايل */}
                <Link href="/my-orders" onClick={() => setMenuOpen(false)} style={{
                  color: '#ddd', fontSize: '0.9rem', textDecoration: 'none',
                  padding: '10px 0', borderBottom: '1px solid #222',
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                    <rect x="9" y="3" width="6" height="4" rx="1"/>
                    <path d="M9 12h6M9 16h4"/>
                  </svg>
                  طلباتي
                </Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: '#aaa',
                  fontSize: '0.9rem', fontFamily: 'Cairo, sans-serif',
                  textAlign: 'right', padding: '10px 0'
                }}>خروج</button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{
                color: '#aaa', fontSize: '0.9rem', textDecoration: 'none', padding: '10px 0'
              }}>دخول</Link>
            )}
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-login-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .nav-mobile-bar { display: block !important; }
        }
        .nav-mobile-bar a:hover {
          color: var(--gold) !important;
          background: rgba(255,255,255,0.04);
        }
        .nav-mobile-bar div:last-child::-webkit-scrollbar { display: none; }
        .nav-mobile-bar div:last-child { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}