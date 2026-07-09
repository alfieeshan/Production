import React, { useState } from 'react';
import {
  Eye,
  Edit2,
  Copy,
  Trash2,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  PackageCheck,
  PackageX,
} from 'lucide-react';
import { Product } from '../types';

interface ProductTableProps {
  products: Product[];
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDuplicate: (product: Product) => void;
  onDelete: (product: Product) => void;
  onBulkDelete: (ids: (string | number)[]) => void;
  onBulkUpdateStatus: (ids: (string | number)[], status: 'active' | 'inactive') => void;
}

export function ProductTable({
  products,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onBulkDelete,
  onBulkUpdateStatus,
}: ProductTableProps) {
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Pagination calculations
  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = products.slice(startIndex, startIndex + itemsPerPage);

  // Active Dropdown state for rows
  const [openActionId, setOpenActionId] = useState<string | number | null>(null);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const pageIds = paginatedProducts.map((p) => p.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = paginatedProducts.map((p) => p.id);
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    }
  };

  const handleSelectOne = (id: string | number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const isAllPageSelected = () => {
    if (paginatedProducts.length === 0) return false;
    return paginatedProducts.every((p) => selectedIds.includes(p.id));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(price)
      .replace('BDT', '৳');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Bulk executions
  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected products?`)) {
      onBulkDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleBulkActivate = () => {
    onBulkUpdateStatus(selectedIds, 'active');
    setSelectedIds([]);
  };

  const handleBulkDeactivate = () => {
    onBulkUpdateStatus(selectedIds, 'inactive');
    setSelectedIds([]);
  };

  return (
    <div className="space-y-4">
      {/* Bulk Action Banner */}
      {selectedIds.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between p-3.5 bg-emerald-50/50 border border-emerald-150 rounded-xl gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-800">
              {selectedIds.length} product{selectedIds.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkActivate}
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <PackageCheck className="w-3.5 h-3.5" /> Mark Active
            </button>
            <button
              onClick={handleBulkDeactivate}
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <PackageX className="w-3.5 h-3.5" /> Mark Inactive
            </button>
            <button
              onClick={handleBulkDelete}
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Bulk Delete
            </button>
            <button
              onClick={() => setSelectedIds([])}
              type="button"
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-900 cursor-pointer"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={isAllPageSelected()}
                    onChange={handleSelectAll}
                    id="checkbox-select-all"
                    className="w-4 h-4 rounded text-emerald-600 border-gray-300 focus:ring-emerald-500 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4">Product Info</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">WhatsApp Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 text-sm">
              {paginatedProducts.map((product) => {
                const isChecked = selectedIds.includes(product.id);
                const isDropdownOpen = openActionId === product.id;

                return (
                  <tr
                    key={product.id}
                    className={`hover:bg-gray-50/50 transition-colors ${
                      isChecked ? 'bg-emerald-50/10' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleSelectOne(product.id, e.target.checked)}
                        id={`checkbox-select-${product.id}`}
                        className="w-4 h-4 rounded text-emerald-600 border-gray-300 focus:ring-emerald-500 cursor-pointer"
                      />
                    </td>

                    {/* Image & Product Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4.5">
                        <div className="relative w-12 h-12 rounded-lg bg-gray-50 border border-gray-150 overflow-hidden shrink-0 flex items-center justify-center">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-[10px] text-gray-400 font-mono">No Pic</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="block text-sm font-semibold text-gray-900 truncate">
                            {product.name}
                          </span>
                          <span className="block text-xs text-gray-400 truncate max-w-xs">
                            {product.description || 'No description provided.'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 font-semibold font-sans text-gray-900">
                      {formatPrice(product.price)}
                    </td>

                    {/* WhatsApp */}
                    <td className="px-6 py-4">
                      {product.whatsapp_number ? (
                        <a
                          href={`https://wa.me/${product.whatsapp_number.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-emerald-600 font-medium font-mono group"
                        >
                          <svg
                            className="w-3.5 h-3.5 fill-current text-[#25D366] group-hover:scale-105 transition-transform"
                            viewBox="0 0 24 24"
                          >
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.263 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.852.002-2.632-1.023-5.105-2.887-6.974-1.866-1.869-4.348-2.899-6.977-2.9-5.443 0-9.867 4.42-9.871 9.853-.001 1.722.453 3.402 1.317 4.877l-.994 3.634 3.727-.977zm11.555-7.737c-.32-.16-1.89-.933-2.185-1.043-.294-.11-.508-.16-.721.16-.213.32-.826 1.043-1.013 1.261-.187.218-.373.245-.693.085-.32-.16-1.349-.497-2.57-1.586-.95-.847-1.591-1.893-1.778-2.213-.187-.32-.02-.493.14-.652.144-.143.32-.373.48-.56.16-.188.213-.32.32-.533.11-.213.053-.4-.027-.56-.08-.16-.721-1.737-.987-2.378-.26-.626-.525-.541-.721-.551-.186-.01-.4-.011-.613-.011-.213 0-.56.08-.853.4-.293.32-1.12 1.093-1.12 2.667 0 1.573 1.147 3.093 1.307 3.307.16.213 2.257 3.447 5.467 4.833.763.329 1.359.526 1.825.674.767.244 1.464.21 2.015.127.614-.093 1.89-.773 2.157-1.48.267-.707.267-1.313.187-1.439-.08-.126-.293-.206-.613-.366z" />
                          </svg>
                          {product.whatsapp_number}
                          <ExternalLink className="w-2.5 h-2.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 font-mono">—</span>
                      )}
                    </td>

                    {/* Status Toggle */}
                    <td className="px-6 py-4">
                      {product.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-50 text-gray-500 border border-gray-200">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {formatDate(product.created_at)}
                    </td>

                    {/* Action Dropdowns */}
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() => setOpenActionId(isDropdownOpen ? null : product.id)}
                        type="button"
                        id={`actions-btn-${product.id}`}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-lg transition-all cursor-pointer"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {isDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenActionId(null)}
                          />
                          <div className="absolute right-6 top-12 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 w-40 text-left z-20 animate-fade-in divide-y divide-gray-100">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  onView(product);
                                  setOpenActionId(null);
                                }}
                                type="button"
                                className="flex items-center gap-2 w-full px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-gray-400" /> Public Preview
                              </button>
                              <button
                                onClick={() => {
                                  onEdit(product);
                                  setOpenActionId(null);
                                }}
                                type="button"
                                className="flex items-center gap-2 w-full px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-gray-400" /> Edit Product
                              </button>
                              <button
                                onClick={() => {
                                  onDuplicate(product);
                                  setOpenActionId(null);
                                }}
                                type="button"
                                className="flex items-center gap-2 w-full px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5 text-gray-400" /> Duplicate Item
                              </button>
                            </div>
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  onDelete(product);
                                  setOpenActionId(null);
                                }}
                                type="button"
                                className="flex items-center gap-2 w-full px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" /> Delete Product
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty Search/Filter State inside Table */}
        {products.length === 0 && (
          <div className="border-t border-gray-150 py-12 text-center text-gray-400 text-sm">
            No products match the selected search or status filters.
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs font-medium text-gray-500">
          <span>
            Showing <strong className="text-gray-700">{totalItems > 0 ? startIndex + 1 : 0}</strong>{' '}
            to{' '}
            <strong className="text-gray-700">
              {Math.min(startIndex + itemsPerPage, totalItems)}
            </strong>{' '}
            of <strong className="text-gray-700">{totalItems}</strong> products
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              type="button"
              id="pagination-prev"
              className="p-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              type="button"
              id="pagination-next"
              className="p-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
