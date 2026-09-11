export const Skeleton = ({ className = '', variant = 'text' }) => {
  const base = {
    text: 'h-4 w-full',
    circle: 'h-10 w-10 rounded-full',
    rect: 'h-32 w-full',
    card: 'h-full w-full',
  };
  return <div className={`skeleton ${base[variant]} ${className}`} aria-hidden="true" />;
};

export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`} aria-hidden="true">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={i === lines - 1 ? 'w-2/3' : ''} />
    ))}
  </div>
);

export const ProductCardSkeleton = () => (
  <div className="rounded-2xl border border-stone-100 bg-white overflow-hidden">
    <Skeleton variant="rect" className="h-32 sm:h-48" />
    <div className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
      <Skeleton className="w-3/4" />
      <Skeleton className="w-full" />
      <Skeleton className="w-1/3" />
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} variant="rect" className="h-28" />
      ))}
    </div>
    <Skeleton variant="rect" className="h-64" />
  </div>
);

export default Skeleton;
