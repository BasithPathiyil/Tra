const cron = require("node-cron");
const { getConsolidationStocks } = require("./fileUpload.service");
const { sendConsolidationsEmail } = require("./sendmail.service");

const runScheduledTask = async () => {
  // .slice(0, 16) + "00.000Z";
  console.log("Running scheduled task at:", new Date());
  const formattedDate = new Date(new Date().getTime() + 5.5 * 3600 * 1000);

  let query = {
    mg: 5,
    perc: 0.15,
    time: formattedDate,
  };
  try {
    const response = await getConsolidationStocks(query);

    sendConsolidationsEmail({ stocks: response.consolidationStocks });
  } catch (error) {
    console.error("Error calling API:", error);
  }
};

// Schedule the cron job: Every 5 minutes from 10:00 AM to 3:10 PM, Monday to Saturday
const startCronJob = () => {
  cron.schedule("*/5 10-15 * * 1-5", runScheduledTask);
  console.log("Cron job started.");
};

module.exports = { startCronJob };
