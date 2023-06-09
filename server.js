const expressPackage = require("express");
const express = expressPackage();
require("dotenv").config();
const connectDB = require("./Config/db");
const morgan = require("morgan");
// connect to DB
connectDB();
const port = process.env.PORT || 4000;
const { notFound, errorHandler } = require("./middlewares/errorMiddlesWare");
const routes = require("./Routes/index");

const { swaggerDocs, routerSwagger } = require("./utils/swagger");

// middleware
express.use(expressPackage.json());

// routes
express.get("/api", (req, res) => {
  res.send({ message: "welcome to this api" });
});

express.use("/api", routes);
express.use(morgan("dev"));
// routes for errorhandling
express.use(notFound);
express.use(errorHandler);

express.listen(port, (err) => {
  if (err) {
    console.log("something went wrong");
    return;
  }
  console.log(`listening at port: ${port}`);

  swaggerDocs(express, port);
});
