'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';

const CATEGORIES = {
  all: 'الكل',
  men: {
    label: 'رجالي',
    items: ['تيشرتات رجالي', 'هوديز رجالي', 'بناطيل رجالي']
  },
  women: {
    label: 'نسائي',
    items: ['هوديز نسائي', 'جيب نسائي']
  }
};

function ProductsContent() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState('الكل');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getDocs(collection(db, 'products')).then(snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.isActive);
      setProducts(data);
      setFiltered(data);
    });
  }, []);

  useEffect(() => {
    let res = [...products];
    if (category !== 'الكل') res = res.filter(p => p.category === category);
    if (search) res = res.filter(p => p.name.includes(search));
    if (sort === 'price-asc') res.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') res.sort((a, b) => b.price - a.price);
    setFiltered(res);
  }, [category, sort, search, products]);

  const btnStyle = (cat) => ({
    padding: '8px 20px',
    border: '1px solid var(--border)',
    background: category === cat ? 'var(--dark)' : 'white',
    color: category === cat ? 'white' : 'var(--dark)',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontFamily: 'Cairo, sans-serif'
  });

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '40px 20px' }}>
        <h1 className="section-title" style={{ marginBottom: 32 }}>{'المنتجات'}</h1>

        {/* الفلاتر */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 32, alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* الكل */}
            <div>
              <button onClick={() => setCategory('الكل')} style={btnStyle('الكل')}>
                {'الكل'}
              </button>
            </div>

            {/* رجالي */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold)',
                fontFamily: 'Cairo, sans-serif', minWidth: 50
              }}>{'رجالي'}</span>
              {CATEGORIES.men.items.map(c => (
                <button key={c} onClick={() => setCategory(c)} style={btnStyle(c)}>{c}</button>
              ))}
            </div>

            {/* نسائي */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold)',
                fontFamily: 'Cairo, sans-serif', minWidth: 50
              }}>{'نسائي'}</span>
              {CATEGORIES.women.items.map(c => (
                <button key={c} onClick={() => setCategory(c)} style={btnStyle(c)}>{c}</button>
              ))}
            </div>

          </div>

          {/* بحث وترتيب */}
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              placeholder="البحث عن منتج..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ padding: '8px 16px', border: '1px solid var(--border)', fontFamily: 'Cairo, sans-serif', fontSize: '0.85rem' }}
            />
            <select value={sort} onChange={e => setSort(e.target.value)}
              style={{ padding: '8px 16px', border: '1px solid var(--border)', fontFamily: 'Cairo, sans-serif', fontSize: '0.85rem' }}>
              <option value="newest">{'الأحدث'}</option>
              <option value="price-asc">{'السعر: الأقل أولاً'}</option>
              <option value="price-desc">{'السعر: الأعلى أولاً'}</option>
            </select>
          </div>
        </div>

        <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: 24 }}>{filtered.length} {'منتج'}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function ProductsPage() {
  return (
    <AuthProvider>
      <CartProvider>
        <ProductsContent />
      </CartProvider>
    </AuthProvider>
  );
}