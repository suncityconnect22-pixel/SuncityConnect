export default function Loading() {
  return (
    <div className="px-4 py-6 space-y-5 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
      </div>

      {/* Greeting Skeleton */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
      </div>

      {/* Card Skeleton 1 */}
      <div className="w-full h-32 bg-gray-100 rounded-2xl border border-gray-200"></div>

      {/* Grid Skeleton */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="w-full h-28 bg-gray-100 rounded-2xl"></div>
          <div className="w-full h-28 bg-gray-100 rounded-2xl"></div>
          <div className="w-full h-28 bg-gray-100 rounded-2xl"></div>
          <div className="w-full h-28 bg-gray-100 rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
}
