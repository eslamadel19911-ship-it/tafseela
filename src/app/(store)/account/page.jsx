'use client';

import { useEffect, useState } from 'react';
import { doc, updateDoc, arrayUnion, setDoc, getDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'القليوبية',
  'الإسكندرية', 'الدقهلية', 'الشرقية', 'المنوفية', 'الغربية',
  'كفر الشيخ', 'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس',
  'شمال سيناء', 'جنوب سيناء', 'الفيوم', 'بني سويف', 'المنيا',
  'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان',
  'البحر الأحمر', 'الوادي الجديد', 'مطروح',
];

export default function AccountPage() {
  const { user, userData } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  const [address, setAddress] = useState({
    label: '',
    phone: '',
    city: '',
    area: '',
    street: '',
    details: '',
  });

  useEffect(() => {
    if (userData) {
      setProfile({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
      });
    }
  }, [userData]);

  if (!user) {
    router.push('/login?redirect=/account');
    return null;
  }

  const addresses = userData?.addresses || [];

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid var(--border)',
    borderRadius: 4,
    fontFamily: 'Cairo, sans-serif',
    fontSize: '0.9rem',
    boxSizing: 'border-box',
  };

  const handleAddress = (e) => {
    setAddress((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const saveProfile = async (e) => {
    e.preventDefault();

    const fullName = `${profile.firstName.trim()} ${profile.lastName.trim()}`.trim();
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    const data = {
      uid: user.uid,
      firstName: profile.firstName.trim(),
      lastName: profile.lastName.trim(),
      fullName,
      phone: profile.phone.trim(),
      email: user.email,
      photoURL: user.photoURL || '',
      updatedAt: new Date(),
    };

    if (snap.exists()) {
      await updateDoc(userRef, data);
    } else {
      await setDoc(userRef, {
        ...data,
        addresses: [],
        provider: user.providerData?.[0]?.providerId || 'email',
        createdAt: new Date(),
      });
    }

    await updateProfile(user, {
      displayName: fullName,
    });

    alert('تم تحديث بياناتك');
    window.location.reload();
  };

  const addAddress = async (e) => {
    e.preventDefault();

    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        fullName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
        phone: profile.phone || '',
        email: user.email,
        addresses: [],
        createdAt: new Date(),
      });
    }

    const newAddress = {
      id: Date.now().toString(),
      label: address.label.trim(),
      phone: address.phone.trim(),
      city: address.city,
      area: address.area.trim(),
      street: address.street.trim(),
      details: address.details.trim(),
    };

    await updateDoc(userRef, {
      addresses: arrayUnion(newAddress),
    });

    alert('تم حفظ العنوان');

    setAddress({
      label: '',
      phone: '',
      city: '',
      area: '',
      street: '',
      details: '',
    });

    window.location.reload();
  };

  return (
    <>
      <Navbar />

      <div className="container" style={{ padding: '40px 16px', maxWidth: 900 }}>
        <h1 className="section-title" style={{ marginBottom: 30 }}>
          حسابي
        </h1>

        <div
          style={{
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: 24,
            marginBottom: 28,
          }}
        >
          <h3 style={{ marginBottom: 20 }}>معلومات العميل</h3>

          <p>
            <strong>الاسم:</strong>{' '}
            {userData?.fullName || user.displayName || 'غير مضاف'}
          </p>

          <p>
            <strong>البريد الإلكتروني:</strong> {user.email}
          </p>

          <p>
            <strong>رقم الجوال:</strong>{' '}
            {userData?.phone || 'غير مضاف'}
          </p>
        </div>

        <div
          style={{
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: 24,
            marginBottom: 28,
          }}
        >
          <h3 style={{ marginBottom: 20 }}>تعديل بياناتي</h3>

          <form onSubmit={saveProfile}>
            <div className="account-grid">
              <input
                value={profile.firstName}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, firstName: e.target.value }))
                }
                placeholder="الاسم الأول"
                required
                style={inputStyle}
              />

              <input
                value={profile.lastName}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, lastName: e.target.value }))
                }
                placeholder="الاسم الأخير"
                required
                style={inputStyle}
              />

              <input
                value={profile.phone}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="رقم الجوال"
                required
                style={inputStyle}
              />

              <input
                value={user.email}
                disabled
                style={{
                  ...inputStyle,
                  background: '#f5f5f5',
                  color: '#888',
                }}
              />
            </div>

            <button
              className="btn-primary"
              style={{ marginTop: 18, padding: '12px 28px' }}
            >
              حفظ البيانات
            </button>
          </form>
        </div>

        <div
          style={{
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: 24,
            marginBottom: 28,
          }}
        >
          <h3 style={{ marginBottom: 20 }}>العناوين المحفوظة</h3>

          {addresses.length === 0 ? (
            <p style={{ color: '#888' }}>لا توجد عناوين محفوظة بعد</p>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              {addresses.map((a) => (
                <div
                  key={a.id}
                  style={{
                    border: '1px solid #eee',
                    borderRadius: 8,
                    padding: 16,
                    background: '#f9f7f4',
                  }}
                >
                  <strong>{a.label}</strong>
                  <p style={{ margin: '8px 0' }}>
                    {a.city} - {a.area}
                  </p>
                  <p style={{ margin: '8px 0' }}>{a.street}</p>
                  <p style={{ margin: '8px 0', color: '#777' }}>
                    {a.details}
                  </p>
                  <p style={{ margin: 0 }}>📞 {a.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: 24,
          }}
        >
          <h3 style={{ marginBottom: 20 }}>إضافة عنوان جديد</h3>

          <form onSubmit={addAddress}>
            <div className="account-grid">
              <input
                name="label"
                value={address.label}
                onChange={handleAddress}
                required
                placeholder="اسم العنوان: المنزل / العمل"
                style={inputStyle}
              />

              <input
                name="phone"
                value={address.phone}
                onChange={handleAddress}
                required
                placeholder="رقم الجوال"
                style={inputStyle}
              />

              <select
                name="city"
                value={address.city}
                onChange={handleAddress}
                required
                style={inputStyle}
              >
                <option value="">اختر المحافظة</option>
                {GOVERNORATES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>

              <input
                name="area"
                value={address.area}
                onChange={handleAddress}
                required
                placeholder="المنطقة / الحي"
                style={inputStyle}
              />

              <input
                name="street"
                value={address.street}
                onChange={handleAddress}
                required
                placeholder="الشارع / رقم المبنى"
                style={inputStyle}
              />

              <input
                name="details"
                value={address.details}
                onChange={handleAddress}
                placeholder="الدور / الشقة / علامة مميزة"
                style={inputStyle}
              />
            </div>

            <button
              className="btn-primary"
              style={{ marginTop: 18, padding: '12px 28px' }}
            >
              حفظ العنوان
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .account-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        @media (max-width: 768px) {
          .account-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <Footer />
    </>
  );
}