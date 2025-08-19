import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface InfiniteScrollProps {
  children: React.ReactNode;
  onLoadMore: () => void;
  hasMore: boolean;
  loading?: boolean;
  className?: string;
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  onLoadMore,
  hasMore,
  loading = false,
  className = ''
}) => {
  const { ref, inView } = useInView({
    threshold: 0
  });

  useEffect(() => {
    if (inView && hasMore && !loading) {
      onLoadMore();
    }
  }, [inView, hasMore, loading, onLoadMore]);

  return (
    <div className={className}>
      {children}
      <div ref={ref} className="h-4">
        {loading && (
          <div className="flex justify-center p-4">
            <div className="loading loading-spinner" />
          </div>
        )}
      </div>
    </div>
  );
};

export default InfiniteScroll;