import { Link } from 'react-router-dom';
import { ArrowRight, Settings } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-2xl">
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
          <img 
            src="https://images.unsplash.com/photo-1531390425712-42171fed1ceb?auto=format&fit=crop&q=80&w=2000" 
            alt="Engineering Tools Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/40 z-0"></div>
        
        <div className="relative z-10 p-8 md:p-16 lg:p-24 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Premium Engineering <span className="text-blue-400">Tools & Equipment</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed">
            The premier marketplace for engineering students and professionals. Buy and sell high-quality new and used workshop tools and drafting equipment at the best prices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/shop" className="inline-flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30">
              Browse Marketplace <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/sell" className="inline-flex justify-center items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold py-4 px-8 rounded-xl transition-all">
              Start Selling
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="flex justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
            <Settings className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-900">Quality Assured</h3>
          <p className="text-slate-600 leading-relaxed">
            We ensure all listed tools meet standard engineering requirements. Sellers detail exactly what condition items are in.
          </p>
        </div>
      </section>

      {/* Quick CTA */}
      <section className="bg-blue-50 rounded-3xl p-12 text-center border border-blue-100">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Have tools gathering dust?</h2>
        <p className="text-blue-800 text-lg mb-8 max-w-xl mx-auto">
          Turn your old drafting boards, calipers, and work shop equipment into cash for juniors who need them.
        </p>
        <Link to="/sell" className="inline-flex items-center gap-2 bg-slate-900 text-white font-semibold py-3 px-8 rounded-full hover:bg-slate-800 transition-colors shadow-md">
           Sell Your Equipment
        </Link>
      </section>
    </div>
  );
}
