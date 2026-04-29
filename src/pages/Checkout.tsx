import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, Truck, CheckCircle2, QrCode } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: '',
    mobile: '',
    address: '📍 Barasat, North 24 Parganas\n',
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/shop');
    }
  }, [items.length, navigate]);

  if (items.length === 0) {
    return null;
  }

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: total
        })
      });

      const orderData = await res.json();
      
      if (!res.ok) {
        toast.error(orderData.error || 'Failed to create order');
        setLoading(false);
        return;
      }

      const resScript = await loadRazorpayScript();
      if (!resScript) {
        toast.error('Failed to load Razorpay SDK');
        setLoading(false);
        return;
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'EngiTools',
        description: 'Payment for Engineering Equipment',
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderDetails: {
                  items,
                  deliveryDetails: deliveryInfo,
                  totalAmount: total
                }
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              clearCart();
              setStep(3);
            } else {
              toast.error('Payment verification failed');
            }
          } catch (err) {
            toast.error('Error verifying payment');
          }
        },
        prefill: {
          name: deliveryInfo.name,
          contact: deliveryInfo.mobile,
        },
        theme: {
          color: '#2563eb'
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (err) {
      toast.error('An error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Toaster />
      
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-200 -z-10 translate-y-[-50%]"></div>
        <div className={`h-1 bg-blue-600 absolute left-0 top-1/2 -z-10 translate-y-[-50%] transition-all duration-500`} style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
        
        <div className={`flex flex-col items-center bg-slate-50 px-2 ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${step >= 1 ? 'bg-blue-600 text-white font-bold shadow-lg' : 'bg-slate-200 text-slate-500'}`}>1</div>
          <span className="text-xs font-semibold uppercase tracking-wider">Delivery</span>
        </div>
        <div className={`flex flex-col items-center bg-slate-50 px-2 ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${step >= 2 ? 'bg-blue-600 text-white font-bold shadow-lg' : 'bg-slate-200 text-slate-500'}`}>2</div>
          <span className="text-xs font-semibold uppercase tracking-wider">Payment</span>
        </div>
        <div className={`flex flex-col items-center bg-slate-50 px-2 ${step >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${step >= 3 ? 'bg-blue-600 text-white font-bold shadow-lg' : 'bg-slate-200 text-slate-500'}`}>3</div>
          <span className="text-xs font-semibold uppercase tracking-wider">Finish</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
        
        {step === 1 && (
          <div className="flex flex-col md:flex-row gap-12">
            <div className="flex-1">
              <h2 className="text-2xl font-bold flex items-center gap-3 mb-6"><Truck className="text-blue-600"/> Delivery Details</h2>
              <form onSubmit={handleDeliverySubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={deliveryInfo.name}
                    onChange={e => setDeliveryInfo({...deliveryInfo, name: e.target.value})}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Recipient's Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
                  <input 
                    type="tel" 
                    required
                    value={deliveryInfo.mobile}
                    onChange={e => setDeliveryInfo({...deliveryInfo, mobile: e.target.value})}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="10-digit Mobile Number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Detailed Address</label>
                  <textarea 
                    required
                    rows={4}
                    value={deliveryInfo.address}
                    onChange={e => setDeliveryInfo({...deliveryInfo, address: e.target.value})}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="Enter full address..."
                  ></textarea>
                </div>
                <button type="submit" className="w-full py-4 mt-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition">
                  Proceed to Payment
                </button>
              </form>
            </div>
            
            {/* Quick Order summary snippet */}
            <div className="w-full md:w-72 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4">Order Total</h3>
              <div className="flex justify-between items-center text-xl font-black text-blue-600 mb-6">
                <span>Total Amount:</span>
                <span>₹{total}</span>
              </div>
              <p className="text-slate-500 text-sm">Pay easily via UPI in the next step.</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="text-center max-w-md mx-auto">
             <h2 className="text-2xl font-bold flex items-center justify-center gap-3 mb-2"><CreditCard className="text-blue-600"/> Razorpay Secure Checkout</h2>
             <p className="text-slate-500 mb-8">Pay securely via UPI, Credit/Debit Cards, or Netbanking for <strong className="text-slate-900">₹{total}</strong></p>

             <div className="p-4 bg-blue-50 text-blue-700 rounded-xl text-sm mb-8 font-medium">
               Clicking below will open the Razorpay payment gateway popup. You can use your preferred UPI app directly.
             </div>

             <button 
                onClick={handleConfirmPayment}
                disabled={loading}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 text-lg flex items-center justify-center"
              >
                {loading ? 'Initializing Razorpay...' : 'Pay Now with Razorpay'}
              </button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Order Successful!</h2>
            <p className="text-lg text-slate-600 max-w-md mx-auto mb-10">
              Your payment was received. The seller has been notified to prepare your items.
            </p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => navigate('/dashboard')} className="px-8 py-3 bg-slate-900 text-white font-medium rounded-full hover:bg-slate-800 transition">
                View Orders
              </button>
              <button onClick={() => navigate('/shop')} className="px-8 py-3 border-2 border-slate-200 text-slate-700 font-medium rounded-full hover:border-slate-300 transition">
                Continue Shopping
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
