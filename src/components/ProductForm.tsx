import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Package, Smartphone, MessageSquare, Save, X, Eye } from 'lucide-react';
import { Product } from '../types';
import { ImageUploader } from './ImageUploader';

const phoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;

const productSchema = z.object({
  name: z.string().min(1, 'Product Name is required'),
  description: z.string(),
  price: z.number().positive('Price must be a positive number'),
  whatsapp_number: z
    .string()
    .min(1, 'WhatsApp Number is required')
    .refine((val) => {
      // Basic sanitize (strip non-digits)
      const digits = val.replace(/\D/g, '');
      return digits.length >= 10 && digits.length <= 15;
    }, 'Invalid phone number format. Must be a valid phone/WhatsApp number.'),
  status: z.union([z.literal('active'), z.literal('inactive')]),
  images: z.array(z.string()).min(1, 'At least one product image is required'),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product | null; // null for Create Mode
  onSubmit: (data: ProductFormValues) => void;
  onCancel: () => void;
  onPreview?: (data: ProductFormValues) => void;
}

export function ProductForm({ product, onSubmit, onCancel, onPreview }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      whatsapp_number: '',
      status: 'active',
      images: [],
    },
  });

  // If editing, load the product data
  useEffect(() => {
    if (product) {
      setValue('name', product.name);
      setValue('description', product.description || '');
      setValue('price', product.price);
      setValue('whatsapp_number', product.whatsapp_number);
      setValue(
        'status',
        product.status === true || product.status === 'active' ? 'active' : 'inactive'
      );
      setValue('images', product.images || []);
    }
  }, [product, setValue]);

  const currentImages = watch('images');
  const formValues = watch();

  const handleFormSubmit = (data: ProductFormValues) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-150 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            {product ? 'Edit Product Catalog' : 'Add New Product'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {product ? `Modifying properties for: ${product.name}` : 'Publish a new mobile handset to your public showcase.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onPreview && (
            <button
              type="button"
              onClick={() => onPreview(formValues as any)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 text-xs font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" /> Preview Display
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 text-xs font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" /> {isSubmitting ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core details column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-5">
            {/* Handset Name */}
            <div>
              <label htmlFor="product-name" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Product Name / Model
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="product-name"
                  placeholder="e.g. iPhone 15 Pro Max, Samsung S24 Ultra"
                  {...register('name')}
                  className={`block w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow ${
                    errors.name ? 'border-red-500' : 'border-gray-250'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="product-desc" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Handset Specifications & Description
              </label>
              <textarea
                id="product-desc"
                rows={5}
                placeholder="Details about memory, camera, battery, warranty, or device physical condition..."
                {...register('description')}
                className="block w-full p-3 border border-gray-250 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
              />
            </div>
          </div>

          {/* Media uploader box */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
            <Controller
              name="images"
              control={control}
              render={({ field }) => (
                <ImageUploader images={field.value} onChangeImages={field.onChange} />
              )}
            />
            {errors.images && (
              <p className="text-xs text-red-500 mt-2 font-medium">{errors.images.message}</p>
            )}
          </div>
        </div>

        {/* Status, Pricing and Sales meta column */}
        <div className="space-y-6">
          {/* Action sidecard */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-5">
            {/* BDT Price */}
            <div>
              <label htmlFor="product-price" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Price (BDT ৳)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 font-bold font-mono">
                  ৳
                </div>
                <input
                  type="number"
                  id="product-price"
                  placeholder="0"
                  {...register('price', { valueAsNumber: true })}
                  className={`block w-full pl-8 pr-3 py-2 border rounded-lg text-sm bg-white text-gray-900 font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow ${
                    errors.price ? 'border-red-500' : 'border-gray-250'
                  }`}
                />
              </div>
              {errors.price && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.price.message}</p>
              )}
            </div>

            {/* WhatsApp Contact */}
            <div>
              <label htmlFor="product-whatsapp" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                WhatsApp Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <MessageSquare className="w-4 h-4 text-[#25D366]" />
                </div>
                <input
                  type="text"
                  id="product-whatsapp"
                  placeholder="e.g. 01700000000"
                  {...register('whatsapp_number')}
                  className={`block w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-white text-gray-900 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow ${
                    errors.whatsapp_number ? 'border-red-500' : 'border-gray-250'
                  }`}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Must include country code or start with 01X. Used for order redirect.
              </p>
              {errors.whatsapp_number && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">
                  {errors.whatsapp_number.message}
                </p>
              )}
            </div>

            {/* Status toggle switch */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Product Status
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <div className="flex border border-gray-200 rounded-lg p-0.5 bg-gray-50">
                    <button
                      type="button"
                      onClick={() => field.onChange('active')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        field.value === 'active'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Active (Visible)
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange('inactive')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        field.value === 'inactive'
                          ? 'bg-gray-200 text-gray-850 shadow-xs'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Inactive (Hidden)
                    </button>
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
