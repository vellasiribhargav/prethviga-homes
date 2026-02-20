const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { ObjectId } = require('mongodb');
const { formatDateForDisplay, formatDateMonthYear, formatDateShortSimple } = require('../../utils/index');

const BLOG_CONFIG = {
  home: {
    slug: "home",
    collection: "blogs"
  },
  project: {
    slug: "projects",
    collection: "blogs"
  },
  discoverUs: {
    slug: "discoverUs",
    collection: "blogs"
  },
  ongoing: {
    slug: "project_details",
    collection: "blogs"
  }
};


const renderBlogMainPage = async (req, res) => {
  try {
    res.render('admin/blog');
  } catch (error) {
    console.error('Error rendering blog page:', error);
    res.render('admin/blog');
  }
};

const getBlogsList = async (req, res) => {
  try {
    const slug = req.params.slug || "discoverUs";
    const section = req.params.section || "blogs-card";
    const collectionName = BLOG_CONFIG[slug]?.collection || "blogs";
    const collection = mongoose.connection.db.collection(collectionName);
    const config = BLOG_CONFIG[slug] || { collection: collectionName, slug: slug, section: section };

    const data = await collection.find({
      page_slug: config.slug,
      page_section: section
    }).toArray();

    const blogs = data.map((b, index) => ({
      ...b,
      id: b._id.toString(),
      title: b.blog_title,
      date: formatDateMonthYear(b.blog_date),
      tag: b.badge_text,
      category: b.badge_text,
      isSeeded: !!b.isSeeded,
      image: b.inner_img,
      description: b.blog_description,
      timeToRead: (b.blog_time && typeof b.blog_time === 'string') ? b.blog_time.replace(/\s*min\s*read\s*/i, '').trim() : b.blog_time,
      content: b.blog_content,
      contentSnippet: b.blog_content ? b.blog_content.replace(/<h1[^>]*>.*?<\/h1>/gi, '').replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/"/g, '&quot;').substring(0, 30) + (b.blog_content.replace(/<h1[^>]*>.*?<\/h1>/gi, '').replace(/<[^>]*>?/gm, '').length > 30 ? '...' : '') : 'No content available...',
      cleanContent: b.blog_content ? b.blog_content.replace(/<h1[^>]*>.*?<\/h1>/gi, '').replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/"/g, '&quot;') : 'No content available...',
      index: index,
      formattedDate: formatDateForDisplay(b.createdAt, true),
      formattedPublicationDate: formatDateMonthYear(b.blog_date)
    }));

    res.render('admin/blog_list', {
      title: 'Blog Management',
      blogs,
      slug,
      section,
      activeLink: 'blog',
      rowsPerPage: 5,
      rowsPerPageOptions: [5, 10]
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.render('admin/blog_list', {
      title: 'Blog Management',
      blogs: [],
      slug: req.params.slug,
      section: req.params.section,
      activeLink: 'blog',
      error: error.message
    });
  }
};

const getBlogs = async (req, res) => {
  try {
    const { slug, section } = req.params;
    const collectionName = BLOG_CONFIG[slug]?.collection || "blogs";
    const collection = mongoose.connection.db.collection(collectionName);
    const config = BLOG_CONFIG[slug] || { collection: collectionName, slug: slug };

    const data = await collection.find({
      page_slug: config.slug,
      page_section: section
    }).toArray();

    res.json({ success: true, data: data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addBlogs = async (req, res) => {
  try {
    const { slug, section } = req.params;
    const blogArr = JSON.parse(req.body.blogArr || '[]');
    const collectionName = BLOG_CONFIG[slug]?.collection || "blogs";
    const collection = mongoose.connection.db.collection(collectionName);
    const config = BLOG_CONFIG[slug] || { collection: collectionName, slug: slug };

    const blogs = blogArr.map((b, i) => {
      const file = req.files.find(f => f.fieldname === `file_${i}`);
      return {
        page_slug: config.slug,
        page_section: section,
        inner_img: file ? `${process.env.PROJECT_URL}uploads/gallery/${file.filename}` : b.coverImage,
        badge_text: b.blogTag,
        blog_date: b.publicationDate,
        blog_title: b.blogTitle,
        blog_description: b.blogDescription,
        blog_time: b.readTime,
        blog_content: b.blogContent,
        blog_id: new ObjectId(), // keeping blog_id for now if used elsewhere, but _id is primary
        createdAt: new Date(), // Use new Date()
        updatedAt: new Date()
      };
    });

    if (blogs.length > 0) {
      await collection.insertMany(blogs);
    }

    res.json({ success: true, message: 'Blog added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBlog = async (req, res) => {
  try {
    const { slug, section, id } = req.params; // Changed index to id
    const collectionName = BLOG_CONFIG[slug]?.collection || "blogs";
    const collection = mongoose.connection.db.collection(collectionName);

    const updateFields = {};
    if (req.body.title) updateFields.blog_title = req.body.title;
    if (req.body.date) updateFields.blog_date = req.body.date;
    if (req.body.tag) updateFields.badge_text = req.body.tag;
    if (req.body.description) updateFields.blog_description = req.body.description;
    if (req.body.read_time) updateFields.blog_time = req.body.read_time;
    if (req.body.content) updateFields.blog_content = req.body.content;

    if (req.file) {
      updateFields.inner_img = `${process.env.PROJECT_URL}uploads/gallery/${req.file.filename}`;
    } else if (req.body.remove_image === 'true') {
      updateFields.inner_img = null;
    }

    if (req.file) {
      updateFields.blog_image = `${process.env.PROJECT_URL}uploads/gallery/${req.file.filename}`;
    }

    updateFields.updatedAt = new Date();

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'No changes made or blog not found' });
    }

    res.json({ success: true, message: 'Blog updated successfully!' });
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const { slug, section, id } = req.params; // Changed index to id
    const collectionName = BLOG_CONFIG[slug]?.collection || "blogs";
    const collection = mongoose.connection.db.collection(collectionName);

    const result = await collection.deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    res.json({ success: true, message: 'Blog deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { renderBlogMainPage, getBlogsList, getBlogs, addBlogs, updateBlog, deleteBlog };