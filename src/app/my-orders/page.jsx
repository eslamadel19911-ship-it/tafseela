'use client';
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ✅ ألوان الـ status
const STATUS_CONFIG = {
  pending:    { label: 'قيد المراجعة',   bg: '#fefce8', color: '#854d0e', border: '#fef08a' },
  confirmed:  { label: 'تم التأكيد',     bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
  shipped:    { label: 'تم الشحن',       bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
  delivered:  { label: 'تم التوصيل',     bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
  cancelled:  { label: 'ملغي',           bg: '#fff1f2', color: '#9f1239', border: '#fecdd3' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{
      padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`
    }}>
      {cfg.label}
    </span>
  );
}

export default function MyOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  // ✅ منع الـ Guest
  useEffect(() => {
    if (user === null) router.push('/login?redirect=/my-orders');
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (user === undefined || loading) return (
    <>
      <Navbar />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>⏳</div>
          <p style={{ color: '#aaa' }}>جاري تحميل طلباتك...</p>
        </div>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: 'clamp(32px, 6vw, 60px) 16px', minHeight: '70vh' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: 700, marginBottom: 6 }}>
            طلباتي
          </h1>
          <p style={{ color: '#888', fontSize: '0.88rem' }}>
            {orders.length > 0 ? `${orders.length} طلب` : ''}
          </p>
        </div>

        {/* Empty State */}
        {orders.length === 0 && (
          <div style={{
            textAlign: 'center', padding: 'clamp(40px, 10vw, 80px) 20px',
            background: '#f9f7f4', borderRadius: 8
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>📦</div>
            <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: '1.1rem' }}>ما عندكش طلبات لحد دلوقتي</h3>
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: 24 }}>
              تصفح منتجاتنا واعمل أول طلب!
            </p>
            <a href="/products" className="btn-primary"
              style={{ textDecoration: 'none', padding: '12px 32px', display: 'inline-block' }}>
              تسوق الآن
            </a>
          </div>
        )}

        {/* Orders List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map(order => (
            <div key={order.id} style={{
              background: 'white', border: '1px solid #eee',
              borderRadius: 8, overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
            }}>

              {/* Order Header */}
              <div
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', cursor: 'pointer',
                  flexWrap: 'wrap', gap: 12,
                  background: expanded === order.id ? '#f9f7f4' : 'white',
                  transition: 'background 0.2s'
                }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      طلب #{order.id.slice(-6).toUpperCase()}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <span style={{ color: '#aaa', fontSize: '0.8rem' }}>
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem' }}>
                    {order.total?.toLocaleString()} جنيه
                  </span>
                  <span style={{ color: '#aaa', fontSize: '1.2rem', transition: 'transform 0.2s',
                    transform: expanded === order.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ▾
                  </span>
                </div>
              </div>

              {/* Order Details */}
              {expanded === order.id && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f0f0f0' }}>

                  {/* المنتجات */}
                  <div style={{ marginTop: 16, marginBottom: 16 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 12, color: '#555' }}>
                      المنتجات
                    </p>
                    {order.items?.map((item, i) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', padding: '10px 0',
                        borderBottom: i < order.items.length - 1 ? '1px solid #f5f5f5' : 'none',
                        gap: 8, flexWrap: 'wrap'
                      }}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 3 }}>{item.name}</p>
                          <p style={{ color: '#aaa', fontSize: '0.78rem' }}>
                            {[item.color, item.size && `مقاس ${item.size}`, `× ${item.qty}`].filter(Boolean).join(' | ')}
                          </p>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                          {(item.price * item.qty).toLocaleString()} ج
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* التفاصيل المالية */}
                  <div style={{
                    background: '#f9f7f4', borderRadius: 6, padding: '14px 16px',
                    fontSize: '0.85rem', marginBottom: 16
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: '#666' }}>المجموع الفرعي</span>
                      <span>{order.subtotal?.toLocaleString()} جنيه</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: '#666' }}>الشحن</span>
                      <span>{order.shippingCost} جنيه</span>
                    </div>
                    {order.discountAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ color: '#166534' }}>خصم ({order.discountCode})</span>
                        <span style={{ color: '#166534' }}>− {order.discountAmount} جنيه</span>
                      </div>
                    )}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontWeight: 800, fontSize: '0.95rem',
                      borderTop: '1px solid #eee', paddingTop: 10, marginTop: 4
                    }}>
                      <span>الإجمالي</span>
                      <span>{order.total?.toLocaleString()} جنيه</span>
                    </div>
                  </div>

                  {/* بيانات التوصيل */}
                  <div style={{ fontSize: '0.83rem', color: '#666', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span>📍</span>
                      <span>{order.address}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span>📞</span>
                      <span>{order.phone}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span>💳</span>
                      <span>
                        {{cod: 'الدفع عند الاستلام', paymob: 'Paymob', instapay: 'InstaPay'}[order.paymentMethod] || order.paymentMethod}
                      </span>
                    </div>
                    {order.notes && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span>📝</span>
                        <span>{order.notes}</span>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}