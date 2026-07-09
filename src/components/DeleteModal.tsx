import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Product } from '../types';

interface DeleteModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteModal({ product, isOpen, onClose, onConfirm }: DeleteModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all w-full max-w-md border border-gray-100 animate-fade-in">
          {/* Header Close */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon + Title */}
          <div className="bg-red-50 p-6 flex gap-4 border-b border-red-100">
            <div className="p-2.5 bg-red-100 text-red-700 rounded-xl h-11 w-11 shrink-0 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-950">Delete Product Catalog Entry?</h3>
              <p className="text-xs text-red-800 mt-1">This action is permanent and cannot be undone.</p>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-500 leading-relaxed">
              You are about to delete <strong className="text-gray-900">{product.name}</strong> from your active catalog.
            </p>

            {product.images && product.images.length > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-150 flex items-center gap-3">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 object-cover rounded-md border border-gray-250"
                />
                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-gray-700 truncate">Associated Files</span>
                  <span className="block text-[10px] font-mono text-gray-400 truncate">
                    {product.images.length} image{product.images.length > 1 ? 's' : ''} will be purged from Supabase storage bucket
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-150">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              type="button"
              id="confirm-delete-btn"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Purge & Delete Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
