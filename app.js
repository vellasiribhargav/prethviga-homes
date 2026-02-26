const express = require("express");
const fs = require("fs");
const path = require("path");
// const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config();

const bodyParser = require("body-parser");
const cors = require("cors");
const createError = require("http-errors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const config = require("./config/config.js");
const homeRoutes = require("./routes/homeRoutes");
const projectsRoutes = require("./routes/projectsRoutes");
const onGoingPageRoutes = require("./routes/onGoingPageRoutes");
const discoverUsRoutes = require("./routes/discoverUsRoutes");

const upcomingRoutes = require('./adminPanel/routes/upcomingRoutes');
const completedRoutes = require('./adminPanel/routes/completedRoutes');
const galleryRoutes = require('./adminPanel/routes/galleryRoutes');
const blogRoutes = require('./adminPanel/routes/blogRoutes');
const faqRoutes = require('./adminPanel/routes/faqRoutes');
const bannerRoutes = require('./adminPanel/routes/bannerRoutes');
const contactsRoutes = require('./adminPanel/routes/contactsRoutes');
const projectDetailsRoutes = require('./adminPanel/routes/projectDetailsRoutes');
const discoverDetailsRoutes = require('./adminPanel/routes/discoverDetailsRoutes');
const projectsListRoutes = require('./adminPanel/routes/projectsRoutes');
const reviewRoutes = require('./adminPanel/routes/reviewRoutes');
const adminAuthRoutes = require('./adminPanel/routes/authRoutes');
const { protectAdmin } = require('./middleware/authMiddleware');

const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const { initRedis } = require('./config/redis.js');

(utils = require("./utils/index")), (env = process.env.NODE_ENV);

//routes
// const customerQueriesRoutes = require("./routes/customerQueryRoutes");
// const grievanceRoutes = require("./routes/grievanceRoutes");
// const authRoutes = require("./routes/authRoutes");
// const policyfileRoutes = require("./routes/policyfileRoutes");
// const assetsForSaleRoutes = require("./routes/assetSalefileRoutes");
// const fileRoutes = require("./routes/fileRoutes");
var hsts = require("hsts");

// MongoDB connection
mongoose.connect(config.mongodb.uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Initialize the app
const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(cookieParser());
// app.use(flash());

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

(async () => {
  try {
    await initRedis();
  } catch (err) {
    console.error('Redis init failed:', err.message);
  }
})();

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

app.get('/admin', (req, res) => {
  res.redirect('/admin/banner/list');
});

// Routes-way
// app.use("/admin", authRoutes);
// app.use("/customerquerys", customerQueriesRoutes);
// app.use("/grievances", grievanceRoutes);
// app.use("/policy", policyfileRoutes);
// app.use("/assetsForSale", assetsForSaleRoutes);
// app.use("/file", fileRoutes);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.quilljs.com"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.quilljs.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
    },
  },
  crossOriginEmbedderPolicy: false,
})
);

app.use("/", homeRoutes);
app.use('/home', homeRoutes);
app.use("/ProjectPage", projectsRoutes);
app.use("/OnGoingPage", onGoingPageRoutes);
app.use("/discoverUs", discoverUsRoutes);
app.use('/', contactsRoutes);

// Admin Auth Routes
app.use('/admin', adminAuthRoutes);

// Protected Admin Routes
app.use('/admin', protectAdmin, upcomingRoutes);
app.use('/admin/upcoming', protectAdmin, upcomingRoutes);
app.use('/admin/completed', protectAdmin, completedRoutes);
app.use('/admin/gallery', protectAdmin, galleryRoutes);
app.use('/admin/blog', protectAdmin, blogRoutes);
app.use('/admin/faq', protectAdmin, faqRoutes);
app.use('/admin/banner', protectAdmin, bannerRoutes);
app.use('/admin/contacts', protectAdmin, contactsRoutes);
app.use('/admin/projectDetails', protectAdmin, projectDetailsRoutes);
app.use('/admin/discoverDetails', protectAdmin, discoverDetailsRoutes);
app.use('/admin/reviews', protectAdmin, reviewRoutes);
app.use('/admin/projects', protectAdmin, projectsListRoutes);
app.use('/admin/upcoming_projects', protectAdmin, upcomingRoutes);

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
    "default-src 'self' data:; script-src 'self' 'unsafe-inline' https://cdn.quilljs.com; script-src-attr 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://cdn.quilljs.com; font-src 'self' data:; img-src 'self' data: blob:;"
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
    "default-src 'self' data:; script-src 'self' 'unsafe-inline' https://cdn.quilljs.com; script-src-attr 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://cdn.quilljs.com; font-src 'self' data:; img-src 'self' data: blob:;"
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
    "default-src 'self' data:; script-src 'self' 'unsafe-inline' https://cdn.quilljs.com; script-src-attr 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://cdn.quilljs.com; font-src 'self' data:; img-src 'self' data: blob:;"
  );

  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  const { slug } = req.params;

  const fileName = path.basename(slug);

  if (slug === "login" || slug === "upload" || slug === "assetsale_upload" || slug === "OnGoingPage" || slug === "admin" || slug === "BlogPage") {
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

// 404 Handler - must be after all routes
app.use(notFoundHandler);

// Global Error Handler - must be last
app.use(errorHandler);

//Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//console.log(`Server is running on http://localhost:${PORT}`);
// });

module.exports = app;