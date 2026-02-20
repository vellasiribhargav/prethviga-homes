const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const path = `${process.env.PROJECT_URL}uploads/gallery/`;
const { formatDateForDisplay, formatDateShortSimple } = require('../../utils/index');
const BANNER_CONFIG = {
  home: {
    collection: "banner",
    slug: "home",
    section: "home_banner",
    path: path,
    imageField: "projimage"
  },
  project: {
    collection: "banner",
    slug: "projects",
    section: "project-banner",
    path: path,
    imageField: "image"
  },
  discoverUs: {
    collection: "banner",
    slug: "discoverUs",
    section: "discover-banner",
    path: path,
    imageField: "image"
  },
  'home-reviews': {
    collection: "banner",
    slug: "home",
    section: "home_reviews",
    path: path,
    imageField: "profile_image"
  }
};

const renderBannerMainPage = async (req, res) => {
  try {
    res.render('admin/banner');
  } catch (error) {
    console.error('Error rendering banner page:', error);
    res.render('admin/banner');
  }
};

const getBannersList = async (req, res) => {
  try {
    const { slug } = req.params;
    const config = BANNER_CONFIG[slug] || BANNER_CONFIG.home;
    const collection = mongoose.connection.db.collection(config.collection);

    const data = await collection.find({
      page_slug: config.slug,
      page_section: config.section
    }).toArray();

    const banners = data.map((item, index) => ({
      image: item[config.imageField] || item.image,
      Heading: item.Heading || '',
      subHeading: item.subHeading || '',
      description: item.description || '',
      number: item.number || '',
      index: index,
      id: item._id.toString(),
      formattedDate: formatDateForDisplay(item.createdAt, true)
    }));

    res.render('admin/banner_list', {
      title: 'Banner Management',
      banners,
      slug,
      activeLink: 'banner',
      rowsPerPage: 5,
      rowsPerPageOptions: [5, 10]
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.render('admin/banner_list', {
      title: 'Banner Management',
      banners: [],
      slug: req.params.slug,
      activeLink: 'banner',
      error: error.message
    });
  }
};

// GET
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

    const items = await collection.find({
      page_slug: config.slug,
      page_section: config.section,
    }).toArray();

    // Normalize field name to 'image' for the frontend and include text fields
    const banners = items.map(item => {
      if (slug === 'home-reviews') {
        return {
          id: item._id.toString(),
          user_name: item.user_name || '',
          user_role: item.user_role || '',
          reviewer: item.reviewer || '',
          profile_image: item[config.imageField] || item.profile_image || ''
        };
      }
      return {
        id: item._id.toString(),
        image: item[config.imageField] || item.image,
        Heading: item.Heading || '',
        subHeading: item.subHeading || '',
        description: item.description || '',
        number: item.number || ''
      };
    });

    res.json({
      success: true,
      data: banners,
    });
  } catch (error) {
    console.error(`[BannerAPI] GET Error: ${error.message}`, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

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

    const { Heading, subHeading, description, number } = req.body;
    const bannersToAdd = req.files.map((file) => ({
      page_slug: config.slug,
      page_section: config.section,
      [config.imageField]: `${config.path}${file.filename}`,
      Heading: Heading || '',
      subHeading: subHeading || '',
      description: description || '',
      number: number || '',
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await collection.insertMany(bannersToAdd);

    return res.json({
      success: true,
      message: "Banner images added successfully",
    });

  } catch (error) {
    console.error("Error in addBanners:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBanner = async (req, res) => {
  try {
    const { slug, id } = req.params;
    const config = BANNER_CONFIG[slug];

    if (!config) {
      return res.status(404).json({ success: false, message: "Invalid banner type" });
    }

    const { Heading, subHeading, description, number } = req.body;
    const collection = mongoose.connection.db.collection(config.collection);

    const updateData = {};
    if (req.file) {
      updateData[config.imageField] = `${config.path}${req.file.filename}`;
    }

    // Always update text fields if they are provided
    if (Heading !== undefined) updateData.Heading = Heading;
    if (subHeading !== undefined) updateData.subHeading = subHeading;
    if (description !== undefined) updateData.description = description;
    if (number !== undefined) updateData.number = number;

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    res.json({ success: true, message: 'Banner updated successfully!' });
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSectionText = async (req, res) => {
  try {
    const { slug } = req.params;
    const config = BANNER_CONFIG[slug];
    const { Heading, subHeading, description, number, reviews } = req.body;

    if (!config) {
      return res.status(404).json({ success: false, message: "Invalid banner type" });
    }

    const collection = mongoose.connection.db.collection(config.collection);

    if (slug === 'home-reviews' && reviews) {
      let updatedReviews = JSON.parse(reviews);

      for (let i = 0; i < updatedReviews.length; i++) {
        const review = updatedReviews[i];
        if (req.files && req.files.length > 0) {
          req.files.forEach(file => {
            const match = file.fieldname.match(/review_image_(\d+)/);
            if (match && parseInt(match[1]) === i) {
              review.profile_image = `${config.path}${file.filename}`;
            }
          });
        }

        if (review.id || review._id) {
          await collection.updateOne(
            { _id: new ObjectId(review.id || review._id) },
            {
              $set: {
                user_name: review.user_name,
                user_role: review.user_role,
                reviewer: review.reviewer,
                profile_image: review.profile_image
              }
            }
          );
        } else {
          // Insert new review
          await collection.insertOne({
            page_slug: config.slug,
            page_section: config.section,
            user_name: review.user_name,
            user_role: review.user_role,
            reviewer: review.reviewer,
            profile_image: review.profile_image,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }

      return res.json({ success: true, message: 'Reviews updated successfully!' });
    }

    await collection.updateMany(
      { page_slug: config.slug, page_section: config.section },
      { $set: { Heading, subHeading, description, number } }
    );

    res.json({ success: true, message: 'Banner text updated successfully!' });
  } catch (error) {
    console.error('Update Text Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const { slug, id } = req.params;
    const config = BANNER_CONFIG[slug];

    if (!config) {
      return res.status(404).json({ success: false, message: "Invalid banner type" });
    }

    if (!mongoose.connection.db) {
      return res.status(503).json({ success: false, message: "Database connection not ready" });
    }
    const collection = mongoose.connection.db.collection(config.collection);

    const result = await collection.deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    res.json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  renderBannerMainPage,
  getBannersList,
  getBanners,
  addBanners,
  updateBanner,
  updateSectionText,
  deleteBanner,
};