const { europeanUnionCountries } = require("../constants");

function vatChecker(country) {
  if (country === "India") {
    return 1;
  } else if (europeanUnionCountries.includes(country)) {
    return 2;
  } else {
    return 3;
  }
}

module.exports = { vatChecker };