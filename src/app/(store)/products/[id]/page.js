'use client';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';

// ✅ تنسيق النص الذكي — بيتعامل مع النص العادي والنقاط والعناوين
function FormattedDescription({ text }) {
  if (!text) return null;

  const hasNewlines = text.includes('\n');
  let lines;

  if (hasNewlines) {
    lines = text.split('\n').filter(l => l.trim());
  } else {
    lines = text
      .split(/[.،]\s+/)
      .filter(l => l.trim())
      .map((l, i, arr) => i < arr.length - 1 ? l + '.' : l);
  }

  const headingKeywords = ['مميزات', 'خامة', 'التنسيق', 'طريقة', 'العناية', 'الغسيل', 'المقاسات', 'ملاحظة'];

  return (
    <div style={{ fontSize: '0.9rem', lineHeight: 1.9, color: 'var(--gray, #666)' }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        const isBullet = trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*');
        const isHeading = headingKeywords.some(k => trimmed.startsWith(k)) || trimmed.endsWith(':');
        const isFeature = trimmed.includes('100%') || trimmed.includes('جنيه') || trimmed.includes('مقاس');

        if (isHeading) {
          return (
            <p key={i} style={{ fontWeight: 700, color: 'var(--dark, #1a1a1a)', marginTop: 16, marginBottom: 6, fontSize: '0.92rem' }}>
              {trimmed}
            </p>
          );
        }

        if (isBullet || isFeature) {
          return (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 7, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--gold, #C9A96E)', marginTop: 3, flexShrink: 0, fontSize: '0.6rem' }}>◆</span>
              <span>{trimmed.replace(/^[-•*]\s*/, '')}</span>
            </div>
          );
        }

        return (
          <p key={i} style={{ marginBottom: 10 }}>{trimmed}</p>
        );
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
  const [activeTab, setActiveTab] = useState('details');
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
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>⏳</div>
        <p style={{ color: '#aaa' }}>جاري التحميل...</p>
      </div>
    </div>
  );

  const handleAdd = () => {
    addItem(product, selectedSize, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const currentImage = product.colorImages?.[selectedColor]
    ? [product.colorImages[selectedColor], ...(product.images || [])]
    : product.images;

  const tabs = [
    { id: 'details', label: 'التفاصيل' },
    { id: 'care', label: 'العناية' },
    { id: 'shipping', label: 'الشحن والإرجاع' },
  ];

  return (
    <>
      <Navbar />

      <style>{`
        .product-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 56px;
          align-items: start;
        }
        @media (max-width: 768px) {
          .product-layout { grid-template-columns: 1fr; gap: 24px; }
        }
        .thumbnails { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
        .thumbnail { width: 68px; height: 88px; cursor: pointer; overflow: hidden; flex-shrink: 0; border-radius: 2px; }
        @media (max-width: 480px) { .thumbnail { width: 58px; height: 74px; } }
        .tab-btn { 
          background: none; border: none; cursor: pointer; 
          font-family: Cairo, sans-serif; font-size: 0.88rem;
          padding: 10px 0; color: #aaa; border-bottom: 2px solid transparent;
          transition: all 0.2s; white-space: nowrap;
        }
        .tab-btn.active { color: var(--dark, #1a1a1a); border-bottom-color: var(--dark, #1a1a1a); font-weight: 700; }
        .tab-btn:hover { color: var(--dark, #1a1a1a); }
      `}</style>

      <div className="container" style={{ padding: '40px 16px 80px' }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: 24, fontSize: '0.8rem', color: '#aaa', display: 'flex', gap: 6, alignItems: 'center' }}>
          <a href="/" style={{ color: '#aaa', textDecoration: 'none' }}>الرئيسية</a>
          <span>›</span>
          <a href="/products" style={{ color: '#aaa', textDecoration: 'none' }}>المنتجات</a>
          <span>›</span>
          <span style={{ color: 'var(--dark)' }}>{product.name}</span>
        </div>

        <div className="product-layout">

          {/* ===== الصور ===== */}
          <div>
            <div style={{
              paddingBottom: '120%', position: 'relative',
              background: '#f5f5f5', borderRadius: 6, overflow: 'hidden'
            }}>
              {currentImage?.[mainImg] && (
                <img
                  src={currentImage[mainImg]}
                  alt={product.name}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
              {product.isNew && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'var(--dark)', color: 'white',
                  padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700, borderRadius: 2
                }}>جديد</div>
              )}
            </div>
            <div className="thumbnails">
              {currentImage?.map((img, i) => (
                <div key={i} onClick={() => setMainImg(i)} className="thumbnail"
                  style={{ border: mainImg === i ? '2px solid var(--dark)' : '2px solid transparent' }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          {/* ===== المعلومات ===== */}
          <div style={{ padding: '4px 0' }}>

            <p style={{ color: 'var(--gray)', marginBottom: 6, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1 }}>
              {product.category}
            </p>

            <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.7rem)', fontWeight: 700, marginBottom: 12, lineHeight: 1.4 }}>
              {product.name}
            </h1>

            <p style={{ fontSize: 'clamp(1.3rem, 3vw, 1.6rem)', fontWeight: 800, marginBottom: 24, color: 'var(--dark)' }}>
              {product.price?.toLocaleString()} جنيه
            </p>

            {/* الألوان */}
            {product.colors?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontWeight: 600, marginBottom: 10, fontSize: '0.88rem' }}>
                  اللون: <span style={{ fontWeight: 400, color: 'var(--gray)' }}>{selectedColor}</span>
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {product.colors.map(c => (
                    <button key={c} onClick={() => { setSelectedColor(c); setMainImg(0); }} style={{
                      padding: '7px 18px',
                      border: selectedColor === c ? '2px solid var(--dark)' : '1px solid #ddd',
                      background: selectedColor === c ? 'var(--dark)' : 'white',
                      color: selectedColor === c ? 'white' : 'var(--dark)',
                      cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
                      fontSize: '0.82rem', borderRadius: 3, transition: 'all 0.15s'
                    }}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {/* المقاسات */}
            {product.sizes?.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontWeight: 600, marginBottom: 10, fontSize: '0.88rem' }}>
                  المقاس: <span style={{ fontWeight: 400, color: 'var(--gray)' }}>{selectedSize}</span>
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {product.sizes.map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)} style={{
                      width: 46, height: 46,
                      border: selectedSize === s ? '2px solid var(--dark)' : '1px solid #ddd',
                      background: selectedSize === s ? 'var(--dark)' : 'white',
                      color: selectedSize === s ? 'white' : 'var(--dark)',
                      cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
                      fontWeight: 700, borderRadius: 3, transition: 'all 0.15s',
                      fontSize: '0.82rem'
                    }}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* زر الإضافة */}
            <button onClick={handleAdd} className="btn-primary"
              style={{ width: '100%', padding: '15px', fontSize: '1rem', borderRadius: 3, marginBottom: 12 }}>
              {added ? '✓ تمت الإضافة للسلة' : 'أضف للسلة'}
            </button>

            {/* زر واتساب */}
            <a href={`https://wa.me/201000000000?text=أريد الاستفسار عن: ${product.name}`}
              target="_blank"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: '13px', border: '1px solid #25D366',
                color: '#25D366', textDecoration: 'none', borderRadius: 3,
                fontSize: '0.9rem', fontWeight: 600
              }}>
              <svg width="18" height="18" fill="#25D366" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.556 4.112 1.528 5.836L0 24l6.341-1.512A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.898 0-3.673-.516-5.193-1.415l-.373-.22-3.764.897.933-3.654-.243-.386A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              استفسر عبر واتساب
            </a>

            {/* ===== Tabs للتفاصيل ===== */}
            <div style={{ marginTop: 36, borderTop: '1px solid #eee', paddingTop: 24 }}>

              {/* Tab Buttons */}
              <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #eee', marginBottom: 20 }}>
                {tabs.map(tab => (
                  <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'details' && (
                <FormattedDescription text={product.description} />
              )}

              {activeTab === 'care' && (
                <div style={{ fontSize: '0.9rem', lineHeight: 1.9, color: 'var(--gray)' }}>
                  {[
                    'يُغسل بماء بارد للحفاظ على جودة الطباعة',
                    'يُفضل قلب التيشيرت قبل الغسيل',
                    'لا تستخدم المبيض أو منظفات قاسية',
                    'تجفيف في الهواء أو على حرارة منخفضة',
                    'الكي من الجهة الداخلية فقط',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--gold)', flexShrink: 0 }}>◆</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'shipping' && (
                <div style={{ fontSize: '0.9rem', lineHeight: 1.9, color: 'var(--gray)' }}>
                  {[
                    { label: 'القاهرة والجيزة والقليوبية', value: '٧٠ جنيه' },
                    { label: 'باقي المحافظات', value: '١٠٠ جنيه' },
                    { label: 'مدة التوصيل', value: '٣-٧ أيام عمل' },
                    { label: 'الإرجاع', value: 'خلال ١٤ يوم من الاستلام' },
                  ].map((row, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '10px 0', borderBottom: i < 3 ? '1px solid #f0f0f0' : 'none'
                    }}>
                      <span>{row.label}</span>
                      <span style={{ fontWeight: 700, color: 'var(--dark)' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

// ✅ بدون AuthProvider / CartProvider — بييجوا من layout.jsx
export default function ProductDetail({ params }) {
  return <ProductContent params={params} />;
}