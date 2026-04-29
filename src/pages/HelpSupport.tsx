import { MapPin, Mail, Phone, LifeBuoy } from 'lucide-react';
import { useState } from 'react';

export default function HelpSupport() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Support Request from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    window.location.href = `mailto:ayandana687@gmail.com?subject=${subject}&body=${body}`;
    setName('');
    setEmail('');
    setMessage('');
  };

  const faqs = [
    {
      q: "How do I list an item for sale?",
      a: "Simply log in to your account, click on the 'Sell' tab in the navigation menu, and fill out the equipment details including high-quality images and specific conditions."
    },
    {
      q: "Can I return a used tool if it's damaged?",
      a: "Since this is a peer-to-peer marketplace, returns are governed by the seller. We recommend thoroughly checking the item details and directly communicating before purchase if you want to inspect locally."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8">
      
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">How can we help?</h1>
        <p className="text-lg text-slate-600 max-w-xl mx-auto">
          Need support with an order or have questions about listing? Our support team is here to assist you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        {/* Contact Info */}
        <div className="bg-slate-900 text-white p-8 md:p-10 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -m-8 opacity-10">
            <LifeBuoy className="w-64 h-64" />
          </div>
          
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">Contact Information</h2>
          
          <div className="space-y-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="bg-white/10 p-3 rounded-full shrink-0">
                <MapPin className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-lg mb-1">Office Address</p>
                <p className="text-slate-300 leading-relaxed">
                  EngiTools Head Market<br />
                  Barasat, North 24 Parganas<br />
                  West Bengal, India
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="bg-white/10 p-3 rounded-full shrink-0">
                <Mail className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-lg mb-1">Email Us</p>
                <a href="mailto:ayandana687@gmail.com" className="text-slate-300 hover:text-white transition">ayandana687@gmail.com</a>
              </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="bg-white/10 p-3 rounded-full shrink-0">
                <Phone className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-lg mb-1">Call Us</p>
                <a href="tel:+918000000000" className="text-slate-300 hover:text-white transition">+91 800-000-0000</a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100">
           <h2 className="text-2xl font-bold mb-6 text-slate-900">Send us a message</h2>
           <form className="space-y-5" onSubmit={handleContactSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea required rows={4} value={message} onChange={e => setMessage(e.target.value)} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
                Submit Message
              </button>
           </form>
        </div>
      </div>

      {/* FAQs */}
      <h2 className="text-3xl font-bold text-center mb-10 text-slate-900">Frequently Asked Questions</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-lg text-slate-900 mb-3">{faq.q}</h3>
            <p className="text-slate-600 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
      
    </div>
  );
}
