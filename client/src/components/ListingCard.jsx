import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FALLBACK =
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80';

function avgRating(reviews) {
  if (!reviews?.length) return null;
  const sum = reviews.reduce((a, r) => a + (r.rating || 0), 0);
  return (sum / reviews.length).toFixed(1);
}

export default function ListingCard({ listing, index = 0 }) {
  const rating = avgRating(listing.reviews);
  const imgUrl = listing.image?.url || FALLBACK;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/listings/${listing._id}`} style={{ display: 'block' }}>
        <div className="listing-card">
          <div className="listing-card__img-wrap">
            <img
              className="listing-card__img"
              src={imgUrl}
              alt={listing.title}
              loading="lazy"
              onError={(e) => { e.target.src = FALLBACK; }}
            />
            {listing.category && (
              <span className="listing-card__badge">{listing.category}</span>
            )}
            <button className="listing-card__fav" onClick={(e) => e.preventDefault()}>
              🤍
            </button>
          </div>
          <div className="listing-card__body">
            <div className="listing-card__top">
              <span className="listing-card__location">{listing.location}</span>
              {rating && (
                <span className="listing-card__rating">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  {rating}
                </span>
              )}
            </div>
            <div className="listing-card__country">{listing.country}</div>
            <div className="listing-card__price">
              <strong>₹{listing.price?.toLocaleString('en-IN')}</strong> / night
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
