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
const projectsRoutes = require("./routes/projectsRoutes");
const onGoingPageRoutes = require("./routes/onGoingPageRoutes");
const discoverUsRoutes = require("./routes/discoverUsRoutes");
const contactRoutes = require('./routes/contactRoutes');
const upcomingRoutes = require('./adminPanel/routes/upcomingRoutes');
const completedRoutes = require('./adminPanel/routes/completedRoutes');
const galleryRoutes = require('./adminPanel/routes/galleryRoutes');
<<<<<<< HEAD
const blogDiscoverRoutes = require('./adminPanel/routes/blogDiscoverRoutes');
=======
const blogRoutes = require('./adminPanel/routes/blogRoutes');
const bannerRoutes = require('./adminPanel/routes/bannerRoutes');
>>>>>>> a1cba77 (Banner pages and other updates)

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

app.locals.PROJECT_URL = process.env.PROJECT_URL;



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
  res.locals.query = req.query; // expose query params to views (used for slug)
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
app.use('/home', homeRoutes);
app.use("/ProjectPage", projectsRoutes);
app.use("/OnGoingPage", onGoingPageRoutes);
app.use("/discoverUs", discoverUsRoutes);
app.use('/', contactRoutes);
app.use('/admin/upcoming', upcomingRoutes);
app.use('/admin/completed', completedRoutes);
app.use('/admin/gallery', galleryRoutes);
<<<<<<< HEAD
app.use('/admin/blogDiscover', blogDiscoverRoutes);
=======
app.use('/admin/blog', blogRoutes);
app.use('/admin/banners', bannerRoutes);

>>>>>>> a1cba77 (Banner pages and other updates)
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

app.get("/", (req, res) => {
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

app.get("/:cat/:slug", (req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' data: https://cdnjs.cloudflare.com; script-src 'self' https://code.jquery.com; style-src  'self' 'unsafe-inline'  https://cdnjs.cloudflare.com; img-src 'self' data: ;"
  );

  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  const { slug, cat } = req.params;
  const fileName = path.basename(slug);

  const filePath = path.join(__dirname, `views/${cat}`, `${fileName}.pug`);
  // console.log(filePath,'filePath')

  if (fs.existsSync(filePath)) {
    res.render(`${cat}/${slug}`);
  } else {
    next();
  }

});

// single slug
app.get("/:slug", async (req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' data: https://cdnjs.cloudflare.com; script-src 'self' https://code.jquery.com; style-src  'self' 'unsafe-inline'  https://cdnjs.cloudflare.com; img-src 'self' data: ;");

  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  const { slug } = req.params;

  const fileName = path.basename(slug);

  if (slug === "login" || slug === "upload" || slug === "assetsale_upload" || slug === "OnGoingPage" || slug === "admin") {
    return next();
  }

  const filePath = path.join(__dirname, "views", `${fileName}.pug`);
  // console.log(filePath,'filePath')

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