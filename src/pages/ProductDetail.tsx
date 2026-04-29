import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, Star, ShieldCheck, Tag } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user, token } = useAuth();
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${id}`).then(res => res.json()),
      fetch(`/api/products/${id}/reviews`).then(res => res.json())
    ])
    .then(([productData, reviewData]) => {
      if (!productData || productData.error) {
        setProduct(null);
      } else {
        setProduct(productData);
      }
      setReviews(reviewData || []);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: id, rating, reviewText })
      });
      if (res.ok) {
        const newReview = await res.json();
        setReviews([...reviews, newReview]);
        setReviewText('');
        setRating(5);
        toast.success('Review added successfully');
      }
    } catch(err) {
      toast.error('Failed to post review');
    }
  };

  if (loading) return <div className="text-center py-20">Loading product...</div>;
  if (!product) return <div className="text-center py-20 text-red-500">Product not found</div>;

  const averageRatingStr = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";
  const averageRating = parseFloat(averageRatingStr);

  return (
    <div className="max-w-6xl mx-auto">
      <Toaster />
      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 mb-12">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Product Image */}
          <div className="w-full md:w-1/2">
            <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden mb-4">
              <img 
                src={product.image || 'https://images.unsplash.com/photo-1542013898-7a561dc3b5ba?q=80&w=800&auto=format&fit=crop'} 
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply p-4"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="w-full md:w-1/2 flex flex-col pt-4">
            <div className="flex gap-2 mb-4">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${product.condition === 'New' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {product.condition}
              </span>
              <span className="px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-full shadow-sm flex items-center gap-1">
                <Tag className="w-3 h-3" /> {product.category}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-amber-400">
                {Array.from({length: 5}).map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < averageRating ? 'fill-current' : 'text-slate-200'}`} />
                ))}
              </div>
              <span className="text-slate-600 font-medium">({reviews.length} reviews)</span>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-blue-600">₹{product.sellingPrice}</span>
                {product.actualPrice > product.sellingPrice && (
                  <span className="text-lg text-slate-400 line-through">₹{product.actualPrice}</span>
                )}
              </div>
              {product.actualPrice > product.sellingPrice && (
                <p className="text-emerald-600 text-sm font-medium mt-1">
                  You save ₹{product.actualPrice - product.sellingPrice} ({Math.round(((product.actualPrice - product.sellingPrice) / product.actualPrice) * 100)}%)
                </p>
              )}
            </div>

            <p className="text-slate-600 leading-relaxed mb-8 whitespace-pre-line flex-1">
              {product.description}
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-4 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <span className="font-medium text-sm">Secure transactions & genuine verified listings matching Barasat standards.</span>
              </div>
            </div>

            <button 
              onClick={() => {
                addToCart(product);
                toast.success('Added to cart!');
              }}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-6 h-6" /> Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>
        
        {/* Write a Review */}
        {user ? (
          <form onSubmit={handleReviewSubmit} className="mb-12 bg-slate-50 p-6 rounded-2xl">
            <h3 className="font-semibold text-lg mb-4">Write a Review</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(num => (
                  <button 
                    type="button" 
                    key={num} 
                    onClick={() => setRating(num)}
                    className={`p-1 rounded-md transition ${rating >= num ? 'text-amber-400' : 'text-slate-300'}`}
                  >
                    <Star className="w-8 h-8 fill-current" />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Review</label>
              <textarea 
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                required
                rows={4}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="What did you like or dislike about this product?"
              ></textarea>
            </div>
            <button type="submit" className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition">
              Submit Review
            </button>
          </form>
        ) : (
          <div className="mb-12 bg-slate-50 p-6 rounded-2xl flex items-center justify-between">
            <p className="text-slate-600">Please log in to write a review.</p>
            <button onClick={() => window.location.href='/login'} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm">Login</button>
          </div>
        )}

        {/* Display Reviews */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map(review => (
              <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-semibold text-slate-900">{review.userName}</span>
                    <div className="flex items-center mt-1">
                       {Array.from({length: 5}).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-700 mt-3">{review.reviewText}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
