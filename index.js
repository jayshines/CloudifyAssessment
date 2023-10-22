// Import required modules
const express = require("express");
const bodyParser = require("body-parser");

//Helpers
const {
  createEconomicProducts,
  postEconomicProducts,
} = require("./economic/product/helpers");

const { findOrCreateCustomer } = require("./economic/customer/helpers");

const { createDraftInvoice } = require("./economic/invoice/helpers");

require("dotenv").config();

// Create an Express app
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Define routes and handlers
app.post("/product", handleProductRequest);
app.post("/invoice", handleInvoiceRequest);

// Request handlers
async function handleProductRequest(req, res) {
  try {
    const shopifyNewProduct = req.body;
    const economicProduct = createEconomicProducts(shopifyNewProduct);
    await postEconomicProducts(economicProduct);
    res
      .status(201)
      .send({
        message: "success",
        productName: shopifyNewProduct.title,
        economicProduct,
      });
  } catch (error) {
    console.log(error);
  }
}

async function handleInvoiceRequest(req, res) {
  try {
    const targetEmail = req.body.email;
    const lineItems = req.body.line_items;
    const currency = req.body.currency;

    let draftInvoice = {};
    const customer = await findOrCreateCustomer(targetEmail, req.body.customer);
    setTimeout( async () => {
      draftInvoice = await createDraftInvoice(customer, lineItems, currency);
    }, 5000);

    res.status(201).send({ message: "success", data: draftInvoice });
  } catch (error) {
    console.log(error);
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
