const mongoose = require("mongoose");

const BANNER_CONFIG = {
  home: {
    collection: "home",
    slug: "home",
    section: "home_banner",
    path: `${process.env.PROJECT_URL}uploads/homebanner/`,
    imageField: "projimage"
  },
  project: {
    collection: "ProjectPage",
    slug: "ProjectPage",
    section: "project-banner",
    path: `${process.env.PROJECT_URL}uploads/projectbanner/`,
    imageField: "image"
  },
  discoverUs: {
    collection: "discoverUs",
    slug: "discoverUs",
    section: "discover-banner",
    path: `${process.env.PROJECT_URL}uploads/discoverUsbanner/`,
    imageField: "image"
  },
  ongoing: {
    collection: "OnGoingPage",
    slug: "OnGoingPage",
    section: "hero-section",
    path: `${process.env.PROJECT_URL}uploads/ongoingbanner/`,
    imageField: "pimage"
  }
};

/**
 * GET banner images
 */
const getBanners = async (req, res) => {
  try {
    const { slug } = req.params;
    const config = BANNER_CONFIG[slug];

    if (!config) {
      return res.status(404).json({ success: false, message: "Invalid banner type" });
    }

    if (!mongoose.connection.db) {
      return res.status(503).json({ success: false, message: "Database connection not ready" });
    }
    const collection = mongoose.connection.db.collection(config.collection);

    const data = await collection.findOne({
      page_slug: config.slug,
      page_section: config.section,
    });

    const items = data?.page_content || [];
    // Normalize field name to 'image' for the frontend
    const banners = items.map(item => ({
      image: item[config.imageField] || item.image
    }));

    res.json({
      success: true,
      data: banners,
    });
  } catch (error) {
    console.error(`[BannerAPI] GET Error: ${error.message}`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ADD banner images (ARRAY)
 */
const addBanners = async (req, res) => {
  try {
    const { slug } = req.params;
    const config = BANNER_CONFIG[slug];

    if (!config) {
      return res.status(404).json({ success: false, message: "Invalid banner type" });
    }

    if (!req.files || !req.files.length) {
      return res
        .status(422)
        .json({ success: false, message: "No banner images uploaded" });
    }

    const collection = mongoose.connection.db.collection(config.collection);

    const bannersToAdd = req.files.map((file) => ({
      [config.imageField]: `${config.path}${file.filename}`,
    }));

    const pageSlug = config.slug;
    const pageSection = config.section;

    // checking page & section
    const page = await collection.findOne({
      page_slug: pageSlug,
      page_section: pageSection,
    });

    if (!page) {
      await collection.insertOne({
        page_slug: pageSlug,
        page_section: pageSection,
        page_content: bannersToAdd,
      });

      return res.json({
        success: true,
        message: "New page and new banner section created with banners",
      });
    } else {
      await collection.updateOne(
        { page_slug: pageSlug, page_section: pageSection },
        {
          $push: {
            page_content: { $each: bannersToAdd },
          },
        }
      );

      return res.json({
        success: true,
        message: "Banner images added to existing section",
      });
    }
  } catch (error) {
    console.error("Error in addBanners:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE banner by index
 */
const deleteBanner = async (req, res) => {
  try {
    const { slug, index } = req.params;
    const config = BANNER_CONFIG[slug];

    if (!config) {
      return res.status(404).json({ success: false, message: "Invalid banner type" });
    }

    if (!mongoose.connection.db) {
      return res.status(503).json({ success: false, message: "Database connection not ready" });
    }
    const collection = mongoose.connection.db.collection(config.collection);

    const data = await collection.findOne({
      page_slug: config.slug,
      page_section: config.section,
    });

    if (!data?.page_content?.length) {
      return res
        .status(404)
        .json({ success: false, message: "No banners found" });
    }

    data.page_content.splice(Number(index), 1);

    await collection.updateOne(
      { page_slug: config.slug, page_section: config.section },
      { $set: { page_content: data.page_content } }
    );

    res.json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  getBanners,
  addBanners,
  deleteBanner,
};
