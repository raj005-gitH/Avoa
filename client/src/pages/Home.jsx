import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getListings } from '../api';
import ListingCard from '../components/ListingCard';
import FilterStrip from '../components/FilterStrip';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [heroQuery, setHeroQuery] = useState('');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  });

  // Build API params from state
  const apiParams = {
    ...(query && { q: query }),
    ...(filters.category && { category: filters.category }),
    ...(filters.minPrice && { minPrice: filters.minPrice }),
    ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['listings', apiParams],
    queryFn: () => getListings(apiParams).then((r) => r.data),
    staleTime: 30_000,
  });

  const handleHeroSearch = (e) => {
    e.preventDefault();
    setQuery(heroQuery);
  };

  return (
    <>
      <Navbar onSearch={setQuery} />

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero__blob hero__blob-1" />
        <div className="hero__blob hero__blob-2" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <div className="hero__eyebrow">
            ✈️ &nbsp;Discover unique stays around the world
          </div>
          <h1>
            Find your perfect <span>getaway</span>
          </h1>
          <p>
            From cozy cabins to beachfront villas — explore thousands of unique stays handpicked for every traveller.
          </p>

          <form className="hero__search" onSubmit={handleHeroSearch}>
            <div className="hero__search-field">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <input
                placeholder="Where are you going?"
                value={heroQuery}
                onChange={(e) => setHeroQuery(e.target.value)}
              />
            </div>
            <button type="submit">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              Search
            </button>
          </form>

          <div className="hero__stats">
            <div className="hero__stat">
              <strong>{data?.count || '1,000'}+</strong>
              <span>UNIQUE STAYS</span>
            </div>
            <div className="hero__stat">
              <strong>50+</strong>
              <span>COUNTRIES</span>
            </div>
            <div className="hero__stat">
              <strong>4.9★</strong>
              <span>AVG RATING</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Filters ── */}
      <FilterStrip filters={filters} onChange={setFilters} />

      {/* ── Listings Grid ── */}
      <section className="listings-section">
        {/* Active search indicator */}
        {(query || filters.category || filters.minPrice || filters.maxPrice) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}
          >
            <span style={{ fontSize: '0.9rem', color: 'var(--gray-700)' }}>
              {isLoading ? 'Searching...' : `${data?.count ?? 0} result${data?.count !== 1 ? 's' : ''}`}
              {query && <> for "<strong>{query}</strong>"</>}
            </span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setQuery(''); setHeroQuery(''); setFilters({ category: '', minPrice: '', maxPrice: '' }); }}
            >
              ✕ Clear
            </button>
          </motion.div>
        )}

        {isLoading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : isError ? (
          <div className="no-results">
            <div className="icon">⚠️</div>
            <h3>Something went wrong</h3>
            <p>Couldn't load listings. Please try again.</p>
          </div>
        ) : data?.listings?.length === 0 ? (
          <div className="no-results">
            <div className="icon">🔍</div>
            <h3>No stays found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="listings-grid">
            {data?.listings?.map((listing, i) => (
              <ListingCard key={listing._id} listing={listing} index={i} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}
