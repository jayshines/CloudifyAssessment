const { economicHeaders } = require("../headers");
const axios = require("axios");

function createEconomicProducts(shopifyProduct) {
  return shopifyProduct.variants.map((variant) => ({
    name: variant.title,
    productNumber: variant.sku,
    salesPrice: +variant.price,
    description: shopifyProduct.title,
  }));
}

async function postEconomicProducts(products) {
  for (const product of products) {
    await axios.post(
      "https://restapi.e-conomic.com/products",
      product,
      economicHeaders
    );
  }
}

async function findOrCreateEconomicProducts(lineItems) {
  const economicProducts = [];

  for (const lineItem of lineItems) {
    const sku = lineItem.sku;
    const existingProduct = await findEconomicProductBySku(sku);

    if (existingProduct) {
      economicProducts.push(existingProduct);
    } else {
      const newProductData = {
        productGroup: { productGroupNumber: 1 },
        productNumber: sku,
        name: lineItem.title,
        salesPrice: parseInt(lineItem.price),
      };
      const newProduct = await createEconomicProduct(newProductData);
      economicProducts.push(newProduct);
    }
  }

  return economicProducts;
}

async function findEconomicProductBySku(sku) {
  const result = await axios.get(
    `https://restapi.e-conomic.com/products?filter=productNumber$eq:${sku}`,
    economicHeaders
  );
  return result.data.collection[0] || null;
}

module.exports = {
  createEconomicProducts,
  postEconomicProducts,
  findOrCreateEconomicProducts,
};
