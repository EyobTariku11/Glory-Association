
// // Import packages
// const express = require("express");
// const home = require("./routes/home");
// const chapa = require("./routes/chapa");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const fs = require("fs");
// const https = require("https");

// // Middlewares
// const app = express();
// app.use(express.json());
// app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   next();
// });

// const options = {
//   key: fs.readFileSync("./key.pem"), // Update with the correct path to your SSL/TLS private key

//   cert: fs.readFileSync("./cert.pem"),
//   };


// app.use(cors(options));

// app.use("/", home);
// app.use("/chapa", chapa);

// // Connection
// const port = 8443; // Change this to your desired HTTPS port

// https.createServer(options, app).listen(port, () => {
//   console.log(`Listening to port ${port}`);
// });
// Import packages
const express = require("express");
const home = require("./routes/home");
const arifpay = require("./routes/ArifPay");
const cors = require("cors");
const bodyParser = require("body-parser");

// Load environment variables
require('dotenv').config();

// Middlewares
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Define routes
app.use("/", home);
app.use("/arifpay", arifpay);

// HTTP Connection
const port = 8080; // Choose your desired port for HTTP

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
