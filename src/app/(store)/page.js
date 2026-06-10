'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useEffect, useState } from 'react';
import { collection, query, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

// ✅ غيّر الرسائل هنا
const PROMO_MESSAGES = [
  '🎉 كود الخصم TAFSEELA10 — خصم ١٠٪ على أول طلب',
  '🚚 شحن مجاني على الطلبات فوق ١٠٠٠ جنيه',
  '✨ تشكيلة صيف ٢٠٢٦ متاحة الآن',
];

function PromoBar() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % PROMO_MESSAGES.length), 3500);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{
      background: 'var(--gold, #C9A96E)', color: 'white',
      textAlign: 'center', padding: '9px 16px',
      fontSize: 'clamp(0.75rem, 2.5vw, 0.88rem)',
      fontWeight: 600, letterSpacing: 0.3,
    }}>
      <span key={idx} style={{ display: 'inline-block', animation: 'fadeSlide 0.5s ease' }}>
        {PROMO_MESSAGES[idx]}
      </span>
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ✅ أيقونات السوشيال ميديا
const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    href: 'https://facebook.com/tafseela', // ✅ غيّر الرابط
    svg: (
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/tafseela', // ✅ غيّر الرابط
    svg: (
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://tiktok.com/@tafseela', // ✅ غيّر الرابط
    svg: (
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
  },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const q = query(collection(db, 'products'), where('isActive', '==', true), limit(8));
      const snap = await getDocs(q);
      setFeatured(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchProducts();
  }, []);

  return (
    <>
      <PromoBar />
      <Navbar />

      {/* Hero */}
      <section style={{
        minHeight: '90vh', background: 'var(--dark)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: 'white', padding: '40px 20px' }}>
          <img src="/logo.png" alt="tafseela" style={{
            width: '100%', maxWidth: 500, height: 'auto',
            objectFit: 'contain', marginBottom: 24
          }} />
          <p style={{ fontSize: 'clamp(1rem, 4vw, 2.1rem)', color: '#aaa', marginBottom: 40, letterSpacing: 1 }}>
            بتحكي عنك
          </p>
          <Link href="/products">
            <button className="btn-outline" style={{ color: 'white', borderColor: 'white', padding: '12px 40px' }}>
              تسوق الآن
            </button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ padding: 'clamp(40px, 8vw, 80px) 20px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="section-title">المنتجات المميزة</h2>
            <p className="section-subtitle">اكتشف أحدث تشكيلات تفصيلة</p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))',
            gap: 24
          }}>
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link href="/products">
              <button className="btn-outline">عرض كل المنتجات</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section style={{ background: 'var(--dark)', color: 'white', padding: 'clamp(60px, 10vw, 100px) 20px' }}>
        <div className="container" style={{ maxWidth: 700, textAlign: 'center', margin: '0 auto' }}>
          <div style={{ width: 40, height: 2, background: 'var(--gold)', margin: '0 auto 32px' }} />
          <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 700, marginBottom: 24 }}>قصتنا</h2>
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

          {/* ✅ أيقونات السوشيال ميديا */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 40 }}>
            {SOCIAL_LINKS.map(({ label, href, svg }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 48, height: 48, borderRadius: '50%',
                  border: '1px solid #333', color: '#aaa',
                  textDecoration: 'none', transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--gold, #C9A96E)';
                  e.currentTarget.style.borderColor = 'var(--gold, #C9A96E)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = '#aaa';
                  e.currentTarget.style.borderColor = '#333';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {svg}
              </a>
            ))}
          </div>

          {/* ✅ نص متابعة */}
          <p style={{ color: '#555', fontSize: '0.8rem', marginTop: 14, letterSpacing: 1 }}>
            تابعونا على منصات التواصل
          </p>
        </div>
      </section>

      {/* WhatsApp Float */}
      <a href="https://wa.me/201000000000" target="_blank" style={{
        position: 'fixed', bottom: 28, left: 28, zIndex: 99,
        background: '#25D366', color: 'white', width: 54, height: 54,
        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(37,211,102,0.4)', textDecoration: 'none'
      }}>
        <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.556 4.112 1.528 5.836L0 24l6.341-1.512A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.898 0-3.673-.516-5.193-1.415l-.373-.22-3.764.897.933-3.654-.243-.386A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
      </a>

      <Footer />
    </>
  );
}