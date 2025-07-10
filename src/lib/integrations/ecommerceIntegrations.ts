import { IntegrationNode } from '@/types/integrations';
import { ShoppingBag, Package, CreditCard, Truck, DollarSign, Users, BarChart, Tag, Zap, Database } from 'lucide-react';

// Shopify Integrations
export const shopifyCreateProduct: IntegrationNode = {
  id: 'shopify_create_product',
  name: 'Create Product',
  description: 'Create a new product in Shopify store',
  category: 'productivity',
  icon: Package,
  color: '#96BF48',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'title', label: 'Product Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: false },
    { name: 'price', label: 'Price', type: 'number', required: true },
    { name: 'inventory', label: 'Inventory Count', type: 'number', required: false }
  ],
  endpoints: [],
  configSchema: {
    api_key: { type: 'password', label: 'Shopify API Key', required: true, placeholder: 'shpat_...' }
  }
};

export const shopifyUpdateInventory: IntegrationNode = {
  id: 'shopify_update_inventory',
  name: 'Update Inventory',
  description: 'Update product inventory levels',
  category: 'productivity',
  icon: Package,
  color: '#96BF48',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'product_id', label: 'Product ID', type: 'text', required: true },
    { name: 'quantity', label: 'New Quantity', type: 'number', required: true }
  ],
  endpoints: [],
  configSchema: {
    api_key: { type: 'password', label: 'Shopify API Key', required: true, placeholder: 'shpat_...' }
  }
};

export const shopifyNewOrder: IntegrationNode = {
  id: 'shopify_new_order',
  name: 'New Order',
  description: 'Triggered when a new order is placed',
  category: 'triggers',
  icon: ShoppingBag,
  color: '#96BF48',
  requiresAuth: true,
  authType: 'api_key',
  type: 'trigger',
  fields: [],
  endpoints: [],
  configSchema: {
    api_key: { type: 'password', label: 'Shopify API Key', required: true, placeholder: 'shpat_...' }
  }
};

// WooCommerce Integrations
export const wooCommerceCreateProduct: IntegrationNode = {
  id: 'woocommerce_create_product',
  name: 'Create Product',
  description: 'Create a new product in WooCommerce',
  category: 'productivity',
  icon: Package,
  color: '#96588A',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'name', label: 'Product Name', type: 'text', required: true },
    { name: 'regular_price', label: 'Price', type: 'number', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: false }
  ],
  endpoints: [],
  configSchema: {
    consumer_key: { type: 'text', label: 'Consumer Key', required: true },
    consumer_secret: { type: 'password', label: 'Consumer Secret', required: true },
    store_url: { type: 'text', label: 'Store URL', required: true, placeholder: 'https://yourstore.com' }
  }
};

export const wooCommerceNewOrder: IntegrationNode = {
  id: 'woocommerce_new_order',
  name: 'New Order',
  description: 'Triggered when a new order is received',
  category: 'triggers',
  icon: ShoppingBag,
  color: '#96588A',
  requiresAuth: true,
  authType: 'api_key',
  type: 'trigger',
  fields: [],
  endpoints: [],
  configSchema: {
    consumer_key: { type: 'text', label: 'Consumer Key', required: true },
    consumer_secret: { type: 'password', label: 'Consumer Secret', required: true }
  }
};

// Magento Integrations
export const magentoCreateProduct: IntegrationNode = {
  id: 'magento_create_product',
  name: 'Create Product',
  description: 'Create a new product in Magento',
  category: 'productivity',
  icon: Package,
  color: '#EC6737',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'sku', label: 'SKU', type: 'text', required: true },
    { name: 'name', label: 'Product Name', type: 'text', required: true },
    { name: 'price', label: 'Price', type: 'number', required: true }
  ],
  endpoints: [],
  configSchema: {
    access_token: { type: 'password', label: 'Access Token', required: true },
    base_url: { type: 'text', label: 'Magento Base URL', required: true }
  }
};

// BigCommerce Integrations
export const bigCommerceCreateProduct: IntegrationNode = {
  id: 'bigcommerce_create_product',
  name: 'Create Product',
  description: 'Create a new product in BigCommerce',
  category: 'productivity',
  icon: Package,
  color: '#121118',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'name', label: 'Product Name', type: 'text', required: true },
    { name: 'price', label: 'Price', type: 'number', required: true },
    { name: 'weight', label: 'Weight', type: 'number', required: false }
  ],
  endpoints: [],
  configSchema: {
    access_token: { type: 'password', label: 'Access Token', required: true },
    store_hash: { type: 'text', label: 'Store Hash', required: true }
  }
};

// Amazon Seller Central
export const amazonCreateListing: IntegrationNode = {
  id: 'amazon_create_listing',
  name: 'Create Product Listing',
  description: 'Create a new product listing on Amazon',
  category: 'productivity',
  icon: Package,
  color: '#FF9900',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'asin', label: 'ASIN', type: 'text', required: true },
    { name: 'title', label: 'Product Title', type: 'text', required: true },
    { name: 'price', label: 'Price', type: 'number', required: true }
  ],
  endpoints: [],
  configSchema: {
    access_key: { type: 'text', label: 'Access Key ID', required: true },
    secret_key: { type: 'password', label: 'Secret Access Key', required: true },
    marketplace_id: { type: 'text', label: 'Marketplace ID', required: true }
  }
};

// eBay Integrations
export const ebayCreateListing: IntegrationNode = {
  id: 'ebay_create_listing',
  name: 'Create Listing',
  description: 'Create a new listing on eBay',
  category: 'productivity',
  icon: Package,
  color: '#E53238',
  requiresAuth: true,
  authType: 'oauth',
  type: 'action',
  fields: [
    { name: 'title', label: 'Item Title', type: 'text', required: true },
    { name: 'category_id', label: 'Category ID', type: 'text', required: true },
    { name: 'start_price', label: 'Starting Price', type: 'number', required: true }
  ],
  endpoints: [],
  configSchema: {
    app_id: { type: 'text', label: 'Application ID', required: true },
    cert_id: { type: 'password', label: 'Certificate ID', required: true }
  }
};

// Etsy Integrations
export const etsyCreateListing: IntegrationNode = {
  id: 'etsy_create_listing',
  name: 'Create Listing',
  description: 'Create a new product listing on Etsy',
  category: 'productivity',
  icon: Package,
  color: '#F56500',
  requiresAuth: true,
  authType: 'oauth',
  type: 'action',
  fields: [
    { name: 'title', label: 'Listing Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'price', label: 'Price', type: 'number', required: true },
    { name: 'quantity', label: 'Quantity', type: 'number', required: true }
  ],
  endpoints: [],
  configSchema: {
    api_key: { type: 'password', label: 'API Key', required: true },
    shared_secret: { type: 'password', label: 'Shared Secret', required: true }
  }
};

// Square Integrations
export const squareCreateItem: IntegrationNode = {
  id: 'square_create_item',
  name: 'Create Catalog Item',
  description: 'Create a new catalog item in Square',
  category: 'productivity',
  icon: Package,
  color: '#3E4348',
  requiresAuth: true,
  authType: 'api_key',
  type: 'action',
  fields: [
    { name: 'name', label: 'Item Name', type: 'text', required: true },
    { name: 'base_price', label: 'Base Price', type: 'number', required: true }
  ],
  endpoints: [],
  configSchema: {
    access_token: { type: 'password', label: 'Access Token', required: true },
    application_id: { type: 'text', label: 'Application ID', required: true }
  }
};

// Inventory Management
export const inventoryLowStock: IntegrationNode = {
  id: 'inventory_low_stock',
  name: 'Low Stock Alert',
  description: 'Triggered when inventory falls below threshold',
  category: 'triggers',
  icon: Package,
  color: '#DC2626',
  requiresAuth: false,
  type: 'trigger',
  fields: [
    { name: 'threshold', label: 'Stock Threshold', type: 'number', required: true }
  ],
  endpoints: [],
  configSchema: {}
};

export const priceMonitor: IntegrationNode = {
  id: 'price_monitor',
  name: 'Price Monitor',
  description: 'Monitor competitor prices and trigger alerts',
  category: 'triggers',
  icon: DollarSign,
  color: '#059669',
  requiresAuth: false,
  type: 'trigger',
  fields: [
    { name: 'product_url', label: 'Product URL', type: 'text', required: true },
    { name: 'target_price', label: 'Target Price', type: 'number', required: true }
  ],
  endpoints: [],
  configSchema: {}
};