const cron = require("node-cron");
const { getConsolidationStocks } = require("./fileUpload.service");
const { sendConsolidationsEmail } = require("./sendmail.service");
const { default: axios } = require("axios");

const runScheduledTask = async () => {
  // .slice(0, 16) + "00.000Z";
  console.log("Running scheduled task at:", new Date());
  const currentIST = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });
  const currentHours = new Date(currentIST).getHours();
  const currentMinutes = new Date(currentIST).getMinutes();
  if (currentHours >= 15 && currentMinutes > 10) {
    console.log("Cron job stopped after 3:10 PM IST.");
    return;
  }

  const formattedDate = new Date(new Date().getTime() + 5.5 * 3600 * 1000);

  let query = {
    mg: 5,
    perc: 0.15,
    time: formattedDate,
  };
  try {
    const response = await getConsolidationStocks(query);
    if (response.consolidationStocks.length < 1) {
      return;
    }
    sendConsolidationsEmail({ stocks: response.consolidationStocks });
  } catch (error) {
    console.error("Error calling API:", error);
  }
};

// Schedule the cron job: Every 5 minutes from 10:00 AM to 3:10 PM, Monday to Saturday
const startCronJob = () => {
  cron.schedule("*/5 4-9 * * 1-5", runScheduledTask);
  console.log("Cron job started.");
};

const call5minApi = async () => {
  try {
    const data = await axios.get("https://tra-c8a9.onrender.com");
  } catch (error) {
    console.log("error in calling api");
  }
};

const start5min = async () => {
  cron.schedule("*/5 * * * *", call5minApi);
};

module.exports = { startCronJob, start5min };
