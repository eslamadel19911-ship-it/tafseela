'use client';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function CartDrawer({ open, onClose }) {
  const { items, removeItem, updateQty, total } = useCart();

  return (
    <>
      {open && <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200
      }} />}
      <div style={{
        position: 'fixed', top: 0, left: open ? 0 : '-420px', width: 400, height: '100vh',
        background: 'white', zIndex: 201, transition: 'left 0.35s ease',
        display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>سلة التسوق ({items.length})</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem' }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🛍️</div>
              <p>سلتك فارغة</p>
            </div>
          ) : items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 70, height: 90, background: '#f5f5f5', flexShrink: 0 }}>
                {item.images?.[0] && <img src={item.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{item.name}</p>
                <p style={{ color: 'var(--gray)', fontSize: '0.75rem', marginBottom: 8 }}>{item.size} · {item.color}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => item.qty > 1 ? updateQty(item.id, item.size, item.color, item.qty - 1) : removeItem(item.id, item.size, item.color)}
                      style={{ width: 24, height: 24, border: '1px solid var(--border)', background: 'none', cursor: 'pointer' }}>−</button>
                    <span style={{ fontSize: '0.85rem' }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.size, item.color, item.qty + 1)}
                      style={{ width: 24, height: 24, border: '1px solid var(--border)', background: 'none', cursor: 'pointer' }}>+</button>
                  </div>
                  <span style={{ fontWeight: 700 }}>{(item.price * item.qty).toLocaleString()} جنيه</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontWeight: 600 }}>الإجمالي</span>
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{total.toLocaleString()} جنيه</span>
            </div>
            <Link href="/checkout" onClick={onClose}>
              <button className="btn-primary" style={{ width: '100%', padding: '14px' }}>
                إتمام الطلب
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}