const Hero = () => {
  return (
    <div className="bg-gradient-to-b from-[#0f172a] to-[#1e293b] py-16 px-6 text-center border-b border-slate-800">
      <div className="max-w-4xl mx-auto">
        <div className="inline-block bg-blue-900/50 text-blue-400 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-800">
            Grand Savings — Up to 40% Off
        </div>
        
        <h2 className="text-5xl font-black text-white mb-4 italic tracking-tighter">
          Your Trusted <br/> 
          <span className="text-amber-500 underline decoration-blue-500">Neighbourhood</span> Store
        </h2>
        
        <p className="text-slate-400 font-medium text-sm mb-8 max-w-sm mx-auto uppercase">
          Quality daily essentials at unbeatable prices.
        </p>

        <button className="bg-amber-500 text-[#0f172a] px-10 py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-amber-400 transition-all active:scale-95">
          Start Shopping
        </button>
      </div>
    </div>
  );
};

export default Hero;
