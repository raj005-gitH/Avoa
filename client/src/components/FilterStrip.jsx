import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { icon: '🏖️', label: 'Beach' },
  { icon: '🏔️', label: 'Mountains' },
  { icon: '🏙️', label: 'City' },
  { icon: '🌊', label: 'Lakefront' },
  { icon: '🌿', label: 'Countryside' },
  { icon: '🏰', label: 'Castles' },
  { icon: '🔥', label: 'Trending' },
  { icon: '✨', label: 'Luxury' },
  { icon: '🏕️', label: 'Camping' },
  { icon: '🏡', label: 'Cabins' },
];

export default function FilterStrip({ filters, onChange }) {
  const [showPrice, setShowPrice] = useState(false);

  const setCategory = (cat) => {
    onChange({ ...filters, category: filters.category === cat ? '' : cat });
  };

  return (
    <div style={{ borderBottom: '1px solid var(--gray-100)' }}>
      <div className="filter-strip">
        {CATEGORIES.map((c) => (
          <button
            key={c.label}
            className={`filter-chip${filters.category === c.label ? ' active' : ''}`}
            onClick={() => setCategory(c.label)}
          >
            <span>{c.icon}</span>
            <span>{c.label}</span>
          </button>
        ))}

        {/* Price filter toggle */}
        <div className="price-toggle" style={{ marginLeft: 'auto', flexShrink: 0, padding: '0 8px' }}>
          <button
            onClick={() => setShowPrice((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 'var(--radius-pill)',
              border: '1.5px solid var(--gray-300)', fontSize: '0.85rem',
              fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)',
              background: showPrice ? 'var(--gray-900)' : 'white',
              color: showPrice ? 'white' : 'var(--gray-700)',
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
            </svg>
            Filters
          </button>
        </div>
      </div>

      {/* Expandable price range filter */}
      <AnimatePresence>
        {showPrice && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '16px 24px', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end',
              background: 'var(--gray-100)',
            }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>
                  Min Price (₹/night)
                </label>
                <input
                  type="number" min="0" placeholder="0"
                  value={filters.minPrice || ''}
                  onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
                  style={{ padding: '8px 12px', border: '1.5px solid var(--gray-300)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', width: 140 }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>
                  Max Price (₹/night)
                </label>
                <input
                  type="number" min="0" placeholder="Any"
                  value={filters.maxPrice || ''}
                  onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
                  style={{ padding: '8px 12px', border: '1.5px solid var(--gray-300)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', width: 140 }}
                />
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onChange({ ...filters, minPrice: '', maxPrice: '', category: '' })}
              >
                Clear all
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
