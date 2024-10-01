const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const os = require("os");
const cluster = require("cluster");

require("dotenv").config();

//import routes
const userAuth = require("./routes/authRoutes");
const taskroutes = require("./routes/tasks");
const storageroutes = require("./routes/storage");
const msgroutes = require("./routes/messages");
const orgroutes = require("./routes/org");

//middlewares
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api", userAuth);
app.use("/api", taskroutes);
app.use("/api", storageroutes);
app.use("/api", msgroutes);
app.use("/api", orgroutes);

//DB
const connectDB = async () => {
  try {
    // mongoose.set("strictQuery", false);
    mongoose.connect(process.env.PRODDB).then(() => {
      console.log("DB is connected");
    });
  } catch (err) {
    console.log(err);
  }
};
connectDB();

//App
//const PORT = 7352;
const connectApp = () => {
  try {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on ${process.env.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};
connectApp();
