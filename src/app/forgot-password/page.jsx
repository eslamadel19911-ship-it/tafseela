'use client';
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      const msgs = {
        'auth/user-not-found':  'البريد الإلكتروني غير مسجل',
        'auth/invalid-email':   'البريد الإلكتروني غير صحيح',
        'auth/too-many-requests': 'تم تجاوز عدد المحاولات، حاول لاحقاً',
      };
      setError(msgs[err.code] || 'حدث خطأ، يرجى المحاولة مرة أخرى');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    border: '1px solid var(--border, #ddd)',
    fontFamily: 'Cairo, sans-serif', fontSize: '0.9rem',
    boxSizing: 'border-box', borderRadius: 3,
    direction: 'ltr', textAlign: 'right',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#f9f7f4', padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        padding: 'clamp(32px, 6vw, 48px) clamp(24px, 6vw, 40px)',
        width: '100%', maxWidth: 400,
        boxShadow: '0 2px 20px rgba(0,0,0,0.08)', borderRadius: 4
      }}>

        {/* اللوجو */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src="/logo.png" alt="تفصيلة"
            style={{ height: 48, width: 'auto', objectFit: 'contain', filter: 'invert(1)' }} />
        </div>

        {/* ✅ شاشة النجاح */}
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>📧</div>
            <h2 style={{ fontWeight: 700, marginBottom: 12, fontSize: '1.2rem' }}>
              تم إرسال الرابط!
            </h2>
            <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: 8 }}>
              تم إرسال رابط إعادة تعيين كلمة المرور إلى:
            </p>
            <p style={{ fontWeight: 700, color: 'var(--dark, #1a1a1a)', marginBottom: 24, direction: 'ltr' }}>
              {email}
            </p>
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: 4, padding: '12px 16px',
              fontSize: '0.82rem', color: '#166534', marginBottom: 28, lineHeight: 1.7
            }}>
              ✅ تحقق من صندوق الوارد أو مجلد الـ Spam
            </div>

            <button onClick={() => { setSent(false); setEmail(''); }}
              style={{
                width: '100%', padding: '12px', marginBottom: 12,
                border: '1px solid var(--border, #ddd)', background: 'white',
                fontFamily: 'Cairo, sans-serif', fontSize: '0.9rem',
                cursor: 'pointer', borderRadius: 3, color: '#555'
              }}>
              إرسال مرة أخرى
            </button>

            <Link href="/login" style={{
              display: 'block', textAlign: 'center',
              color: 'var(--dark, #1a1a1a)', fontSize: '0.9rem',
              textDecoration: 'none', fontWeight: 600
            }}>
              ← العودة لتسجيل الدخول
            </Link>
          </div>

        ) : (
          <>
            <h2 style={{ textAlign: 'center', fontWeight: 700, marginBottom: 8, fontSize: '1.2rem' }}>
              نسيت كلمة المرور؟
            </h2>
            <p style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem', marginBottom: 28, lineHeight: 1.7 }}>
              أدخل بريدك الإلكتروني وهنبعتلك رابط لإعادة تعيين كلمة المرور
            </p>

            {/* رسالة الخطأ */}
            {error && (
              <div style={{
                background: '#fff3f3', color: '#c0392b',
                padding: '12px 16px', marginBottom: 16,
                fontSize: '0.85rem', borderRadius: 4
              }}>
                ❌ {error}
              </div>
            )}

            <form onSubmit={submit}>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.88rem' }}>
                  البريد الإلكتروني
                </label>
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  required placeholder="example@email.com"
                  style={inputStyle}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1rem', opacity: loading ? 0.7 : 1, borderRadius: 3 }}>
                {loading ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Link href="/login" style={{ color: '#aaa', fontSize: '0.82rem', textDecoration: 'none' }}>
                ← العودة لتسجيل الدخول
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}