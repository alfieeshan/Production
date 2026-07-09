import React from 'react';

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div
        className={`${sizeClasses[size]} border-gray-200 border-t-emerald-500 rounded-full animate-spin`}
        role="status"
      />
    </div>
  );
}

export function LoadingTable() {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 animate-pulse">
      <div className="h-12 bg-gray-50 flex items-center px-6 gap-4">
        <div className="w-4 h-4 bg-gray-200 rounded" />
        <div className="w-16 h-4 bg-gray-200 rounded" />
        <div className="w-48 h-4 bg-gray-200 rounded" />
        <div className="w-24 h-4 bg-gray-200 rounded" />
        <div className="w-32 h-4 bg-gray-200 rounded animate-none" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 flex items-center px-6 gap-4">
          <div className="w-4 h-4 bg-gray-150 rounded" />
          <div className="w-10 h-10 bg-gray-150 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="w-1/3 h-4 bg-gray-150 rounded" />
            <div className="w-1/4 h-3 bg-gray-100 rounded" />
          </div>
          <div className="w-24 h-4 bg-gray-150 rounded" />
          <div className="w-16 h-6 bg-gray-150 rounded-full" />
          <div className="w-20 h-4 bg-gray-150 rounded" />
        </div>
      ))}
    </div>
  );
}

export function LoadingCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 space-y-3">
          <div className="flex justify-between items-center">
            <div className="w-24 h-4 bg-gray-200 rounded" />
            <div className="w-6 h-6 bg-gray-200 rounded-full" />
          </div>
          <div className="w-16 h-8 bg-gray-200 rounded" />
          <div className="w-32 h-3 bg-gray-150 rounded" />
        </div>
      ))}
    </div>
  );
}
