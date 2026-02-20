const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { formatDateMonthYear } = require('../utils/index');

const getdiscoverUsData = async (req, res) => {
  try {
    // discover_details: values + buyer guide
    const discoverData = await mongoose.connection.db.collection('discover_details').find({ page_slug: 'discoverUs' }).toArray();
    // banner: discover-banner
    const bannerDocs = await mongoose.connection.db.collection('banner').find({ page_slug: 'discoverUs', page_section: 'discover-banner' }).toArray();

    // blogs (Multi-document)
    const blogsData = await mongoose.connection.db.collection('blogs').find({ page_slug: 'discoverUs', page_section: 'blogs-card' }).toArray();

    // reviews (Multi-document, from home)
    const reviewsData = await mongoose.connection.db.collection('reviews').find({ page_slug: 'home', page_section: 'reviews' }).toArray();

    const ourvaluesData = discoverData.filter(item => item.page_section === 'value-container');
    const buyerDataDoc = discoverData.find(item => item.page_section === 'buyer-container');
    const buyerData = buyerDataDoc ? [buyerDataDoc] : [];
    const bannerData = bannerDocs;

    const blogData = blogsData.map(blog => {
      return {
        ...blog,
        blog_id: blog._id.toString(),
        blog_date: formatDateMonthYear(blog.blog_date),
        timeToRead: blog.blog_time
      };
    });

    res.render('discoverUs', {
      ourvaluesData,
      blogData,
      bannerData,
      reviewsData,
      buyerData
    });
  } catch (error) {
    console.error('Error fetching discoverUs data:', error);
    res.render('discoverUs', {
      ourvaluesData: [],
      blogData: [],
      bannerData: [],
      reviewsData: [],
      buyerData: []
    });
  }
};

const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const { ObjectId } = require('mongodb');

    const blog = await mongoose.connection.db.collection('blogs').findOne({
      $or: [
        { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
        { blog_id: ObjectId.isValid(id) ? new ObjectId(id) : id }
      ]
    });

    const bannerDocs = await mongoose.connection.db.collection('banner').find({ page_slug: 'discoverUs', page_section: 'discover-banner' }).toArray();

    if (!blog) {
      // Fallback: search by blog_id if _id not found (for legacy compatibility)
      const blogsData = await mongoose.connection.db.collection('blogs').find({ page_slug: 'discoverUs', page_section: 'blogs-card' }).toArray();
      const fallbackBlog = blogsData.find(b => (b.blog_id && b.blog_id.toString() === id));

      if (!fallbackBlog) {
        return res.status(404).send('Blog not found');
      }

      const formattedBlog = {
        ...fallbackBlog,
        blog_date: formatDateMonthYear(fallbackBlog.blog_date),
        timeToRead: fallbackBlog.blog_time
      };

      return res.render('BlogPage', {
        blog: formattedBlog,
        bannerData: bannerDocs,
        isBlogPage: true
      });
    }

    const formattedBlog = {
      ...blog,
      blog_date: formatDateMonthYear(blog.blog_date),
      timeToRead: blog.blog_time
    };

    res.render('BlogPage', {
      blog: formattedBlog,
      bannerData: bannerDocs,
      isBlogPage: true
    });
  } catch (error) {
    console.error('Error fetching blog by ID:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  getdiscoverUsData,
  getBlogById
};