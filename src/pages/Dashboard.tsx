import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Package, Tag, ShoppingBag, Clock, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

export default function Dashboard() {
  const { token, user } = useAuth();
  const [data, setData] = useState({ orders: [], products: [] as any[] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // orders, products

  useEffect(() => {
    fetch('/api/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(d => {
      setData(d);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [token]);

  const handleDeleteProduct = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setData(prev => ({
          ...prev,
          products: prev.products.filter(p => p.id !== productId)
        }));
        toast.success('Listing deleted successfully');
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to delete listing');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  if (loading) return <div className="text-center py-20">Loading dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Toaster />
      {/* Header Profile */}
      <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight">Welcome, {user?.name}</h1>
          <p className="text-slate-400">{user?.email}</p>
        </div>
        <div className="hidden sm:flex gap-4">
          <div className="bg-slate-800 p-4 rounded-xl text-center min-w-24">
            <p className="text-sm text-slate-400 font-medium mb-1">Purchases</p>
            <p className="text-2xl font-black text-blue-400">{data.orders.length}</p>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl text-center min-w-24">
            <p className="text-sm text-slate-400 font-medium mb-1">Listings</p>
            <p className="text-2xl font-black text-emerald-400">{data.products.length}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`pb-4 px-4 font-semibold text-lg transition-colors flex items-center gap-2 ${activeTab === 'orders' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <ShoppingBag className="w-5 h-5"/> Order History
        </button>
        <button 
          onClick={() => setActiveTab('products')}
          className={`pb-4 px-4 font-semibold text-lg transition-colors flex items-center gap-2 ${activeTab === 'products' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Tag className="w-5 h-5"/> My Listings
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        
        {activeTab === 'orders' && (
          <div>
            {data.orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">You haven't placed any orders yet.</p>
                <Link to="/shop" className="text-blue-600 font-semibold inline-block mt-4">Browse Marketplace</Link>
              </div>
            ) : (
              <div className="space-y-6">
                {data.orders.map((order: any) => (
                  <div key={order.id} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Order placed</p>
                        <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                         <p className="text-sm text-slate-500 mb-1">Total</p>
                         <p className="font-bold text-blue-600">₹{order.totalAmount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Order ID</p>
                        <p className="font-mono text-sm">{order.id}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4"/> {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-white space-y-4">
                      {order.items.map((item: any) => (
                        <div key={item.product.id} className="flex gap-4">
                          <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                             <img src={item.product.image || 'https://via.placeholder.com/150'} alt={item.product.name} className="w-full h-full object-cover"/>
                          </div>
                          <div className="flex-1">
                            <Link to={`/product/${item.product.id}`} className="font-medium text-slate-900 hover:text-blue-600">{item.product.name}</Link>
                            <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            {data.products.length === 0 ? (
               <div className="text-center py-12">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">You haven't listed any equipment for sale.</p>
                <Link to="/sell" className="text-blue-600 font-semibold inline-block mt-4">Create your first listing</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {data.products.map((product: any) => (
                  <div key={product.id} className="flex gap-6 p-4 border border-slate-200 rounded-xl items-center hover:bg-slate-50 transition">
                    <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                      <img src={product.image || 'https://via.placeholder.com/150'} alt={product.name} className="w-full h-full object-cover"/>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-sm text-slate-500">{product.condition} • {product.category}</p>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Listed on {new Date(product.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                       <p className="text-xl font-bold text-slate-900">₹{product.sellingPrice}</p>
                       <div className="flex items-center gap-4 mt-2">
                         <Link to={`/product/${product.id}`} className="text-sm text-blue-600 font-medium hover:underline inline-block">View Live</Link>
                         <button 
                           onClick={() => handleDeleteProduct(product.id)}
                           className="text-sm text-red-500 font-medium hover:underline inline-flex items-center gap-1"
                         >
                           <Trash2 className="w-4 h-4"/> Delete
                         </button>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// Simple internal check icon alias since I forgot to import it at the top
const CheckCircle2 = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
)
