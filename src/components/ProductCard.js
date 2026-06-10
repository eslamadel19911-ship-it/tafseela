'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [error, setError] = useState('');

  const hasSale =
    product.onSale &&
    product.salePrice &&
    Number(product.salePrice) < Number(product.price);

  const discountPercent = hasSale
    ? Math.round(((Number(product.price) - Number(product.salePrice)) / Number(product.price)) * 100)
    : null;

  const displayPrice = hasSale ? Number(product.salePrice) : Number(product.price);

  const getImageForColor = (color) => {
    if (product.colorImages && color && product.colorImages[color]) {
      return product.colorImages[color];
    }

    return product.images?.[0] || null;
  };

  const currentImage = getImageForColor(selectedColor) || product.images?.[0];

  const handleAddClick = (e) => {
    e.preventDefault();
    setSelectedSize('');
    setSelectedColor('');
    setError('');
    setShowModal(true);
  };

  const handleConfirm = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      setError('يرجى اختيار المقاس');
      return;
    }

    if (product.colors?.length > 0 && !selectedColor) {
      setError('يرجى اختيار اللون');
      return;
    }

    addItem(
      {
        ...product,
        price: displayPrice,
        originalPrice: product.price,
        salePrice: hasSale ? product.salePrice : null,
        onSale: hasSale,
      },
      selectedSize,
      selectedColor
    );

    setShowModal(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <Link
        href={`/products/${product.id}`}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background: 'white',
            transition: 'transform 0.3s',
            transform: hovered ? 'translateY(-4px)' : 'none',
            boxShadow: hovered ? '0 8px 30px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          <div
            style={{
              position: 'relative',
              paddingBottom: '130%',
              overflow: 'hidden',
              background: '#f5f5f5',
            }}
          >
            {currentImage ? (
              <img
                src={currentImage}
                alt={product.name}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.5s',
                  transform: hovered ? 'scale(1.05)' : 'scale(1)',
                }}
              />
            ) : (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ccc',
                  fontSize: '0.8rem',
                }}
              >
                لا توجد صورة
              </div>
            )}

            {hasSale && (
              <span
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  background: '#ef4444',
                  color: 'white',
                  padding: '4px 10px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  borderRadius: 20,
                  zIndex: 2,
                }}
              >
                خصم {discountPercent}%
              </span>
            )}

            {product.badge && (
              <span
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: 'var(--gold)',
                  color: 'white',
                  padding: '4px 10px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  borderRadius: 20,
                }}
              >
                {product.badge}
              </span>
            )}
          </div>

          <div style={{ padding: '16px 12px' }}>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--gray)',
                marginBottom: 4,
              }}
            >
              {product.category}
            </p>

            <h3
              style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              {product.name}
            </h3>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div>
                {hasSale ? (
                  <>
                    <div
                      style={{
                        textDecoration: 'line-through',
                        color: '#999',
                        fontSize: '0.75rem',
                        marginBottom: 2,
                      }}
                    >
                      {Number(product.price).toLocaleString()} جنيه
                    </div>

                    <div
                      style={{
                        fontWeight: 800,
                        color: '#ef4444',
                        fontSize: '1rem',
                      }}
                    >
                      {Number(product.salePrice).toLocaleString()} جنيه
                    </div>
                  </>
                ) : (
                  <span
                    style={{
                      fontWeight: 700,
                      color: 'var(--dark)',
                    }}
                  >
                    {Number(product.price).toLocaleString()} جنيه
                  </span>
                )}
              </div>

              <button
                onClick={handleAddClick}
                className="btn-primary"
                style={{
                  padding: '6px 16px',
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap',
                }}
              >
                {added ? '✓ تمت الإضافة' : 'أضف للسلة'}
              </button>
            </div>
          </div>
        </div>
      </Link>

      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 8,
              padding: 28,
              width: '100%',
              maxWidth: 420,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>
                {product.name}
              </h3>

              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                }}
              >
                ✕
              </button>
            </div>

            {currentImage && (
              <img
                src={currentImage}
                alt={product.name}
                style={{
                  width: '100%',
                  height: 200,
                  objectFit: 'cover',
                  borderRadius: 6,
                  marginBottom: 16,
                  transition: 'all 0.3s',
                }}
              />
            )}

            <div style={{ marginBottom: 18 }}>
              {hasSale ? (
                <div>
                  <span
                    style={{
                      textDecoration: 'line-through',
                      color: '#999',
                      fontSize: '0.85rem',
                      marginLeft: 8,
                    }}
                  >
                    {Number(product.price).toLocaleString()} جنيه
                  </span>

                  <span
                    style={{
                      color: '#ef4444',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                    }}
                  >
                    {Number(product.salePrice).toLocaleString()} جنيه
                  </span>
                </div>
              ) : (
                <strong style={{ fontSize: '1rem' }}>
                  {Number(product.price).toLocaleString()} جنيه
                </strong>
              )}
            </div>

            {product.colors?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    marginBottom: 10,
                  }}
                >
                  اللون:{' '}
                  <span
                    style={{
                      color: 'var(--gold)',
                      fontWeight: 700,
                    }}
                  >
                    {selectedColor || 'اختر لوناً'}
                  </span>
                </p>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      style={{
                        padding: '8px 16px',
                        border:
                          selectedColor === color
                            ? '2px solid var(--dark)'
                            : '1px solid var(--border)',
                        background:
                          selectedColor === color ? 'var(--dark)' : 'white',
                        color:
                          selectedColor === color ? 'white' : 'var(--dark)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        borderRadius: 4,
                        fontFamily: 'Cairo, sans-serif',
                        transition: 'all 0.2s',
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    marginBottom: 10,
                  }}
                >
                  المقاس:{' '}
                  <span
                    style={{
                      color: 'var(--gold)',
                      fontWeight: 700,
                    }}
                  >
                    {selectedSize || 'اختر مقاساً'}
                  </span>
                </p>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      style={{
                        width: 44,
                        height: 44,
                        border:
                          selectedSize === size
                            ? '2px solid var(--dark)'
                            : '1px solid var(--border)',
                        background:
                          selectedSize === size ? 'var(--dark)' : 'white',
                        color:
                          selectedSize === size ? 'white' : 'var(--dark)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        borderRadius: 4,
                        fontFamily: 'Cairo, sans-serif',
                        transition: 'all 0.2s',
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p
                style={{
                  color: 'red',
                  fontSize: '0.85rem',
                  marginBottom: 12,
                }}
              >
                {error}
              </p>
            )}

            <button
              onClick={handleConfirm}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '0.95rem',
              }}
            >
              إضافة للسلة
            </button>
          </div>
        </div>
      )}
    </>
  );
}