'use client';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';

// ✅ دالة لتنسيق النص — بتحول السطور لفقرات والنقاط لـ list
function FormattedDescription({ text }) {
  if (!text) return null;
  const lines = text.split('\n').filter(l => l.trim());
  return (
    <div style={{ color: 'var(--gray)', fontSize: '0.9rem', lineHeight: 1.9 }}>
      {lines.map((line, i) => {
        const isBullet = line.trim().startsWith('-') || line.trim().startsWith('•');
        if (isBullet) {
          return (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--gold)', marginTop: 2, flexShrink: 0 }}>◆</span>
              <span>{line.replace(/^[-•]\s*/, '')}</span>
            </div>
          );
        }
        return <p key={i} style={{ marginBottom: 10 }}>{line}</p>;
      })}
    </div>
  );
}

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

  // ✅ الصورة الرئيسية تتغير مع اللون لو فيه colorImages
  const currentImage = product.colorImages?.[selectedColor]
    ? [product.colorImages[selectedColor], ...(product.images || [])]
    : product.images;

  return (
    <>
      <Navbar />

      <style>{`
        .product-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: start;
        }

        /* ✅ موبايل: عمود واحد */
        @media (max-width: 768px) {
          .product-layout {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .product-info {
            padding: 0 !important;
          }
          .product-title {
            font-size: 1.3rem !important;
          }
          .product-price {
            font-size: 1.3rem !important;
          }
          .product-description-section {
            margin-top: 24px !important;
            padding-top: 24px !important;
          }
        }

        /* ✅ الصور المصغرة تتمدد على الموبايل */
        .thumbnails {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .thumbnail {
          width: 68px;
          height: 88px;
          cursor: pointer;
          overflow: hidden;
          flex-shrink: 0;
        }

        @media (max-width: 480px) {
          .thumbnail {
            width: 56px;
            height: 72px;
          }
        }
      `}</style>

      <div className="container" style={{ padding: '40px 16px 60px' }}>
        <div className="product-layout">

          {/* ✅ الصور */}
          <div>
            <div style={{
              paddingBottom: '120%', position: 'relative',
              background: '#f5f5f5', borderRadius: 4, overflow: 'hidden'
            }}>
              {currentImage?.[mainImg] && (
                <img
                  src={currentImage[mainImg]}
                  alt={product.name}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>
            <div className="thumbnails">
              {currentImage?.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setMainImg(i)}
                  className="thumbnail"
                  style={{ border: mainImg === i ? '2px solid var(--dark)' : '2px solid transparent' }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          {/* ✅ المعلومات */}
          <div className="product-info" style={{ padding: '8px 0' }}>
            <p style={{ color: 'var(--gray)', marginBottom: 6, fontSize: '0.82rem' }}>{product.category}</p>

            <h1 className="product-title" style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 14, lineHeight: 1.4 }}>
              {product.name}
            </h1>

            <p className="product-price" style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 28, color: 'var(--dark)' }}>
              {product.price?.toLocaleString()} جنيه
            </p>

            {/* الألوان */}
            {product.colors?.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <p style={{ fontWeight: 600, marginBottom: 10, fontSize: '0.88rem' }}>
                  اللون: <span style={{ fontWeight: 400 }}>{selectedColor}</span>
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {product.colors.map(c => (
                    <button key={c} onClick={() => { setSelectedColor(c); setMainImg(0); }} style={{
                      padding: '7px 16px',
                      border: selectedColor === c ? '2px solid var(--dark)' : '1px solid var(--border)',
                      background: 'white', cursor: 'pointer',
                      fontFamily: 'Cairo, sans-serif', fontSize: '0.82rem',
                      borderRadius: 3,
                    }}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {/* المقاسات */}
            {product.sizes?.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontWeight: 600, marginBottom: 10, fontSize: '0.88rem' }}>
                  المقاس: <span style={{ fontWeight: 400 }}>{selectedSize}</span>
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {product.sizes.map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)} style={{
                      width: 44, height: 44,
                      border: selectedSize === s ? '2px solid var(--dark)' : '1px solid var(--border)',
                      background: 'white', cursor: 'pointer',
                      fontFamily: 'Cairo, sans-serif', fontWeight: 600,
                      borderRadius: 3,
                    }}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleAdd}
              className="btn-primary"
              style={{ width: '100%', padding: '15px', fontSize: '1rem', borderRadius: 3 }}
            >
              {added ? '✓ تمت الإضافة للسلة' : 'أضف للسلة'}
            </button>

            {/* ✅ التفاصيل منسقة */}
            <div className="product-description-section" style={{ marginTop: 32, paddingTop: 28, borderTop: '1px solid var(--border)' }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700, fontSize: '1rem' }}>التفاصيل</h3>
              <FormattedDescription text={product.description} />
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