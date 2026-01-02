const express = require("express");
const fs = require("fs");
const path = require("path");
// const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const createError = require("http-errors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const config = require("./config/config");
const homeRoutes = require("./routes/homeRoutes");
const onGoingPageRoutes = require("./routes/onGoingPageRoutes");

(utils = require("./utils/index")), (env = process.env.NODE_ENV);

//routes
// const customerQueriesRoutes = require("./routes/customerQueryRoutes");
// const grievanceRoutes = require("./routes/grievanceRoutes");
// const authRoutes = require("./routes/authRoutes");
// const policyfileRoutes = require("./routes/policyfileRoutes");
// const assetsForSaleRoutes = require("./routes/assetSalefileRoutes");
// const fileRoutes = require("./routes/fileRoutes");
var hsts = require("hsts");


// Initialize dotenv for environment variables
dotenv.config();

// MongoDB connection
mongoose.connect(config.mongodb.uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Initialize the app
const app = express();
app.use(cors());
app.use(cookieParser());
// app.use(flash());

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



// View engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
// ✅ Serve static /bundle files here
app.use("/bundle", express.static(path.join(__dirname, "public/bundle")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Define other routes and logic here
app.use((req, res, next) => {
  res.locals.utils = utils;
  res.locals.env = env;
  next();
});

// Routes-way
// app.use("/admin", authRoutes);
// app.use("/customerquerys", customerQueriesRoutes);
// app.use("/grievances", grievanceRoutes);
// app.use("/policy", policyfileRoutes);
// app.use("/assetsForSale", assetsForSaleRoutes);
// app.use("/file", fileRoutes);
app.use("/", homeRoutes);
app.use("/OnGoingPage", onGoingPageRoutes);

app.use((req, res, next) => {
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  next();
});

app.use(
  hsts({
    maxAge: 31536000,
    includeSubDomains: true, // Also enabled by default
  })
);

app.get("/test", (req, res) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' data: https://cdnjs.cloudflare.com; script-src 'self' https://code.jquery.com; style-src  'self' 'unsafe-inline'  https://cdnjs.cloudflare.com; img-src 'self' data: ;"
  );
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  res.render("home");
});

// app.get("/adminpanel", (req, res) => {
//   res.setHeader(
//     "Content-Security-Policy",
// "default-src 'self' data: https://cdnjs.cloudflare.com; script-src 'self' https://code.jquery.com; style-src  'self' 'unsafe-inline'  https://cdnjs.cloudflare.com; img-src 'self' data: ;"
//   );

//   res.setHeader(
//     "Strict-Transport-Security",
//     "max-age=31536000; includeSubDomains"
//   );

//   res.render("login");
// });

// single slug
app.get("/:slug", async (req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
"default-src 'self' data: https://cdnjs.cloudflare.com; script-src 'self' https://code.jquery.com; style-src  'self' 'unsafe-inline'  https://cdnjs.cloudflare.com; img-src 'self' data: ;"  );

  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  const { slug } = req.params;
  const fileName = path.basename(slug);

  if (slug === "login" || slug === "upload" || slug === "assetsale_upload" || slug === "OnGoingPage") {
    return next();
  }

  const filePath = path.join(__dirname, "views", `${fileName}.pug`);

  if (fs.existsSync(filePath)) {
    res.render(slug);
  } else {
    next();
  }
});

app.use((req, res, next) => {
  next(createError(404));
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' https://code.jquery.com; style-src  'self' 'unsafe-inline'"
  );

  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  // //console.log("404 error",err)
  res.status(404).render("404", { message: "Page not found!" }); // Render 404 pag
});

//Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
    //console.log(`Server is running on http://localhost:${PORT}`);
// });

module.exports = app;