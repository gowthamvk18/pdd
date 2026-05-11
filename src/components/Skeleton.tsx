interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`}></div>
  );
};

export const CardSkeleton = () => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 space-y-4">
    <div className="flex gap-4">
      <Skeleton className="w-14 h-14 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <Skeleton className="h-12 w-full mt-4" />
  </div>
);

export const SessionSkeleton = () => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 flex flex-col md:flex-row justify-between items-center gap-6">
    <div className="flex items-center gap-4 w-full">
      <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-6 w-1/2" />
        <div className="flex gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
    <div className="flex gap-3 w-full md:w-auto">
      <Skeleton className="h-12 w-32" />
      <Skeleton className="h-12 w-32" />
    </div>
  </div>
);
