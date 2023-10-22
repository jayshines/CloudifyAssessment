require("dotenv").config();

// Define headers

const economicHeaders = {
  headers: {
    "x-appsecrettoken": process.env.ECONOMIC_API_KEY,
    "x-agreementgranttoken": process.env.ECONOMIC_AGREEMENT_GRANT_TOKEN,
    "content-type": "application/json",
  },
};

module.exports = { economicHeaders };
