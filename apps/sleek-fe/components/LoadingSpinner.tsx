export function LoadingSpinner({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "w-8 h-8 border-3",
    md: "w-12 h-12 border-4",
    lg: "w-16 h-16 border-4"
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        {/* Outer ring with gradient */}
        <div className={`${sizeClasses[size]} border-gray-200 rounded-full`}></div>
        
        {/* Spinning gradient ring */}
        <div className={`absolute inset-0 ${sizeClasses[size]} border-t-transparent border-r-transparent border-b-transparent border-l-green-500 rounded-full animate-spin`}></div>
        
        {/* Inner dot */}
        {/* <div className="absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div> */}
      </div>
    </div>
  );
}

export function SkeletonCard({ variant = "grid", className = "" }: { variant?: "grid" | "list"; className?: string }) {
  if (variant === "list") {
    return (
      <div className={`animate-pulse rounded-2xl overflow-hidden bg-white border border-gray-100 ${className}`}>
        <div className="flex flex-col md:flex-row">
          {/* Image skeleton */}
          <div className="md:w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200"></div>
          
          {/* Content skeleton */}
          <div className="flex-1 p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg w-3/4"></div>
                <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg w-1/2"></div>
              </div>
              <div className="h-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg w-16"></div>
            </div>
            
            <div className="space-y-2">
              <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg w-full"></div>
              <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg w-5/6"></div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="space-y-2">
                <div className="h-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg w-24"></div>
                <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg w-20"></div>
              </div>
              <div className="space-y-1 text-right">
                <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg w-20"></div>
                <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg w-16"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`animate-pulse group overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
      {/* Image skeleton with gradient */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        {/* Simulated image loading */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
        </div>
        
        {/* Top badges skeleton */}
        <div className="absolute top-4 left-4 space-y-2">
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-16"></div>
          <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-12"></div>
        </div>
        
        {/* Action buttons skeleton */}
        <div className="absolute top-4 right-4 space-y-2">
          <div className="h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
          <div className="h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
        </div>
        
        {/* Quick view button skeleton */}
        <div className="absolute bottom-4 right-4 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-32"></div>
      </div>

      {/* Content skeleton */}
      <div className="p-5 space-y-4">
        {/* Category skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-24"></div>
        </div>

        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-full"></div>
          <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-4/5"></div>
        </div>

        {/* Price skeleton */}
        <div className="flex items-baseline gap-3">
          <div className="h-7 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-24"></div>
          <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-16"></div>
          <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-12"></div>
        </div>

        {/* Seller info skeleton */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
              <div className="space-y-1">
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-20"></div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                  <div className="h-3 w-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                  <div className="h-3 w-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-8"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Location & time skeleton */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-16"></div>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-12"></div>
            </div>
          </div>

          {/* Button skeleton */}
          <div className="h-11 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl mt-4"></div>
        </div>
      </div>
    </div>
  );
}

// Additional skeleton components
export function SkeletonGrid({ count = 4, variant = "grid", className = "" }: { count?: number; variant?: "grid" | "list"; className?: string }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} variant={variant} />
      ))}
    </div>
  );
}

export function SkeletonList({ count = 3, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} variant="list" />
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg ${
            index === lines - 1 ? 'w-4/5' : 'w-full'
          }`}
        ></div>
      ))}
    </div>
  );
}

export function SkeletonButton({ className = "" }: { className?: string }) {
  return (
    <div className={`h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg ${className}`}></div>
  );
}