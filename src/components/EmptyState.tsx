import React from 'react';
import { PackageOpen, Search, AlertCircle, Database, Settings } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-products' | 'no-results' | 'error' | 'config';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  errorDetails?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  onAction,
  errorDetails,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  const iconMap = {
    'no-products': <PackageOpen className="w-12 h-12 text-gray-300 stroke-[1.5]" />,
    'no-results': <Search className="w-12 h-12 text-gray-300 stroke-[1.5]" />,
    'error': <AlertCircle className="w-12 h-12 text-red-400 stroke-[1.5]" />,
    'config': <Database className="w-12 h-12 text-amber-500 stroke-[1.5]" />,
  };

  const defaults = {
    'no-products': {
      title: 'No products found',
      description: 'Get started by creating your first product in the catalog.',
    },
    'no-results': {
      title: 'No matching products',
      description: 'We couldn’t find any products that match your current search queries or filters.',
    },
    'error': {
      title: 'Database connection error',
      description: 'We were unable to communicate with your Supabase database. Please check your credentials and internet connection.',
    },
    'config': {
      title: 'Supabase Credentials Required',
      description: 'To connect this Admin Panel to your Mobile Phone Showcase website, you must provide your Supabase URL and Anon Key.',
    },
  };

  const activeTitle = title || defaults[type].title;
  const activeDesc = description || defaults[type].description;

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[350px] bg-white border border-gray-200 rounded-xl">
      <div className="p-3 bg-gray-50 rounded-full mb-4">
        {iconMap[type]}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{activeTitle}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6 leading-relaxed">
        {activeDesc}
      </p>

      {errorDetails && (
        <div className="w-full max-w-md p-3 mb-6 bg-red-50 rounded-lg text-left border border-red-100">
          <p className="text-xs font-mono text-red-600 break-all whitespace-pre-wrap">
            {errorDetails}
          </p>
        </div>
      )}

      {type === 'config' && (
        <div className="w-full max-w-md p-4 mb-6 bg-amber-50 rounded-xl text-left border border-amber-100 space-y-3">
          <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" /> Setup Instructions
          </h4>
          <ol className="text-xs text-amber-800 space-y-2 list-decimal list-inside leading-relaxed">
            <li>Click the <strong>Settings</strong> gear icon in the AI Studio sidebar menu.</li>
            <li>Add these two variables to your secrets config:
              <ul className="list-disc list-inside ml-4 mt-1 font-mono text-amber-900">
                <li>VITE_SUPABASE_URL</li>
                <li>VITE_SUPABASE_ANON_KEY</li>
              </ul>
            </li>
            <li>Paste your credentials from your Supabase Project Settings API tab.</li>
            <li>Refresh or reload the preview to begin managing your live products!</li>
          </ol>
        </div>
      )}

      <div className="flex flex-wrap justify-center items-center gap-3">
        {onAction && actionLabel && (
          <button
            onClick={onAction}
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors cursor-pointer"
          >
            {actionLabel}
          </button>
        )}
        {onSecondaryAction && secondaryActionLabel && (
          <button
            onClick={onSecondaryAction}
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors cursor-pointer"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
