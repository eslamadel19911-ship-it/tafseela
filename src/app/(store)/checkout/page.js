'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { addDoc, collection, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'القليوبية',
  'الإسكندرية', 'الدقهلية', 'الشرقية', 'المنوفية', 'الغربية',
  'كفر الشيخ', 'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس',
  'شمال سيناء', 'جنوب سيناء', 'الفيوم', 'بني سويف', 'المنيا',
  'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان',
  'البحر الأحمر', 'الوادي الجديد', 'مطروح',
];

const NEAR_CAIRO = ['القاهرة', 'الجيزة', 'القليوبية'];
const getShippingCost = (city) => !city ? 0 : NEAR_CAIRO.includes(city) ? 70 : 100;

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', notes: '' });
  const [payMethod, setPayMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // كود الخصم
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // ✅ منع الـ Guest — لازم يسجل دخول
  useEffect(() => {
    if (user === null) {
      router.push('/login?redirect=/checkout');
    }
  }, [user]);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const discountAmount = appliedCoupon
    ? appliedCoupon.type === 'percent'
      ? Math.round((total || 0) * appliedCoupon.value / 100)
      : appliedCoupon.value
    : 0;

  const shippingCost = getShippingCost(form.city);
  const grandTotal = (total || 0) + shippingCost - discountAmount;

  // ✅ التحقق من كود الخصم من Firebase
  const applyCoupon = async () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return;

    setCouponLoading(true);
    setCouponError('');

    try {
      const codeRef = doc(db, 'discountCodes', code);
      const codeSnap = await getDoc(codeRef);

      // الكود مش موجود
      if (!codeSnap.exists()) {
        setCouponError('كود الخصم غير صحيح');
        setTimeout(() => setCouponError(''), 3000);
        setCouponLoading(false);
        return;
      }

      const codeData = codeSnap.data();

      // الكود متوقف
      if (!codeData.active) {
        setCouponError('هذا الكود غير متاح حالياً');
        setTimeout(() => setCouponError(''), 3000);
        setCouponLoading(false);
        return;
      }

      // ✅ التحقق إن المستخدم ما استخدمش الكود قبل كده
      if (codeData.oneTimeOnly && codeData.usedUsers?.includes(user.uid)) {
        setCouponError('استخدمت هذا الكود من قبل');
        setTimeout(() => setCouponError(''), 3000);
        setCouponLoading(false);
        return;
      }

      // ✅ الكود صح
      setAppliedCoupon({ code, ...codeData });
      setCouponError('');

    } catch (err) {
      setCouponError('حدث خطأ، حاول مرة أخرى');
      setTimeout(() => setCouponError(''), 3000);
    }

    setCouponLoading(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ حفظ الطلب
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        userEmail: user.email,
        customerName: form.name,
        phone: form.phone,
        address: form.address + ', ' + form.city,
        notes: form.notes,
        items: items.map(i => ({
          id: i.id, name: i.name, price: i.price,
          qty: i.qty, size: i.size, color: i.color
        })),
        subtotal: total,
        shippingCost,
        discountCode: appliedCoupon?.code || null,
        discountAmount,
        total: grandTotal,
        paymentMethod: payMethod,
        status: 'pending',
        createdAt: new Date(),
      });

      // ✅ تسجيل userId في الكود عشان ميتستخدمش تاني
      if (appliedCoupon?.oneTimeOnly) {
        const codeRef = doc(db, 'discountCodes', appliedCoupon.code);
        await updateDoc(codeRef, {
          usedUsers: arrayUnion(user.uid)
        });
      }

      clearCart();
      setSuccess(true);
    } catch (err) {
      alert('حدث خطأ، يرجى المحاولة مرة أخرى');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    border: '1px solid var(--border)',
    fontFamily: 'Cairo, sans-serif', fontSize: '0.9rem',
    boxSizing: 'border-box', borderRadius: 3, background: 'white',
  };

  // شاشة التحميل لحد ما يتحقق من الـ user
  if (user === undefined) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#aaa' }}>جاري التحميل...</p>
    </div>
  );

  if (success) return (
    <>
      <Navbar />
      <div style={{
        minHeight: '80vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '20px'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>تم تأكيد طلبك!</h2>
        <p style={{ color: 'var(--gray)', marginBottom: 8 }}>
          شكراً <strong>{form.name}</strong>!
        </p>
        <p style={{ color: 'var(--gray)', marginBottom: 24 }}>سنتواصل معك على <strong>{form.phone}</strong> لتأكيد التوصيل</p>
        <a href="/" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 32px' }}>
          العودة للرئيسية
        </a>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: 'clamp(30px, 6vw, 60px) 16px' }}>
        <h1 className="section-title" style={{ marginBottom: 40 }}>إتمام الطلب</h1>

        <form onSubmit={submit}>
          <style>{`
            .checkout-grid {
              display: grid;
              grid-template-columns: 1fr 400px;
              gap: 48px;
            }
            @media (max-width: 768px) {
              .checkout-grid { grid-template-columns: 1fr; gap: 24px; }
              .checkout-summary { order: -1; }
            }
          `}</style>

          <div className="checkout-grid">

            {/* ===== بيانات التوصيل ===== */}
            <div>
              <h3 style={{ marginBottom: 24, fontWeight: 600 }}>بيانات التوصيل</h3>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>الاسم الكامل</label>
                <input name="name" value={form.name} onChange={handle} required style={inputStyle} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>رقم الهاتف</label>
                <input name="phone" value={form.phone} onChange={handle} required style={inputStyle} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>المحافظة</label>
                <select name="city" value={form.city} onChange={handle} required style={inputStyle}>
                  <option value="">اختر المحافظة</option>
                  <optgroup label="القاهرة الكبرى — شحن ٧٠ جنيه">
                    {NEAR_CAIRO.map(g => <option key={g} value={g}>{g}</option>)}
                  </optgroup>
                  <optgroup label="باقي المحافظات — شحن ١٠٠ جنيه">
                    {GOVERNORATES.filter(g => !NEAR_CAIRO.includes(g)).map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </optgroup>
                </select>
                {form.city && (
                  <div style={{
                    marginTop: 8, padding: '8px 14px',
                    background: NEAR_CAIRO.includes(form.city) ? '#f0fdf4' : '#fefce8',
                    border: `1px solid ${NEAR_CAIRO.includes(form.city) ? '#bbf7d0' : '#fef08a'}`,
                    borderRadius: 4, fontSize: '0.82rem',
                    color: NEAR_CAIRO.includes(form.city) ? '#166534' : '#854d0e',
                    display: 'flex', alignItems: 'center', gap: 6
                  }}>
                    🚚 تكلفة الشحن إلى <strong>{form.city}</strong>: <strong>{shippingCost} جنيه</strong>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>العنوان التفصيلي</label>
                <input name="address" value={form.address} onChange={handle} required
                  placeholder="الشارع، رقم المبنى، الشقة..." style={inputStyle} />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>ملاحظات (اختياري)</label>
                <textarea name="notes" value={form.notes} onChange={handle} rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              {/* ===== كود الخصم ===== */}
              <div style={{ marginBottom: 28, padding: 16, background: '#f9f7f4', borderRadius: 6, border: '1px solid var(--border)' }}>
                <label style={{ display: 'block', marginBottom: 10, fontWeight: 600, fontSize: '0.92rem' }}>
                  🎟️ كود الخصم
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), applyCoupon())}
                    placeholder="أدخل الكود هنا"
                    disabled={!!appliedCoupon}
                    style={{
                      flex: 1, padding: '10px 14px',
                      border: `1px solid ${appliedCoupon ? '#bbf7d0' : 'var(--border)'}`,
                      background: appliedCoupon ? '#f0fdf4' : 'white',
                      fontFamily: 'Cairo, sans-serif', fontSize: '0.9rem',
                      borderRadius: 3, textTransform: 'uppercase', letterSpacing: 1
                    }}
                  />
                  {appliedCoupon ? (
                    <button type="button"
                      onClick={() => { setAppliedCoupon(null); setCoupon(''); }}
                      style={{
                        padding: '10px 16px', background: '#fee2e2', color: '#ef4444',
                        border: 'none', borderRadius: 3, cursor: 'pointer',
                        fontFamily: 'Cairo, sans-serif', fontSize: '0.85rem', whiteSpace: 'nowrap'
                      }}>إلغاء</button>
                  ) : (
                    <button type="button" onClick={applyCoupon} disabled={couponLoading}
                      style={{
                        padding: '10px 20px', background: 'var(--dark)', color: 'white',
                        border: 'none', borderRadius: 3, cursor: 'pointer',
                        fontFamily: 'Cairo, sans-serif', fontSize: '0.9rem',
                        whiteSpace: 'nowrap', opacity: couponLoading ? 0.7 : 1
                      }}>
                      {couponLoading ? '...' : 'تطبيق'}
                    </button>
                  )}
                </div>

                {appliedCoupon && (
                  <div style={{
                    marginTop: 8, color: '#166534', background: '#f0fdf4',
                    border: '1px solid #bbf7d0', padding: '7px 12px',
                    borderRadius: 4, fontSize: '0.82rem'
                  }}>
                    ✅ تم تطبيق الكود <strong>{appliedCoupon.code}</strong> — خصم{' '}
                    {appliedCoupon.type === 'percent'
                      ? `${appliedCoupon.value}٪ (${discountAmount} جنيه)`
                      : `${appliedCoupon.value} جنيه`}
                  </div>
                )}
                {couponError && (
                  <div style={{ marginTop: 8, color: '#ef4444', fontSize: '0.82rem' }}>❌ {couponError}</div>
                )}
              </div>

              {/* ===== طريقة الدفع ===== */}
              <h3 style={{ margin: '8px 0 20px', fontWeight: 600 }}>طريقة الدفع</h3>
              {[
                { id: 'cod',      label: 'الدفع عند الاستلام' },
                { id: 'paymob',   label: 'بطاقة / فودافون كاش (Paymob)' },
                { id: 'instapay', label: 'InstaPay' },
              ].map(opt => (
                <label key={opt.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12,
                  padding: '14px 16px', borderRadius: 3, cursor: 'pointer',
                  border: payMethod === opt.id ? '1px solid var(--dark)' : '1px solid var(--border)',
                }}>
                  <input type="radio" name="payMethod" value={opt.id}
                    checked={payMethod === opt.id} onChange={() => setPayMethod(opt.id)} />
                  <span style={{ fontSize: '0.9rem', fontWeight: payMethod === opt.id ? 600 : 400 }}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>

            {/* ===== ملخص الطلب ===== */}
            <div className="checkout-summary">
              <div style={{ background: '#f9f7f4', padding: 24, borderRadius: 8, position: 'sticky', top: 100 }}>
                <h3 style={{ marginBottom: 20, fontWeight: 600 }}>ملخص الطلب</h3>

                {items.length === 0 ? (
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
                    السلة فاضية
                  </p>
                ) : (
                  items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: '0.85rem' }}>
                      <span>{item.name} {item.size ? `(${item.size})` : ''} x{item.qty}</span>
                      <span style={{ fontWeight: 600 }}>{(item.price * item.qty).toLocaleString()} ج</span>
                    </div>
                  ))
                )}

                <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--gray)' }}>المجموع الفرعي</span>
                    <span>{(total || 0).toLocaleString()} جنيه</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--gray)' }}>الشحن</span>
                    <span style={{ fontWeight: 500 }}>
                      {shippingCost === 0 ? 'اختر المحافظة' : `${shippingCost} جنيه`}
                    </span>
                  </div>
                  {appliedCoupon && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.88rem' }}>
                      <span style={{ color: '#166534' }}>خصم ({appliedCoupon.code})</span>
                      <span style={{ color: '#166534', fontWeight: 600 }}>− {discountAmount} جنيه</span>
                    </div>
                  )}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontWeight: 800, fontSize: '1.1rem',
                    borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 8
                  }}>
                    <span>الإجمالي</span>
                    <span>{shippingCost === 0 ? '—' : `${grandTotal.toLocaleString()} جنيه`}</span>
                  </div>
                </div>

                <button type="submit"
                  disabled={loading || items.length === 0 || !form.city}
                  className="btn-primary"
                  style={{
                    width: '100%', padding: '14px', marginTop: 20, fontSize: '1rem',
                    opacity: (loading || items.length === 0 || !form.city) ? 0.5 : 1,
                    cursor: (!form.city || items.length === 0) ? 'not-allowed' : 'pointer'
                  }}>
                  {loading ? 'جاري التأكيد...' : `تأكيد الطلب${shippingCost ? ` — ${grandTotal.toLocaleString()} ج` : ''}`}
                </button>

                {items.length === 0 && (
                  <a href="/products" style={{
                    display: 'block', textAlign: 'center', marginTop: 12,
                    fontSize: '0.85rem', color: 'var(--dark)', textDecoration: 'underline'
                  }}>تصفح المنتجات</a>
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