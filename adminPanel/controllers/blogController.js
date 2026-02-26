const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { ObjectId } = require('mongodb');
const { formatDateMonthYear, formatedDate } = require('../../utils/index');
const { ListFilter } = require('../utils/filterUtils');

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
    const pageSlug = req.params.slug || req.query.slug || req.cookies.admin_blog_slug || 'discoverUs';
    const pageSection = req.params.section || req.query.section || req.cookies.admin_blog_section || 'blogs-card';
    res.render('admin/blog', { pageSlug, pageSection });
  } catch (error) {
    console.error('Error rendering blog page:', error);
    res.render('admin/blog');
  }
};

const getBlogsList = async (req, res) => {
  try {
    const slug = req.params.slug || req.query.slug || req.cookies.admin_blog_slug || "discoverUs";
    const section = req.params.section || req.query.section || req.cookies.admin_blog_section || "blogs-card";
    let { search, fromDate, toDate, page = 1, limit = 5, is_filter = false } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 5;
    const skip = (page - 1) * limit;

    const collectionName = BLOG_CONFIG[slug]?.collection || "blogs";
    const collection = mongoose.connection.db.collection(collectionName);
    const config = BLOG_CONFIG[slug] || { collection: collectionName, slug: slug, section: section };

    const baseQuery = {
      page_slug: config.slug,
      page_section: section
    };

    const { query, isFiltered } = ListFilter(baseQuery, req);

    const totalItems = await collection.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    const data = await collection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();

    const blogs = data.map((b, index) => {
      const cleanContent = b.blog_content ? b.blog_content.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim() : '';
      return {
        ...b,
        id: b._id.toString(),
        title: b.blog_title || 'Untitled',
        tag: b.badge_text || 'No Tag',
        description: b.blog_description || 'No description available...',
        timeToRead: (b.blog_time && typeof b.blog_time === 'string') ? b.blog_time.replace(/\s*min\s*read\s*/i, '').trim() : (b.blog_time || '0'),
        date: formatDateMonthYear(b.blog_date),
        image: b.inner_img || '',
        contentSnippet: cleanContent.substring(0, 100) + (cleanContent.length > 100 ? '...' : '') || 'No content available...',
        cleanContent: cleanContent,
        index: skip + index,
        formattedDate: formatedDate(b.createdAt, true),
        formattedPublicationDate: formatDateMonthYear(b.blog_date)
      };
    });

    const response = {
      title: 'Blog Management',
      blogs,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
        start: skip + 1,
        end: Math.min(skip + limit, totalItems)
      },
      slug,
      section,
      activeLink: 'blog',
      rowsPerPage: limit,
      rowsPerPageOptions: [5, 10, 20],
      filters: { search, fromDate, toDate },
      is_filtered: isFiltered
    };

    if (is_filter) {
      return res.json({ success: true, ...response });
    }

    res.render('admin/blog_list', response);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.render('admin/blog_list', {
      title: 'Blog Management',
      blogs: [],
      slug: req.params.slug,
      section: req.params.section,
      activeLink: 'blog',
      error: error.message,
      filters: {}
    });
  }
};

const getBlogs = async (req, res) => {
  try {
    const slug = req.params.slug || req.query.slug || req.cookies.admin_blog_slug || "discoverUs";
    const section = req.params.section || req.query.section || req.cookies.admin_blog_section || "blogs-card";
    const { search, fromDate, toDate } = req.query;
    const collectionName = BLOG_CONFIG[slug]?.collection || "blogs";
    const collection = mongoose.connection.db.collection(collectionName);
    const config = BLOG_CONFIG[slug] || { collection: collectionName, slug: slug };

    let baseQuery = {
      page_slug: config.slug,
      page_section: section
    };

    const { query, isFiltered } = ListFilter(baseQuery, req);

    let data = await collection.find(query).toArray();

    res.json({ success: true, data: data, is_filtered: isFiltered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addBlogs = async (req, res) => {
  try {
    const slug = req.params.slug || req.query.slug || req.cookies.admin_blog_slug || "discoverUs";
    const section = req.params.section || req.query.section || req.cookies.admin_blog_section || "blogs-card";
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
    const slug = req.params.slug || req.query.slug || req.cookies.admin_blog_slug || "discoverUs";
    const section = req.params.section || req.query.section || req.cookies.admin_blog_section || "blogs-card";
    const { id } = req.params; // Changed index to id
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
    const slug = req.params.slug || req.query.slug || req.cookies.admin_blog_slug || "discoverUs";
    const section = req.params.section || req.query.section || req.cookies.admin_blog_section || "blogs-card";
    const { id } = req.params; // Changed index to id
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