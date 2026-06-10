'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useEffect, useState } from 'react';
import { collection, query, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

const PROMO_MESSAGES = [
  '🎉 كود الخصم TAFSEELA10 — خصم ١٠٪ على أول طلب',
  '🚚 شحن مجاني على الطلبات فوق ١٠٠٠ جنيه',
  '✨ تشكيلة صيف ٢٠٢٦ متاحة الآن',
];

const HOME_CATEGORIES = [
  'تيشرتات رجالي',
  'هوديز رجالي',
  'بناطيل رجالي',
  'هوديز نسائي',
  'جيب نسائي',
];

const REVIEWS = [
  {
    name: 'أحمد محمود',
    text: 'الخامة ممتازة والتغليف شيك جدًا. المنتج وصل زي الصور بالظبط.',
    rating: '★★★★★',
  },
  {
    name: 'سارة علي',
    text: 'التصميم مختلف وراقي، والمقاس كان مضبوط. تجربة حلوة جدًا.',
    rating: '★★★★★',
  },
  {
    name: 'محمد خالد',
    text: 'أكتر حاجة عجبتني الاهتمام بالتفاصيل وجودة الطباعة.',
    rating: '★★★★★',
  },
];

function PromoBar() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % PROMO_MESSAGES.length);
    }, 3500);

    return () => clearInterval(t);
  }, []);

  return (
    <div className="promo-bar">
      <span key={idx} className="promo-text">
        {PROMO_MESSAGES[idx]}
      </span>
    </div>
  );
}

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const q = query(
        collection(db, 'products'),
        where('isActive', '==', true),
        limit(20)
      );

      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      setFeatured(data.slice(0, 8));

      setOffers(
        data
          .filter(
            (p) =>
              p.onSale &&
              p.salePrice &&
              Number(p.salePrice) < Number(p.price)
          )
          .slice(0, 4)
      );
    };

    fetchProducts();
  }, []);

  return (
    <>
      <PromoBar />
      <Navbar />

      <style>{`
        .promo-bar {
          background: var(--gold, #C9A96E);
          color: white;
          text-align: center;
          padding: 9px 16px;
          font-size: clamp(0.75rem, 2.5vw, 0.88rem);
          font-weight: 600;
          letter-spacing: 0.3px;
        }

        .promo-text {
          display: inline-block;
          animation: fadeSlide 0.5s ease;
        }

        @keyframes fadeSlide {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .home-hero {
          background:
            radial-gradient(circle at center, rgba(201,169,110,0.10), transparent 34%),
            var(--dark);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
        }

        .hero-inner {
          width: 100%;
          margin: 0 auto;
        }

        .hero-logo {
          width: 100%;
          height: auto;
          object-fit: contain;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-title {
          color: #cfcfcf;
          letter-spacing: 1px;
          font-weight: 600;
          line-height: 1.3;
        }

        .hero-subtitle {
          color: #888;
          line-height: 1.8;
        }

        .hero-actions {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .hero-main-btn {
          color: white;
          border-color: white;
          padding: 12px 42px;
          font-size: 0.95rem;
        }

        .home-categories {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
          max-width: 760px;
          margin: 0 auto;
        }

        .home-category-link {
          color: #ddd;
          border: 1px solid #333;
          background: rgba(255,255,255,0.03);
          padding: 9px 17px;
          border-radius: 999px;
          text-decoration: none;
          font-size: 0.86rem;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .home-category-link:hover {
          color: var(--gold);
          border-color: var(--gold);
          transform: translateY(-2px);
        }

        .offers-section {
          background: #fff;
          padding: clamp(40px, 7vw, 70px) 20px;
        }

        .offers-header {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 28px;
        }

        .offers-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .home-features {
          background: #111;
          border-top: 1px solid #222;
          border-bottom: 1px solid #222;
          padding: 22px 20px;
        }

        .features-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          text-align: center;
          color: white;
        }

        .feature-card {
          padding: 16px;
        }

        .feature-icon {
          font-size: 1.6rem;
          margin-bottom: 8px;
        }

        .feature-title {
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .feature-text {
          color: #777;
          font-size: 0.82rem;
          line-height: 1.7;
        }

        .featured-section {
          padding: clamp(40px, 8vw, 80px) 20px;
        }

        .featured-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(260px, 100%), 1fr));
          gap: 24px;
        }

        .reviews-section {
          background: #f7f4ef;
          padding: clamp(45px, 8vw, 80px) 20px;
        }

        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }

        .review-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 26px 22px;
          text-align: center;
          box-shadow: 0 8px 24px rgba(0,0,0,0.04);
        }

        .review-stars {
          color: var(--gold);
          font-size: 1rem;
          margin-bottom: 14px;
          letter-spacing: 2px;
        }

        .review-text {
          color: #555;
          line-height: 1.9;
          font-size: 0.92rem;
          margin-bottom: 18px;
        }

        .review-name {
          color: var(--dark);
          font-weight: 700;
          font-size: 0.9rem;
        }

        @media (min-width: 769px) {
          .home-hero {
            min-height: auto !important;
            padding: 28px 20px 34px !important;
            align-items: flex-start !important;
          }

          .hero-inner {
            max-width: 760px !important;
          }

          .hero-logo {
            max-width: 520px !important;
            margin-bottom: 2px !important;
          }

          .hero-title {
            font-size: 1.55rem !important;
            margin-top: 0 !important;
            margin-bottom: 4px !important;
          }

          .hero-subtitle {
            font-size: 0.95rem !important;
            margin-top: 0 !important;
            margin-bottom: 17px !important;
          }

          .hero-actions {
            margin-bottom: 20px !important;
          }

          .offers-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }
        }

        @media (max-width: 768px) {
          .home-hero {
            min-height: auto;
            padding: 56px 16px 48px;
          }

          .hero-inner {
            max-width: 100%;
          }

          .hero-logo {
            max-width: 360px;
            margin-bottom: 18px;
          }

          .hero-title {
            font-size: clamp(1rem, 4vw, 2.1rem);
            margin-bottom: 12px;
          }

          .hero-subtitle {
            font-size: clamp(0.85rem, 2vw, 1rem);
            margin-bottom: 34px;
          }

          .hero-actions {
            margin-bottom: 34px;
          }

          .hero-main-btn {
            width: 100%;
            max-width: 260px;
          }

          .home-categories {
            gap: 9px;
          }

          .home-category-link {
            font-size: 0.78rem;
            padding: 8px 13px;
          }

          .offers-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 4px;
          }

          .feature-card {
            padding: 10px;
          }

          .featured-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
          }

          .reviews-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .review-card {
            padding: 22px 18px;
          }
        }

        @media (max-width: 380px) {
          .home-category-link {
            font-size: 0.74rem;
            padding: 7px 11px;
          }

          .featured-grid,
          .offers-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
        }
      `}</style>

      <section className="home-hero">
        <div className="hero-inner">
          <img src="/logo.png" alt="tafseela" className="hero-logo" />

          <p className="hero-title">بتحكي عنك</p>

          <p className="hero-subtitle">
            ملابس شبابية بتصميمات عصرية وجودة عالية لكل تفصيلة في يومك
          </p>

          <div className="hero-actions">
            <Link href="/products">
              <button className="btn-outline hero-main-btn">
                تسوق الآن
              </button>
            </Link>
          </div>

          <div className="home-categories">
            {HOME_CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/products?category=${encodeURIComponent(cat)}`}
                className="home-category-link"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {offers.length > 0 && (
        <section className="offers-section">
          <div className="container">
            <div className="offers-header">
              <div>
                <h2 className="section-title" style={{ marginBottom: 8 }}>
                  🔥 العروض الحالية
                </h2>
                <p className="section-subtitle">
                  خصومات لفترة محدودة على منتجات مختارة
                </p>
              </div>

              <Link href="/offers">
                <button className="btn-outline">
                  عرض كل العروض
                </button>
              </Link>
            </div>

            <div className="offers-grid">
              {offers.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="home-features">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🧵</div>
            <div className="feature-title">خامات مختارة</div>
            <div className="feature-text">نهتم بالخامة والقَصّة قبل أي شيء.</div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <div className="feature-title">تغليف يليق بيك</div>
            <div className="feature-text">كل طلب يوصل بتجربة مرتبة من أول لحظة.</div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <div className="feature-title">تصميمات شبابية</div>
            <div className="feature-text">ستايل بسيط، عملي، ومناسب لكل يوم.</div>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="section-title">المنتجات المميزة</h2>
            <p className="section-subtitle">اكتشف أحدث تشكيلات تفصيلة</p>
          </div>

          <div className="featured-grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link href="/products">
              <button className="btn-outline">عرض كل المنتجات</button>
            </Link>
          </div>
        </div>
      </section>

      <section className="reviews-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 42 }}>
            <h2 className="section-title">آراء العملاء</h2>
            <p className="section-subtitle">تجارب حقيقية من عملاء تفصيلة</p>
          </div>

          <div className="reviews-grid">
            {REVIEWS.map((review) => (
              <div key={review.name} className="review-card">
                <div className="review-stars">{review.rating}</div>
                <p className="review-text">“{review.text}”</p>
                <div className="review-name">{review.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          background: 'var(--dark)',
          color: 'white',
          padding: 'clamp(60px, 10vw, 100px) 20px',
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: 700,
            textAlign: 'center',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              width: 40,
              height: 2,
              background: 'var(--gold)',
              margin: '0 auto 32px',
            }}
          />

          <h2
            style={{
              fontSize: 'clamp(1.4rem, 4vw, 2rem)',
              fontWeight: 700,
              marginBottom: 24,
            }}
          >
            قصتنا
          </h2>

          <p style={{ color: '#aaa', lineHeight: 2, fontSize: 'clamp(0.9rem, 2.5vw, 1rem)', marginBottom: 16 }}>
            تفصيلة بدأت من فكرة بسيطة: إن كل شخص له أسلوبه، ذوقه، وتفاصيله الخاصة.
          </p>

          <p style={{ color: '#aaa', lineHeight: 2, fontSize: 'clamp(0.9rem, 2.5vw, 1rem)', marginBottom: 16 }}>
            نحن لا نصمم ملابس فقط، بل نصنع قطعا تعبر عنك، عن هدوئك، عن اختياراتك، وعن الطريقة التي تحب ان تظهر بها للعالم.
          </p>

          <p style={{ color: '#aaa', lineHeight: 2, fontSize: 'clamp(0.9rem, 2.5vw, 1rem)', marginBottom: 16 }}>
            في تفصيلة، نهتم بكل شيء: الخامة، القصة، اللون، التيكت، والتغليف. لاننا نؤمن ان الجمال الحقيقي لا يكون في الشكل فقط، بل في كل تفصيلة صغيرة تكمل الحكاية.
          </p>

          <p style={{ fontWeight: 700, color: 'var(--gold)', marginTop: 24, fontSize: '1.1rem' }}>
            تفصيلة.. بتحكي عنك
          </p>
        </div>
      </section>

      <a
        href="https://wa.me/201000000000"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: 28,
          left: 28,
          zIndex: 99,
          background: '#25D366',
          color: 'white',
          width: 54,
          height: 54,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(37,211,102,0.4)',
          textDecoration: 'none',
          fontSize: '0.8rem',
        }}
      >
        واتساب
      </a>

      <Footer />
    </>
  );
}