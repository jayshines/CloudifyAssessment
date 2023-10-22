require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const app = express();
const port = 3000;

app.use(bodyParser.json()); 

const economicHeaders = {
    headers: {
      "x-appsecrettoken": process.env.ECONOMIC_API_KEY,
      "x-agreementgranttoken ": process.env.ECONOMIC_AGREEMENT_GRANT_TOKEN,
      "content-type": "application/json",
    },
  };

  app.post("/product", (req, res) => {
    try {
      const shopifyNewProduct = req.body;
      const { title: productName } = shopifyNewProduct;
      let economicProduct = [];
      shopifyNewProduct.variants.forEach((variant) => {
        let temp = {
          title: variant.title,
          price: variant.price,
          sku: variant.sku,
        };
        economicProduct.push(temp);
      });
  
      economicProduct.forEach(async (newProduct) => {
        const Product = {
          productGroup: {
            productGroupNumber: 1,
          },
          name: newProduct.title,
          productNumber: newProduct.sku,
          salesPrice: +newProduct.price,
          description: productName,
        };
        await axios.post(
          "https://restapi.e-conomic.com/products",
          Product,
          economicHeaders
        );
        console.log(Product);
      });
      res.send({ productName, economicProduct });
    } catch (error) {
      console.log(error);
    }
  });

  app.post("/invoice", async (req, res) => {
    try {
      // find economic customer
      // if not present then create economic customer
  
      const targetEmail = req.body.email;
  
      const result = await axios.get(
        `https://restapi.e-conomic.com/customers?filter=email$eq:${targetEmail}`,
        economicHeaders
      );
      const collection = result.data.collection;
      console.log(result);
  
      if (collection.length === 0) {
        const shippingData = req.body.customer;
        const newEconomicCustomer = await createCustomer(shippingData, targetEmail);
        createDraftInvoice(newEconomicCustomer);
      } else {
        createDraftInvoice(collection[0],customer, lineItems);
      }
      res.send("Hello");
    } catch (error) {
      console.log(error);
    }
  });
  
  async function createCustomer(customerData, email) {
    const newCustomerData = {
      currency: "INR",
      email,
      customerGroup: { customerGroupNumber: 1 },
      name: `${customerData.first_name + " " + customerData.last_name}`,
      paymentTerms: { paymentTermsNumber: 1 },
      vatZone: {
        vatZoneNumber: vatChecker(customerData.default_address.country),
      },
    };
    const newCustomer = await axios.post(
      "https://restapi.e-conomic.com/customers",
      newCustomerData,
      economicHeaders
    );
    //   console.log(newCustomerData);
    return newCustomer.data;
  }
  
  async function createDraftInvoice (customer, lineItems) {
    findOrCreateEconomicProducts();
  }
  
  
  
  function vatChecker(country) {
    const europeanUnionCountries = [
      "Austria",
      "Belgium",
      "Bulgaria",
      "Croatia",
      "Republic of Cyprus",
      "Czech Republic",
      "Denmark",
      "Estonia",
      "Finland",
      "France",
      "Germany",
      "Greece",
      "Hungary",
      "Ireland",
      "Italy",
      "Latvia",
      "Lithuania",
      "Luxembourg",
      "Malta",
      "Netherlands",
      "Poland",
      "Portugal",
      "Romania",
      "Slovakia",
      "Slovenia",
      "Spain",
      "Sweden",
    ];
  
    if (country === "India") {
      return 1;
    } else if (europeanUnionCountries.includes(country)) {
      return 2;
    } else {
      return 3;
    }
  }
  
  
  // Function to find or create e-conomic products
  async function findOrCreateEconomicProducts(lineItems) {
    const economicProducts = [];
  
    for (const lineItem of lineItems) {
      const sku = lineItem.sku; // The SKU from the Shopify line item
  
      // Check if a product with the same SKU exists in e-conomic
      const existingProduct = await findEconomicProductBySku(sku);
  
      if (existingProduct) {
        economicProducts.push(existingProduct);
      } else {
        // Create a new product in e-conomic
        const newProductData = {
          productGroup: { productGroupNumber: 1 }, // Set the product group as 1
          productNumber: sku, // Use the SKU as the product number
          name: lineItem.title, // Use the Shopify product title
        };
  
        const newProduct = await createEconomicProduct(newProductData);
        economicProducts.push(newProduct);
      }
    }
  
    return economicProducts;
  }
  
  // Function to find an e-conomic product by SKU
  async function findEconomicProductBySku(sku) {
   const result =  axios.get(`https://restapi.e-conomic.com/products?filter=productNumber$eq:${sku}`,economicHeaders);
    console.log(result);
  }



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });