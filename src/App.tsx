import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Smartphone,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { getSupabase, isSupabaseConfigured, formatRowToProduct, formatProductToRow, DEFAULT_COLUMN_MAPPING } from './lib/supabase';
import { ColumnMapping, Product, FilterOptions, DashboardStats } from './types';
import { LoadingSpinner, LoadingCards, LoadingTable } from './components/Loading';
import { EmptyState } from './components/EmptyState';
import { DashboardCards } from './components/DashboardCards';
import { SearchBar } from './components/SearchBar';
import { ProductTable } from './components/ProductTable';
import { ProductForm } from './components/ProductForm';
import { DeleteModal } from './components/DeleteModal';
import { PreviewModal } from './components/PreviewModal';
import { Login } from './components/Login';
import { Settings } from './components/Settings';

export default function App() {
  // Session State
  const [session, setSession] = useState<any>(null);
  const [isDemoMode, setIsDemoMode] = useState(() => localStorage.getItem('supabase_showcase_demo') === 'true');
  const [authChecking, setAuthChecking] = useState(true);

  const setDemoModeWithStorage = (val: boolean) => {
    setIsDemoMode(val);
    if (val) {
      localStorage.setItem('supabase_showcase_demo', 'true');
    } else {
      localStorage.removeItem('supabase_showcase_demo');
    }
  };

  // Layout & Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'add-product' | 'settings'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Products and Columns State
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>(() => {
    const saved = localStorage.getItem('supabase_showcase_col_mapping');
    return saved ? JSON.parse(saved) : { ...DEFAULT_COLUMN_MAPPING };
  });

  // Filters State
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    sort: 'newest',
    status: 'all',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  // Modal target selections
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Monitor Supabase Authentication
  useEffect(() => {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        supabase.auth.getSession().then(({ data: { session: activeSession } }) => {
          setSession(activeSession);
          setAuthChecking(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
          setSession(newSession);
        });

        return () => subscription.unsubscribe();
      } catch (err) {
        console.warn('Auth monitoring failed:', err);
        setAuthChecking(false);
      }
    } else {
      setAuthChecking(false);
    }
  }, []);

  // Fetch Products from Database
  useEffect(() => {
    if (isDemoMode || (isSupabaseConfigured() && session)) {
      fetchProducts();
    }
  }, [session, isDemoMode, columnMapping]);

  const fetchProducts = async () => {
    setLoading(true);
    setErrorState(null);

    if (isDemoMode) {
      try {
        const demoStored = localStorage.getItem('supabase_showcase_demo_products');
        if (demoStored) {
          const parsed = JSON.parse(demoStored);
          setRawRows(parsed);
          setProducts(parsed);
        } else {
          // Seed initial products
          const initialDemoProducts: Product[] = [
            {
              id: 'demo-1',
              name: 'iPhone 15 Pro Max',
              description: 'Brand new Apple iPhone 15 Pro Max in Natural Titanium. 256GB storage, 100% battery health, fully unlocked. Comes with box and original Apple USB-C cable.',
              price: 135000,
              whatsapp_number: '+8801712345678',
              status: 'active',
              images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80'],
              created_at: new Date().toISOString()
            },
            {
              id: 'demo-2',
              name: 'Samsung Galaxy S24 Ultra',
              description: 'Samsung Galaxy S24 Ultra, Titanium Gray, 12GB RAM, 512GB Storage. 100x Space Zoom camera, includes S-Pen. Pristine condition with 1 year official warranty.',
              price: 125000,
              whatsapp_number: '+8801812345678',
              status: 'active',
              images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80'],
              created_at: new Date(Date.now() - 86400000).toISOString()
            },
            {
              id: 'demo-3',
              name: 'Google Pixel 8 Pro',
              description: 'Google Pixel 8 Pro, Obsidian Black, 128GB. Magic Eraser, Best Take camera features. Smooth 120Hz display, clean stock Android experience. Used for 2 months, look like new.',
              price: 85000,
              whatsapp_number: '+8801912345678',
              status: 'active',
              images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80'],
              created_at: new Date(Date.now() - 172800000).toISOString()
            }
          ];
          localStorage.setItem('supabase_showcase_demo_products', JSON.stringify(initialDemoProducts));
          setRawRows(initialDemoProducts);
          setProducts(initialDemoProducts);
        }
      } catch (err: any) {
        console.error('Demo fetch products error:', err);
        setErrorState('Unable to load offline demo products.');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) throw error;

      if (data) {
        setRawRows(data);
        const formatted = data.map((row) => formatRowToProduct(row, columnMapping));
        setProducts(formatted);
      }
    } catch (err: any) {
      console.error('Fetch products error:', err);
      setErrorState(err.message || 'Unable to load products. Check table mapping.');
    } finally {
      setLoading(false);
    }
  };

  // Sync mappings with localStorage
  const handleUpdateColumnMapping = (newMapping: ColumnMapping) => {
    setColumnMapping(newMapping);
    localStorage.setItem('supabase_showcase_col_mapping', JSON.stringify(newMapping));
  };

  // Apply filters and sorting client-side
  const getFilteredProducts = () => {
    let result = [...products];

    // Search filter
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter((p) => p.status === filters.status);
    }

    // Sorting options
    if (filters.sort === 'newest') {
      result.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    } else if (filters.sort === 'oldest') {
      result.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateA - dateB;
      });
    } else if (filters.sort === 'price_low_high') {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'price_high_low') {
      result.sort((a, b) => b.price - a.price);
    } else if (filters.sort === 'alphabetical') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  };

  // Compute Dashboard Statistics
  const computeStats = (): DashboardStats => {
    const total = products.length;
    const active = products.filter((p) => p.status === 'active').length;
    const inactive = total - active;

    // Get latest added product
    let latest: Product | null = null;
    if (products.length > 0) {
      const sorted = [...products].sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
      latest = sorted[0];
    }

    return { total, active, inactive, latest };
  };

  // Logout Handler
  const handleLogout = async () => {
    if (isDemoMode) {
      setDemoModeWithStorage(false);
      setSession(null);
      toast.success('Signed out from demo preview.');
      return;
    }

    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
      toast.success('Signed out successfully.');
    } catch (err: any) {
      toast.error('Sign out error.');
    }
  };

  // CRUD actions: ADD / EDIT submit
  const handleProductSubmit = async (formData: any) => {
    try {
      if (isDemoMode) {
        const demoStored = localStorage.getItem('supabase_showcase_demo_products');
        let demoList: Product[] = demoStored ? JSON.parse(demoStored) : [];
        
        const formattedProduct: Product = {
          id: selectedProduct ? selectedProduct.id : `demo-${Date.now()}`,
          name: formData.name,
          description: formData.description || '',
          price: formData.price,
          whatsapp_number: formData.whatsapp_number,
          status: formData.status,
          images: formData.images,
          created_at: selectedProduct?.created_at || new Date().toISOString(),
        };

        if (selectedProduct) {
          demoList = demoList.map((p) => p.id === selectedProduct.id ? formattedProduct : p);
          toast.success('Product updated locally (Demo Mode)!');
        } else {
          demoList.unshift(formattedProduct);
          toast.success('Product added locally (Demo Mode)!');
        }

        localStorage.setItem('supabase_showcase_demo_products', JSON.stringify(demoList));
        fetchProducts();
        setSelectedProduct(null);
        setActiveTab('products');
        return;
      }

      const supabase = getSupabase();

      // Look up schema sample to decide boolean status / array storage type
      const sampleRow = rawRows.length > 0 ? rawRows[0] : null;

      // Format Product object
      const formattedProduct: Partial<Product> = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        whatsapp_number: formData.whatsapp_number,
        status: formData.status,
        images: formData.images,
      };

      if (selectedProduct) {
        // Edit mode
        formattedProduct.id = selectedProduct.id;
        const rowData = formatProductToRow(formattedProduct, columnMapping, sampleRow);

        const { error } = await supabase
          .from('products')
          .update(rowData)
          .eq(columnMapping.id, selectedProduct.id);

        if (error) throw error;
        toast.success('Product updated successfully!');
      } else {
        // Create mode
        const rowData = formatProductToRow(formattedProduct, columnMapping, sampleRow);

        // Delete ID property on insert to let database auto-generate primary key
        delete rowData[columnMapping.id];

        const { error } = await supabase
          .from('products')
          .insert(rowData);

        if (error) throw error;
        toast.success('Product added successfully!');
      }

      fetchProducts();
      setSelectedProduct(null);
      setActiveTab('products');
    } catch (err: any) {
      console.error('Save product error:', err);
      toast.error(err.message || 'Unable to save product. Check schema configuration.');
    }
  };

  // CRUD actions: DUPLICATE
  const handleDuplicateProduct = async (product: Product) => {
    try {
      if (isDemoMode) {
        const demoStored = localStorage.getItem('supabase_showcase_demo_products');
        let demoList: Product[] = demoStored ? JSON.parse(demoStored) : [];

        const duplicateProduct: Product = {
          id: `demo-${Date.now()}`,
          name: `${product.name} (Copy)`,
          description: product.description || '',
          price: product.price,
          whatsapp_number: product.whatsapp_number,
          status: 'inactive', // Default duplicate to inactive/draft
          images: product.images,
          created_at: new Date().toISOString(),
        };

        demoList.unshift(duplicateProduct);
        localStorage.setItem('supabase_showcase_demo_products', JSON.stringify(demoList));
        toast.success('Product duplicated locally as Draft!');
        fetchProducts();
        return;
      }

      const supabase = getSupabase();
      const sampleRow = rawRows.length > 0 ? rawRows[0] : null;

      const duplicateProduct: Partial<Product> = {
        name: `${product.name} (Copy)`,
        description: product.description,
        price: product.price,
        whatsapp_number: product.whatsapp_number,
        status: 'inactive', // Default duplicate to inactive/draft
        images: product.images,
      };

      const rowData = formatProductToRow(duplicateProduct, columnMapping, sampleRow);
      delete rowData[columnMapping.id];

      const { error } = await supabase
        .from('products')
        .insert(rowData);

      if (error) throw error;

      toast.success('Product duplicated as Draft!');
      fetchProducts();
    } catch (err: any) {
      console.error('Duplicate product error:', err);
      toast.error(err.message || 'Duplicate item failed.');
    }
  };

  // CRUD actions: DELETE
  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      if (isDemoMode) {
        const demoStored = localStorage.getItem('supabase_showcase_demo_products');
        let demoList: Product[] = demoStored ? JSON.parse(demoStored) : [];

        demoList = demoList.filter((p) => p.id !== selectedProduct.id);
        localStorage.setItem('supabase_showcase_demo_products', JSON.stringify(demoList));
        toast.success('Product removed locally.');
        setSelectedProduct(null);
        fetchProducts();
        return;
      }

      const supabase = getSupabase();

      // 1. Delete database record
      const { error } = await supabase
        .from('products')
        .delete()
        .eq(columnMapping.id, selectedProduct.id);

      if (error) throw error;

      // 2. Remove associated images from Supabase Storage bucket
      if (selectedProduct.images && selectedProduct.images.length > 0) {
        const filePathsShop = selectedProduct.images
          .filter((url) => url.includes('/storage/v1/object/public/Shop/'))
          .map((url) => {
            const parts = url.split('/Shop/');
            return parts.length > 1 ? decodeURIComponent(parts[1]) : '';
          })
          .filter(Boolean);

        const filePathsLegacy = selectedProduct.images
          .filter((url) => url.includes('/storage/v1/object/public/product-images/'))
          .map((url) => {
            const parts = url.split('/product-images/');
            return parts.length > 1 ? decodeURIComponent(parts[1]) : '';
          })
          .filter(Boolean);

        if (filePathsShop.length > 0) {
          await supabase.storage.from('Shop').remove(filePathsShop);
        }
        if (filePathsLegacy.length > 0) {
          await supabase.storage.from('product-images').remove(filePathsLegacy);
        }
      }

      toast.success('Product and media assets purged.');
      setSelectedProduct(null);
      fetchProducts();
    } catch (err: any) {
      console.error('Delete execution error:', err);
      toast.error(err.message || 'Unable to delete product.');
    }
  };

  // BULK ACTIONS: DELETE
  const handleBulkDelete = async (ids: (string | number)[]) => {
    try {
      if (isDemoMode) {
        const demoStored = localStorage.getItem('supabase_showcase_demo_products');
        let demoList: Product[] = demoStored ? JSON.parse(demoStored) : [];

        demoList = demoList.filter((p) => !ids.includes(p.id));
        localStorage.setItem('supabase_showcase_demo_products', JSON.stringify(demoList));
        toast.success('Bulk delete executed locally.');
        fetchProducts();
        return;
      }

      const supabase = getSupabase();

      // Find selected product images to purge
      const targetProducts = products.filter((p) => ids.includes(p.id));

      const { error } = await supabase
        .from('products')
        .delete()
        .in(columnMapping.id, ids);

      if (error) throw error;

      // Purge storage media for all deleted products
      const allMediaPathsShop: string[] = [];
      const allMediaPathsLegacy: string[] = [];
      targetProducts.forEach((p) => {
        if (p.images && p.images.length > 0) {
          p.images.forEach((url) => {
            if (url.includes('/storage/v1/object/public/Shop/')) {
              const parts = url.split('/Shop/');
              if (parts.length > 1) {
                allMediaPathsShop.push(decodeURIComponent(parts[1]));
              }
            } else if (url.includes('/storage/v1/object/public/product-images/')) {
              const parts = url.split('/product-images/');
              if (parts.length > 1) {
                allMediaPathsLegacy.push(decodeURIComponent(parts[1]));
              }
            }
          });
        }
      });

      if (allMediaPathsShop.length > 0) {
        await supabase.storage.from('Shop').remove(allMediaPathsShop);
      }
      if (allMediaPathsLegacy.length > 0) {
        await supabase.storage.from('product-images').remove(allMediaPathsLegacy);
      }

      toast.success('Bulk delete executed and assets purged.');
      fetchProducts();
    } catch (err: any) {
      console.error('Bulk delete error:', err);
      toast.error(err.message || 'Bulk delete failed.');
    }
  };

  // BULK ACTIONS: STATUS UPDATE
  const handleBulkUpdateStatus = async (ids: (string | number)[], status: 'active' | 'inactive') => {
    try {
      if (isDemoMode) {
        const demoStored = localStorage.getItem('supabase_showcase_demo_products');
        let demoList: Product[] = demoStored ? JSON.parse(demoStored) : [];

        demoList = demoList.map((p) => ids.includes(p.id) ? { ...p, status } : p);
        localStorage.setItem('supabase_showcase_demo_products', JSON.stringify(demoList));
        toast.success(`Bulk updated selected items to ${status} locally.`);
        fetchProducts();
        return;
      }

      const supabase = getSupabase();
      const sampleRow = rawRows.length > 0 ? rawRows[0] : null;

      // Check if status in database schema is boolean
      const statusIsBoolean = sampleRow && typeof sampleRow[columnMapping.status] === 'boolean';
      const dbStatusValue = statusIsBoolean ? status === 'active' : status;

      const { error } = await supabase
        .from('products')
        .update({ [columnMapping.status]: dbStatusValue })
        .in(columnMapping.id, ids);

      if (error) throw error;

      toast.success(`Bulk updated selected items to ${status}.`);
      fetchProducts();
    } catch (err: any) {
      console.error('Bulk status update error:', err);
      toast.error(err.message || 'Bulk update failed.');
    }
  };

  // Check if configuration exists
  const isConfigured = isSupabaseConfigured();

  // Route/Tab Render Helper
  const renderContent = () => {
    if (errorState && activeTab !== 'settings') {
      return (
        <EmptyState
          type="error"
          title="Products Sync Error"
          description={errorState}
          actionLabel="Open Database Settings"
          onAction={() => setActiveTab('settings')}
          secondaryActionLabel="Switch to Offline Demo Mode"
          onSecondaryAction={() => {
            setDemoModeWithStorage(true);
            setErrorState(null);
            toast.success('Switched to fully functional offline demo mode!');
          }}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {loading ? (
              <LoadingCards />
            ) : (
              <DashboardCards
                stats={computeStats()}
                onViewProduct={(p) => {
                  setSelectedProduct(p);
                  setIsPreviewOpen(true);
                }}
              />
            )}

            {/* Quick Actions & Recent Listings Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Products Listing */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Recent Products
                  </h3>
                  <button
                    onClick={() => setActiveTab('products')}
                    type="button"
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                {loading ? (
                  <LoadingTable />
                ) : products.length > 0 ? (
                  <ProductTable
                    products={products}
                    onView={(p) => {
                      setSelectedProduct(p);
                      setIsPreviewOpen(true);
                    }}
                    onEdit={(p) => {
                      setSelectedProduct(p);
                      setActiveTab('add-product');
                    }}
                    onDuplicate={handleDuplicateProduct}
                    onDelete={(p) => {
                      setSelectedProduct(p);
                      setIsDeleteOpen(true);
                    }}
                    onBulkDelete={handleBulkDelete}
                    onBulkUpdateStatus={handleBulkUpdateStatus}
                  />
                ) : (
                  <EmptyState
                    type="no-products"
                    actionLabel="Add Product"
                    onAction={() => setActiveTab('add-product')}
                  />
                )}
              </div>

              {/* Quick Actions and Help widget */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedProduct(null);
                        setActiveTab('add-product');
                      }}
                      type="button"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#1ebd53] text-white text-xs font-semibold rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" /> Add Product Listing
                    </button>
                    <button
                      onClick={() => setActiveTab('settings')}
                      type="button"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <SettingsIcon className="w-4 h-4 text-gray-400" /> Diagnose Database Schema
                    </button>
                  </div>
                </div>

                {/* Database Quick Guide card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-3 text-xs">
                  <h4 className="font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-[#25D366]" /> Product Table Specs
                  </h4>
                  <p className="text-gray-500 leading-relaxed">
                    This admin panel connects securely to your table named <code>products</code>.
                  </p>
                  <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-150 font-mono text-[10px] text-gray-600 space-y-1">
                    <div>• Name: VARCHAR (Text)</div>
                    <div>• Description: TEXT</div>
                    <div>• Price: NUMERIC / FLOAT</div>
                    <div>• WhatsApp: VARCHAR</div>
                    <div>• Status: TEXT / BOOLEAN</div>
                    <div>• Images: VARCHAR[] / JSONB</div>
                  </div>
                  <p className="text-[10px] text-gray-400 italic">
                    If columns differ, you can map them under settings in seconds!
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Products Catalog</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Manage listings, view status, price models, and WhatsApp redirects.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setActiveTab('add-product');
                }}
                type="button"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Add Product
              </button>
            </div>

            {/* Search, Filter & Sort */}
            <SearchBar filters={filters} onChangeFilters={setFilters} />

            {loading ? (
              <LoadingTable />
            ) : getFilteredProducts().length > 0 ? (
              <ProductTable
                products={getFilteredProducts()}
                onView={(p) => {
                  setSelectedProduct(p);
                  setIsPreviewOpen(true);
                }}
                onEdit={(p) => {
                  setSelectedProduct(p);
                  setActiveTab('add-product');
                }}
                onDuplicate={handleDuplicateProduct}
                onDelete={(p) => {
                  setSelectedProduct(p);
                  setIsDeleteOpen(true);
                }}
                onBulkDelete={handleBulkDelete}
                onBulkUpdateStatus={handleBulkUpdateStatus}
              />
            ) : (
              <EmptyState type="no-results" />
            )}
          </div>
        );

      case 'add-product':
        return (
          <div className="max-w-5xl mx-auto bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-xs">
            <ProductForm
              product={selectedProduct}
              onSubmit={handleProductSubmit}
              onCancel={() => {
                setSelectedProduct(null);
                setActiveTab('products');
              }}
              isDemo={isDemoMode}
              onPreview={(data) => {
                const mockupProduct: Product = {
                  id: selectedProduct?.id || 'NEW_TEMP',
                  name: data.name,
                  description: data.description || '',
                  price: data.price,
                  whatsapp_number: data.whatsapp_number,
                  status: data.status === 'active' ? 'active' : 'inactive',
                  images: data.images,
                };
                setSelectedProduct(mockupProduct);
                setIsPreviewOpen(true);
              }}
            />
          </div>
        );

      case 'settings':
        return (
          <div className="max-w-4xl mx-auto">
            <Settings
              userSession={session}
              columnMapping={columnMapping}
              onUpdateColumnMapping={handleUpdateColumnMapping}
              onLogout={handleLogout}
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Auth Protection Gate
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center space-y-3">
          <LoadingSpinner size="lg" />
          <p className="text-xs text-gray-500 font-semibold tracking-wide uppercase animate-pulse">
            Verifying Admin Session...
          </p>
        </div>
      </div>
    );
  }

  if (!session && !isDemoMode) {
    return (
      <>
        <Login
          onLoginSuccess={(activeSession) => setSession(activeSession)}
          onBypassDev={() => {
            setDemoModeWithStorage(true);
            toast.success('Bypassed to offline developer preview!');
          }}
        />
        <Toaster position="top-right" reverseOrder={false} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F8F9FA] font-sans text-gray-900 relative">
      <Toaster position="top-right" reverseOrder={false} />

      {/* ----------------- DESKTOP SIDEBAR ----------------- */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 p-5 shrink-0 justify-between h-screen sticky top-0">
        <div className="space-y-8">
          {/* Brand/Logo Header */}
          <div className="flex items-center gap-3.5 px-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-gray-950">Showcase Admin</h1>
              <span className="block text-[10px] text-[#25D366] font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                ● Live Database
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'products', label: 'Products', icon: <Package className="w-4 h-4" /> },
              { id: 'add-product', label: 'Add Product', icon: <PlusCircle className="w-4 h-4" /> },
              { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
            ].map((link) => {
              const active = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    if (link.id === 'add-product') {
                      setSelectedProduct(null);
                    }
                    setActiveTab(link.id as any);
                  }}
                  type="button"
                  id={`nav-link-${link.id}`}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-gray-950 text-white shadow-xs font-bold'
                      : 'text-gray-500 hover:text-gray-950 hover:bg-gray-50'
                  }`}
                >
                  {link.icon} {link.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer/Logout Admin section */}
        <div className="border-t border-gray-150 pt-5 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-center">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-gray-900 truncate">
                {isDemoMode ? 'Demo Administrator' : session?.user?.email?.split('@')[0] || 'Admin User'}
              </span>
              <span className="block text-[10px] text-gray-400 truncate">
                {isDemoMode ? 'Preview bypass mode' : session?.user?.email}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-left transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-400" /> Logout
          </button>
        </div>
      </aside>

      {/* ----------------- MOBILE DRAWER / SIDEBAR ----------------- */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white p-5 h-full animate-fade-in justify-between">
            {/* Drawer Close button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-50 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-8 mt-4">
              {/* Brand Header */}
              <div className="flex items-center gap-3.5 px-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-sm font-bold tracking-tight text-gray-950">Showcase Admin</h1>
                  <span className="block text-[10px] text-[#25D366] font-bold uppercase tracking-wider">
                    ● Live Database
                  </span>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
                  { id: 'products', label: 'Products', icon: <Package className="w-4 h-4" /> },
                  { id: 'add-product', label: 'Add Product', icon: <PlusCircle className="w-4 h-4" /> },
                  { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
                ].map((link) => {
                  const active = activeTab === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => {
                        if (link.id === 'add-product') {
                          setSelectedProduct(null);
                        }
                        setActiveTab(link.id as any);
                        setMobileMenuOpen(false);
                      }}
                      type="button"
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg text-left transition-all cursor-pointer ${
                        active
                          ? 'bg-gray-950 text-white shadow-xs font-bold'
                          : 'text-gray-500 hover:text-gray-950 hover:bg-gray-50'
                      }`}
                    >
                      {link.icon} {link.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Admin profile / logout */}
            <div className="border-t border-gray-150 pt-5 space-y-4">
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-center">
                  AD
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-gray-900 truncate">
                    {isDemoMode ? 'Demo Administrator' : session?.user?.email?.split('@')[0] || 'Admin User'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                type="button"
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-left transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-400" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TOP RAIL & MAIN CONTENT AREA ----------------- */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4">
            {/* Hamburger menu for mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              type="button"
              id="mobile-drawer-btn"
              className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-gray-950 cursor-pointer lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Header Path title */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="font-semibold text-gray-400">Admin Console</span>
              <span>/</span>
              <span className="font-bold text-gray-900 capitalize tracking-wide">{activeTab.replace('-', ' ')}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Status light */}
            {!isConfigured && (
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-100 rounded-full animate-pulse">
                <ShieldAlert className="w-3 h-3" /> Credentials Missing
              </span>
            )}
            {isDemoMode && (
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-150 rounded-full">
                Demo Environment
              </span>
            )}
            <button
              onClick={() => {
                setSelectedProduct(null);
                setActiveTab('add-product');
              }}
              type="button"
              id="top-quick-add-btn"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-950 hover:bg-gray-900 text-white text-xs font-semibold rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Quick Add
            </button>
          </div>
        </header>

        {/* Content workspace container */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto pb-16">
          {!isConfigured && activeTab !== 'settings' ? (
            <EmptyState type="config" />
          ) : (
            renderContent()
          )}
        </main>
      </div>

      {/* ----------------- GLOBAL MODALS ----------------- */}
      {/* Product Public Showcase Preview Modal */}
      <PreviewModal
        product={selectedProduct}
        isOpen={isPreviewOpen}
        onClose={() => {
          setSelectedProduct(null);
          setIsPreviewOpen(false);
        }}
      />

      {/* Database Record Purge Modal */}
      <DeleteModal
        product={selectedProduct}
        isOpen={isDeleteOpen}
        onClose={() => {
          setSelectedProduct(null);
          setIsDeleteOpen(false);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
