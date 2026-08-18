'use client';
import React from 'react';

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage,
    onItemsPerPageChange,
    itemName = "entries",
    className = ""
}) {
    const safePage = Number(currentPage) || 1;
    const safeTotal = Number(totalPages) || 1;
    const safeTotalItems = Number(totalItems) || 0;
    const safePerPage = Number(itemsPerPage) || 10;

    return (
        <div className={`flex flex-wrap items-center justify-end gap-3.5 py-4 pr-6 md:pr-10 bg-transparent w-full ${className}`}>
            <svg width="0" height="0" className="absolute w-0 h-0 pointer-events-none">
                <defs>
                    <linearGradient id="paginationGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#882619" />
                        <stop offset="100%" stopColor="#D4612D" />
                    </linearGradient>
                </defs>
            </svg>

            {totalItems !== undefined && (
                <div className="text-xs font-bold bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent mr-1">
                    {safeTotalItems} {itemName}
                </div>
            )}

            <div className="flex items-center gap-3">
                <button
                    onClick={() => onPageChange(safePage - 1)}
                    disabled={safePage === 1}
                    className="p-1 cursor-pointer opacity-100 hover:scale-110 active:scale-95 transition-all"
                    title="Previous Page"
                >
                    <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                        <path d="M15 1.5L2 9L15 16.5V1.5Z" fill="url(#paginationGradient)" />
                    </svg>
                </button>

                <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm border border-[#D4612D] bg-white dark:bg-zinc-800 shadow-sm cursor-default">
                    <span className="bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent font-black">
                        {safePage}
                    </span>
                </div>

                <button
                    onClick={() => onPageChange(safePage + 1)}
                    disabled={safePage === safeTotal}
                    className="p-1 cursor-pointer opacity-100 hover:scale-110 active:scale-95 transition-all"
                    title="Next Page"
                >
                    <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                        <path d="M1 1.5L14 9L1 16.5V1.5Z" fill="url(#paginationGradient)" />
                    </svg>
                </button>
            </div>

            <div className="relative border border-[#D4612D] rounded-lg px-3.5 py-1.5 bg-white dark:bg-zinc-800 flex items-center justify-between gap-3 shadow-sm cursor-pointer ml-1">
                <span className="text-sm font-extrabold bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent pointer-events-none select-none">
                    {safePerPage === 999999 ? 'All' : `${safePerPage}/ Page`}
                </span>

                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="pointer-events-none shrink-0">
                    <path d="M1 1L6 7L11 1H1Z" fill="url(#paginationGradient)" />
                </svg>

                <select
                    value={safePerPage}
                    onChange={(e) => onItemsPerPageChange && onItemsPerPageChange(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer bg-white dark:bg-zinc-800 text-base"
                >
                    <option value={10}>10/ Page</option>
                    <option value={20}>20/ Page</option>
                    <option value={50}>50/ Page</option>
                    <option value={100}>100/ Page</option>
                    <option value={999999}>All</option>
                    {![10, 20, 50, 100, 999999].includes(safePerPage) && (
                        <option value={safePerPage}>{safePerPage}/ Page</option>
                    )}
                </select>
            </div>
        </div>
    );
}
