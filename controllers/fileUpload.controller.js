const { fileUploadService } = require("../services");
const { tryCatch } = require("../utils/tryCatch");

const fileUpload = tryCatch(async (req, res, next) => {
  let objResult = await fileUploadService.fileUpload(req, res);
  res.status(200).json({
    status: true,
    statuscode: 200,
    message: "uploaded",
    objResult,
  });
});

const removeFile = tryCatch(async (req, res, next) => {
  let objResult = await fileUploadService.removeFileDoc(req.query.id);
  res.status(200).json({
    status: true,
    statuscode: 200,
    message: "Deleted Successfully",
    objResult,
  });
});

const getAllFilesByUserId = tryCatch(async (req, res, next) => {
  let { page, rowsPerPage } = req.query;
  let { allFiles, allFilesCount } = await fileUploadService.getAllFilesByUserId(
    req.user._id,
    {
      page,
      rowsPerPage,
    }
  );
  res.status(200).json({
    status: true,
    statuscode: 200,
    message: "all files fetched Successfully",
    arrResult: allFiles,
    arrCount: allFilesCount,
  });
});

const getFile = tryCatch(async (req, res, next) => {
  const { filePath, fileName } = await fileUploadService.getFile(
    req.query.fileId,
    req.query.secretKey
  );
  //   res.set("Content-Disposition", `attachment; filename=${fileName}`);
  //   res.set({
  //     "Content-Type": "image/jpeg",
  //     "Content-Disposition": `attachment; filename="example.jpg"`, // Set the desired filename
  //   });
  //   res.setHeader("Content-type", "image/jpeg");
  res.download(filePath);
});

const getStockGraphData = tryCatch(async (req, res, next) => {
  let { page, rowsPerPage } = req.query;
  let result = await fileUploadService.getStockGraphData();
  res.status(200).json({
    status: true,
    statuscode: 200,
    message: "all files fetched Successfully",
    result,
  });
});

const getStock10timesData = tryCatch(async (req, res, next) => {
  let { page, rowsPerPage } = req.query;
  let result = await fileUploadService.getStock10timesData(req.query);
  res.status(200).json({
    status: true,
    statuscode: 200,
    message: "all files fetched Successfully",
    result,
  });
});

const getEquityStockIndices = tryCatch(async (req, res, next) => {
  let { page, rowsPerPage } = req.query;
  let result = await fileUploadService.getEquityStockIndices(req.query);
  res.status(200).json({
    status: true,
    statuscode: 200,
    message: "all files fetched Successfully",
    result,
  });
});

const getStockCustomizeForAto = tryCatch(async (req, res, next) => {
  let { page, rowsPerPage } = req.query;
  let result = await fileUploadService.getStockCustomizeForAto(req.query);
  res.status(200).json({
    status: true,
    statuscode: 200,
    message: "all files fetched Successfully",
    result,
  });
});

const getStockIntradayValues = tryCatch(async (req, res, next) => {
  let { page, rowsPerPage } = req.query;
  let result = await fileUploadService.getStockIntradayValues(req.query);
  res.status(200).json({
    status: true,
    statuscode: 200,
    message: "all files fetched Successfully",
    result,
  });
});

const getLast3Intervals = tryCatch(async (req, res, next) => {
  let { page, rowsPerPage } = req.query;
  let result = await fileUploadService.getLast3Intervals(req.query);
  res.status(200).json({
    status: true,
    statuscode: 200,
    message: "all files fetched Successfully",
    result,
  });
});
const getLast3IntervalsOfMultiple = tryCatch(async (req, res, next) => {
  let { page, rowsPerPage } = req.query;
  let result = await fileUploadService.getLast3IntervalsOfMultiple(req.query);
  res.status(200).json({
    status: true,
    statuscode: 200,
    message: "all files fetched Successfully",
    result,
  });
});
const preOpenMarketData = tryCatch(async (req, res, next) => {
  let { page, rowsPerPage } = req.query;
  let result = await fileUploadService.preOpenMarketData(req.query);
  res.status(200).json({
    status: true,
    statuscode: 200,
    message: "all files fetched Successfully",
    result,
  });
});

const getDataBySymbol = tryCatch(async (req, res, next) => {
  let { symbol, rowsPerPage } = req.query;
  if (!symbol) {
    symbol = "TATASTEEL";
  }
  let result = await fileUploadService.getDataBySymbol(symbol);
  res.status(200).json({
    status: true,
    statuscode: 200,
    message: "all files fetched Successfully",
    result,
  });
});

const preOpenMarketFirstFive = tryCatch(async (req, res, next) => {
  let { page, rowsPerPage } = req.query;
  let result = await fileUploadService.preOpenMarketData(req.query);

  let validStocks = await fileUploadService.preOpenPlusFirstFive(
    result.sellMoreNTimes,
    req.query
  );
  res.status(200).json({
    status: true,
    statuscode: 200,
    message: "all files fetched Successfully",
    validStocks,
  });
});

const getConsolidationStocks = tryCatch(async (req, res, next) => {
  let { page, rowsPerPage } = req.query;
  let result = await fileUploadService.getConsolidationStocks(req.query);
  res.status(200).json({
    status: true,
    statuscode: 200,
    message: "all files fetched Successfully",
    result,
  });
});

module.exports = {
  fileUpload,
  removeFile,
  getAllFilesByUserId,
  getFile,
  getStockGraphData,
  getStock10timesData,
  getEquityStockIndices,
  getStockCustomizeForAto,
  getStockIntradayValues,
  getLast3Intervals,
  getLast3IntervalsOfMultiple,
  preOpenMarketData,
  getDataBySymbol,
  preOpenMarketFirstFive,
  getConsolidationStocks,
};
