import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getListing, createReview, deleteReview, createOrder, verifyPayment } from '../api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import MapView from '../components/MapView';
import Footer from '../components/Footer';

const FALLBACK = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80';

function Stars({ rating, size = 16 }) {
  return (
    <span style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24"
          fill={n <= rating ? '#FF385C' : 'none'}
          stroke={n <= rating ? '#FF385C' : '#d0d0d0'} strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [nights, setNights] = useState(1);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => getListing(id).then((r) => r.data),
  });

  const reviewMutation = useMutation({
    mutationFn: () => createReview(id, { review: { rating: reviewRating, comment: reviewComment } }),
    onSuccess: () => {
      toast.success('Review posted!');
      setReviewRating(0);
      setReviewComment('');
      queryClient.invalidateQueries(['listing', id]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to post review'),
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId) => deleteReview(id, reviewId),
    onSuccess: () => {
      toast.success('Review deleted');
      queryClient.invalidateQueries(['listing', id]);
    },
  });

  const handleBook = async () => {
    if (!user) return navigate('/login');
    setPaymentLoading(true);

    try {
      const { data: orderData } = await createOrder({ listingId: id, nights });

      // If Razorpay keys are not yet configured in .env, seamlessly use the sandbox demo simulator
      if (orderData.isMock) {
        const simResponse = {
          razorpay_order_id: orderData.order.id,
          razorpay_payment_id: `pay_demo_${Date.now()}`,
          razorpay_signature: 'demo_signature',
          listingId: id,
          nights,
        };
        const { data: verifyData } = await verifyPayment(simResponse);
        setConfirmedBooking(verifyData.booking);
        toast.success('🎉 Booking confirmed! (Sandbox Demo Mode)');
        return;
      }

      // Live / Test Mode: Load checkout.js and open Razorpay modal
      const ok = await loadRazorpay();
      if (!ok) {
        toast.error('Could not load payment gateway');
        return;
      }

      const options = {
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Avoa',
        description: `${data?.listing?.title || 'Stay reservation'} — ${nights} night${nights > 1 ? 's' : ''}`,
        order_id: orderData.order.id,
        handler: async (response) => {
          try {
            const { data: verifyData } = await verifyPayment({
              ...response,
              listingId: id,
              nights,
            });
            setConfirmedBooking(verifyData.booking);
            toast.success('🎉 Booking confirmed! Payment successful.');
          } catch {
            toast.error('Payment verification failed');
          }
        },
        prefill: { name: user.username, email: user.email },
        theme: { color: '#FF385C' },
      };
      new window.Razorpay(options).open();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Booking failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (isLoading) return (
    <>
      <Navbar />
      <div className="page-content spinner-wrap"><div className="spinner" /></div>
    </>
  );

  if (isError || !data?.listing) return (
    <>
      <Navbar />
      <div className="page-content" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <h2>Listing not found</h2>
        <Link to="/" className="btn btn-primary mt-4">Back to home</Link>
      </div>
    </>
  );

  const listing = data.listing;
  const avgRating = listing.reviews?.length
    ? (listing.reviews.reduce((a, r) => a + r.rating, 0) / listing.reviews.length).toFixed(1)
    : null;
  const isOwner = user && (listing.owner?._id === user.id || listing.owner?._id === user._id);
  const totalPrice = listing.price * nights;

  return (
    <>
      <Navbar />
      <div className="page-content">
        <motion.div
          className="detail-page"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="detail-header">
            <h1>{listing.title}</h1>
            <div className="detail-meta">
              {avgRating && (
                <>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                    <Stars rating={Math.round(avgRating)} size={14} />
                    {avgRating} ({listing.reviews.length} reviews)
                  </span>
                  <span className="sep">·</span>
                </>
              )}
              <span>{listing.location}, {listing.country}</span>
              {isOwner && (
                <>
                  <span className="sep">·</span>
                  <Link to={`/listings/${id}/edit`} className="btn btn-secondary btn-sm">Edit listing</Link>
                </>
              )}
            </div>
          </div>

          {/* Hero image */}
          <img
            className="detail-hero-img"
            src={listing.image?.url || FALLBACK}
            alt={listing.title}
            onError={(e) => { e.target.src = FALLBACK; }}
          />

          {/* Body grid */}
          <div className="detail-body">
            {/* Left: info */}
            <div>
              {/* Owner */}
              <div className="detail-owner">
                <div className="detail-owner__avatar">
                  {listing.owner?.username?.[0]?.toUpperCase() || 'H'}
                </div>
                <div>
                  <h4>Hosted by {listing.owner?.username || 'Avoa Host'}</h4>
                  <span>Member of Avoa</span>
                </div>
              </div>

              {/* Description */}
              <p className="detail-desc">{listing.description}</p>

              {/* Map */}
              {listing.geometry && (
                <div className="detail-map">
                  <h3>📍 Where you'll be</h3>
                  <MapView geometry={listing.geometry} title={listing.title} />
                </div>
              )}

              {/* Reviews */}
              <div className="reviews-section">
                <h3>
                  {avgRating && <><Stars rating={Math.round(avgRating)} /> &nbsp;{avgRating} · </>}
                  {listing.reviews?.length || 0} Review{listing.reviews?.length !== 1 ? 's' : ''}
                </h3>

                {listing.reviews?.length > 0 ? (
                  <div className="reviews-list">
                    {listing.reviews.map((rev) => (
                      <motion.div
                        key={rev._id}
                        className="review-card"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="review-card__top">
                          <div className="review-card__avatar">
                            {rev.author?.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="review-card__meta">
                            <h5>{rev.author?.username || 'Guest'}</h5>
                            <span>{new Date(rev.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                          </div>
                          <div className="review-card__stars">
                            <Stars rating={rev.rating} size={13} />
                          </div>
                        </div>
                        <p className="review-card__comment">{rev.comment}</p>
                        {user && (rev.author?._id === user.id || rev.author?._id === user._id) && (
                          <button
                            className="review-card__delete"
                            onClick={() => deleteReviewMutation.mutate(rev._id)}
                          >
                            Delete review
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--gray-500)', marginBottom: 24 }}>No reviews yet. Be the first!</p>
                )}

                {/* Add review form */}
                {user ? (
                  <form
                    className="review-form"
                    onSubmit={(e) => { e.preventDefault(); reviewMutation.mutate(); }}
                  >
                    <h4>Leave a Review</h4>
                    <div className="star-picker">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span
                          key={n}
                          onClick={() => setReviewRating(n)}
                          onMouseEnter={() => setHoverRating(n)}
                          onMouseLeave={() => setHoverRating(0)}
                          style={{ fontSize: '1.8rem', cursor: 'pointer', transition: 'transform .15s' }}
                        >
                          {n <= (hoverRating || reviewRating) ? '⭐' : '☆'}
                        </span>
                      ))}
                    </div>
                    <div className="form-group">
                      <textarea
                        className="form-control"
                        placeholder="Share your experience..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        required
                      />
                    </div>
                    <button
                      className="btn btn-primary"
                      type="submit"
                      disabled={!reviewRating || reviewMutation.isPending}
                    >
                      {reviewMutation.isPending ? 'Posting...' : 'Post Review'}
                    </button>
                  </form>
                ) : (
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>
                    <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 600 }}>Log in</Link> to leave a review.
                  </p>
                )}
              </div>
            </div>

            {/* Right: booking sidebar */}
            <div className="detail-sidebar">
              <div className="booking-card">
                <div className="booking-card__price">
                  <strong>₹{listing.price?.toLocaleString('en-IN')}</strong>
                  <span> / night</span>
                </div>
                <div className="form-group">
                  <label className="form-group label" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>
                    Number of nights
                  </label>
                  <input
                    className="nights-input"
                    type="number" min="1" max="30"
                    value={nights}
                    onChange={(e) => setNights(Math.max(1, Number(e.target.value)))}
                  />
                </div>
                <button
                  className="btn btn-primary w-full btn-lg"
                  onClick={handleBook}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? 'Loading...' : 'Reserve'}
                </button>
                <div className="booking-summary">
                  <div className="row">
                    <span>₹{listing.price?.toLocaleString('en-IN')} × {nights} night{nights > 1 ? 's' : ''}</span>
                    <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="row">
                    <span>Avoa service fee</span>
                    <span>₹{Math.round(totalPrice * 0.12).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="row total">
                    <span>Total</span>
                    <span>₹{Math.round(totalPrice * 1.12).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                {!user && (
                  <p style={{ marginTop: 12, fontSize: '0.82rem', color: 'var(--gray-500)', textAlign: 'center' }}>
                    <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 600 }}>Log in</Link> to book this stay
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Booking Confirmation Modal ── */}
        {confirmedBooking && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(5px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                maxWidth: 480,
                width: '100%',
                padding: '32px 28px',
                boxShadow: 'var(--shadow-lg)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: '#E6F9F5',
                  color: '#00A699',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  margin: '0 auto 16px',
                }}
              >
                ✓
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>
                Reservation Confirmed!
              </h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.92rem', marginBottom: 20 }}>
                Your payment was verified and your stay has been reserved.
              </p>

              <div
                style={{
                  background: 'var(--gray-100)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontSize: '0.88rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  marginBottom: 24,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Stay</span>
                  <strong style={{ maxWidth: 220, textAlign: 'right' }}>{listing.title}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Duration</span>
                  <strong>{confirmedBooking.nights} night{confirmedBooking.nights > 1 ? 's' : ''}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Total Paid</span>
                  <strong style={{ color: 'var(--brand)', fontSize: '1.05rem' }}>
                    ₹{confirmedBooking.totalAmount?.toLocaleString('en-IN')}
                  </strong>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid #e5e5e5', margin: '4px 0' }} />
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', wordBreak: 'break-all' }}>
                  <div><strong>Payment ID:</strong> {confirmedBooking.razorpayPaymentId}</div>
                  <div><strong>Order ID:</strong> {confirmedBooking.razorpayOrderId}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <Link
                  to="/my-bookings"
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1 }}
                >
                  View My Bookings
                </Link>
                <button
                  type="button"
                  className="btn btn-secondary btn-lg"
                  onClick={() => setConfirmedBooking(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}
