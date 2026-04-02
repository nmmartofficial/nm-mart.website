import { Star, Search, Loader2 } from "lucide-react";
import React from "react";

interface WelfareTabProps {
  customerSearch: string;
  setCustomerSearch: (v: string) => void;
  customerData: any;
  pointsToAdd: string;
  setPointsToAdd: (v: string) => void;
  welfareLoading: boolean;
  handleCustomerSearch: () => void;
  handleAddPoints: () => void;
}

const WelfareTab = ({
  customerSearch, setCustomerSearch, customerData, pointsToAdd, setPointsToAdd,
  welfareLoading, handleCustomerSearch, handleAddPoints
}: WelfareTabProps) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-sm space-y-8">
        <h3 className="text-2xl font-black italic uppercase text-black flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <Star size={24} />
          </div>
          NM Welfare Points
        </h3>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input 
              type="text" 
              placeholder="SEARCH BY PHONE OR NAME"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary transition-all font-bold uppercase text-sm"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCustomerSearch()}
            />
          </div>
          <button 
            onClick={handleCustomerSearch}
            disabled={welfareLoading}
            className="bg-black text-white px-8 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-primary transition-all shadow-sm"
          >
            {welfareLoading ? <Loader2 className="animate-spin" size={20} /> : "Search"}
          </button>
        </div>

        {customerData && (
          <div className="bg-gray-50 border border-gray-100 rounded-[32px] p-8 space-y-6 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-2xl font-black italic uppercase text-black">{customerData.full_name}</h4>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1 italic">{customerData.mobile}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] mb-1">Current Points</p>
                <p className="text-4xl font-black text-primary italic leading-none">{customerData.loyalty_points || 0}</p>
              </div>
            </div>

            <div className="h-[1px] bg-gray-200 my-6"></div>

            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] ml-1">Add Points</label>
                <input 
                  type="number" 
                  placeholder="ENTER POINTS TO ADD"
                  className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-primary transition-all font-bold text-sm"
                  value={pointsToAdd}
                  onChange={(e) => setPointsToAdd(e.target.value)}
                />
              </div>
              <button 
                onClick={handleAddPoints}
                disabled={welfareLoading || !pointsToAdd}
                className="bg-primary text-white h-[58px] px-10 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-sm"
              >
                Update Points
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelfareTab;
