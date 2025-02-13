var API = require("indian-stock-exchange");

var NSEAPI = API.NSE;
var BSEAPI = API.BSE;

const getMarketStatus = async (query) => {
  try {
    // const nseIndices = await NSEAPI.getIndices2();
    return "nseIndices";
  } catch (error) {
    console.log("error in getMarketStatus ", error);
  }
};

module.exports = {
  getMarketStatus,
};
