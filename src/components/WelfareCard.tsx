// ... (पुराना इम्पोर्ट्स और स्टेट्स वही रहेंगे)

const WelfareCard = () => {
  // ... (वही रहेगा)

  // बची हुई बचत (Remaining Profit) निकालने का लॉजिक
  const getRemainingProfit = () => {
    if (!userData?.Profit || !userData?.Target) return 0;
    const profit = parseInt(userData.Profit.replace(/\D/g, ""));
    const target = parseInt(userData.Target.replace(/\D/g, ""));
    return target - profit;
  };

  return (
    <section className="py-16 gradient-navy text-white min-h-screen">
      <div className="container mx-auto px-4 text-center">
        
        {userData && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-2xl mx-auto mb-8 bg-yellow-500/10 border-2 border-yellow-500/30 p-6 rounded-[2rem] backdrop-blur-md relative overflow-hidden"
          >
            {/* Background Icon */}
            <Zap className="absolute -right-4 -top-4 text-yellow-500 opacity-10" size={100}/>
            
            <div className="relative z-10">
              <h3 className="text-yellow-500 font-black italic text-xl flex items-center justify-center gap-2">
                <Star size={20} fill="currentColor"/> ध्यान दें, {userData.Name}! <Star size={20} fill="currentColor"/>
              </h3>
              <p className="mt-2 text-lg font-medium">
                आपके कार्ड में अभी भी <span className="text-2xl font-black text-white underline decoration-gold">₹{getRemainingProfit()}</span> का फायदा (Profit) बचा हुआ है।
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
                  Expired on: {userData.Expiry}
                </span>
                <span className="bg-gold/20 text-gold px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-gold/30">
                  Next Month Target: ₹250
                </span>
              </div>
              <p className="mt-4 text-[11px] opacity-60 italic">
                *इस बचत का लाभ उठाने के लिए अगले महीने NM Mart ज़रूर पधारें।
              </p>
            </div>
          </motion.div>
        )}

        {/* बाकी का डैशबोर्ड कोड यहाँ आएगा (जैसा पहले दिया था) */}
        
      </div>
    </section>
  );
};
