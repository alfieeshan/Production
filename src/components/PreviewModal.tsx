import React, { useState } from 'react';
import { X, Send, Heart, Share2, Shield, Truck, Smartphone } from 'lucide-react';
import { Product } from '../types';

interface PreviewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PreviewModal({ product, isOpen, onClose }: PreviewModalProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  if (!isOpen || !product) return null;

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

  const formattedDescription = product.description
    ? product.description.split('\n').map((para, idx) => (
        <p key={idx} className="text-sm text-gray-600 mb-2 leading-relaxed">
          {para}
        </p>
      ))
    : <p className="text-sm text-gray-400 italic">No specifications provided.</p>;

  const handleWhatsAppRedirect = () => {
    if (!product.whatsapp_number) return;
    const sanitizedPhone = product.whatsapp_number.replace(/\D/g, '');
    const message = `Hello! I am interested in purchasing your handset listing: *${product.name}* (Price: ${formatPrice(product.price)}). Is this still available?`;
    const waUrl = `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-4xl border border-gray-100 animate-fade-in flex flex-col md:flex-row max-h-[90vh]">
          {/* Close button top right */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100/80 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left: Images */}
          <div className="w-full md:w-1/2 p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-150 flex flex-col justify-between overflow-y-auto bg-gray-50/50">
            <div className="space-y-4">
              {/* Main Active image */}
              <div className="w-full aspect-square bg-white rounded-xl border border-gray-150 overflow-hidden flex items-center justify-center relative group shadow-inner">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[activeImageIdx] || product.images[0]}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain max-h-[380px]"
                  />
                ) : (
                  <div className="text-gray-300 flex flex-col items-center">
                    <Smartphone className="w-16 h-16 stroke-[1]" />
                    <span className="text-xs mt-2 font-semibold">No Image Uploaded</span>
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  {(product.status === 'active' || product.status === true) ? (
                    <span className="bg-[#25D366] text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-md border border-[#1ebd53] shadow-xs">
                      Available
                    </span>
                  ) : (
                    <span className="bg-gray-500 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-md shadow-xs">
                      Draft / Unlisted
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails list */}
              {product.images && product.images.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      type="button"
                      className={`w-14 h-14 rounded-lg bg-white border overflow-hidden p-1 transition-all cursor-pointer ${
                        idx === activeImageIdx
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p className="text-[10px] text-gray-400 mt-6 text-center">
              * This is a live frontend visual replica. Clicking WhatsApp initiates genuine purchase logic.
            </p>
          </div>

          {/* Right: Product Info */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              {/* Title & Brand heading */}
              <div>
                <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest">
                  Genuine Showcase Item
                </span>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
                  {product.name}
                </h1>
                <div className="flex items-center gap-1.5 mt-2.5 text-xs text-gray-500">
                  <span className="font-mono">ID: {product.id}</span>
                  <span>•</span>
                  <span>BDT Pricing Standard</span>
                </div>
              </div>

              {/* BDT Price */}
              <div className="bg-gray-50 border border-gray-150 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wide">
                    Final BDT Offer
                  </span>
                  <span className="text-2xl font-bold font-sans tracking-tight text-emerald-600">
                    {formatPrice(product.price)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-2 border border-gray-250 bg-white rounded-lg hover:bg-gray-50 text-gray-400 hover:text-red-500 transition-colors shadow-xs cursor-pointer"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="p-2 border border-gray-250 bg-white rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors shadow-xs cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Description specifications */}
              <div className="space-y-2">
                <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Product Overview
                </span>
                <div className="max-h-[220px] overflow-y-auto border-l-2 border-gray-200 pl-4 py-1">
                  {formattedDescription}
                </div>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-3.5 border-t border-gray-150 pt-5">
                <div className="flex gap-2 items-start">
                  <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-semibold text-gray-800">Verified Seller</span>
                    <span className="block text-[10px] text-gray-400 leading-relaxed">
                      Handset condition inspected by admin.
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 items-start">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-semibold text-gray-800">Direct Delivery</span>
                    <span className="block text-[10px] text-gray-400 leading-relaxed">
                      Instant WhatsApp shipping lookup.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons footer */}
            <div className="border-t border-gray-150 pt-6 mt-6">
              {product.whatsapp_number ? (
                <button
                  onClick={handleWhatsAppRedirect}
                  type="button"
                  id="whatsapp-redirect-btn"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-[#25D366] hover:bg-[#1ebd53] text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Order via WhatsApp Direct
                </button>
              ) : (
                <div className="w-full text-center py-3 bg-gray-50 text-xs text-gray-400 rounded-xl border border-dashed border-gray-200">
                  No WhatsApp sales number provided for this item.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
