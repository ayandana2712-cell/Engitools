import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PackagePlus, ImagePlus } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function SellProduct() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    condition: 'Used',
    category: 'Workshop Tools',
    actualPrice: '',
    sellingPrice: '',
    image: ''
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        toast.success('Product listed successfully!');
        navigate('/dashboard');
      } else {
        toast.error('Failed to list product');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Toaster />
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
            <PackagePlus className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">List an Item for Sale</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. T-Square, Vernier Caliper"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description & Details</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Describe the condition, usage, brand, and specifications..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="Workshop Tools">Workshop Tools</option>
                <option value="Drawing Equipment">Drawing Equipment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Condition</label>
              <select 
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="New">New</option>
                <option value="Used">Used</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Original Price (₹)</label>
              <input 
                type="number" 
                name="actualPrice"
                value={formData.actualPrice}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Actual MRP"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price (₹)</label>
              <input 
                type="number" 
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Your Price"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Image</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl relative hover:bg-slate-50 transition">
                <div className="space-y-1 text-center">
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" className="mx-auto h-32 object-cover rounded-md" />
                  ) : (
                    <ImagePlus className="mx-auto h-12 w-12 text-slate-400" />
                  )}
                  <div className="flex text-sm text-slate-600 justify-center">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-2 py-1">
                      <span>Upload a file</span>
                      <input name="image" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                    </label>
                  </div>
                  <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 mt-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Publishing Listing...' : 'List Product For Sale'}
          </button>
        </form>
      </div>
    </div>
  );
}
