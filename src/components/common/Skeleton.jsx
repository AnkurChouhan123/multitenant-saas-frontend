export const CardSkeleton = () => (
  <div className="bg-gray-200 rounded-lg animate-pulse h-48 w-full" />
);

export const TableSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-12 bg-gray-200 rounded mb-2 animate-pulse" />
    ))}
  </>
);