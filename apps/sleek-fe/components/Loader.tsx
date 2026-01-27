import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'white';
  fullScreen?: boolean;
  className?: string;
}

const Loader = ({
  size = 'md',
  variant = 'primary',
  fullScreen = false,
  className = ''
}: LoaderProps) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-14 h-14 border-4',
    xl: 'w-20 h-20 border-4'
  };

  // Variant classes
  const variantClasses = {
    default: 'border-gray-200 border-t-gray-900',
    primary: 'border-gray-100 border-t-green-500',
    secondary: 'border-gray-100 border-t-blue-500',
    white: 'border-white/30 border-t-white'
  };

  // Spinner gradient variants
  const gradientVariants = {
    primary: 'from-green-400 to-green-600',
    secondary: 'from-blue-400 to-blue-600',
    default: 'from-gray-400 to-gray-600',
    white: 'from-white to-white/80'
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <div className="text-center">
          <div className="relative">
            {/* Outer glow effect */}
            <div className={`absolute inset-0 ${sizeClasses[size]} border-transparent rounded-full blur-md animate-pulse bg-gradient-to-r ${gradientVariants[variant]} opacity-20`}></div>
            
            {/* Main spinner */}
            <div className={`relative ${sizeClasses[size]} rounded-full border ${variantClasses[variant]} animate-spin`}></div>
            
            {/* Inner dot */}
            <div className="absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${gradientVariants[variant]} animate-pulse`}></div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="text-gray-600 text-sm font-medium">Loading...</div>
            <div className="mt-2 text-xs text-gray-400">Campus Marketplace</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        {/* Optional: Add a subtle pulsing background */}
        <div className={`absolute inset-0 ${sizeClasses[size]} border-transparent rounded-full blur-sm animate-pulse bg-gradient-to-r ${gradientVariants[variant]} opacity-10`}></div>
        
        {/* Main spinner ring */}
        <div className={`relative ${sizeClasses[size]} rounded-full border ${variantClasses[variant]} animate-spin`}></div>
        
        {/* Optional: Inner gradient dot */}
        {variant === 'primary' && (
          <div className="absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-1.5 h-1.5 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loader;

// Additional loading components for different use cases
export const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 p-8">
    <div className="text-center max-w-md">
      <div className="relative mx-auto mb-8">
        {/* Logo container */}
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center">
          <div className="w-10 h-10 bg-white/20 rounded-full animate-pulse"></div>
        </div>
        
        {/* Animated text dots */}
        <div className="flex items-center justify-center gap-1 mt-4">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading SleekRoad</h3>
      <p className="text-sm text-gray-600">Your campus marketplace is loading...</p>
    </div>
  </div>
);

export const ContentLoader = ({ text = "Loading content..." }: { text?: string }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="relative inline-block">
        <div className="w-12 h-12 border-3 border-gray-100 border-t-green-500 rounded-full animate-spin"></div>
        <div className="absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>
      <p className="mt-4 text-sm text-gray-600 font-medium">{text}</p>
    </div>
  </div>
);

export const ButtonLoader = ({ variant = "primary" }: { variant?: "primary" | "secondary" | "outline" }) => {
  const colorClasses = {
    primary: "border-white/30 border-t-white",
    secondary: "border-gray-300 border-t-gray-600",
    outline: "border-gray-400 border-t-gray-800"
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`w-4 h-4 border-2 ${colorClasses[variant]} rounded-full animate-spin`}></div>
    </div>
  );
};

export const CardLoader = () => (
  <div className="animate-pulse rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded w-1/2"></div>
      <div className="h-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded w-1/3"></div>
    </div>
  </div>
);