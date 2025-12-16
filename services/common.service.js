const { default: axios } = require("axios");
const fetch = require("node-fetch")

const fetchAnyApi = async (url) => {
  console.log("url", url);
  try {
    const data = await fetch(url);
    console.log("data", data);
    return data;
  } catch (error) {
    console.log("err", error);
  }
};

module.exports = { fetchAnyApi };
