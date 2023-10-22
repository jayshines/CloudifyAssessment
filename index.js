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

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });