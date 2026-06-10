'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';

const CATEGORIES = [
  'الكل',
  'تيشرتات رجالي',
  'هوديز رجالي',
  'بناطيل رجالي',
  'هوديز نسائي',
  'جيب نسائي',
];

function ProductsContent() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState('الكل');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getDocs(collection(db, 'products')).then((snap) => {
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((p) => p.isActive);

      setProducts(data);
      setFiltered(data);
    });
  }, []);

  useEffect(() => {
    let res = [...products];

    if (category !== 'الكل') {
      res = res.filter((p) => p.category === category);
    }

    if (search.trim()) {
      res = res.filter((p) =>
        p.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sort === 'price-asc') {
      res.sort((a, b) => a.price - b.price);
    }

    if (sort === 'price-desc') {
      res.sort((a, b) => b.price - a.price);
    }

    setFiltered(res);
  }, [category, sort, search, products]);

  const btnStyle = (cat) => ({
    padding: '8px 16px',
    border: '1px solid var(--border)',
    background: category === cat ? 'var(--dark)' : 'transparent',
    color: category === cat ? 'white' : 'white',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontFamily: 'Cairo, sans-serif',
    borderRadius: '24px',
    whiteSpace: 'nowrap',
  });

  return (
    <>
      <Navbar />

      <style>{`
        .top-categories {
          background: #111;
          border-top: 1px solid #222;
          border-bottom: 1px solid #222;
          padding: 14px 16px;
          overflow-x: auto;
          display: flex;
          gap: 10px;
          scrollbar-width: none;
        }

        .top-categories::-webkit-scrollbar {
          display: none;
        }

        .products-filters {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 28px;
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

        .products-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        @media (min-width: 1024px) {
          .top-categories {
            justify-content: center;
          }

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

      <div className="top-categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={btnStyle(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="container" style={{ padding: '32px 16px' }}>
        <h1 className="section-title" style={{ marginBottom: 28 }}>
          المنتجات
        </h1>

        <div className="products-filters">
          <div className="search-sort-row">
            <input
              placeholder="البحث عن منتج..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">الأحدث</option>
              <option value="price-asc">الأقل سعراً</option>
              <option value="price-desc">الأعلى سعراً</option>
            </select>
          </div>
        </div>

        <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: 20 }}>
          {filtered.length} منتج
        </p>

        <div className="products-grid">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
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