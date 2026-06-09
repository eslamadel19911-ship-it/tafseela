'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

const EMPTY = { name: '', category: '', price: '', description: '', sizes: '', colors: '', badge: '', isActive: true, images: [] };
const CATEGORIES = [
  'تيشرتات رجالي',
  'هوديز رجالي',
  'بناطيل رجالي',
  'هوديز نسائي',
  'جيب نسائي'
];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  const save = async (e) => {
    e.preventDefault();
    const data = {
      ...form, price: Number(form.price),
      sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
      colors: form.colors.split(',').map(c => c.trim()).filter(Boolean),
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
    setForm({ ...p, sizes: p.sizes?.join(', ') || '', colors: p.colors?.join(', ') || '' });
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

  return (
    <div style={{ fontFamily: 'Cairo, sans-serif', direction: 'rtl', padding: 32, background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/admin" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>{'← لوحة التحكم'}</Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{'المنتجات'} ({products.length})</h1>
        </div>
        <button onClick={() => { setForm(EMPTY); setEditing(null); setShowForm(true); }}
          style={{ background: '#1A1A1A', color: 'white', padding: '10px 24px', border: 'none', cursor: 'pointer', borderRadius: 4, fontFamily: 'Cairo, sans-serif' }}>
          {'+ إضافة منتج'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', padding: 28, borderRadius: 8, marginBottom: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h2 style={{ marginBottom: 24, fontWeight: 600 }}>{editing ? 'تعديل منتج' : 'إضافة منتج جديد'}</h2>
          <form onSubmit={save}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {[
                { name: 'name', label: 'اسم المنتج', required: true },
                { name: 'price', label: 'السعر (جنيه)', type: 'number', required: true },
                { name: 'sizes', label: 'المقاسات (مفصولة بفاصلة: S, M, L)' },
                { name: 'colors', label: 'الألوان (مفصولة بفاصلة)' },
                { name: 'badge', label: 'شارة (جديد، مميز...)' },
              ].map(f => (
                <div key={f.name}>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 500 }}>{f.label}</label>
                  <input name={f.name} type={f.type || 'text'} value={form[f.name] || ''} onChange={handle} required={f.required}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 4, fontFamily: 'Cairo, sans-serif' }} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 500 }}>{'الفئة'}</label>
                <select name="category" value={form.category} onChange={handle} required
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 4, fontFamily: 'Cairo, sans-serif' }}>
                  <option value="">{'اختر الفئة'}</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 500 }}>{'الوصف'}</label>
              <textarea name="description" value={form.description} onChange={handle} rows={3}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 4, fontFamily: 'Cairo, sans-serif', resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 500 }}>{'صور المنتج'}</label>
              <input type="file" multiple accept="image/*" onChange={async (e) => {
                const urls = await uploadImages(Array.from(e.target.files));
                setForm(p => ({ ...p, images: [...(p.images || []), ...urls] }));
              }} />
              {uploading && <p style={{ color: '#C9A96E', fontSize: '0.8rem', marginTop: 8 }}>{'جاري رفع الصور...'}</p>}
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {form.images?.map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={url} style={{ width: 60, height: 80, objectFit: 'cover', borderRadius: 4 }} />
                    <button type="button" onClick={() => setForm(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                      style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', fontSize: '0.6rem' }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" style={{ background: '#1A1A1A', color: 'white', padding: '10px 28px', border: 'none', cursor: 'pointer', borderRadius: 4, fontFamily: 'Cairo, sans-serif' }}>
                {editing ? 'حفظ التعديلات' : 'إضافة المنتج'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                style={{ background: 'white', border: '1px solid #ddd', padding: '10px 20px', cursor: 'pointer', borderRadius: 4, fontFamily: 'Cairo, sans-serif' }}>
                {'إلغاء'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
        {products.map(p => (
          <div key={p.id} style={{ background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', opacity: p.isActive ? 1 : 0.6 }}>
            <div style={{ paddingBottom: '80%', position: 'relative', background: '#f5f5f5' }}>
              {p.images?.[0] && <img src={p.images[0]} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
              {!p.isActive && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontWeight: 700 }}>{'مخفي'}</span>
                </div>
              )}
            </div>
            <div style={{ padding: 16 }}>
              <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: 4 }}>{p.category}</p>
              <p style={{ fontWeight: 600, marginBottom: 8, fontSize: '0.9rem' }}>{p.name}</p>
              <p style={{ fontWeight: 800, color: '#C9A96E', marginBottom: 12 }}>{p.price?.toLocaleString()} {'جنيه'}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => startEdit(p)} style={{ flex: 1, padding: '6px', background: '#f0f0f0', border: 'none', cursor: 'pointer', borderRadius: 4, fontSize: '0.8rem', fontFamily: 'Cairo, sans-serif' }}>{'تعديل'}</button>
                <button onClick={() => toggle(p)} style={{ flex: 1, padding: '6px', background: p.isActive ? '#fef3c7' : '#d1fae5', border: 'none', cursor: 'pointer', borderRadius: 4, fontSize: '0.8rem', fontFamily: 'Cairo, sans-serif' }}>
                  {p.isActive ? 'إخفاء' : 'إظهار'}
                </button>
                <button onClick={() => remove(p.id)} style={{ padding: '6px 10px', background: '#fee2e2', border: 'none', cursor: 'pointer', borderRadius: 4, fontSize: '0.8rem', color: '#ef4444' }}>🗑</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}