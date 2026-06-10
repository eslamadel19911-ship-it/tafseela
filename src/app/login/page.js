'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginContent() {
  const [mode, setMode] = useState('login'); // login | register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    border: '1px solid var(--border, #ddd)',
    fontFamily: 'Cairo, sans-serif', fontSize: '0.9rem',
    boxSizing: 'border-box', borderRadius: 3, outline: 'none',
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // التحقق من تطابق كلمة المرور عند التسجيل
    if (mode === 'register' && password !== confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      setLoading(false);
      return;
    }

    if (mode === 'register' && password.length < 6) {
      setError('كلمة المرور يجب أن تكون ٦ أحرف على الأقل');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // ✅ رجّعه للصفحة اللي كان فيها
      router.push(redirect);
    } catch (err) {
      const msgs = {
        'auth/user-not-found':      'البريد الإلكتروني غير مسجل',
        'auth/wrong-password':      'كلمة المرور غير صحيحة',
        'auth/invalid-credential':  'البريد أو كلمة المرور غير صحيحة',
        'auth/email-already-in-use':'البريد الإلكتروني مسجل بالفعل',
        'auth/invalid-email':       'البريد الإلكتروني غير صحيح',
        'auth/too-many-requests':   'تم تجاوز عدد المحاولات، حاول لاحقاً',
      };
      setError(msgs[err.code] || 'حدث خطأ، يرجى المحاولة مرة أخرى');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#f9f7f4', padding: '20px'
    }}>
      <div style={{
        background: '#fff', padding: 'clamp(32px, 6vw, 48px) clamp(24px, 6vw, 40px)',
        width: '100%', maxWidth: 400,
        boxShadow: '0 2px 20px rgba(0,0,0,0.08)', borderRadius: 4
      }}>

        {/* اللوجو */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src="/logo.png" alt="تفصيلة"
            style={{ height: 48, width: 'auto', objectFit: 'contain', filter: 'invert(1)' }} />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: 28, border: '1px solid var(--border, #ddd)', borderRadius: 4, overflow: 'hidden' }}>
          {[
            { id: 'login', label: 'تسجيل الدخول' },
            { id: 'register', label: 'حساب جديد' },
          ].map(tab => (
            <button key={tab.id} onClick={() => { setMode(tab.id); setError(''); }} style={{
              flex: 1, padding: '11px', border: 'none', cursor: 'pointer',
              fontFamily: 'Cairo, sans-serif', fontSize: '0.88rem', fontWeight: 600,
              background: mode === tab.id ? 'var(--dark, #1a1a1a)' : 'white',
              color: mode === tab.id ? 'white' : '#888',
              transition: 'all 0.2s'
            }}>{tab.label}</button>
          ))}
        </div>

        {/* رسالة Redirect */}
        {redirect !== '/' && (
          <div style={{
            background: '#fef9ec', border: '1px solid #fde68a',
            color: '#92400e', padding: '10px 14px', borderRadius: 4,
            fontSize: '0.82rem', marginBottom: 16, textAlign: 'center'
          }}>
            🔒 سجّل دخولك لإتمام الطلب
          </div>
        )}

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

          {/* البريد */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.88rem' }}>
              البريد الإلكتروني
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              required placeholder="example@email.com"
              style={{ ...inputStyle, direction: 'ltr', textAlign: 'right' }} />
          </div>

          {/* كلمة المرور */}
          <div style={{ marginBottom: mode === 'register' ? 16 : 24 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.88rem' }}>
              كلمة المرور
            </label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)} required
                placeholder={mode === 'register' ? '٦ أحرف على الأقل' : ''}
                style={{ ...inputStyle, paddingLeft: 44 }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: '1rem'
              }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* تأكيد كلمة المرور — عند التسجيل فقط */}
          {mode === 'register' && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.88rem' }}>
                تأكيد كلمة المرور
              </label>
              <input type={showPass ? 'text' : 'password'} value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)} required
                style={inputStyle} />
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem', opacity: loading ? 0.7 : 1, borderRadius: 3 }}>
            {loading
              ? 'جاري التحميل...'
              : mode === 'login' ? 'دخول' : 'إنشاء حساب'
            }
          </button>
        </form>

        {/* رابط نسيت كلمة المرور */}
        {mode === 'login' && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <a href="/forgot-password" style={{ color: '#aaa', fontSize: '0.82rem', textDecoration: 'none' }}>
              نسيت كلمة المرور؟
            </a>
          </div>
        )}

        {/* رابط العودة */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a href="/" style={{ color: '#aaa', fontSize: '0.82rem', textDecoration: 'none' }}>
            ← العودة للرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}

// ✅ Suspense مطلوب عشان useSearchParams
export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>جاري التحميل...</div>}>
      <LoginContent />
    </Suspense>
  );
}