'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', notes: '' });
  const [payMethod, setPayMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'orders'), {
        userId: user?.uid || 'guest',
        customerName: form.name,
        phone: form.phone,
        address: form.address + ', ' + form.city,
        notes: form.notes,
        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, size: i.size, color: i.color })),
        total,
        paymentMethod: payMethod,
        status: 'pending',
        createdAt: new Date(),
      });
      clearCart();
      setSuccess(true);
    } catch (err) {
      alert('حدث خطأ، يرجى المحاولة مرة أخرى');
    }
    setLoading(false);
  };

  if (success) return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
      <div style={{ fontSize: '4rem', marginBottom: 16 }}>✅</div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>تم تأكيد طلبك!</h2>
      <p style={{ color: 'var(--gray)', marginBottom: 24 }}>سنتواصل معك قريباً لتأكيد التوصيل</p>
      <a href="/" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 32px' }}>العودة للرئيسية</a>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: 'clamp(30px, 6vw, 60px) 20px' }}>
        <h1 className="section-title" style={{ marginBottom: 40 }}>إتمام الطلب</h1>

        <form onSubmit={submit}>
          {/* CSS Grid responsive */}
          <style>{`
            .checkout-grid {
              display: grid;
              grid-template-columns: 1fr 400px;
              gap: 48px;
            }
            @media (max-width: 768px) {
              .checkout-grid {
                grid-template-columns: 1fr;
                gap: 32px;
              }
              .checkout-summary {
                order: -1;
              }
            }
          `}</style>

          <div className="checkout-grid">
            {/* بيانات التوصيل */}
            <div>
              <h3 style={{ marginBottom: 24, fontWeight: 600 }}>بيانات التوصيل</h3>
              {[
                { name: 'name', label: 'الاسم الكامل' },
                { name: 'phone', label: 'رقم الهاتف' },
                { name: 'address', label: 'العنوان' },
                { name: 'city', label: 'المدينة' },
                { name: 'notes', label: 'ملاحظات (اختياري)' },
              ].map(f => (
                <div key={f.name} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>{f.label}</label>
                  <input name={f.name} value={form[f.name]} onChange={handle}
                    required={f.name !== 'notes'}
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border)', fontFamily: 'Cairo, sans-serif', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
              ))}

              <h3 style={{ margin: '32px 0 20px', fontWeight: 600 }}>طريقة الدفع</h3>
              {[
                { id: 'cod', label: 'الدفع عند الاستلام' },
                { id: 'paymob', label: 'بطاقة / فودافون كاش (Paymob)' },
                { id: 'instapay', label: 'InstaPay' },
              ].map(opt => (
                <label key={opt.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12,
                  padding: '16px',
                  border: payMethod === opt.id ? '1px solid var(--dark)' : '1px solid var(--border)',
                  cursor: 'pointer'
                }}>
                  <input type="radio" name="payMethod" value={opt.id}
                    checked={payMethod === opt.id}
                    onChange={() => setPayMethod(opt.id)}
                  />
                  <span style={{ fontSize: '0.9rem', fontWeight: payMethod === opt.id ? 600 : 400 }}>{opt.label}</span>
                </label>
              ))}
            </div>

            {/* ملخص الطلب */}
            <div className="checkout-summary">
              <div style={{ background: '#f9f7f4', padding: 24, borderRadius: 8, position: 'sticky', top: 100 }}>
                <h3 style={{ marginBottom: 20, fontWeight: 600 }}>ملخص الطلب</h3>

                {items.length === 0 ? (
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
                    السلة فاضية — أضف منتجات أولاً
                  </p>
                ) : (
                  items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: '0.85rem' }}>
                      <span>{item.name} {item.size ? '(' + item.size + ')' : ''} x{item.qty}</span>
                      <span style={{ fontWeight: 600 }}>{(item.price * item.qty).toLocaleString()} ج</span>
                    </div>
                  ))
                )}

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 16, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem' }}>
                  <span>الإجمالي</span>
                  <span>{(total || 0).toLocaleString()} جنيه</span>
                </div>

                <button type="submit" disabled={loading || items.length === 0} className="btn-primary"
                  style={{ width: '100%', padding: '14px', marginTop: 20, fontSize: '1rem', opacity: (loading || items.length === 0) ? 0.5 : 1, cursor: items.length === 0 ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'جاري التأكيد...' : 'تأكيد الطلب'}
                </button>

                {items.length === 0 && (
                  <a href="/products" style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: '0.85rem', color: 'var(--dark)', textDecoration: 'underline' }}>
                    تصفح المنتجات
                  </a>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
}