import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, User, LogOut, Wrench, PackagePlus, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavLinks = () => (
    <>
      <Link to="/shop" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Shop</Link>
      <Link to="/help" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Help & Support</Link>
      {user ? (
        <>
          <Link to="/sell" className="text-slate-600 hover:text-blue-600 font-medium flex items-center gap-1 transition-colors">
            <PackagePlus className="w-4 h-4" /> Sell
          </Link>
          <Link to="/dashboard" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Dashboard</Link>
          <button onClick={handleLogout} className="text-red-500 hover:text-red-700 font-medium flex items-center gap-1 transition-colors text-left">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </>
      ) : (
        <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
          <User className="w-4 h-4" /> Login
        </Link>
      )}
    </>
  );

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">EngiTools</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLinks />
            <Link to="/cart" className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-blue-600 rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-4">
             <Link to="/cart" className="relative p-2 text-slate-600 hover:text-blue-600">
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-blue-600 rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 hover:text-blue-600 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t py-4 px-4 flex flex-col space-y-4 shadow-lg top-16 absolute w-full left-0 z-40">
          <NavLinks />
        </div>
      )}
    </nav>
  );
}
