'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

const STATUS_COLORS = {
  pending: '#f59e0b', confirmed: '#3b82f6',
  shipped: '#8b5cf6', delivered: '#10b981', cancelled: '#ef4444',
};
const STATUS_LABELS = {
  pending: 'قيد المراجعة', confirmed: 'تم التأكيد',
  shipped: 'تم الشحن', delivered: 'تم التسليم', cancelled: 'ملغي',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, products: 0, pending: 0 });
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const productsSnap = await getDocs(collection(db, 'products'));

        const ordersData = ordersSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(0);
            const dateB = b.createdAt?.toDate?.() || new Date(0);
            return dateB - dateA;
          });

        setOrders(ordersData);
        setStats({
          orders: ordersData.length,
          revenue: ordersData
            .filter(o => o.status !== 'cancelled')
            .reduce((s, o) => s + (o.total || 0), 0),
          products: productsSnap.size,
          pending: ordersData.filter(o => o.status === 'pending').length,
        });
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, 'orders', id), { status });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    setStats(prev => ({
      ...prev,
      pending: orders.filter(o => (o.id === id ? status : o.status) === 'pending').length,
    }));
  };

  const cards = [
    { label: 'إجمالي الطلبات', value: stats.orders, icon: '📦', color: '#1A1A1A' },
    { label: 'الإيرادات', value: `${stats.revenue.toLocaleString()} جنيه`, icon: '💰', color: '#C9A96E' },
    { label: 'المنتجات', value: stats.products, icon: '👗', color: '#1A1A1A' },
    { label: 'طلبات معلقة', value: stats.pending, icon: '⏳', color: '#f59e0b' },
  ];

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cairo, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
        <p>جاري التحميل...</p>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: '#1A1A1A', color: 'white', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '28px 24px', borderBottom: '1px solid #333' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>تفصيلة</div>
          <div style={{ fontSize: '0.55rem', letterSpacing: 4, color: '#C9A96E', marginTop: 2 }}>ADMIN PANEL</div>
        </div>
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {[
            { id: 'dashboard', label: 'لوحة التحكم', icon: '📊' },
            { id: 'orders', label: 'الطلبات', icon: '📦' },
            { id: 'products', label: 'المنتجات', icon: '👗' },
          ].map(item => (
            <button key={item.id} onClick={() => setTab(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%',
              padding: '12px 16px', background: tab === item.id ? '#C9A96E' : 'transparent',
              border: 'none', color: 'white', cursor: 'pointer', borderRadius: 6,
              marginBottom: 4, fontFamily: 'Cairo, sans-serif', fontSize: '0.9rem', fontWeight: 500
            }}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '16px 24px', borderTop: '1px solid #333' }}>
          <Link href="/" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.85rem' }}>← العودة للموقع</Link>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {tab === 'dashboard' && (
          <>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 32 }}>لوحة التحكم</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
              {cards.map(c => (
                <div key={c.label} style={{ background: 'white', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>{c.icon}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: c.color, marginBottom: 4 }}>{c.value}</div>
                  <div style={{ color: '#666', fontSize: '0.85rem' }}>{c.label}</div>
                </div>
              ))}
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>آخر الطلبات</h2>
            <OrdersTable orders={orders.slice(0, 10)} updateStatus={updateStatus} />
          </>
        )}

        {tab === 'orders' && (
          <>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 32 }}>الطلبات ({orders.length})</h1>
            <OrdersTable orders={orders} updateStatus={updateStatus} />
          </>
        )}

        {tab === 'products' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>المنتجات</h1>
            <Link href="/admin/products">
              <button style={{ background: '#1A1A1A', color: 'white', padding: '12px 32px', border: 'none', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', borderRadius: 4 }}>
                إدارة المنتجات
              </button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function OrdersTable({ orders, updateStatus }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ background: '#f9f7f4', borderBottom: '1px solid #eee' }}>
            {['رقم الطلب', 'العميل', 'الهاتف', 'المبلغ', 'الدفع', 'الحالة', 'التاريخ', 'تغيير الحالة', 'تفاصيل'].map(h => (
              <th key={h} style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: '#555', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <>
              <tr key={order.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#C9A96E', fontSize: '0.75rem' }}>#{order.id.slice(-6).toUpperCase()}</td>
                <td style={{ padding: '12px 16px' }}>{order.customerName}</td>
                <td style={{ padding: '12px 16px', direction: 'ltr' }}>{order.phone}</td>
                <td style={{ padding: '12px 16px', fontWeight: 700 }}>{order.total?.toLocaleString()} ج</td>
                <td style={{ padding: '12px 16px', fontSize: '0.75rem' }}>{order.paymentMethod === 'cod' ? 'عند الاستلام' : order.paymentMethod}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    background: STATUS_COLORS[order.status] + '20',
                    color: STATUS_COLORS[order.status],
                    padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600
                  }}>{STATUS_LABELS[order.status]}</span>
                </td>
                <td style={{ padding: '12px 16px', color: '#888', fontSize: '0.75rem' }}>
                  {order.createdAt?.toDate?.()?.toLocaleDateString('ar-EG') || '—'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)}
                    style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, fontFamily: 'Cairo, sans-serif', fontSize: '0.75rem' }}>
                    {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    style={{ background: 'none', border: '1px solid #ddd', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'Cairo, sans-serif' }}>
                    {expanded === order.id ? 'إخفاء' : 'عرض'}
                  </button>
                </td>
              </tr>
              {expanded === order.id && (
                <tr key={order.id + '_detail'}>
                  <td colSpan={9} style={{ padding: '16px 24px', background: '#fafafa', borderBottom: '1px solid #eee' }}>
                    <div style={{ marginBottom: 8, fontSize: '0.85rem', color: '#555' }}>
                      <strong>العنوان:</strong> {order.address}
                    </div>
                    {order.notes && (
                      <div style={{ marginBottom: 8, fontSize: '0.85rem', color: '#555' }}>
                        <strong>ملاحظات:</strong> {order.notes}
                      </div>
                    )}
                    <div style={{ fontSize: '0.85rem', color: '#555' }}><strong>المنتجات:</strong></div>
                    {order.items?.map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: 16, padding: '6px 0', fontSize: '0.8rem', borderBottom: '1px solid #eee' }}>
                        <span>{item.name}</span>
                        {item.size && <span>المقاس: {item.size}</span>}
                        {item.color && <span>اللون: {item.color}</span>}
                        <span>الكمية: {item.qty}</span>
                        <span style={{ fontWeight: 700 }}>{(item.price * item.qty).toLocaleString()} ج</span>
                      </div>
                    ))}
                  </td>
                </tr>
              )}
            </>
          ))}
          {orders.length === 0 && (
            <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>لا توجد طلبات بعد</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}