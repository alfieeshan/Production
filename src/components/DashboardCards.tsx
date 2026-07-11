import React from 'react';
import { Package, CheckCircle2, XCircle, Sparkles, Phone, DollarSign } from 'lucide-react';
import { DashboardStats, Product } from '../types';

interface DashboardCardsProps {
  stats: DashboardStats;
  onViewProduct?: (product: Product) => void;
}

export function DashboardCards({ stats, onViewProduct }: DashboardCardsProps) {
  const cards = [
    {
      title: 'Total Products',
      value: stats.total,
      description: 'Items in your public showcase',
      icon: <Package className="w-5 h-5 text-gray-500" />,
      color: 'border-gray-200 text-gray-900',
    },
    {
      title: 'Active Products',
      value: stats.active,
      description: 'Visible on customer catalog',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      color: 'border-gray-200 text-emerald-700',
    },
    {
      title: 'Inactive Products',
      value: stats.inactive,
      description: 'Hidden/draft catalog items',
      icon: <XCircle className="w-5 h-5 text-gray-400" />,
      color: 'border-gray-200 text-gray-600',
    },
  ];

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {card.title}
            </span>
            <div className="p-1.5 bg-gray-50 rounded-lg border border-gray-100">
              {card.icon}
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold font-sans tracking-tight text-gray-900">
              {card.value}
            </span>
            <p className="text-xs text-gray-400 mt-1">{card.description}</p>
          </div>
        </div>
      ))}

      {/* Latest Added Product Card */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between md:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            < className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Latest Product
          </span>
          {stats.latest && (
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded-full border border-emerald-100">
              New
            </span>
          )}
        </div>

        {stats.latest ? (
          <div
            onClick={() => onViewProduct?.(stats.latest!)}
            className="group flex gap-3.5 items-center cursor-pointer"
          >
            <div className="relative w-12 h-12 rounded-lg bg-gray-50 border border-gray-150 overflow-hidden shrink-0 flex items-center justify-center">
              {stats.latest.images?.[0] ? (
                <img
                  src={stats.latest.images[0]}
                  alt={stats.latest.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <Package className="w-6 h-6 text-gray-300" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
                {stats.latest.name}
              </h4>
              <p className="text-xs text-emerald-600 font-semibold font-sans mt-0.5">
                {formatPrice(stats.latest.price)}
              </p>
              {stats.latest.whatsapp_number && (
                <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                  <Phone className="w-2.5 h-2.5" /> {stats.latest.whatsapp_number}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-12 border border-dashed border-gray-200 rounded-lg bg-gray-50 text-xs text-gray-400">
            No products added yet
          </div>
        )}
      </div>
    </div>
  );
}
