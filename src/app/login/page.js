'use client';

import { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginContent() {
  const [mode, setMode] = useState('login');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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
    width: '100%',
    padding: '12px 16px',
    border: '1px solid var(--border, #ddd)',
    fontFamily: 'Cairo, sans-serif',
    fontSize: '0.9rem',
    boxSizing: 'border-box',
    borderRadius: 3,
    outline: 'none',
  };

  const saveUserData = async (firebaseUser, data = {}) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: firebaseUser.uid,
        firstName: data.firstName || firebaseUser.displayName?.split(' ')[0] || '',
        lastName: data.lastName || firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
        fullName:
          data.fullName ||
          firebaseUser.displayName ||
          `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL || '',
        provider: data.provider || 'email',
        createdAt: new Date(),
      });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (mode === 'register') {
      if (!firstName.trim() || !lastName.trim()) {
        setError('من فضلك أدخل الاسم الأول والاسم الأخير');
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('كلمة المرور غير متطابقة');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('كلمة المرور يجب أن تكون ٦ أحرف على الأقل');
        setLoading(false);
        return;
      }
    }

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        const fullName = `${firstName.trim()} ${lastName.trim()}`;

        await updateProfile(userCredential.user, {
          displayName: fullName,
        });

        await saveUserData(userCredential.user, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          fullName,
          provider: 'email',
        });
      }

      router.push(redirect);
    } catch (err) {
      const msgs = {
        'auth/user-not-found': 'البريد الإلكتروني غير مسجل',
        'auth/wrong-password': 'كلمة المرور غير صحيحة',
        'auth/invalid-credential': 'البريد أو كلمة المرور غير صحيحة',
        'auth/email-already-in-use': 'البريد الإلكتروني مسجل بالفعل',
        'auth/invalid-email': 'البريد الإلكتروني غير صحيح',
        'auth/too-many-requests': 'تم تجاوز عدد المحاولات، حاول لاحقاً',
        'auth/popup-closed-by-user': 'تم إغلاق نافذة جوجل قبل إتمام التسجيل',
      };

      setError(msgs[err.code] || 'حدث خطأ، يرجى المحاولة مرة أخرى');
    }

    setLoading(false);
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      await saveUserData(result.user, {
        provider: 'google',
      });

      router.push(redirect);
    } catch (err) {
      const msgs = {
        'auth/popup-closed-by-user': 'تم إغلاق نافذة جوجل قبل إتمام التسجيل',
        'auth/cancelled-popup-request': 'تم إلغاء طلب تسجيل الدخول',
        'auth/account-exists-with-different-credential': 'هذا البريد مسجل بطريقة دخول مختلفة',
      };

      setError(msgs[err.code] || 'حدث خطأ أثناء تسجيل الدخول بجوجل');
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9f7f4',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: 'clamp(32px, 6vw, 48px) clamp(24px, 6vw, 40px)',
          width: '100%',
          maxWidth: 430,
          boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
          borderRadius: 4,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img
            src="/logo.png"
            alt="تفصيلة"
            style={{
              height: 48,
              width: 'auto',
              objectFit: 'contain',
              filter: 'invert(1)',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            marginBottom: 28,
            border: '1px solid var(--border, #ddd)',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          {[
            { id: 'login', label: 'تسجيل الدخول' },
            { id: 'register', label: 'حساب جديد' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setMode(tab.id);
                setError('');
              }}
              style={{
                flex: 1,
                padding: '11px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Cairo, sans-serif',
                fontSize: '0.88rem',
                fontWeight: 600,
                background: mode === tab.id ? 'var(--dark, #1a1a1a)' : 'white',
                color: mode === tab.id ? 'white' : '#888',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {redirect !== '/' && (
          <div
            style={{
              background: '#fef9ec',
              border: '1px solid #fde68a',
              color: '#92400e',
              padding: '10px 14px',
              borderRadius: 4,
              fontSize: '0.82rem',
              marginBottom: 16,
              textAlign: 'center',
            }}
          >
            🔒 سجّل دخولك لإتمام الطلب
          </div>
        )}

        {error && (
          <div
            style={{
              background: '#fff3f3',
              color: '#c0392b',
              padding: '12px 16px',
              marginBottom: 16,
              fontSize: '0.85rem',
              borderRadius: 4,
            }}
          >
            ❌ {error}
          </div>
        )}

        <form onSubmit={submit}>
          {mode === 'register' && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.88rem' }}>
                  الاسم الأول
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required={mode === 'register'}
                  style={inputStyle}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.88rem' }}>
                  الاسم الأخير
                </label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required={mode === 'register'}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.88rem' }}>
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@email.com"
              style={{ ...inputStyle, direction: 'ltr', textAlign: 'right' }}
            />
          </div>

          <div style={{ marginBottom: mode === 'register' ? 16 : 24 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.88rem' }}>
              كلمة المرور
            </label>

            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={mode === 'register' ? '٦ أحرف على الأقل' : ''}
                style={{ ...inputStyle, paddingLeft: 44 }}
              />

              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#aaa',
                  fontSize: '1rem',
                }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.88rem' }}>
                تأكيد كلمة المرور
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={mode === 'register'}
                style={inputStyle}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '1rem',
              opacity: loading ? 0.7 : 1,
              borderRadius: 3,
            }}
          >
            {loading ? 'جاري التحميل...' : mode === 'login' ? 'دخول' : 'إنشاء حساب'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#eee' }} />
          <span style={{ fontSize: '0.78rem', color: '#aaa' }}>أو</span>
          <div style={{ flex: 1, height: 1, background: '#eee' }} />
        </div>

        <button
          type="button"
          onClick={loginWithGoogle}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: 4,
            cursor: 'pointer',
            fontFamily: 'Cairo, sans-serif',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            opacity: loading ? 0.7 : 1,
          }}
        >
          <span style={{ fontWeight: 700, color: '#4285F4' }}>G</span>
          المتابعة باستخدام Google
        </button>

        {mode === 'login' && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <a href="/forgot-password" style={{ color: '#aaa', fontSize: '0.82rem', textDecoration: 'none' }}>
              نسيت كلمة المرور؟
            </a>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a href="/" style={{ color: '#aaa', fontSize: '0.82rem', textDecoration: 'none' }}>
            ← العودة للرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          جاري التحميل...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}