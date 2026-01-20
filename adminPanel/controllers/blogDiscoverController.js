const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const BLOG_CONFIG = {
  home: {
    slug: "home",
    collection: "home"
  },
  project: {
    slug: "ProjectPage",
    collection: "ProjectPage"
  },
  discoverUs: {
    slug: "discoverUs",
    collection: "discoverUs"
  },
  ongoing: {
    slug: "OnGoingPage",
    collection: "OnGoingPage"
  }
};

const getBlogs = async (req, res) => {
  try {
    const { slug, section } = req.params;
    const config = BLOG_CONFIG[slug] || { collection: 'discoverUs', slug: slug };
    const collection = mongoose.connection.db.collection(config.collection);

    const data = await collection.findOne({
      page_slug: config.slug,
      page_section: section
    });

    res.json({ success: true, data: data?.page_content || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addBlogs = async (req, res) => {
  try {
    const { slug, section } = req.params;
    const blogArr = JSON.parse(req.body.blogArr || '[]');
    const config = BLOG_CONFIG[slug] || { collection: 'discoverUs', slug: slug };
    const collection = mongoose.connection.db.collection(config.collection);

    const blogs = blogArr.map((b, i) => {
      const file = req.files.find(f => f.fieldname === `file_${i}`);
      return {
        inner_img: file ? `${process.env.PROJECT_URL}uploads/blogDiscover/${file.filename}` : b.coverImage,
        badge_text: b.blogTag,
        blog_date: b.publicationDate,
        blog_text: b.blogTitle,
        blog_description: b.blogDescription,
        blog_id: new ObjectId()
      };
    });

    await collection.updateOne(
      { page_slug: config.slug, page_section: section },
      { $push: { page_content: { $each: blogs } } },
      { upsert: true }
    );

    res.json({ success: true, message: 'Blog added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const { slug, section, index } = req.params;
    const config = BLOG_CONFIG[slug] || { collection: 'discoverUs', slug: slug };
    const collection = mongoose.connection.db.collection(config.collection);

    const page = await collection.findOne({
      page_slug: config.slug,
      page_section: section
    });

    if (page && page.page_content) {
      page.page_content.splice(Number(index), 1);

      await collection.updateOne(
        { page_slug: config.slug, page_section: section },
        { $set: { page_content: page.page_content } }
      );
      res.json({ success: true, message: 'Blog deleted' });
    } else {
      res.status(404).json({ success: false, message: 'Blog not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getBlogs, addBlogs, deleteBlog };
