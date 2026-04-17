export function ScoringLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-3 px-4 bg-white border border-gray-100 rounded-xl shadow-sm my-4">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-200"></div>
        <span className="font-heading font-bold text-[10px] uppercase tracking-wider text-gray-400">Pass (1)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-200"></div>
        <span className="font-heading font-bold text-[10px] uppercase tracking-wider text-gray-400">Needs Attention (0.5)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-200"></div>
        <span className="font-heading font-bold text-[10px] uppercase tracking-wider text-gray-400">Urgent Attention (0)</span>
      </div>
    </div>
  );
}
