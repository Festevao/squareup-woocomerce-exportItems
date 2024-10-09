export interface WooCommerceProduct {
  name: string;
  type?: 'simple' | 'grouped' | 'external' | 'variable';
  description?: string;
  price: string;
  short_description?: string;
  sku?: string;
  regular_price?: string;
  sale_price?: string;
  date_on_sale_from?: string;
  date_on_sale_to?: string;
  virtual?: boolean;
  downloadable?: boolean;
  downloads?: { id: string; name: string; file: string }[];
  categories?: { id: number }[];
  tags?: { id: number }[];
  images?: { src: string; name: string, alt: string, id?: number }[];
  attributes?: {
    id?: number;
    name?: string;
    options?: string[];
    visible?: boolean;
    variation?: boolean;
  }[];
  variations?: ProductVariation[];
  default_attributes?: { id?: number; name: string; option: string }[];
  stock_status?: 'instock' | 'outofstock' | 'onbackorder';
  manage_stock?: boolean;
  stock_quantity?: number;
  sold_individually?: boolean;
  weight?: string;
  dimensions?: { length: string; width: string; height: string };
  shipping_class?: string;
  reviews_allowed?: boolean;
  upsell_ids?: number[];
  cross_sell_ids?: number[];
  parent_id?: number;
  purchase_note?: string;
  menu_order?: number;
  status?: 'draft' | 'pending' | 'private' | 'publish';
};

export interface ProductVariation {
  regular_price: string;
  price: string;
  sale_price: string;
  description: string;
  on_sale: boolean;
  purchasable: boolean;
  stock_quantity: number;
  attributes: {
    id: number;
    name: string;
    option: string;
  }[];
}