const { findOrCreateEconomicProducts } = require("../product/helpers");
const { economicHeaders } = require("../headers");
const axios = require("axios");

async function createDraftInvoice(customer, lineItems, currency) {
  const collection = await findOrCreateEconomicProducts(lineItems);

  const draftInvoiceBody = {
    currency,
    customer: {
      customerNumber: customer.customerNumber,
    },
    date: new Date().toISOString().split("T")[0],
    layout: { layoutNumber: 20 },
    paymentTerms: { paymentTermsNumber: 1 },
    recipient: {
      name: customer.name,
      vatZone: {
        vatZoneNumber: customer.vatZone.vatZoneNumber,
      },
    },
    lines: createInvoiceLines(collection),
  };

  const draftInvoice = await axios.post(
    "https://restapi.e-conomic.com/invoices/drafts",
    draftInvoiceBody,
    economicHeaders
  );
  // console.log(draftInvoice);
  return draftInvoice.data;
}

function createInvoiceLines(collection) {
  return collection.map((data) => ({
    lineNumber: 1,
    product: { productNumber: data.productNumber },
    quantity: 1.0,
    unitNetPrice: 20000.0, // You may need to set the appropriate price here
  }));
}

module.exports = { createDraftInvoice };
