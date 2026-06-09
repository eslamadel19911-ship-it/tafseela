'use client';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';

function ProductContent({ params }) {
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [mainImg, setMainImg] = useState(0);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    getDoc(doc(db, 'products', params.id)).then(d => {
      if (d.exists()) {
        const p = { id: d.id, ...d.data() };
        setProduct(p);
        setSelectedSize(p.sizes?.[0] || '');
        setSelectedColor(p.colors?.[0] || '');
      }
    });
  }, [params.id]);

  if (!product) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      جاري التحميل...
    </div>
  );

  const handleAdd = () => {
    addItem(product, selectedSize, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '60px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60 }}>

          {/* Images */}
          <div>
            <div style={{ paddingBottom: '120%', position: 'relative', background: '#f5f5f5', marginBottom: 12 }}>
              {product.images?.[mainImg] && (
                <img src={product.images[mainImg]} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {product.images?.map((img, i) => (
                <div key={i} onClick={() => setMainImg(i)} style={{
                  width: 70, height: 90, cursor: 'pointer',
                  border: mainImg === i ? '2px solid var(--dark)' : '2px solid transparent', overflow: 'hidden'
                }}>
                  <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div style={{ padding: '20px 0' }}>
            <p style={{ color: 'var(--gray)', marginBottom: 8, fontSize: '0.85rem' }}>{product.category}</p>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 16 }}>{product.name}</h1>
            <p style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 24 }}>
              {product.price?.toLocaleString()} جنيه
            </p>

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontWeight: 600, marginBottom: 12, fontSize: '0.9rem' }}>اللون: {selectedColor}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {product.colors.map(c => (
                    <button key={c} onClick={() => setSelectedColor(c)} style={{
                      padding: '6px 16px',
                      border: selectedColor === c ? '2px solid var(--dark)' : '1px solid var(--border)',
                      background: 'white', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontSize: '0.8rem'
                    }}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <p style={{ fontWeight: 600, marginBottom: 12, fontSize: '0.9rem' }}>المقاس: {selectedSize}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {product.sizes.map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)} style={{
                      width: 44, height: 44,
                      border: selectedSize === s ? '2px solid var(--dark)' : '1px solid var(--border)',
                      background: 'white', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 600
                    }}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleAdd} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1rem' }}>
              {added ? '✓ تمت الإضافة للسلة' : 'أضف للسلة'}
            </button>

            <div style={{ marginTop: 32, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
              <h3 style={{ marginBottom: 12, fontWeight: 600 }}>التفاصيل</h3>
              <p style={{ color: 'var(--gray)', lineHeight: 2, fontSize: '0.9rem' }}>{product.description}</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function ProductDetail({ params }) {
  return (
    <AuthProvider>
      <CartProvider>
        <ProductContent params={params} />
      </CartProvider>
    </AuthProvider>
  );
}