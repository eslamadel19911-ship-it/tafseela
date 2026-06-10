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
    padding: '8px 16px',
    border: '1px solid var(--border)',
    background: category === cat ? 'var(--dark)' : 'white',
    color: category === cat ? 'white' : 'var(--dark)',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontFamily: 'Cairo, sans-serif',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
  });

  return (
    <>
      <Navbar />

      {/* ✅ CSS مدمج للتجاوب */}
      <style>{`
        .products-filters {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
        }

        .search-sort-row {
          display: flex;
          gap: 10px;
          width: 100%;
        }

        .search-sort-row input,
        .search-sort-row select {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid var(--border);
          font-family: Cairo, sans-serif;
          font-size: 0.85rem;
          border-radius: 4px;
          min-width: 0;
        }

        .category-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .category-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--gold);
          font-family: Cairo, sans-serif;
          min-width: 45px;
        }

        /* ✅ Grid متجاوب */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        @media (min-width: 640px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }

        @media (min-width: 1024px) {
          .products-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
        }

        @media (min-width: 1280px) {
          .products-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        /* ✅ على الموبايل الصغير */
        @media (max-width: 400px) {
          .search-sort-row {
            flex-direction: column;
          }
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }
      `}</style>

      <div className="container" style={{ padding: '32px 16px' }}>
        <h1 className="section-title" style={{ marginBottom: 28 }}>المنتجات</h1>

        {/* ✅ الفلاتر */}
        <div className="products-filters">

          {/* البحث والترتيب في الأعلى على الموبايل */}
          <div className="search-sort-row">
            <input
              placeholder="البحث عن منتج..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="newest">الأحدث</option>
              <option value="price-asc">الأقل سعراً</option>
              <option value="price-desc">الأعلى سعراً</option>
            </select>
          </div>

          {/* الكل */}
          <div className="category-row">
            <button onClick={() => setCategory('الكل')} style={btnStyle('الكل')}>الكل</button>
          </div>

          {/* رجالي */}
          <div className="category-row">
            <span className="category-label">رجالي</span>
            {CATEGORIES.men.items.map(c => (
              <button key={c} onClick={() => setCategory(c)} style={btnStyle(c)}>{c}</button>
            ))}
          </div>

          {/* نسائي */}
          <div className="category-row">
            <span className="category-label">نسائي</span>
            {CATEGORIES.women.items.map(c => (
              <button key={c} onClick={() => setCategory(c)} style={btnStyle(c)}>{c}</button>
            ))}
          </div>

        </div>

        <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: 20 }}>
          {filtered.length} منتج
        </p>

        {/* ✅ Grid متجاوب */}
        <div className="products-grid">
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