import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Cart() {
  const { items, removeFromCart, total, itemCount } = useCart();
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    toast.error('Payment processing is temporarily unavailable.');
    // navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
        <p className="text-slate-500 mb-8">Looks like you haven't added any equipment to your cart yet.</p>
        <Link to="/shop" className="inline-flex py-3 px-8 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Toaster />
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <ul className="divide-y divide-slate-100">
              {items.map((item) => (
                <li key={item.product.id} className="p-6 flex gap-6">
                  <div className="w-24 h-24 bg-slate-50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                    <img 
                      src={item.product.image || 'https://images.unsplash.com/photo-1542013898-7a561dc3b5ba?q=80'} 
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link to={`/product/${item.product.id}`}>
                          <h3 className="text-lg font-semibold text-slate-900 hover:text-blue-600 transition tracking-tight">
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-slate-500 mt-1">{item.product.category} • {item.product.condition}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-slate-900">₹{item.product.sellingPrice}</p>
                        <p className="text-xs text-slate-500 mt-1">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="mt-auto pt-4 flex justify-between items-center">
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-medium text-slate-900">₹{total}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-medium text-emerald-600">Free Campus Delivery</span>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-base font-bold text-slate-900">Total</span>
                <span className="text-2xl font-black text-blue-600">₹{total}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckoutClick}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition shadow-lg"
            >
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
