import React from 'react';

const Pagination = ({ totalDocuments, perPage, currentPage, setCurrentPage }) => {
    const totalPages = Math.ceil(totalDocuments / perPage);

    if (totalPages <= 1) return null;

    return (
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 flex justify-center border-t border-gray-100">
            <nav className="inline-flex -space-x-px rounded-xl bg-white shadow-lg border border-gray-200" aria-label="Pagination">
                <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-l-xl border-r border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                    Trước
                </button>
                {(() => {
                    const pages = [];
                    const maxVisiblePages = 5;
                    let startPage = Math.max(1, currentPage - 2);
                    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                    if (endPage === totalPages && totalPages > maxVisiblePages) {
                        startPage = Math.max(1, totalPages - maxVisiblePages + 1);
                    }

                    for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i)}
                                className={`px-4 py-2 text-sm font-medium border-r border-gray-200 last:border-r-0 ${currentPage === i
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                                    : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                                    } transition-all duration-200`}
                            >
                                {i}
                            </button>
                        );
                    }

                    return pages;
                })()}
                <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-r-xl bg-white text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                    Tiếp
                </button>
            </nav>
        </div>
    );
};

export default Pagination;