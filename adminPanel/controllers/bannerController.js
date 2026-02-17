const mongoose = require("mongoose");
const path = `${process.env.PROJECT_URL}uploads/gallery/`;
const BANNER_CONFIG = {
  home: {
    collection: "home",
    slug: "home",
    section: "home_banner",
    path: path,
    imageField: "projimage"
  },
  project: {
    collection: "ProjectPage",
    slug: "ProjectPage",
    section: "project-banner",
    path: path,
    imageField: "image"
  },
  discoverUs: {
    collection: "discoverUs",
    slug: "discoverUs",
    section: "discover-banner",
    path: path,
    imageField: "image"
  },
  'home-reviews': {
    collection: "home",
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

    const data = await collection.findOne({
      page_slug: config.slug,
      page_section: config.section
    });

    const banners = data?.page_content?.map((item, index) => ({
      image: item[config.imageField] || item.image,
      Heading: item.Heading || '',
      subHeading: item.subHeading || '',
      description: item.description || '',
      number: item.number || '',
      index: index,
      id: index.toString()
    })) || [];

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
    // Normalize field name to 'image' for the frontend and include text fields
    const banners = items.map(item => {
      if (slug === 'home-reviews') {
        return {
          user_name: item.user_name || '',
          user_role: item.user_role || '',
          reviewer: item.reviewer || '',
          profile_image: item[config.imageField] || item.profile_image || ''
        };
      }
      return {
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

    const { Heading, subHeading, description, number } = req.body;
    const bannersToAdd = req.files.map((file) => ({
      [config.imageField]: `${config.path}${file.filename}`,
      Heading: Heading || '',
      subHeading: subHeading || '',
      description: description || '',
      number: number || '',
      createdAt: new Date()
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
 * UPDATE banner image
 */
const updateBanner = async (req, res) => {
  try {
    const { slug, index } = req.params;
    const config = BANNER_CONFIG[slug];

    if (!config) {
      return res.status(404).json({ success: false, message: "Invalid banner type" });
    }

    const { Heading, subHeading, description, number } = req.body;
    const collection = mongoose.connection.db.collection(config.collection);

    const updateData = {};
    if (req.file) {
      updateData[`page_content.${index}.${config.imageField}`] = `${config.path}${req.file.filename}`;
    }

    // Always update text fields if they are provided
    if (Heading !== undefined) updateData[`page_content.${index}.Heading`] = Heading;
    if (subHeading !== undefined) updateData[`page_content.${index}.subHeading`] = subHeading;
    if (description !== undefined) updateData[`page_content.${index}.description`] = description;
    if (number !== undefined) updateData[`page_content.${index}.number`] = number;

    const result = await collection.updateOne(
      { page_slug: config.slug, page_section: config.section },
      { $set: updateData }
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

/**
 * UPDATE banner text data (Global for section)
 */
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

      // Handle file uploads for review profile images
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          // Expecting fieldName like 'review_image_0'
          const match = file.fieldname.match(/review_image_(\d+)/);
          if (match) {
            const index = parseInt(match[1]);
            if (updatedReviews[index]) {
              updatedReviews[index].profile_image = `${config.path}${file.filename}`;
            }
          }
        });
      }

      await collection.updateOne(
        { page_slug: config.slug, page_section: config.section },
        { $set: { page_content: updatedReviews } }
      );
      return res.json({ success: true, message: 'Reviews updated successfully!' });
    }

    const data = await collection.findOne({
      page_slug: config.slug,
      page_section: config.section,
    });

    if (!data || !data.page_content) {
      return res.status(404).json({ success: false, message: "Banner section not found" });
    }

    // Update all items that have text fields, or ensure at least one has it
    let textUpdated = false;
    const updatedContent = data.page_content.map(item => {
      // If it's an object that looks like it should have text (or even if it doesn't, we can add it to all for consistency if that's the pattern)
      // Actually, let's only update objects that ALREADY have at least one text field,
      // OR if it's the only object there.
      const hasTextField = ('Heading' in item || 'subHeading' in item || 'description' in item || 'number' in item);

      if (hasTextField) {
        textUpdated = true;
        return {
          ...item,
          Heading: Heading !== undefined ? Heading : item.Heading,
          subHeading: subHeading !== undefined ? subHeading : item.subHeading,
          description: description !== undefined ? description : item.description,
          number: number !== undefined ? number : item.number
        };
      }
      return item;
    });

    // If no item had text fields, add it to the first one or push a new one
    if (!textUpdated) {
      if (updatedContent.length > 0) {
        updatedContent[0].Heading = Heading;
        updatedContent[0].subHeading = subHeading;
        updatedContent[0].description = description;
        updatedContent[0].number = number;
      } else {
        updatedContent.push({
          Heading,
          subHeading,
          description,
          number,
          createdAt: new Date()
        });
      }
    }

    await collection.updateOne(
      { page_slug: config.slug, page_section: config.section },
      { $set: { page_content: updatedContent } }
    );

    res.json({ success: true, message: 'Banner text updated successfully!' });
  } catch (error) {
    console.error('Update Text Error:', error);
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
  renderBannerMainPage,
  getBannersList,
  getBanners,
  addBanners,
  updateBanner,
  updateSectionText,
  deleteBanner,
};