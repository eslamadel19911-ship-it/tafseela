export default function Footer() {
  return (
    <footer style={{
      background: 'var(--dark)', color: 'white',
      padding: '60px 20px 30px'
    }}>
      <div className="container">
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 40, marginBottom: 48
        }}>
          <div>
            <img
              src="/logo.png"
              alt="تفصيلة"
              style={{
                height: 200,
                width: 'auto',
                objectFit: 'contain',
                marginBottom: 5,
        
              }}
            />
          </div>
          <div>
            <h4 style={{ marginBottom: 16, fontSize: '0.9rem', letterSpacing: 1 }}>روابط سريعة</h4>
            {[['/', 'الرئيسية'], ['/products', 'المنتجات'], ['/about', 'من نحن'], ['/contact', 'تواصل معنا']].map(([href, label]) => (
              <div key={href} style={{ marginBottom: 10 }}>
                <a href={href} style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.85rem' }}>{label}</a>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ marginBottom: 16, fontSize: '0.9rem', letterSpacing: 1 }}>سياسات المتجر</h4>
            {['سياسة الإرجاع', 'الشحن والتوصيل', 'الخصوصية', 'الشروط والأحكام'].map((label) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <a href="#" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.85rem' }}>{label}</a>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ marginBottom: 16, fontSize: '0.9rem', letterSpacing: 1 }}>تواصل معنا</h4>
            <a href="https://wa.me/201000000000" target="_blank"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#25D366', color: 'white', padding: '10px 20px',
                borderRadius: 4, textDecoration: 'none', fontSize: '0.85rem'
              }}>
              واتساب
            </a>
          </div>
        </div>
        <div style={{
          borderTop: '1px solid #333', paddingTop: 24,
          textAlign: 'center', color: '#555', fontSize: '0.8rem'
        }}>
          © 2026 تفصيلة — جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  );
}