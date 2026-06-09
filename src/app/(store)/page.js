'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useEffect, useState } from 'react';
import { collection, query, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import Link from 'next/link';

function HomeContent() {
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
      <Navbar />

      {/* Hero */}
      <section style={{
        height: '90vh',
        background: 'var(--dark)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: 'white', padding: '0 20px' }}>
          <img
            src="/logo.png"
            alt="tafseela"
            style={{ height: 750, width: 'auto', objectFit: 'contain', marginBottom: -250 }}
          />
          <p style={{ fontSize: '2.1rem', color: '#aaa', marginBottom: 40, letterSpacing: 1 }}>
            {'بتحكي عنك'}
          </p>
          <Link href="/products">
            <button className="btn-outline" style={{ color: 'white', borderColor: 'white', padding: '12px 40px' }}>
              {'تسوق الآن'}
            </button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ padding: '80px 20px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="section-title">{'المنتجات المميزة'}</h2>
            <p className="section-subtitle">{'اكتشف أحدث تشكيلات تفصيلة'}</p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 24
          }}>
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link href="/products">
              <button className="btn-outline">{'عرض كل المنتجات'}</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section style={{ background: 'var(--dark)', color: 'white', padding: '100px 20px' }}>
        <div className="container" style={{ maxWidth: 700, textAlign: 'center', margin: '0 auto' }}>
          <div style={{ width: 40, height: 2, background: 'var(--gold)', margin: '0 auto 32px' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 24 }}>{'قصتنا'}</h2>
          <p style={{ color: '#aaa', lineHeight: 2, fontSize: '1rem', marginBottom: 16 }}>
            {'تفصيلة بدأت من فكرة بسيطة: إن كل شخص له أسلوبه، ذوقه، وتفاصيله الخاصة.'}
          </p>
          <p style={{ color: '#aaa', lineHeight: 2, fontSize: '1rem', marginBottom: 16 }}>
            {'نحن لا نصمم ملابس فقط، بل نصنع قطعا تعبر عنك، عن هدوئك، عن اختياراتك، وعن الطريقة التي تحب ان تظهر بها للعالم.'}
          </p>
          <p style={{ color: '#aaa', lineHeight: 2, fontSize: '1rem', marginBottom: 16 }}>
            {'في تفصيلة، نهتم بكل شيء: الخامة، القصة، اللون، التيكت، والتغليف. لاننا نؤمن ان الجمال الحقيقي لا يكون في الشكل فقط، بل في كل تفصيلة صغيرة تكمل الحكاية.'}
          </p>
          <p style={{ fontWeight: 700, color: 'var(--gold)', marginTop: 24, fontSize: '1.1rem' }}>
            {'تفصيلة.. بتحكي عنك'}
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
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.556 4.112 1.528 5.836L0 24l6.341-1.512A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.898 0-3.673-.516-5.193-1.415l-.373-.22-3.764.897.933-3.654-.243-.386A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        </svg>
      </a>

      <Footer />
    </>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <CartProvider>
        <HomeContent />
      </CartProvider>
    </AuthProvider>
  );
}