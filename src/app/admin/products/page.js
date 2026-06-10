'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

const EMPTY = { name: '', category: '', price: '', description: '', sizes: '', colors: '', badge: '', isActive: true, images: [], colorImages: {} };
const CATEGORIES = [
  'تيشرتات رجالي', 'هوديز رجالي', 'بناطيل رجالي', 'هوديز نسائي', 'جيب نسائي'
];

const inputStyle = {
  width: '100%', padding: '10px 14px', border: '1px solid #ddd',
  borderRadius: 4, fontFamily: 'Cairo, sans-serif', fontSize: '0.9rem'
};
const labelStyle = { display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600 };
const hintStyle = { fontSize: '0.75rem', color: '#888', marginTop: 4 };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [colorUploadingFor, setColorUploadingFor] = useState('');

  const load = async () => {
    const snap = await getDocs(collection(db, 'products'));
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };
  useEffect(() => { load(); }, []);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const uploadImages = async (files) => {
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();
      if (data.secure_url) urls.push(data.secure_url);
    }
    setUploading(false);
    return urls;
  };

  // ✅ رفع صورة لون معين
  const uploadColorImage = async (color, file) => {
    setColorUploadingFor(color);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );
    const data = await res.json();
    if (data.secure_url) {
      setForm(p => ({ ...p, colorImages: { ...p.colorImages, [color]: data.secure_url } }));
    }
    setColorUploadingFor('');
  };

  const save = async (e) => {
    e.preventDefault();
    const colorsArr = form.colors.split(',').map(c => c.trim()).filter(Boolean);
    const data = {
      ...form,
      price: Number(form.price),
      sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
      colors: colorsArr,
      colorImages: form.colorImages || {},
    };
    if (editing) {
      await updateDoc(doc(db, 'products', editing), data);
    } else {
      await addDoc(collection(db, 'products'), { ...data, createdAt: new Date() });
    }
    setForm(EMPTY); setEditing(null); setShowForm(false);
    load();
  };

  const startEdit = (p) => {
    setForm({
      ...p,
      sizes: p.sizes?.join(', ') || '',
      colors: p.colors?.join(', ') || '',
      colorImages: p.colorImages || {},
    });
    setEditing(p.id); setShowForm(true);
  };

  const toggle = async (p) => {
    await updateDoc(doc(db, 'products', p.id), { isActive: !p.isActive });
    load();
  };

  const remove = async (id) => {
    if (confirm('هل أنت متأكد من الحذف؟')) {
      await deleteDoc(doc(db, 'products', id)); load();
    }
  };

  // ✅ الألوان الحالية من حقل الـ colors
  const currentColors = form.colors.split(',').map(c => c.trim()).filter(Boolean);

  return (
    <div style={{ fontFamily: 'Cairo, sans-serif', direction: 'rtl', padding: 32, background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/admin" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>← لوحة التحكم</Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>المنتجات ({products.length})</h1>
        </div>
        <button onClick={() => { setForm(EMPTY); setEditing(null); setShowForm(true); }}
          style={{ background: '#1A1A1A', color: 'white', padding: '10px 24px', border: 'none', cursor: 'pointer', borderRadius: 4, fontFamily: 'Cairo, sans-serif' }}>
          + إضافة منتج
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', padding: 28, borderRadius: 8, marginBottom: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h2 style={{ marginBottom: 24, fontWeight: 600 }}>{editing ? 'تعديل منتج' : 'إضافة منتج جديد'}</h2>
          <form onSubmit={save}>

            {/* ✅ الحقول الأساسية */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>اسم المنتج *</label>
                <input name="name" value={form.name} onChange={handle} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>السعر (جنيه) *</label>
                <input name="price" type="number" value={form.price} onChange={handle} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>الفئة *</label>
                <select name="category" value={form.category} onChange={handle} required style={inputStyle}>
                  <option value="">اختر الفئة</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>شارة (اختياري)</label>
                <input name="badge" value={form.badge || ''} onChange={handle} placeholder="جديد، مميز، خصم..." style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>المقاسات</label>
                <input name="sizes" value={form.sizes} onChange={handle} placeholder="S, M, L, XL, XXL" style={inputStyle} />
                <p style={hintStyle}>اكتب المقاسات مفصولة بفاصلة</p>
              </div>
              <div>
                <label style={labelStyle}>الألوان</label>
                <input name="colors" value={form.colors} onChange={handle} placeholder="أبيض, أسود, زيتي" style={inputStyle} />
                <p style={hintStyle}>اكتب الألوان مفصولة بفاصلة</p>
              </div>
            </div>

            {/* ✅ الوصف مع تلميح */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>الوصف والتفاصيل</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handle}
                rows={6}
                placeholder={`مثال:\nتيشيرت فلسطين.. حق والحق لا يزول\n- خامة قطن 100%\n- طباعة احترافية بألوان ثابتة\n- تصميم حصري من تفصيلة\nيغسل بماء بارد للحفاظ على جودة الطباعة`}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.8 }}
              />
              <p style={hintStyle}>
                💡 ابدأ كل نقطة بـ <strong>-</strong> أو <strong>•</strong> وستظهر منسقة تلقائياً في صفحة المنتج
              </p>
            </div>

            {/* ✅ صور المنتج الرئيسية */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>صور المنتج</label>
              <input type="file" multiple accept="image/*" onChange={async (e) => {
                const urls = await uploadImages(Array.from(e.target.files));
                setForm(p => ({ ...p, images: [...(p.images || []), ...urls] }));
              }} style={{ marginBottom: 8 }} />
              {uploading && <p style={{ color: '#C9A96E', fontSize: '0.8rem' }}>جاري رفع الصور...</p>}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {form.images?.map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={url} style={{ width: 60, height: 80, objectFit: 'cover', borderRadius: 4 }} />
                    <button type="button" onClick={() => setForm(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                      style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', fontSize: '0.6rem' }}>✕</button>
                  </div>
                ))}
              </div>
            </div>

            {/* ✅ صور الألوان */}
            {currentColors.length > 0 && (
              <div style={{ marginBottom: 20, background: '#f9f9f9', padding: 16, borderRadius: 6, border: '1px solid #eee' }}>
                <label style={{ ...labelStyle, marginBottom: 12 }}>صور الألوان (اختياري)</label>
                <p style={{ ...hintStyle, marginBottom: 12 }}>
                  📸 لكل لون، ارفع صورة المنتج بهذا اللون — ستظهر تلقائياً عند اختيار اللون
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {currentColors.map(color => (
                    <div key={color} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, minWidth: 60, fontSize: '0.88rem' }}>{color}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => e.target.files[0] && uploadColorImage(color, e.target.files[0])}
                        style={{ fontSize: '0.82rem' }}
                      />
                      {colorUploadingFor === color && (
                        <span style={{ color: '#C9A96E', fontSize: '0.8rem' }}>جاري الرفع...</span>
                      )}
                      {form.colorImages?.[color] && (
                        <div style={{ position: 'relative' }}>
                          <img src={form.colorImages[color]} style={{ width: 50, height: 65, objectFit: 'cover', borderRadius: 4, border: '2px solid #C9A96E' }} />
                          <button type="button"
                            onClick={() => setForm(p => {
                              const ci = { ...p.colorImages };
                              delete ci[color];
                              return { ...p, colorImages: ci };
                            })}
                            style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', fontSize: '0.6rem' }}>✕</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit"
                style={{ background: '#1A1A1A', color: 'white', padding: '10px 28px', border: 'none', cursor: 'pointer', borderRadius: 4, fontFamily: 'Cairo, sans-serif' }}>
                {editing ? 'حفظ التعديلات' : 'إضافة المنتج'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                style={{ background: 'white', border: '1px solid #ddd', padding: '10px 20px', cursor: 'pointer', borderRadius: 4, fontFamily: 'Cairo, sans-serif' }}>
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* قائمة المنتجات */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
        {products.map(p => (
          <div key={p.id} style={{ background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', opacity: p.isActive ? 1 : 0.6 }}>
            <div style={{ paddingBottom: '80%', position: 'relative', background: '#f5f5f5' }}>
              {p.images?.[0] && <img src={p.images[0]} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
              {!p.isActive && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontWeight: 700 }}>مخفي</span>
                </div>
              )}
            </div>
            <div style={{ padding: 16 }}>
              <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: 4 }}>{p.category}</p>
              <p style={{ fontWeight: 600, marginBottom: 8, fontSize: '0.9rem' }}>{p.name}</p>
              <p style={{ fontWeight: 800, color: '#C9A96E', marginBottom: 12 }}>{p.price?.toLocaleString()} جنيه</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => startEdit(p)}
                  style={{ flex: 1, padding: '6px', background: '#f0f0f0', border: 'none', cursor: 'pointer', borderRadius: 4, fontSize: '0.8rem', fontFamily: 'Cairo, sans-serif' }}>تعديل</button>
                <button onClick={() => toggle(p)}
                  style={{ flex: 1, padding: '6px', background: p.isActive ? '#fef3c7' : '#d1fae5', border: 'none', cursor: 'pointer', borderRadius: 4, fontSize: '0.8rem', fontFamily: 'Cairo, sans-serif' }}>
                  {p.isActive ? 'إخفاء' : 'إظهار'}
                </button>
                <button onClick={() => remove(p.id)}
                  style={{ padding: '6px 10px', background: '#fee2e2', border: 'none', cursor: 'pointer', borderRadius: 4, fontSize: '0.8rem', color: '#ef4444' }}>🗑</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}