const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { formatDateForDisplay } = require('../../utils/index');

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
    const collectionName = BLOG_CONFIG[slug]?.collection || slug;
    const collection = mongoose.connection.db.collection(collectionName);
    const config = BLOG_CONFIG[slug] || { collection: collectionName, slug: slug };

    const data = await collection.findOne({
      page_slug: config.slug,
      page_section: section
    });

    const blogs = data?.page_content?.map((b, index) => ({
      ...b,
      id: (b.blog_id || index).toString(),
      title: b.blog_text,
      date: formatDateForDisplay(b.blog_date, true),
      tag: b.badge_text,
      image: b.inner_img,
      description: b.blog_description,
      timeToRead: (b.blog_time && typeof b.blog_time === 'string') ? b.blog_time.replace(/\s*min\s*read\s*/i, '').trim() : b.blog_time,
      content: b.blog_content,
      contentSnippet: b.blog_content ? b.blog_content.replace(/<h1[^>]*>.*?<\/h1>/gi, '').replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/"/g, '&quot;').substring(0, 30) + (b.blog_content.replace(/<h1[^>]*>.*?<\/h1>/gi, '').replace(/<[^>]*>?/gm, '').length > 30 ? '...' : '') : 'No content available...',
      cleanContent: b.blog_content ? b.blog_content.replace(/<h1[^>]*>.*?<\/h1>/gi, '').replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/"/g, '&quot;') : 'No content available...',
      index: index
    })) || [];

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
    const collectionName = BLOG_CONFIG[slug]?.collection || slug;
    const collection = mongoose.connection.db.collection(collectionName);
    const config = BLOG_CONFIG[slug] || { collection: collectionName, slug: slug };

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
    const collectionName = BLOG_CONFIG[slug]?.collection || slug;
    const collection = mongoose.connection.db.collection(collectionName);
    const config = BLOG_CONFIG[slug] || { collection: collectionName, slug: slug };

    const blogs = blogArr.map((b, i) => {
      const file = req.files.find(f => f.fieldname === `file_${i}`);
      return {
        inner_img: file ? `${process.env.PROJECT_URL}uploads/blog/${file.filename}` : b.coverImage,
        badge_text: b.blogTag,
        blog_date: b.publicationDate,
        blog_text: b.blogTitle,
        blog_description: b.blogDescription,
        blog_time: b.readTime,
        blog_content: b.blogContent,
        blog_id: new ObjectId(),
        createdAt: new Date()
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

const updateBlog = async (req, res) => {
  try {
    const { slug, section, index } = req.params;
    const collectionName = BLOG_CONFIG[slug]?.collection || slug;
    const collection = mongoose.connection.db.collection(collectionName);
    const config = BLOG_CONFIG[slug] || { collection: collectionName, slug: slug };

    const updateFields = {};
    if (req.body.title) updateFields[`page_content.${index}.blog_text`] = req.body.title;
    if (req.body.date) updateFields[`page_content.${index}.blog_date`] = req.body.date;
    if (req.body.tag) updateFields[`page_content.${index}.badge_text`] = req.body.tag;
    if (req.body.description) updateFields[`page_content.${index}.blog_description`] = req.body.description;
    if (req.body.read_time) updateFields[`page_content.${index}.blog_time`] = req.body.read_time;
    if (req.body.content) updateFields[`page_content.${index}.blog_content`] = req.body.content;

    if (req.file) {
      updateFields[`page_content.${index}.inner_img`] = `${process.env.PROJECT_URL}uploads/blog/${req.file.filename}`;
    }

    const result = await collection.updateOne(
      { page_slug: config.slug, page_section: section },
      { $set: updateFields }
    );

    if (result.modifiedCount === 0) {
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
    const { slug, section, index } = req.params;
    const collectionName = BLOG_CONFIG[slug]?.collection || slug;
    const collection = mongoose.connection.db.collection(collectionName);
    const config = BLOG_CONFIG[slug] || { collection: collectionName, slug: slug };

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

module.exports = { renderBlogMainPage, getBlogsList, getBlogs, addBlogs, updateBlog, deleteBlog };