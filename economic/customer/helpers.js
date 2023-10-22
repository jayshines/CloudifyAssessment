const {vatChecker} = require("../../helpers/helpers");

const { economicHeaders } = require("../headers");
const axios = require("axios");

async function findOrCreateCustomer(email, customerData) {
  const existingCustomer = await findEconomicCustomerByEmail(email);

  if (existingCustomer) {
    return existingCustomer;
  } else {
    return createCustomer(customerData, email);
  }
}

async function findEconomicCustomerByEmail(email) {
  const result = await axios.get(
    `https://restapi.e-conomic.com/customers?filter=email$eq:${email}`,
    economicHeaders
  );
  return result.data.collection[0] || null;
}

async function createCustomer(customerData, email) {
  const newCustomerData = {
    // @TODO: fix hardcoded currency
    currency: "INR",
    email,
    customerGroup: { customerGroupNumber: 1 },
    name: `${customerData.first_name} ${customerData.last_name}`,
    paymentTerms: { paymentTermsNumber: 1 },
    vatZone: {
      vatZoneNumber: vatChecker(customerData.default_address.country),
    },
    phone: customerData.phone,
    city: customerData.default_address.city,
    address: `${
      customerData?.default_address?.address1 +
      " " +
      customerData?.default_address?.address2
    }`,
    zip: customerData?.default_address?.zip,
    country: customerData?.default_address?.country_name,
  };
  return ({ data } = await axios.post(
    "https://restapi.e-conomic.com/customers",
    newCustomerData,
    economicHeaders
  ));
}

module.exports = {
  findOrCreateCustomer,
};
