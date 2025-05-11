"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Asset } from '@/types';
import AssetCard from './AssetCard';
import FilterControls from './FilterControls';
import { useAssets } from '@/contexts/AssetContext'; // Import useAssets
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Skeleton } from '@/components/ui/skeleton';


const ITEMS_PER_PAGE = 9;

export default function MarketplaceClient() {
  const { assets: allAssets } = useAssets(); // Get assets from context
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    searchTerm: '',
    category: 'All',
    priceRange: [0, 500],
    sortBy: 'relevance',
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (allAssets.length > 0 || allAssets) { // Check if allAssets is not undefined
      setIsLoading(false);
    }
  }, [allAssets]);


  const filteredAssets = useMemo(() => {
    if (isLoading) return []; // Don't process if loading or assets not yet available
    
    let assets = [...allAssets]; // Use a copy of assets from context

    // Search term filter
    if (filters.searchTerm) {
      assets = assets.filter(asset =>
        asset.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        asset.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        asset.tags.some(tag => tag.toLowerCase().includes(filters.searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (filters.category !== 'All') {
      assets = assets.filter(asset => asset.category === filters.category);
    }

    // Price range filter
    // Handle the case where priceRange[1] is the max (500 in this case, meaning 500+)
    if (filters.priceRange[1] === 500) {
        assets = assets.filter(asset => asset.price >= filters.priceRange[0]);
    } else {
        assets = assets.filter(asset => asset.price >= filters.priceRange[0] && asset.price <= filters.priceRange[1]);
    }


    // Sort assets
    switch (filters.sortBy) {
      case 'price_asc':
        assets.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        assets.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        assets.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
        break;
      // 'relevance' and 'popular' would need more complex logic/backend data
      default: // Default to newest if relevance or popular is selected but not implemented
        assets.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
        break;
    }

    return assets;
  }, [allAssets, filters, isLoading]);

  const totalPages = Math.ceil(filteredAssets.length / ITEMS_PER_PAGE);
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1); 
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  const renderPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5; 
    const halfMaxPages = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, currentPage - halfMaxPages);
    let endPage = Math.min(totalPages, currentPage + halfMaxPages);

    if (currentPage <= halfMaxPages) {
        endPage = Math.min(totalPages, maxPagesToShow);
    }
    if (currentPage + halfMaxPages >= totalPages) {
        startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }


    if (startPage > 1) {
        items.push(
            <PaginationItem key="start-ellipsis">
                <PaginationEllipsis />
            </PaginationItem>
        );
    }

    for (let i = startPage; i <= endPage; i++) {
        items.push(
            <PaginationItem key={i}>
                <PaginationLink href="#" isActive={i === currentPage} onClick={(e) => { e.preventDefault(); handlePageChange(i);}}>
                    {i}
                </PaginationLink>
            </PaginationItem>
        );
    }

    if (endPage < totalPages) {
        items.push(
            <PaginationItem key="end-ellipsis">
                <PaginationEllipsis />
            </PaginationItem>
        );
    }
    return items;
  };

  if (isLoading) {
    return (
      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <Skeleton className="h-[500px] w-full" />
        </aside>
        <main className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }


  return (
    <div className="grid lg:grid-cols-4 gap-8">
      <aside className="lg:col-span-1 sticky top-20 h-fit">
        <FilterControls onFilterChange={handleFilterChange} initialFilters={filters} />
      </aside>
      <main className="lg:col-span-3">
        {paginatedAssets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedAssets.map(asset => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-2xl font-semibold text-muted-foreground">No Assets Found</h3>
            <p className="mt-2 text-foreground">Try adjusting your filters or search terms.</p>
          </div>
        )}
        {totalPages > 1 && (
          <Pagination className="mt-12">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if(currentPage > 1) handlePageChange(currentPage - 1);}} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}/>
              </PaginationItem>
              {renderPaginationItems()}
              <PaginationItem>
                <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if(currentPage < totalPages) handlePageChange(currentPage + 1);}} className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}/>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </main>
    </div>
  );
}

const CardSkeleton = () => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col">
    <Skeleton className="aspect-[3/2] w-full" />
    <div className="p-4 flex-grow space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-1/4" />
    </div>
    <div className="p-4 pt-0 flex justify-between items-center">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-8 w-8 rounded-md" />
    </div>
  </div>
);