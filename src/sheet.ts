import * as dotenv from 'dotenv';
import * as XLSX from 'xlsx';
import { Product } from 'types/squareupSheetLine';

dotenv.config();

export const readExcelFile = async (filePath: string, callback: (products: Product[], options: { name: string, options: string[] }[]) => (void | Promise<void>)): Promise<void> =>{
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  const [products, optionsMap] = rawData.slice(1).reduce<[Product[], Map<string, Set<string>>]>((acc, row, index) => {
    const [products, optionsMap] = acc;

    const product: Product = {
      referenceHandle: row[0],
      token: row[1],
      itemName: row[2],
      variationName: row[3],
      unitAndPrecision: row[4],
      sku: row[5],
      description: row[6],
      reportingCategory: row[7],
      seoTitle: row[8],
      seoDescription: row[9],
      permalink: row[10],
      gtin: row[11],
      squareOnlineItemVisibility: row[12],
      itemType: row[13],
      weight: row[14],
      socialMediaLinkTitle: row[15],
      socialMediaLinkDescription: row[16],
      shippingEnabled: row[17],
      selfServeOrderingEnabled: row[18],
      deliveryEnabled: row[19],
      pickupEnabled: row[20],
      price: row[21],
      onlineSalePrice: row[22],
      sellable: row[23],
      stockable: row[24],
      skipDetailScreenInPOS: row[25],
      optionName1: row[26],
      optionValue1: row[27],
      optionName2: row[28],
      optionValue2: row[29],
      enabledBeyondParadiseShop: row[30],
      currentQuantityBeyondParadiseShop: row[31],
      newQuantityBeyondParadiseShop: row[32],
      stockAlertEnabledBeyondParadiseShop: row[33],
      stockAlertCountBeyondParadiseShop: row[34],
      priceBeyondParadiseShop: row[35],
      enabledMindfulImageriesGallery: row[36],
      currentQuantityMindfulImageriesGallery: row[37],
      newQuantityMindfulImageriesGallery: row[38],
      stockAlertEnabledMindfulImageriesGallery: row[39],
      stockAlertCountMindfulImageriesGallery: row[40],
      priceMindfulImageriesGallery: row[41],
    };

    products.push(product);

    const addOption = (optionName: string, optionValue: string) => {
      if (optionName && optionValue) {
        if (!optionsMap.has(optionName)) {
          optionsMap.set(optionName, new Set());
        }
        optionsMap.get(optionName)?.add(optionValue);
      }
    };

    if (index > 0) {
      addOption(row[26], row[27]);
      addOption(row[28], row[29]);
    }

    return [products, optionsMap];
  }, [[], new Map<string, Set<string>>()]);

  const options = Array.from(optionsMap.entries()).map(([name, values]) => ({
    name,
    options: Array.from(values),
  }));

  await callback(products.splice(1), options);
}
