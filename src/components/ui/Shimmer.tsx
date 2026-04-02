
interface ShimmerProps {
  className?: string;
}

export function Shimmer({ className = "" }: ShimmerProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
}

export function ScoreChartShimmer() {
  return (
    <div className="card p-6 mb-6">
      <div className="h-4 w-32 bg-gray-200 rounded mb-6 animate-pulse"></div>
      <div className="h-64 w-full flex items-end justify-around gap-4 px-4">
        <div className="flex-1 bg-gray-100 rounded-t-lg animate-pulse" style={{ height: '60%' }}></div>
        <div className="flex-1 bg-gray-100 rounded-t-lg animate-pulse" style={{ height: '40%' }}></div>
        <div className="flex-1 bg-gray-100 rounded-t-lg animate-pulse" style={{ height: '80%' }}></div>
      </div>
    </div>
  );
}

export function RecentAuditsShimmer() {
  return (
    <div className="mt-8 space-y-4">
      <div className="h-4 w-24 bg-gray-200 rounded mb-4 animate-pulse"></div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="card h-24 w-full animate-pulse"></div>
      ))}
    </div>
  );
}
