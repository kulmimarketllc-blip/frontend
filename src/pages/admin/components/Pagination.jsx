import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ 
  currentPage = 1, 
  totalItems = 0, 
  itemsPerPage = 10, 
  onPageChange = () => {},
  loading = false 
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1, 2);
      
      if (currentPage > 4) pages.push('...');
      
      const start = Math.max(3, currentPage - 1);
      const end = Math.min(totalPages - 2, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 3) pages.push('...');
      
      pages.push(totalPages - 1, totalPages);
    }
    
    return pages;
  };

  const handlePrevious = () => {
    if (currentPage > 1 && !loading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && !loading) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    if (typeof page === 'number' && page !== currentPage && !loading) {
      onPageChange(page);
    }
  };

  const pages = getPageNumbers();

  return (
    <div className="mt-8 flex flex-col gap-4 py-6 mx-2 md:mx-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-center">
        {/* Left Box - Info Text */}
        <div className="flex justify-start">
          <div className="text-[0.75rem] text-gray2">
            Page <span className="text-teal font-semibold">{currentPage}</span> of <span className="text-teal font-semibold">{totalPages}</span> {totalItems > 0 && `• Showing ${Math.min(itemsPerPage, totalItems)} of `}<span className="text-teal font-semibold">{totalItems || '—'}</span> items
          </div>
        </div>

        {/* Right Box - Navigation Controls */}
        <div className="flex items-center gap-2 justify-start md:justify-end">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1 || loading}
            className="disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 rounded border border-white/10 px-3 py-2 text-[0.8rem] text-gray2 hover:border-teal hover:text-teal transition"
          >
            <ChevronLeft size={16} />
            <span className="hidden min-[640px]:inline">Previous</span>
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1 flex-wrap">
            {pages.map((page, idx) => {
              if (page === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray2">
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={page}
                  onClick={() => handlePageClick(page)}
                  disabled={loading}
                  className={`disabled:opacity-50 disabled:cursor-not-allowed rounded border px-3 py-2 text-[0.8rem] font-medium transition ${
                    currentPage === page
                      ? 'border-teal bg-teal/10 text-teal'
                      : 'border-white/10 text-gray2 hover:border-teal hover:text-teal'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages || loading}
            className="disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 rounded border border-white/10 px-3 py-2 text-[0.8rem] text-gray2 hover:border-teal hover:text-teal transition"
          >
            <span className="hidden min-[640px]:inline">Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
