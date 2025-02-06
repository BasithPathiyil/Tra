const express = require("express");
const helmet = require("helmet");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const xss = require("xss-clean");
const cors = require("cors");
const routes = require("./routes");
const { errorHandler } = require("./middlewares/errorHanlder");
const { startCronJob } = require("./services/cronjob");

connectDB();
const app = express();
dotenv.config({ path: ".env" });
app.use(helmet());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(xss());

app.use(cors());
startCronJob();
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use("/api", routes);
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});
app.use((err, req, res, next) => {
  res.status(404).json({ error: err });
});
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
