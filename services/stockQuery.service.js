const PreopenMarket = require("../models/preopenmarket.model");

function formatDateInMonth(inputDate) {
  // Create a new Date object from the input string
  const date = new Date(inputDate);

  // Array of month abbreviations
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Get the day, month, and year
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  // Return the formatted string
  return `${day}-${month}-${year}`;
}

const getPreopenMarketDataWithDate = async (query) => {
  // Default settings
  if (!query?.mg) {
    query.mg = 5;
  }
  if (!query?.perc) {
    query.perc = 0.15;
  }
  if (!query.time) {
    query.time = "2024-12-04";
  }
  let date = formatDateInMonth(query.date);
  try {
    const datas = await PreopenMarket.find({ date: date });
    return datas;
  } catch (error) {
    console.log(error);
    return { error: "An error occurred while processing the data." };
  }
};

module.exports = {
  getPreopenMarketDataWithDate,
};
