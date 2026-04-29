import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export interface Product {
  id: string;
  name: string;
  description: string;
  condition: 'New' | 'Used';
  category: 'Workshop Tools' | 'Drawing Equipment';
  actualPrice: number;
  sellingPrice: number;
  image: string;
}

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCondition, setFilterCondition] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest'); // newest, priceAsc, priceDesc
  const { addToCart } = useCart();

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch products", err);
        setLoading(false);
      });
  }, []);

  const filteredProducts = products
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(p => filterCondition === 'All' || p.condition === filterCondition)
    .filter(p => filterCategory === 'All' || p.category === filterCategory)
    .sort((a, b) => {
      if (sortOrder === 'priceAsc') return a.sellingPrice - b.sellingPrice;
      if (sortOrder === 'priceDesc') return b.sellingPrice - a.sellingPrice;
      return 0; // Default: assuming newest represents order in DB for now
    });

  if (loading) return <div className="text-center py-20 text-slate-500">Loading shop...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><Filter className="w-5 h-5"/> Filters</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Find tools..."
                  className="w-full pl-9 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select 
                value={filterCategory} 
                onChange={e => setFilterCategory(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Categories</option>
                <option value="Workshop Tools">Workshop Tools</option>
                <option value="Drawing Equipment">Drawing Equipment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Condition</label>
              <select 
                value={filterCondition} 
                onChange={e => setFilterCondition(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">Any Condition</option>
                <option value="New">New</option>
                <option value="Used">Used</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sort By Price</label>
              <select 
                value={sortOrder} 
                onChange={e => setSortOrder(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Featured</option>
                <option value="priceAsc">Low to High</option>
                <option value="priceDesc">High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-6">Equipment & Tools</h2>
        
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed">
            <p className="text-slate-500 text-lg">No products found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                <Link to={`/product/${product.id}`} className="block relative aspect-square bg-slate-100 overflow-hidden">
                  <img 
                    src={product.image || 'https://images.unsplash.com/photo-1542013898-7a561dc3b5ba?q=80&w=600&auto=format&fit=crop'} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full shadow-sm ${product.condition === 'New' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {product.condition}
                    </span>
                  </div>
                </Link>
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">{product.category}</span>
                  <Link to={`/product/${product.id}`} className="block hover:text-blue-600 transition-colors">
                    <h3 className="font-semibold text-lg line-clamp-1 mb-2">{product.name}</h3>
                  </Link>
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                    <div>
                      <p className="text-xl font-bold text-slate-900">₹{product.sellingPrice}</p>
                      {product.actualPrice > product.sellingPrice && (
                         <p className="text-xs text-slate-400 line-through">₹{product.actualPrice}</p>
                      )}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(product);
                      }}
                      className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors"
                      title="Add to Cart"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
