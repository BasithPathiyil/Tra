const AppError = require("../middlewares/AppError");
const User = require("../models/user.model");
const UserFile = require("../models/userFile.model");
const { upload } = require("../utils/multerFileUpload");
const axios = require("axios");

const fs = require("fs");

//funcion to generate 6 digit number
const generateUniqueCode = async () => {
  const min = 100000;
  const max = 999999;

  let code;

  do {
    code = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (await isCodeDup(code));

  return code;
};

const isCodeDup = async (code) => {
  const isDuplicate = await UserFile.findOne({ secretKey: code }).exec();
  return !!isDuplicate;
};

const removeFromDirectory = async (filePath) => {
  return await fs.unlinkSync(filePath);
};

const fileUpload = (req, res) => {
  return new Promise((resolve, reject) => {
    const singleUpload = upload.single("file");

    singleUpload(req, res, async function (err) {
      // function for incase if any error occurs
      const deleteFile = (error) => {
        if (req.file) {
          // Delete the uploaded file
          fs.unlinkSync(req.file.path);
        }
        reject(error);
      };

      if (err) {
        deleteFile(new AppError(400, err.message));
      } else {
        try {
          let data = {
            userId: req.user._id,
            secretKey: await generateUniqueCode(),
            fileName: req.body.filename
              ? req.body.filename + "." + req.file.filename.split(".")[1]
              : req.file.filename,
            fileUrl: `public/uploads/${req.file.filename}`,
            filePath: req.file.path,
          };
          const createdData = await UserFile.create(data);
          resolve(createdData);
        } catch (error) {
          deleteFile(error);
        }
      }
    });
  });
};

const removeFileDoc = async (objectId) => {
  const deletedDoc = await UserFile.findByIdAndDelete(objectId);
  await removeFromDirectory(deletedDoc.filePath);
  return deletedDoc;
};

const getAllFilesByUserId = async (userId, options) => {
  const { page, rowsPerPage } = options;
  const allFilesCount = await UserFile.countDocuments({ userId });
  const allFiles = await UserFile.find({ userId })
    .skip(page ? (page - 1) * rowsPerPage : 0)
    .limit(rowsPerPage ? rowsPerPage : 100);
  return { allFiles, allFilesCount };
};

const getFile = async (fileId, secretKey) => {
  const fileDoc = await UserFile.findById(fileId).select("+secretKey");
  if (!fileDoc) {
    throw new AppError(400, "File not found in database");
  }
  if (secretKey !== fileDoc.secretKey) {
    throw new AppError(400, "Incorrect secret code");
  }
  let filePath = fileDoc.filePath;
  if (!fs.existsSync(filePath)) {
    throw new AppError(400, "File not found in storage");
  }

  return { filePath, fileName: fileDoc.fileName };
};
// let apiKey = "0AS0G7D6EFX9W09P";
// async function getStockGraphData(symbol = "IBM", interval = "1min") {
//   const baseURL = "https://www.alphavantage.co/query";

//   let functionType = "";
//   if (interval === "daily") {
//     functionType = "TIME_SERIES_DAILY";
//   } else if (["1min", "5min", "15min", "30min", "60min"].includes(interval)) {
//     functionType = "TIME_SERIES_INTRADAY";
//   } else {
//     throw new Error("Invalid interval provided.");
//   }

//   try {
//     const params = {
//       function: functionType,
//       symbol,
//       apikey: apiKey,
//       ...(interval !== "daily" && { interval }), // Add interval for intraday
//     };

//     const response = await axios.get(baseURL, { params });
//     const data = response.data;

//     // Determine the key to access time series data
//     const timeSeriesKey =
//       functionType === "TIME_SERIES_DAILY"
//         ? "Time Series (Daily)"
//         : `Time Series (${interval})`;

//     // const timeSeries = data[timeSeriesKey];
//     // if (!timeSeries) throw new Error("Invalid data received from API.");

//     // // Format data for graphing
//     // const graphData = Object.entries(timeSeries).map(([date, values]) => ({
//     //   date,
//     //   close: parseFloat(values["4. close"]),
//     // }));

//     return data;
//   } catch (error) {
//     console.error("Error fetching stock data:", error.message);
//     throw error;
//   }
// }

// const yahooFinance = require("yahoo-finance2").default;

// async function getStockGraphData(symbol = "TCS") {
//   try {
//     const data = await yahooFinance.historical(symbol, {
//       period1: "2023-01-01", // Start date
//       period2: new Date().toISOString().split("T")[0], // End date (today)
//       interval: "1min", // Daily data
//     });

//     // Format data for graphing
//     const graphData = data.map((entry) => ({
//       date: entry.date.toISOString(), // Convert date to ISO string
//       close: entry.close,
//     }));

//     return graphData;
//   } catch (error) {
//     console.error("Error fetching Yahoo Finance data:", error.message);
//     throw error;
//   }
// }
// let finhubapikey = "ct138shr01qkcukblingct138shr01qkcukblio0";
// async function getStockGraphData(symbol="TCS") {
//   const baseURL = "https://finnhub.io/api/v1/stock/candle";
//   const resolution = "D"; // Daily data
//   const now = Math.floor(Date.now() / 1000); // Current timestamp
//   const oneYearAgo = now - 365 * 24 * 60 * 60; // Timestamp for one year ago

//   try {
//     const response = await axios.get(baseURL, {
//       params: {
//         symbol,
//         resolution,
//         from: oneYearAgo,
//         to: now,
//         token: finhubapikey,
//       },
//     });

//     const { t, c } = response.data; // t = timestamps, c = closing prices
//     if (!t || !c) throw new Error("Invalid data received.");

//     // Format data for graphing
//     const graphData = t.map((timestamp, index) => ({
//       date: new Date(timestamp * 1000).toISOString(), // Convert timestamp to ISO string
//       close: c[index],
//     }));

//     return graphData;
//   } catch (error) {
//     console.error("Error fetching Finnhub data:", error);
//     throw error;
//   }
// }

const finnhub = require("finnhub");

const api_key = finnhub.ApiClient.instance.authentications["api_key"];
api_key.apiKey = "ct13js9r01qkcukbm2ggct13js9r01qkcukbm2h0"; // Replace this
const finnhubClient = new finnhub.DefaultApi();

// Stock candles
// finnhubClient.stockCandles(
//   "AAPL",
//   "D",
//   1590988249,
//   1591852249,
//   (error, data, response) => {
//     console.log(data);
//   }
// );

// const getStockGraphData = (symbol="TCS", resolution="5", from=1590988249, to=1591852249) => {
//   console.log("working")
//   try {
//     return new Promise((resolve, reject) => {
//       console.log("here")
//       finnhubClient.stockCandles(
//         symbol,
//         resolution,
//         from,
//         to,
//         (error, data, response) => {
//           if (error) {
//             console.log("error")
//             console.log(error)
//             reject(error);
//           } else {
//             console.log("not error")
//             resolve(data);
//           }
//         }
//       );
//     });
//   } catch (error) {
//     console.log("error")
//   }

// };

const aggregateToIntervals = (data, intervalMinutes) => {
  const aggregatedData = [];
  let tempData = [];

  data.forEach((entry, index) => {
    tempData.push(entry);

    if ((index + 1) % intervalMinutes === 0) {
      const open = tempData[0].open;
      const close = tempData[tempData.length - 1].close;
      const high = Math.max(...tempData.map((item) => item.high));
      const low = Math.min(...tempData.map((item) => item.low));
      const volume = tempData.reduce((sum, item) => sum + item.volume, 0);

      aggregatedData.push({ open, close, high, low, volume });
      tempData = [];
    }
  });

  return aggregatedData;
};

const { NseIndia } = require("stock-nse-india");
const nseIndia = new NseIndia();

const aggregateTo15Minutes = (data) => {
  const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds
  const aggregatedData = [];
  let currentIntervalStart =
    Math.floor(data[0][0] / fifteenMinutes) * fifteenMinutes;
  console.log("currentIntervalStart", currentIntervalStart);
  let intervalData = [];

  for (const [timestamp, value] of data) {
    if (timestamp >= currentIntervalStart + fifteenMinutes) {
      // Process the previous interval
      const open = intervalData[0][1];
      const close = intervalData[intervalData.length - 1][1];
      const high = Math.max(...intervalData.map(([_, v]) => v));
      const low = Math.min(...intervalData.map(([_, v]) => v));

      aggregatedData.push({
        startTime: new Date(currentIntervalStart).toISOString(),
        open,
        close,
        high,
        low,
      });

      // Start a new interval
      currentIntervalStart += fifteenMinutes;
      intervalData = [];
    }

    intervalData.push([timestamp, value]);
  }

  // Process the final interval
  if (intervalData.length > 0) {
    const open = intervalData[0][1];
    const close = intervalData[intervalData.length - 1][1];
    const high = Math.max(...intervalData.map(([_, v]) => v));
    const low = Math.min(...intervalData.map(([_, v]) => v));

    aggregatedData.push({
      startTime: new Date(currentIntervalStart).toISOString(),
      open,
      close,
      high,
      low,
    });
  }

  return aggregatedData;
};

// const getStockGraphData = async () => {
//   const data = await nseIndia.getEquityIntradayData("TATASTEEL");

//   const fiveminuteData = aggregateTo15Minutes(data.grapthData);
//   const formattedData = data?.grapthData.map(([timestamp, value]) => {
//     const date = new Date(timestamp); // Convert timestamp to Date
//     const time = date.toISOString("en-IN", { hour12: false }); // Format time
//     return { time, value };
//   });

//   return fiveminuteData;
// };

// const getStockGraphData = async () => {
//   const range = {
//     start: new Date("2024-01-01"),
//     end: new Date("2024-11-25"),
//   };
//   const data = await nseIndia.getEquityTradeInfo("TATASTEEL");
//   return data;
// };

let nifty50Stocks = [
  "ADANIPORTS",
  "ADANIENT",
  "BEL",
  "SHRIRAMFIN",
  "NTPC",
  "HDFCBANK",
  "TRENT",
  "INDUSINDBK",
  "BPCL",
  "TATAMOTORS",
  "M&M",
  "RELIANCE",
  "COALINDIA",
  "DRREDDY",
  "BAJFINANCE",
  "LT",
  "TITAN",
  "AXISBANK",
  "TATASTEEL",
  "POWERGRID",
  "ICICIBANK",
  "SBIN",
  "ASIANPAINT",
  "MARUTI",
  "HINDALCO",
  "ONGC",
  "BRITANNIA",
  "KOTAKBANK",
  "HEROMOTOCO",
  "HCLTECH",
  "BAJAJFINSV",
  "HINDUNILVR",
  "ITC",
  "TCS",
  "BAJAJ-AUTO",
  "BHARTIARTL",
  "INFY",
  "TECHM",
  "WIPRO",
  "ULTRACEMCO",
  "APOLLOHOSP",
  "CIPLA",
  "GRASIM",
  "SUNPHARMA",
  "TATACONSUM	",
  "SBILIFE",
  "NESTLEIND",
  "HDFCLIFE",
  "EICHERMOT",
  "JSWSTEEL",
];
const nifty100Symbols = [
  "RELIANCE",
  "TCS",
  "INFY",
  "HDFCBANK",
  "ICICIBANK",
  "HINDUNILVR",
  "HDFC",
  "SBIN",
  "BHARTIARTL",
  "KOTAKBANK",
  "ITC",
  "LT",
  "ADANIENT",
  "AXISBANK",
  "ADANIGREEN",
  "ASIANPAINT",
  "BAJFINANCE",
  "TITAN",
  "MARUTI",
  "WIPRO",
  "ONGC",
  "NTPC",
  "HCLTECH",
  "POWERGRID",
  "TECHM",
  "DMART",
  "ULTRACEMCO",
  "SUNPHARMA",
  "TATAMOTORS",
  "VEDL",
  "JSWSTEEL",
  "IOC",
  "HINDALCO",
  "ADANIPORTS",
  "COALINDIA",
  "DIVISLAB",
  "BPCL",
  "CIPLA",
  "BAJAJFINSV",
  "HEROMOTOCO",
  "GRASIM",
  "UPL",
  "SHREECEM",
  "TATAPOWER",
  "BRITANNIA",
  "DRREDDY",
  "ADANITRANS",
  "SBICARD",
  "AMBUJACEM",
  "PIDILITIND",
  "M&M",
  "BEL",
  "DLF",
  "ICICIPRULI",
  "GAIL",
  "BAJAJHLDNG",
  "HDFCAMC",
  "SRF",
  "NAUKRI",
  "PNB",
  "SBILIFE",
  "LTI",
  "TATACHEM",
  "PAGEIND",
  "HAVELLS",
  "EICHERMOT",
  "ICICIGI",
  "BERGEPAINT",
  "MOTHERSON",
  "ATGL",
  "ADANIPOWER",
  "IGL",
  "BOSCHLTD",
  "PIIND",
  "AUROPHARMA",
  "TORNTPHARM",
  "GODREJCP",
  "MFSL",
  "CONCOR",
  "COLPAL",
  "TATACONSUM",
  "BIOCON",
  "NESTLEIND",
  "ABB",
  "HINDZINC",
  "CHOLAFIN",
  "INDUSINDBK",
  "BANDHANBNK",
  "LUPIN",
  "TORNTPOWER",
  "NMDC",
  "ZOMATO",
  "PFC",
  "SIEMENS",
  "PETRONET",
  "CANBK",
  "GLAND",
  "TATACOMM",
  "POLYCAB",
  "INDHOTEL",
  "HAL",
  "IREDA",
  "IRCTC",
];

const indianStockSymbols = [
  "RELIANCE",
  "TCS",
  "HDFCBANK",
  "INFY",
  "ICICIBANK",
  "HINDUNILVR",
  "SBI",
  "HDFC",
  "ITC",
  "BHARTIARTL",
  "KOTAKBANK",
  "ADANIENT",
  "WIPRO",
  "LT",
  "ASIANPAINT",
  "DMART",
  "BAJFINANCE",
  "TITAN",
  "ONGC",
  "ADANIPORTS",
  "MARUTI",
  "ULTRACEMCO",
  "HCLTECH",
  "NTPC",
  "POWERGRID",
  "NESTLEIND",
  "SUNPHARMA",
  "COALINDIA",
  "TECHM",
  "AXISBANK",
  "JSWSTEEL",
  "BPCL",
  "INDUSINDBK",
  "TATACONSUM",
  "DIVISLAB",
  "ADANIGREEN",
  "TATASTEEL",
  "UPL",
  "M&M",
  "GRASIM",
  "DABUR",
  "SBILIFE",
  "HDFCLIFE",
  "BAJAJFINSV",
  "EICHERMOT",
  "ADANITRANS",
  "HINDALCO",
  "ICICIPRULI",
  "BRITANNIA",
  "PIDILITIND",
  "HEROMOTOCO",
  "GAIL",
  "IOC",
  "VEDL",
  "BIOCON",
  "SIEMENS",
  "DRREDDY",
  "AMBUJACEM",
  "ZOMATO",
  "PAYTM",
  "NYKAA",
  "POLYCAB",
  "BOSCHLTD",
  "SHREECEM",
  "BANDHANBNK",
  "IRCTC",
  "ACC",
  "GODREJCP",
  "BERGEPAINT",
  "TORNTPHARM",
  "COLPAL",
  "CIPLA",
  "TATAMOTORS",
  "HAL",
  "TATAPOWER",
  "ADANIPOWER",
  "INDIGO",
  "MRF",
  "PNB",
  "UBL",
  "IDFCFIRSTB",
  "MOTHERSON",
  "LICI",
  "ABB",
  "BEL",
  "BHEL",
  "NHPC",
  "IRFC",
  "SAIL",
  "INDHOTEL",
  "SRF",
  "TATACHEM",
  "CASTROLIND",
  "JINDALSTEL",
  "ASHOKLEY",
  "BANKBARODA",
  "LTI",
  "LTIM",
  "MPHASIS",
  "PERSISTENT",
  "COFORGE",
  "NIITTECH",
  "INDIAMART",
  "MCX",
  "BSE",
  "HAPPSTMNDS",
  "ZENSARTECH",
  "OFSS",
  "CYIENT",
  "MINDTREE",
  "TECHMAHINDRA",
  "KPITTECH",
  "ADANIWILMAR",
  "JUBLFOOD",
  "TRENT",
  "APOLLOHOSP",
  "FORTIS",
  "AUROPHARMA",
  "LUPIN",
  "GLENMARK",
  "ALKEM",
  "ABBOTINDIA",
  "IPCALAB",
  "SANOFI",
  "ZYDUSLIFE",
  "METROPOLIS",
  "ASTRAL",
  "VGUARD",
  "KEI",
  "HAVELLS",
  "FINOLEXIND",
  "CROMPTON",
  "BEML",
  "CONCOR",
  "AIAENG",
  "HINDCOPPER",
  "NMDC",
  "MOIL",
  "ORIENTCEM",
  "RAMCOCEM",
  "JKLAKSHMI",
  "SOBHA",
  "DLF",
  "GODREJPROP",
  "OBEROIRLTY",
  "BRIGADE",
  "PRESTIGE",
  "SUNTECK",
  "PHOENIXLTD",
  "GMRINFRA",
  "L&TFH",
  "IDFC",
  "IDBI",
  "CHOLAFIN",
  "BAJAJHLDNG",
  "SHRIRAMFIN",
  "PFC",
  "RECLTD",
  "IRCON",
  "RVNL",
  "ADANITOTALGAS",
  "MGL",
  "IGL",
  "GSPL",
  "PETRONET",
  "OIL",
  "CANBK",
  "UNIONBANK",
  "CENTRALBK",
  "INDIANB",
  "IOB",
  "UCOBANK",
  "FEDERALBNK",
  "CUB",
  "YESBANK",
  "RBLBANK",
  "DCBBANK",
  "SBICARD",
  "APOLLOTYRE",
  "CEATLTD",
  "JKTYRE",
  "BALKRISIND",
  "AMARAJABAT",
  "EXIDEIND",
  "LICHSGFIN",
  "HDFC",
  "GODREJAGRO",
  "RALLIS",
  "PIIND",
  "CHAMBLFERT",
  "COROMANDEL",
  "GNFC",
  "GSFC",
  "DEEPAKFERT",
  "NAVINFLUOR",
  "AARTIIND",
  "ALKYLAMINE",
  "FINEORG",
  "NEOGEN",
  "VSTIND",
  "NOCIL",
  "ATUL",
  "KANSAINER",
  "AKZOINDIA",
  "SHALPAINTS",
  "GUJALKALI",
  "HONAUT",
  "TTKPRESTIG",
  "IFBIND",
  "SCHAEFFLER",
  "CUMMINSIND",
  "THERMAX",
  "SONACOMS",
  "ROUTE",
  "JINDALSTEL",
  "TTML",
  "JBCHEPHARM",
  "BBTC",
  "JUBLPHARMA",
  "SYMPHONY",
  "LUXIND",
  "RUPA",
  "PAGEIND",
  "AMBUJACEM",
  "SHREECEM",
  "ACC",
  "EIDPARRY",
  "VINATIORGA",
  "KIRLOSBROS",
  "SOLARINDS",
  "INDIAMART",
  "CENTURYTEX",
  "JKTYRE",
  "RAJESHEXPO",
  "KPRMILL",
  "POLYCAB",
  "MASFIN",
  "MAXHEALTH",
  "WESTLIFE",
  "KIMS",
  "APLLTD",
  "GPPL",
  "INOXWIND",
  "ABBINDIA",
  "KALPATPOWR",
  "VRLLOG",
  "MASTEK",
  "SIS",
  "STLTECH",
  "VAIBHAVGBL",
  "LAXMIMACH",
  "IEX",
  "NAUKRI",
  "GNFC",
  "JSWHL",
  "KPIT",
  "FSL",
  "FDC",
  "LAOPALA",
  "CENTUM",
  "AVANTIFEED",
  "HGINFRA",
  "KAJARIACER",
  "RELAXO",
  "RADICO",
  "TASTYBITE",
  "BAJAJCON",
  "VINATIORGA",
  "HAPPSTMNDS",
  "LATENTVIEW",
  "SUVENPHAR",
  "CHEMPLASTS",
  "NLCINDIA",
  "SPANDANA",
  "INDOSTAR",
  "SHYAMMETL",
  "CLEAN",
  "EXPLEOSOL",
  "ANANTRAJ",
  "SUVENPHARMA",
  "AMRUTANJAN",
  "MAHLOG",
  "BLS",
  "DIXON",
  "CAMLINFINE",
  "ESABINDIA",
  "GSFC",
  "MTARTECH",
  "STARCEMENT",
  "PTC",
  "AKASH",
  "GICRE",
  "IPO",
  "SURYAROSH",
  "ONGC",
  "RELAXO",
  "JYOTHYLAB",
  "ASTRAZEN",
];

const smallCapSymbols = [
  "ADANIGREEN",
  "ATGL",
  "ADANIPORTS",
  "ATGL",
  "ASTRAL",
  "APOLLOTYRE",
  "ASTERDM",
  "AUROPHARMA",
  "BAJAJHLDNG",
  "BALKRISIND",
  "BANDHANBNK",
  "CANFINHOME",
  "CASTROLIND",
  "CHOLAHLDNG",
  "CUMMINSIND",
  "EIDPARRY",
  "FINCABLES",
  "GLAND",
  "GRINDWELL",
  "HAL",
  "IBREALEST",
  "IDFCFIRSTB",
  "INEOSSTYRO",
  "IRCTC",
  "ISEC",
  "JBCHEPHARM",
  "KEI",
  "LALPATHLAB",
  "LICHSGFIN",
  "LTTS",
  "MOTILALOFS",
  "MRF",
  "NH",
  "NOCIL",
  "ORIENTCEM",
  "PHOENIXLTD",
  "PRESTIGE",
  "PNBHOUSING",
  "RAJESHEXPO",
  "ROUTE",
  "RPOWER",
  "SOLARINDS",
  "SONATSOFTW",
  "SUNTV",
  "SYMPHONY",
  "TEJASNET",
  "TRENT",
  "TVSMOTOR",
  "WELSPUNIND",
  "WHIRLPOOL",
  "ZYDUSWELL",
  "ZEN",
  "CENTURYPLY",
];

const midCapSymbols = [
  "ACC",
  "ADANIGREEN",
  "AMARAJABAT",
  "APOLLOHOSP",
  "AUROPHARMA",
  "BALKRISIND",
  "BATAINDIA",
  "BHARATFORG",
  "CROMPTON",
  "DALMIASUG",
  "ESCORTS",
  "GODREJPROP",
  "INDIGO",
  "INDUSTOWER",
  "JUBLFOOD",
  "LICHSGFIN",
  "LUPIN",
  "M&MFIN",
  "MANAPPURAM",
  "MFSL",
  "MRPL",
  "OBEROIRLTY",
  "PIIND",
  "RBLBANK",
  "RECLTD",
  "SRTRANSFIN",
  "SUNTV",
  "TATACHEM",
  "TATACOMM",
  "TORNTPHARM",
  "UPL",
  "VGUARD",
  "ZEEL",
];

const get50StockData = async () => {
  try {
    // Create an array of promises
    const stockDataPromises = nifty50Stocks.map((symbol) =>
      getDataBySymbol(symbol)
    );

    // Wait for all promises to resolve
    const allStockData = await Promise.all(stockDataPromises);
    const sellMoreStocks = [];
    const sellMore3times = [];
    const buyMoreStocks = [];
    const buyMore3times = [];

    //
    let atoBuyNBuyMore = [];
    let atoSellNSellMore = [];
    let atoBuyNBuy3More = [];
    let atoSellNSell3More = [];

    //
    let sellMoreChangePositive = [];
    let sellMore3ChangePositive = [];

    let buyMoreChangeNegative = [];
    let buyMore3ChangeNegative = [];
    // Extract preOpenMarket data from each stock's data
    const preOpenMarketData = allStockData.map((stock) => {
      if (
        stock?.preOpenMarket?.totalSellQuantity >
          stock?.preOpenMarket?.totalBuyQuantity &&
        stock?.preOpenMarket?.atoSellQty > stock?.preOpenMarket?.atoBuyQty
      ) {
        atoSellNSellMore.push({
          stock: stock?.info?.symbol,
          buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
          sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
          atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
          atoSellQty: stock?.preOpenMarket?.atoSellQty,
        });
      }

      //atoBuyNBuyMore
      if (
        stock?.preOpenMarket?.totalBuyQuantity >
          stock?.preOpenMarket?.totalSellQuantity &&
        stock?.preOpenMarket?.atoBuyQty > stock?.preOpenMarket?.atoSellQty
      ) {
        atoBuyNBuyMore.push({
          stock: stock?.info?.symbol,
          buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
          sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
          atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
          atoSellQty: stock?.preOpenMarket?.atoSellQty,
          stockData: stock,
        });
      }
      if (
        stock?.preOpenMarket?.totalSellQuantity >
        stock?.preOpenMarket?.totalBuyQuantity
      ) {
        sellMoreStocks.push({
          stock: stock?.info?.symbol,
          buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
          sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
        });
        if (stock.preOpenMarket?.Change > 0) {
          sellMoreChangePositive.push({
            stock: stock?.info?.symbol,
            buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
            sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
            atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
            atoSellQty: stock?.preOpenMarket?.atoSellQty,
            change: stock.preOpenMarket?.Change,
          });
        }
        if (
          stock?.preOpenMarket?.totalSellQuantity >
          3 * stock?.preOpenMarket?.totalBuyQuantity
        ) {
          sellMore3times.push({
            stock: stock?.info?.symbol,
            buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
            sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
            atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
            atoSellQty: stock?.preOpenMarket?.atoSellQty,
          });
          if (stock.preOpenMarket?.Change > 0) {
            sellMore3ChangePositive.push({
              stock: stock?.info?.symbol,
              buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
              sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
              atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
              atoSellQty: stock?.preOpenMarket?.atoSellQty,
              change: stock.preOpenMarket?.Change,
            });
          }
        }

        if (
          stock?.preOpenMarket?.totalSellQuantity >
            3 * stock?.preOpenMarket?.totalBuyQuantity &&
          stock?.preOpenMarket?.atoSellQty > stock?.preOpenMarket?.atoBuyQty
        ) {
          atoSellNSell3More.push({
            stock: stock?.info?.symbol,
            buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
            sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
            atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
            atoSellQty: stock?.preOpenMarket?.atoSellQty,
            stockData: stock,
          });
        }
      } else {
        buyMoreStocks.push({
          stock: stock?.info?.symbol,
          buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
          sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
        });
        if (stock.preOpenMarket?.Change < 0) {
          buyMoreChangeNegative.push({
            stock: stock?.info?.symbol,
            buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
            sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
            atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
            atoSellQty: stock?.preOpenMarket?.atoSellQty,
            change: stock.preOpenMarket?.Change,
          });
        }
        if (
          stock?.preOpenMarket?.totalBuyQuantity >
          3 * stock?.preOpenMarket?.totalSellQuantity
        ) {
          buyMore3times.push({
            stock: stock?.info?.symbol,
            buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
            sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
            atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
            atoSellQty: stock?.preOpenMarket?.atoSellQty,
          });
          if (stock.preOpenMarket?.Change < 0) {
            buyMore3ChangeNegative.push({
              stock: stock?.info?.symbol,
              buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
              sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
              atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
              atoSellQty: stock?.preOpenMarket?.atoSellQty,
              change: stock.preOpenMarket?.Change,
              // stockData:stock
            });
          }
        }
        if (
          stock?.preOpenMarket?.totalBuyQuantity >
            3 * stock?.preOpenMarket?.totalSellQuantity &&
          stock?.preOpenMarket?.atoBuyQty > stock?.preOpenMarket?.atoSellQty
        ) {
          atoBuyNBuy3More.push({
            stock: stock?.info?.symbol,
            buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
            sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
            atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
            atoSellQty: stock?.preOpenMarket?.atoSellQty,
            stockData: stock,
          });
        }
      }
      return {
        symbol: stock?.info?.symbol || "", // Include the stock symbol for identification
        preOpenMarket: stock?.preOpenMarket, // Extract preOpenMarket data
      };
    });

    return {
      // preOpenMarketData,
      sellMoreStocks,
      sellMore3times,
      buyMoreStocks,
      buyMore3times,
      atoBuyNBuyMore,
      atoBuyNBuy3More,
      atoSellNSellMore,
      atoSellNSell3More,
      buyMoreChangeNegative,
      buyMore3ChangeNegative,
      sellMoreChangePositive,
      sellMore3ChangePositive,

      // anyOne: allStockData[0],
    }; // This will be an array of data for all the stocks
  } catch (error) {
    console.error("Error fetching stock data:", error);
    throw error; // Re-throw the error if needed
  }
};

const get10TimesStockDataFn = async (stocks, times = 10) => {
  try {
    // Create an array of promises
    const stockDataPromises = stocks.map((symbol) => getDataBySymbol(symbol));

    // Wait for all promises to resolve
    const allStockData = await Promise.all(stockDataPromises);
    const sellMoreStocks = [];
    const sellMore10times = [];
    const buyMoreStocks = [];
    const buyMore10times = [];

    //
    let atoBuyNBuyMore = [];
    let atoSellNSellMore = [];
    let atoBuyNBuy3More = [];
    let atoSellNSell3More = [];

    //
    let sellMoreChangePositive = [];
    let sellMore3ChangePositive = [];

    let buyMoreChangeNegative = [];
    let buyMore3ChangeNegative = [];
    // Extract preOpenMarket data from each stock's data
    const preOpenMarketData = allStockData.map((stock) => {
      if (
        stock?.preOpenMarket?.totalSellQuantity >
          stock?.preOpenMarket?.totalBuyQuantity &&
        stock?.preOpenMarket?.atoSellQty > stock?.preOpenMarket?.atoBuyQty
      ) {
        atoSellNSellMore.push({
          stock: stock?.info?.symbol,
          buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
          sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
          atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
          atoSellQty: stock?.preOpenMarket?.atoSellQty,
          change: stock.preOpenMarket?.Change,
        });
      }

      //atoBuyNBuyMore
      if (
        stock?.preOpenMarket?.totalBuyQuantity >
          stock?.preOpenMarket?.totalSellQuantity &&
        stock?.preOpenMarket?.atoBuyQty > stock?.preOpenMarket?.atoSellQty
      ) {
        atoBuyNBuyMore.push({
          stock: stock?.info?.symbol,
          buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
          sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
          atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
          atoSellQty: stock?.preOpenMarket?.atoSellQty,
          change: stock.preOpenMarket?.Change,
        });
      }
      if (
        stock?.preOpenMarket?.totalSellQuantity >
        stock?.preOpenMarket?.totalBuyQuantity
      ) {
        sellMoreStocks.push({
          stock: stock?.info?.symbol,
          buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
          sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
          atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
          atoSellQty: stock?.preOpenMarket?.atoSellQty,
          change: stock.preOpenMarket?.Change,
        });
        if (stock.preOpenMarket?.Change > 0) {
          sellMoreChangePositive.push({
            stock: stock?.info?.symbol,
            buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
            sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
            atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
            atoSellQty: stock?.preOpenMarket?.atoSellQty,
            change: stock.preOpenMarket?.Change,
          });
        }
        if (
          stock?.preOpenMarket?.totalSellQuantity >
          times * stock?.preOpenMarket?.totalBuyQuantity
        ) {
          sellMore10times.push({
            stock: stock?.info?.symbol,
            buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
            sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
            atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
            atoSellQty: stock?.preOpenMarket?.atoSellQty,
            change: stock.preOpenMarket?.Change,
          });
          if (stock.preOpenMarket?.Change > 0) {
            sellMore3ChangePositive.push({
              stock: stock?.info?.symbol,
              buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
              sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
              atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
              atoSellQty: stock?.preOpenMarket?.atoSellQty,
              change: stock.preOpenMarket?.Change,
            });
          }
        }

        if (
          stock?.preOpenMarket?.totalSellQuantity >
            3 * stock?.preOpenMarket?.totalBuyQuantity &&
          stock?.preOpenMarket?.atoSellQty > stock?.preOpenMarket?.atoBuyQty
        ) {
          atoSellNSell3More.push({
            stock: stock?.info?.symbol,
            buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
            sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
            atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
            atoSellQty: stock?.preOpenMarket?.atoSellQty,
            change: stock.preOpenMarket?.Change,
          });
        }
      } else {
        buyMoreStocks.push({
          stock: stock?.info?.symbol,
          buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
          sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
          atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
          atoSellQty: stock?.preOpenMarket?.atoSellQty,
          change: stock.preOpenMarket?.Change,
        });
        if (stock.preOpenMarket?.Change < 0) {
          buyMoreChangeNegative.push({
            stock: stock?.info?.symbol,
            buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
            sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
            atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
            atoSellQty: stock?.preOpenMarket?.atoSellQty,
            change: stock.preOpenMarket?.Change,
          });
        }
        if (
          stock?.preOpenMarket?.totalBuyQuantity >
          times * stock?.preOpenMarket?.totalSellQuantity
        ) {
          buyMore10times.push({
            stock: stock?.info?.symbol,
            buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
            sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
            atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
            atoSellQty: stock?.preOpenMarket?.atoSellQty,
            change: stock.preOpenMarket?.Change,
          });
          if (stock.preOpenMarket?.Change < 0) {
            buyMore3ChangeNegative.push({
              stock: stock?.info?.symbol,
              buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
              sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
              atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
              atoSellQty: stock?.preOpenMarket?.atoSellQty,
              change: stock.preOpenMarket?.Change,
              // stockData:stock
            });
          }
        }
        if (
          stock?.preOpenMarket?.totalBuyQuantity >
            3 * stock?.preOpenMarket?.totalSellQuantity &&
          stock?.preOpenMarket?.atoBuyQty > stock?.preOpenMarket?.atoSellQty
        ) {
          atoBuyNBuy3More.push({
            stock: stock?.info?.symbol,
            buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
            sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
            atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
            atoSellQty: stock?.preOpenMarket?.atoSellQty,
            change: stock.preOpenMarket?.Change,
          });
        }
      }
      return {
        symbol: stock?.info?.symbol || "", // Include the stock symbol for identification
        preOpenMarket: stock?.preOpenMarket, // Extract preOpenMarket data
      };
    });

    return {
      // preOpenMarketData,
      sellMoreStocks,
      sellMore10times,
      buyMoreStocks,
      buyMore10times,
      atoBuyNBuyMore,
      atoBuyNBuy3More,
      atoSellNSellMore,
      atoSellNSell3More,
      buyMoreChangeNegative,
      buyMore3ChangeNegative,
      sellMoreChangePositive,
      sellMore3ChangePositive,

      // anyOne: allStockData[0],
    }; // This will be an array of data for all the stocks
  } catch (error) {
    console.error("Error fetching stock data:", error);
    throw error; // Re-throw the error if needed
  }
};

const getCustomTimesStockDataFn = async (stocks, times = 3) => {
  try {
    const stockDataPromises = stocks.map((symbol) => getDataBySymbol(symbol));
    const allStockData = await Promise.all(stockDataPromises);
    const sellMoreFiltered = [];
    const buyMoreFiltered = [];
    const sellMoreAtoFilter = [];
    const buyMoreAtoFiltered = [];

    allStockData.forEach((stock) => {
      if (
        stock?.preOpenMarket?.totalSellQuantity >
          times * stock?.preOpenMarket?.totalBuyQuantity &&
        stock?.preOpenMarket?.Change > 0
      ) {
        sellMoreFiltered.push({
          stock: stock?.info?.symbol,
          buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
          sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
          atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
          atoSellQty: stock?.preOpenMarket?.atoSellQty,
          change: stock?.preOpenMarket?.Change,
        });
      }
      if (
        stock?.preOpenMarket?.totalSellQuantity >
          times * stock?.preOpenMarket?.totalBuyQuantity &&
        stock?.preOpenMarket?.atoSellQty > stock?.preOpenMarket?.atoBuyQty &&
        stock?.preOpenMarket?.Change > 0
      ) {
        sellMoreAtoFilter.push({
          stock: stock?.info?.symbol,
          buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
          sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
          atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
          atoSellQty: stock?.preOpenMarket?.atoSellQty,
          change: stock?.preOpenMarket?.Change,
        });
      }
      if (
        stock?.preOpenMarket?.totalBuyQuantity >
          times * stock?.preOpenMarket?.totalSellQuantity &&
        stock?.preOpenMarket?.Change < 0
      ) {
        buyMoreFiltered.push({
          stock: stock?.info?.symbol,
          buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
          sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
          atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
          atoSellQty: stock?.preOpenMarket?.atoSellQty,
          change: stock?.preOpenMarket?.Change,
        });
      }
      if (
        stock?.preOpenMarket?.totalBuyQuantity >
          times * stock?.preOpenMarket?.totalSellQuantity &&
        stock?.preOpenMarket?.atoBuyQty > stock?.preOpenMarket?.atoSellQty &&
        stock?.preOpenMarket?.Change < 0
      ) {
        buyMoreAtoFiltered.push({
          stock: stock?.info?.symbol,
          buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
          sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
          atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
          atoSellQty: stock?.preOpenMarket?.atoSellQty,
          change: stock?.preOpenMarket?.Change,
        });
      }
    });

    return {
      sellMoreFiltered,
      sellMoreAtoFilter,
      buyMoreFiltered,
      buyMoreAtoFiltered,
    };
  } catch (error) {
    console.error("Error fetching sell more data:", error);
    throw error;
  }
};
const getCustomTimesStockDataFnForAto = async (stocks, times = 3) => {
  try {
    const stockDataPromises = stocks.map((symbol) => getDataBySymbol(symbol));
    const allStockData = await Promise.all(stockDataPromises);
    const sellAtoMore = [];
    const buyAtoMore = [];

    allStockData.forEach((stock) => {
      if (
        stock?.preOpenMarket?.atoSellQty >
        times * stock?.preOpenMarket?.atoBuyQty
      ) {
        sellAtoMore.push({
          stock: stock?.info?.symbol,
          buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
          sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
          atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
          atoSellQty: stock?.preOpenMarket?.atoSellQty,
          change: stock?.preOpenMarket?.Change,
        });
      }
      if (
        stock?.preOpenMarket?.atoBuyQty >
        times * stock?.preOpenMarket?.atoSellQty
      ) {
        buyAtoMore.push({
          stock: stock?.info?.symbol,
          buyQuantity: stock?.preOpenMarket?.totalBuyQuantity,
          sellQuantity: stock?.preOpenMarket?.totalSellQuantity,
          atoBuyQty: stock?.preOpenMarket?.atoBuyQty,
          atoSellQty: stock?.preOpenMarket?.atoSellQty,
          change: stock?.preOpenMarket?.Change,
        });
      }
    });

    return {
      sellAtoMore,
      buyAtoMore,
    };
  } catch (error) {
    console.error("Error fetching sell more data:", error);
    throw error;
  }
};

const getDataBySymbol = async (symbol) => {
  let url = `https://www.nseindia.com/api/quote-equity?symbol=${symbol}`;
  const data = await nseIndia.getData(url);
  return data;
};

const getStockGraphData = async () => {
  try {
    // const data = await nseIndia.getDataByEndpoint(
    //   "https://www.nseindia.com/api/market/volume"
    // );
    const data = await get50StockData();
    return data;
  } catch (error) {
    console.log("error", error);
    throw error;
  }
  // const data = await get50StockData();
};

const getStock10timesData = async (query) => {
  try {
    let type = query?.type;
    let times = Number(query?.times) || 10;
    let stock = [...nifty50Stocks];
    if (type) {
      if (type === "mid") {
        stock = [...midCapSymbols];
      } else if (type === "small") {
        stock = [...smallCapSymbols];
      } else if (type === "hundred") {
        stock = [...nifty100Symbols];
      }
    }
    // const data = await nseIndia.getDataByEndpoint(
    //   "https://www.nseindia.com/api/market/volume"
    // );
    const data = await get10TimesStockDataFn(stock, times);
    return data;
  } catch (error) {
    console.log("error", error);
    throw error;
  }
  // const data = await get50StockData();
};

const getEquityStockIndices = async (query) => {
  try {
    const data = await getStockCustomize(query);
    return data;
  } catch (error) {
    throw error;
  }
};
const getStockCustomize = async (query) => {
  try {
    let type = query?.type;
    let times = Number(query?.times) || 10;
    let stock = [...nifty50Stocks];
    if (type) {
      if (type === "mid") {
        stock = [...midCapSymbols];
      } else if (type === "small") {
        stock = [...smallCapSymbols];
      } else if (type === "hundred") {
        stock = [...nifty100Symbols];
      } else if (type === "three") {
        stock = [...indianStockSymbols];
      }
    }
    // const data = await nseIndia.getDataByEndpoint(
    //   "https://www.nseindia.com/api/market/volume"
    // );
    const data = await getCustomTimesStockDataFn(stock, times);
    return data;
  } catch (error) {
    console.log("error", error);
    throw error;
  }
  // const data = await get50StockData();
};
const getStockCustomizeForAto = async (query) => {
  try {
    let type = query?.type;
    let times = Number(query?.times) || 10;
    let stock = [...nifty50Stocks];
    if (type) {
      if (type === "mid") {
        stock = [...midCapSymbols];
      } else if (type === "small") {
        stock = [...smallCapSymbols];
      } else if (type === "hundred") {
        stock = [...nifty100Symbols];
      } else if (type === "three") {
        stock = [...indianStockSymbols];
      }
    }
    // const data = await nseIndia.getDataByEndpoint(
    //   "https://www.nseindia.com/api/market/volume"
    // );
    const data = await getCustomTimesStockDataFnForAto(stock, times);
    return data;
  } catch (error) {
    console.log("error", error);
    throw error;
  }
  // const data = await get50StockData();
};
module.exports = {
  fileUpload,
  removeFileDoc,
  getAllFilesByUserId,
  getFile,
  getStockGraphData,
  getStock10timesData,
  getEquityStockIndices,
  getStockCustomizeForAto,
};
