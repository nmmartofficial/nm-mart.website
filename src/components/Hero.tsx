const Hero = () => {
  return (
    <div className="bg-[#0ea5e9] py-20 px-6 text-center border-b-8 border-[#fbbf24] relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
        <div className="bg-[#f59e0b] text-[#0f172a] px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest mb-6 border-2 border-white/20 shadow-lg">
            Grand Savings — Up to 40% Off
        </div>
        
        <h2 className="text-6xl font-black text-white mb-6 leading-[1.05] tracking-tighter italic uppercase drop-shadow-lg">
          Your Trusted <br/> 
          <span className="text-[#fbbf24]">Neighbourhood</span> Store
        </h2>
        
        <p className="text-white/90 font-bold text-sm leading-relaxed mb-10 max-w-sm uppercase tracking-tight">
          Quality daily essentials at unbeatable prices. Serving Manjhanpur with pride.
        </p>

        <button className="bg-[#f59e0b] text-[#0f172a] px-12 py-5 rounded-2xl font-black text-xs uppercase shadow-2xl active:scale-95 transition-all border-b-4 border-white/40">
          Shop Now
        </button>
      </div>
    </div>
  );
};

export default Hero;
