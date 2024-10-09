import { readExcelFile } from './src/sheet';
import { crawlStore } from './src/crawllerStore';
import { formatDescription, addProductToWooCommerce, addVaraintToProduct } from './src/woocommerce';
import { uploadImageFromURL } from './src/productImageHandler';
import { WooCommerceProduct } from 'types/wooCommerceProduct';

readExcelFile(process.env.SHEET_PATH, async (products, options) => {
  const squareupImagesUrl = await crawlStore();

  const startIn = 15;
  const maxIteration = 15;
  let iteration = 0;
  
  while (products.length > 0) {
    const currentProduct = products[0];
    const currentItemName = currentProduct.itemName.toLowerCase();
    
    const sameItemProducts = products.filter(product => product.itemName.toLowerCase() === currentItemName);

    products = products.filter(product => product.itemName.toLowerCase() !== currentItemName);

    if (startIn > iteration) {
      iteration++;
      continue;
    }

    if (maxIteration < iteration) {
      break;
    }

    let newProduct: WooCommerceProduct = {
      name: sameItemProducts[0].itemName,
      type: 'variable',
      sale_price: sameItemProducts.reduce((min, product) => { return product.price < min ? product.price : min }, Infinity).toFixed(2),
      price: sameItemProducts.reduce((min, product) => { return product.price < min ? product.price : min }, Infinity).toFixed(2),
      regular_price: sameItemProducts.reduce((min, product) => { return product.price < min ? product.price : min }, Infinity).toFixed(2),
      description: formatDescription(sameItemProducts.find((product) => product.description).description ?? ""),
      attributes: sameItemProducts.reduce((acc, repeatProduct) => {
        if (!acc.some((accItem) => accItem.name === repeatProduct.optionName1)) {
          const accNextId = acc.length === 0 ? 1 : Math.max(...acc.map(item => item.id)) + 1;
          acc.push({
            id: accNextId,
            name: repeatProduct.optionName1,
            options: options.find((option) => option.name === repeatProduct.optionName1)?.options ?? [],
            visible: true,
            variation: true,
          })
        }
        if (!acc.some((accItem) => accItem.name === repeatProduct.optionName2)) {
          const accNextId = acc.length === 0 ? 1 : Math.max(...acc.map(item => item.id)) + 1;
          acc.push({
            id: accNextId,
            name: repeatProduct.optionName2,
            options: options.find((option) => option.name === repeatProduct.optionName2)?.options ?? [],
            visible: true,
            variation: true,
          })
        }

        return acc;
      }, [] as { id: number; name: string; options: string[]; visible: boolean; variation: boolean; }[]),
      variations: sameItemProducts.map((product) => {
        const stock = product.currentQuantityBeyondParadiseShop + product.currentQuantityMindfulImageriesGallery;
        return {
          regular_price: product.price.toFixed(2),
          price: product.price.toFixed(2),
          sale_price: product.price.toFixed(2),
          description: formatDescription(sameItemProducts.find((product) => product.description).description ?? ""),
          on_sale: true,
          purchasable: true,
          stock_quantity: !stock || isNaN(stock) || typeof stock !== 'number' ? 0 : stock,
          attributes: [
            product.optionName1
              ? {
                  id: 1,
                  name: product.optionName1,
                  option: product.optionValue1,
                }
              : {} as { id: number; name: string; option: string; },
            product.optionName2
              ? {
                  id: 2,
                  name: product.optionName2,
                  option: product.optionValue2,
                }
              : {} as { id: number; name: string; option: string; },
          ],
        };
      })
    }

    
    const squareupImages = squareupImagesUrl.find(info => info.itemName.toLowerCase() === sameItemProducts[0].itemName.toLowerCase())?.images ?? [];
    let wordpressImages: string[] = [];
    
    if (squareupImages.length > 0) {
      wordpressImages = await Promise.all(squareupImages.map(async (imageURL) => {
        return await uploadImageFromURL(imageURL);
      }));
      newProduct.images = wordpressImages.map((url, index) => {
        return {
          name: newProduct.name + "_image",
          src: url,
          alt: newProduct.name + "_image",
        }
      })
    }

    console.log("iteration:", iteration);
    
    const productId = await addProductToWooCommerce(newProduct);

    console.log("productId:", productId);

    for(const productVariant of newProduct.variations) {
      await addVaraintToProduct(productId, productVariant);
    }

    iteration++;
  }
})
  .then(() => {
    console.log('Success');
  })
  .catch((e) => {
    console.error(e);
  });
