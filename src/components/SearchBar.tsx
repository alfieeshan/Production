import React from 'react';
import { Search, ArrowUpDown, Filter, X } from 'lucide-react';
import { FilterOptions, SortOption } from '../types';

interface SearchBarProps {
  filters: FilterOptions;
  onChangeFilters: (filters: FilterOptions) => void;
}

export function SearchBar({ filters, onChangeFilters }: SearchBarProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeFilters({ ...filters, search: e.target.value });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChangeFilters({ ...filters, sort: e.target.value as SortOption });
  };

  const handleStatusChange = (status: 'all' | 'active' | 'inactive') => {
    onChangeFilters({ ...filters, status });
  };

  const clearSearch = () => {
    onChangeFilters({ ...filters, search: '' });
  };

  return (
    <div className="flex flex-col gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-xs md:flex-row md:items-center">
      {/* Search Bar Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={filters.search}
          onChange={handleSearchChange}
          placeholder="Search product name..."
          id="search-input"
          className="block w-full pl-9 pr-8 py-2 border border-gray-250 rounded-lg text-sm bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
        />
        {filters.search && (
          <button
            onClick={clearSearch}
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Action Filters Group */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Tab Filters */}
        <div className="flex border border-gray-200 rounded-lg p-0.5 bg-gray-50 shrink-0">
          {(['all', 'active', 'inactive'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => handleStatusChange(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all cursor-pointer ${
                filters.status === status
                  ? 'bg-white text-gray-900 shadow-xs border border-gray-200/50'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <div className="relative inline-block shrink-0">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
          </div>
          <select
            value={filters.sort}
            onChange={handleSortChange}
            id="sort-select"
            className="block w-full pl-8 pr-8 py-2 border border-gray-250 rounded-lg text-xs bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer appearance-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_low_high">Price Low → High</option>
            <option value="price_high_low">Price High → Low</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-gray-400">
            <svg
              className="h-3.5 w-3.5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
