import React from 'react';

const Welfare = () => {
  return (
    <div className="min-h-[600px] flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-[#e0f2fe]">
      
      {/* 1. Title Section */}
      <h2 className="text-3xl font-black text-[#1e293b] italic uppercase tracking-tighter mb-12">
        NM <span className="text-[#0ea5e9]">MART</span> CLUB
      </h2>

      {/* 2. Premium Login Card (Isi code ko 'Member Login' wale div se replace karein) */}
      <div className="bg-white/80 backdrop-blur-md w-full max-w-sm p-10 rounded-[2.5rem] shadow-2xl shadow-blue-100 border border-white flex flex-col items-center gap-8">
        
        <div className="flex flex-col items-center">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">
             Member Login
           </h3>
           <div className="h-1 w-8 bg-[#0ea5e9] rounded-full"></div>
        </div>
        
        {/* Input Box - Phone Number */}
        <div className="w-full">
          <input 
            type="text" 
            placeholder="91XXXXXXXXX" 
            className="w-full py-5 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center text-xl font-bold text-[#0369a1] tracking-widest outline-none focus:border-[#0ea5e9] focus:bg-white transition-all shadow-inner"
          />
        </div>

        {/* Enter Dashboard Button */}
        <button className="w-full bg-[#0ea5e9] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-[#0369a1] hover:-translate-y-1 transition-all active:scale-95">
          Enter Dashboard
        </button>

        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
          Exclusive for NM Mart Members
        </p>
      </div>
    </div>
  );
};

export default Welfare;
