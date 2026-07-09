import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ColumnMapping, Product } from '../types';

let supabaseInstance: SupabaseClient | null = null;

export const supabaseConfig = {
  url: ((import.meta as any).env?.VITE_SUPABASE_URL as string) || '',
  anonKey: ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || '',
};

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseConfig.url && supabaseConfig.anonKey);
}

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase URL and Anon Key are not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your AI Studio project Settings.'
    );
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return supabaseInstance;
}

// Default Column Mappings
export const DEFAULT_COLUMN_MAPPING: ColumnMapping = {
  id: 'id',
  name: 'name',
  description: 'description',
  price: 'price',
  whatsapp_number: 'whatsapp_number',
  status: 'status',
  images: 'images',
};

/**
 * Automatically inspects a product record and returns a ColumnMapping matching the columns.
 */
export function autoDetectColumns(sampleRecord: Record<string, any>): ColumnMapping {
  const mapping = { ...DEFAULT_COLUMN_MAPPING };
  if (!sampleRecord) return mapping;

  const keys = Object.keys(sampleRecord);

  // Check ID
  if (keys.includes('id')) mapping.id = 'id';

  // Check Name
  if (keys.includes('name')) mapping.name = 'name';
  else if (keys.includes('title')) mapping.name = 'title';
  else if (keys.includes('product_name')) mapping.name = 'product_name';

  // Check Description
  if (keys.includes('description')) mapping.description = 'description';
  else if (keys.includes('desc')) mapping.description = 'desc';
  else if (keys.includes('details')) mapping.description = 'details';

  // Check Price
  if (keys.includes('price')) mapping.price = 'price';
  else if (keys.includes('price_bdt')) mapping.price = 'price_bdt';
  else if (keys.includes('amount')) mapping.price = 'amount';

  // Check WhatsApp
  if (keys.includes('whatsapp_number')) mapping.whatsapp_number = 'whatsapp_number';
  else if (keys.includes('whatsapp')) mapping.whatsapp_number = 'whatsapp';
  else if (keys.includes('whatsapp_no')) mapping.whatsapp_number = 'whatsapp_no';
  else if (keys.includes('phone')) mapping.whatsapp_number = 'phone';

  // Check Status
  if (keys.includes('status')) mapping.status = 'status';
  else if (keys.includes('active')) mapping.status = 'active';
  else if (keys.includes('is_active')) mapping.status = 'is_active';

  // Check Images
  if (keys.includes('images')) mapping.images = 'images';
  else if (keys.includes('image_urls')) mapping.images = 'image_urls';
  else if (keys.includes('image_url')) mapping.images = 'image_url';
  else if (keys.includes('image')) mapping.images = 'image';

  return mapping;
}

/**
 * Formats a raw Supabase database row into our application's standard Product type using the column mapping.
 */
export function formatRowToProduct(row: Record<string, any>, mapping: ColumnMapping): Product {
  // Parse images. Could be JSON array, postgres text array, comma-separated string, or single string.
  let images: string[] = [];
  const rawImages = row[mapping.images];
  if (Array.isArray(rawImages)) {
    images = rawImages;
  } else if (typeof rawImages === 'string') {
    if (rawImages.startsWith('[') && rawImages.endsWith(']')) {
      try {
        images = JSON.parse(rawImages);
      } catch {
        images = [rawImages];
      }
    } else if (rawImages.includes(',')) {
      images = rawImages.split(',').map((u) => u.trim());
    } else if (rawImages) {
      images = [rawImages];
    }
  }

  // Parse status. Could be boolean or text ('active' | 'inactive')
  let status: 'active' | 'inactive' = 'inactive';
  const rawStatus = row[mapping.status];
  if (typeof rawStatus === 'boolean') {
    status = rawStatus ? 'active' : 'inactive';
  } else if (typeof rawStatus === 'string') {
    const s = rawStatus.toLowerCase();
    status = s === 'active' || s === 'true' || s === 'yes' ? 'active' : 'inactive';
  }

  return {
    id: row[mapping.id],
    name: row[mapping.name] || '',
    description: row[mapping.description] || '',
    price: Number(row[mapping.price]) || 0,
    whatsapp_number: row[mapping.whatsapp_number] || '',
    status,
    images,
    created_at: row.created_at || row.created_date,
    ...row, // preserve original fields
  };
}

/**
 * Formats our standard Product type back into a raw Supabase database row using the column mapping.
 */
export function formatProductToRow(product: Partial<Product>, mapping: ColumnMapping, existingRowSchema?: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};

  if (product.id !== undefined) {
    row[mapping.id] = product.id;
  }

  row[mapping.name] = product.name;
  row[mapping.description] = product.description;
  row[mapping.price] = product.price;
  row[mapping.whatsapp_number] = product.whatsapp_number;

  // Handle status column. Let's see if the existing status is boolean or string.
  const schemaTypeIsBoolean = existingRowSchema && typeof existingRowSchema[mapping.status] === 'boolean';
  if (schemaTypeIsBoolean) {
    row[mapping.status] = product.status === 'active';
  } else {
    row[mapping.status] = product.status;
  }

  // Handle images. Let's see if the existing images column is an array or string.
  const schemaTypeIsString = existingRowSchema && typeof existingRowSchema[mapping.images] === 'string';
  if (schemaTypeIsString) {
    row[mapping.images] = product.images && product.images.length > 0 ? product.images[0] : '';
  } else {
    row[mapping.images] = product.images || [];
  }

  return row;
}
