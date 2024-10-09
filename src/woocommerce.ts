import * as dotenv from 'dotenv';
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { ProductVariation, WooCommerceProduct } from 'types/wooCommerceProduct';

dotenv.config();

export const formatDescription = (input: string): string => {
  let formattedText = input
    .replace(/<\/p><p>/g, "\n")
    .replace(/<\/?p>/g, "")
    .replace(/<br\/?>/g, "\n")
    // .replace(/<\/?a[^>]*>/g, "");

  return formattedText.trim().replaceAll('\\n', '\n');
}

const WooCommerce = new WooCommerceRestApi({
  url: process.env.WP_URL,
  consumerKey: process.env.WOOCOMMERCE_KEY,
  consumerSecret: process.env.WOOCOMMERCE_SECRET,
  version: "wc/v3",
});

export const addProductToWooCommerce = async (productData: WooCommerceProduct) => {
  try {
    const response = await WooCommerce.post('products', productData);
    return response.data.id;
  } catch (error) {
    console.error('Erro ao adicionar o produto:', error.response.data);
    return null;
  }
};

export const addVaraintToProduct = async (productId: number, variantData: ProductVariation) => {
  try {
    await WooCommerce.post(`products/${productId}/variations`, variantData);
  } catch (error) {
    console.error('Erro ao adicionar variante:', error.response.data);
  }
};