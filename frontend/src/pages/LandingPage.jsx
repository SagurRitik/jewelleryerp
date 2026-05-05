import React from 'react';
import { Menu, ShoppingBag, User, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    // Using a light cream background to keep the reference's luxurious feel, 
    // but using Nazara's deep plum for text and borders.
    <div className="min-h-screen bg-[#F7F5F0] text-[#55234A] font-serif">
      
      {/* --- NAVBAR --- */}
      <nav className="flex justify-between items-center px-8 py-6">
        <button className="flex items-center gap-2 text-sm tracking-widest uppercase hover:text-[#C4A353] transition-colors">
          <Menu size={20} strokeWidth={1} />
          Menu
        </button>
        <div className="flex gap-4">
          <button className="hover:text-[#C4A353] transition-colors"><ShoppingBag size={20} strokeWidth={1} /></button>
          <button className="hover:text-[#C4A353] transition-colors"><User size={20} strokeWidth={1} /></button>
        </div>
      </nav>

      {/* --- HERO BRANDING --- */}
      <header className="px-8 pb-8 border-b border-[#55234A]/20">
        <h1 className="text-7xl md:text-[9rem] leading-none text-center tracking-tight uppercase">
          Nazara
        </h1>
        <p className="text-center text-sm tracking-[0.3em] uppercase mt-4 text-[#C4A353]">
          Lab Grown Diamonds
        </p>
      </header>

      {/* --- MAIN SPLIT LAYOUT --- */}
      <main className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
        
        {/* LEFT COLUMN: Hero Content & About */}
        <div className="flex flex-col gap-12">
          <div className="relative aspect-[3/4] bg-white rounded-t-full overflow-hidden shadow-sm">
             {/* Replace this div with your hero image (e.g., the hand with diamond rings) */}
             <div className="absolute inset-0 bg-[#E8E2D9] flex items-center justify-center">
                <span className="text-[#55234A]/50 text-sm tracking-widest">Hero Image Placeholder</span>
             </div>
          </div>

          <div>
            <h2 className="text-3xl mb-4">COLLECTION<br/>2025</h2>
            <p className="text-sm font-sans font-light leading-relaxed max-w-sm mb-6 opacity-80">
              Discover exquisite lab-grown jewelry inspired by modern elegance. Each piece is meticulously crafted to bring brilliance and grace to your most cherished occasions.
            </p>
            <button className="bg-[#55234A] text-[#F7F5F0] px-6 py-2 rounded-full text-xs tracking-widest uppercase flex items-center gap-2 hover:bg-[#C4A353] transition-colors">
              Discover <ArrowRight size={14} />
            </button>
          </div>

          <div className="flex flex-col gap-4 border-t border-b border-[#55234A]/20 py-8">
            {['Rings', 'Earrings', 'Necklaces', 'Bracelets'].map((category) => (
              <a key={category} href="#" className="flex justify-between items-center text-sm tracking-widest uppercase hover:text-[#C4A353] transition-colors">
                {category} <ArrowRight size={14} strokeWidth={1} />
              </a>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-8 items-start pt-8">
            <h2 className="text-6xl uppercase tracking-tighter leading-none opacity-20">About<br/>Us</h2>
            <p className="text-xs font-sans font-light leading-relaxed">
              At Nazara, we believe that jewelry is more than just an accessory; it's a timeless expression of elegance. Our lab-grown diamonds represent the pinnacle of sustainable luxury and exceptional craftsmanship.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Categories & Product Grid */}
        <div className="flex flex-col gap-8">
          
          {/* Top Category Images */}
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-[4/5] bg-white">
                <div className="h-full w-full bg-[#E8E2D9] flex items-center justify-center">
                    <span className="text-xs tracking-widest text-[#55234A]/50">Necklaces Image</span>
                </div>
            </div>
            <div className="aspect-[4/5] bg-white">
                <div className="h-full w-full bg-[#E8E2D9] flex items-center justify-center">
                    <span className="text-xs tracking-widest text-[#55234A]/50">Bracelets Image</span>
                </div>
            </div>
          </div>

          <h2 className="text-5xl md:text-7xl uppercase tracking-tighter leading-none my-8">
            Our Most<br/>Loved<br/>Creations
          </h2>

          {/* Product Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-12">
            {[
              { name: 'Eternal Band Ring', price: '₹26,500' },
              { name: 'Spire Chain Necklace', price: '₹104,000' },
              { name: 'Celestial Spark Pendant', price: '₹104,000' },
              { name: 'Pearl Halo Pendant', price: '₹39,800' }
            ].map((product, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="aspect-square bg-white mb-4 overflow-hidden relative">
                   <div className="absolute inset-0 bg-[#E8E2D9] flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                      <span className="text-[10px] tracking-widest text-[#55234A]/50 uppercase">Product Image</span>
                   </div>
                </div>
                <h3 className="text-xs tracking-widest uppercase mb-1">{product.name}</h3>
                <p className="text-[10px] font-sans font-light mb-1 opacity-70">Lab Grown Diamond</p>
                <p className="text-sm">{product.price}</p>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};

export default LandingPage;