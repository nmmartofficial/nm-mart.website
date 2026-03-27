import React from 'react';

const Welfare = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 bg-gradient-to-b from-[#f0f9ff] to-[#e0f2fe] min-h-[500px]">
      
      {/* Title */}
      <h2 className="text-3xl font-black text-[#1e293b] italic uppercase tracking-tighter mb-10">
        NM <span className="text-[#0ea5e9]">MART</span> CLUB
      </h2>

      {/* Glass Card Container */}
      <div className="w-full max-w-sm relative group">
        {/* Glow Background */}
        <div className="absolute -inset-1 bg-sky-400 rounded-[2.5rem] blur opacity-20"></div>
        
        {/* Main Card Body */}
        <div className="relative bg-white/60 backdrop-blur-xl border border-white/80 p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-8">
          
          <div className="text-center">
             <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1">
               Member Login
             </h3>
             <div className="h-1 w-12 bg-[#0ea5e9] mx-auto rounded-full opacity-50"></div>
          </div>
          
          {/* Input Field */}
          <div className="w-full">
            <input 
              type="text" 
              placeholder="91XXXXXXXXX" 
              className="w-full py-5 px-4 bg-white/50 border-2 border-slate-100 rounded-2xl text-center text-xl font-bold text-[#0369a1] tracking-widest outline-none focus:border-[#0ea5e9] transition-all shadow-inner"
            />
          </div>

          {/* Action Button */}
          <button className="w-full bg-[#0ea5e9] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-[#0369a1] transition-all active:scale-95">
            Enter Dashboard
          </button>

          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
            Exclusive for NM Mart Members
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welfare;
