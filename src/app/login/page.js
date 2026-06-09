'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f7f4' }}>
      <div style={{ background: '#fff', padding: '48px 40px', width: '100%', maxWidth: 400, boxShadow: '0 2px 20px rgba(0,0,0,0.08)' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 700, marginBottom: 32, fontSize: '1.5rem' }}>تسجيل الدخول</h2>

        {error && (
          <div style={{ background: '#fff3f3', color: '#c0392b', padding: '12px 16px', marginBottom: 20, fontSize: '0.85rem', borderRadius: 4 }}>
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>البريد الإلكتروني</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border)', fontFamily: 'Cairo, sans-serif', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>كلمة المرور</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border)', fontFamily: 'Cairo, sans-serif', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  );
}