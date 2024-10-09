import * as dotenv from 'dotenv';
import puppeteer from 'puppeteer';

dotenv.config();

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const processItems = (
  items:{
    itemName: string;
    images: string[];
  }[],
) => {
  return items.map(item => {
    const cleanedName = item.itemName.replace(/[\n\t]/g, '').trim();

    const uniqueImages = Array.from(new Set(item.images.map(image => {
        const urlWithoutQueryParams = image.split('?')[0]; // Remove query params
        return urlWithoutQueryParams;
    })));

    const sortedImages = uniqueImages.sort((a, b) => {
        const aIndex = a.match(/_i(\d+)/);
        const bIndex = b.match(/_i(\d+)/);
        return (aIndex ? parseInt(aIndex[1]) : Infinity) - (bIndex ? parseInt(bIndex[1]) : Infinity);
    });

    return {
        itemName: cleanedName,
        images: sortedImages,
    };
});
}

export const crawlStore = async () => {
    const images: {
      itemName: string;
      images: string[];
    }[] = [];

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(`${process.env.SQUAREUP_STORE_URL}/collections`);

    const collectionLinkSelector = 'div.category-item';
    await page.waitForSelector(collectionLinkSelector);
    
    let collectionsElements = await page.$$(collectionLinkSelector);

    for (let i = 0; i < collectionsElements.length; i++) {
        await collectionsElements[i].click();
        
        const itemsSelector = 'div.product-group';
        await page.waitForSelector(itemsSelector);
        
        let itemsElements = await page.$$(itemsSelector);

        for (let j = 0; j < itemsElements.length; j++) {
            await itemsElements[j].click();
            
            const imageSelector = 'div.carousel__image img';
            const itemNameSelector = 'span.crumb.link--current';
            await page.waitForSelector(imageSelector);
            await page.waitForSelector(itemNameSelector);

            const itemNameElement = await page.$(itemNameSelector);
            const itemName = await page.evaluate(el => el.textContent, itemNameElement);

            const imagesElements = await page.$$(imageSelector);
            const imageSrcs = await Promise.all(imagesElements.map(async (imgElement) => {
                return await page.evaluate(img => img.src, imgElement);
            }));

            images.push({
                itemName: itemName,
                images: imageSrcs,
            });
            
            await page.goBack();
            await delay(2000);
            await page.waitForSelector(itemsSelector);
            itemsElements = await page.$$(itemsSelector);
        }

        await page.goBack();
        await delay(2000);
        await page.waitForSelector(collectionLinkSelector);
        collectionsElements = await page.$$(collectionLinkSelector);
    }

    await browser.close();

    return processItems(images);
}
