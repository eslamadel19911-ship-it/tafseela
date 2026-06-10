'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

export default function OffersPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, 'products'));

      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter(
          (p) =>
            p.isActive &&
            p.onSale &&
            p.salePrice &&
            Number(p.salePrice) < Number(p.price)
        );

      setProducts(data);
    };

    load();
  }, []);

  return (
    <>
      <Navbar />

      <div className="container" style={{ padding: '40px 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 className="section-title">العروض</h1>
          <p className="section-subtitle">
            خصومات لفترة محدودة على منتجات مختارة
          </p>
        </div>

        <div className="offers-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {products.length === 0 && (
          <p style={{ textAlign: 'center', color: '#999', padding: 40 }}>
            لا توجد عروض حالياً
          </p>
        )}
      </div>

      <style>{`
        .offers-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        @media (min-width: 1024px) {
          .offers-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }
        }
      `}</style>

      <Footer />
    </>
  );
}