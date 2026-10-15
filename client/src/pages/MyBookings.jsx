import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMyBookings } from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const FALLBACK = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80';

export default function MyBookings() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => getMyBookings().then((r) => r.data),
  });

  const bookings = data?.bookings || [];

  return (
    <>
      <Navbar />
      <div className="page-content" style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 24px', minHeight: '80vh' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div style={{ marginBottom: 32, marginTop: 80 }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--gray-900)' }}>
              My Bookings & Receipts
            </h1>
            <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>
              Track your confirmed reservations, dates, and Razorpay payment details.
            </p>
          </div>

          {isLoading ? (
            <div className="spinner-wrap" style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner" />
            </div>
          ) : isError ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--gray-100)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ color: 'var(--brand)', fontWeight: 600 }}>Could not load your bookings.</p>
              <Link to="/" className="btn btn-secondary mt-4">Return Home</Link>
            </div>
          ) : bookings.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 24px',
              border: '2px dashed var(--gray-300)',
              borderRadius: 'var(--radius-lg)',
              background: '#fafafa'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏖️</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>No bookings yet</h3>
              <p style={{ color: 'var(--gray-500)', maxWidth: 400, margin: '0 auto 24px' }}>
                You haven't reserved any stays yet. Explore our curated collection of extraordinary villas, cabins, and retreats!
              </p>
              <Link to="/" className="btn btn-primary btn-lg">Explore Stays</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {bookings.map((b, idx) => {
                const listing = b.listing;
                const formattedDate = new Date(b.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <motion.div
                    key={b._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    style={{
                      background: 'white',
                      border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 'var(--radius-md)',
                      padding: 24,
                      boxShadow: 'var(--shadow-sm)',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                      gap: 24,
                      alignItems: 'center',
                    }}
                  >
                    {/* Left: Image & Listing title */}
                    <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                      <img
                        src={listing?.image?.url || FALLBACK}
                        alt={listing?.title || 'Listing'}
                        style={{
                          width: 110,
                          height: 90,
                          borderRadius: 'var(--radius-sm)',
                          objectFit: 'cover',
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <span style={{
                          display: 'inline-block',
                          background: '#E6F9F5',
                          color: '#008477',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-pill)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: 6,
                        }}>
                          {b.status}
                        </span>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.3 }}>
                          {listing ? (
                            <Link to={`/listings/${listing._id}`} style={{ color: 'inherit' }}>
                              {listing.title}
                            </Link>
                          ) : (
                            'Stay details unavailable'
                          )}
                        </h3>
                        <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem', marginTop: 4 }}>
                          📍 {listing?.location}, {listing?.country}
                        </p>
                      </div>
                    </div>

                    {/* Middle: Nights & Booking Details */}
                    <div style={{ fontSize: '0.88rem', borderLeft: '1px solid var(--gray-100)', paddingLeft: 18 }}>
                      <div style={{ marginBottom: 4, color: 'var(--gray-700)' }}>
                        <strong>Duration:</strong> {b.nights} night{b.nights > 1 ? 's' : ''}
                      </div>
                      <div style={{ marginBottom: 4, color: 'var(--gray-700)' }}>
                        <strong>Booked on:</strong> {formattedDate}
                      </div>
                      {listing?.owner?.username && (
                        <div style={{ color: 'var(--gray-500)', fontSize: '0.82rem' }}>
                          Host: {listing.owner.username} ({listing.owner.email})
                        </div>
                      )}
                    </div>

                    {/* Right: Payment Breakdown & Transaction IDs */}
                    <div style={{
                      background: '#F9FAFB',
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      fontSize: '0.85rem',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--gray-500)' }}>Total Paid:</span>
                        <strong style={{ fontSize: '1.15rem', color: 'var(--gray-900)' }}>
                          ₹{b.totalAmount?.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', wordBreak: 'break-all' }}>
                        <div><strong>Order ID:</strong> {b.razorpayOrderId}</div>
                        <div><strong>Payment ID:</strong> {b.razorpayPaymentId}</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
