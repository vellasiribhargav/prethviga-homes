const mongoose = require('mongoose');
const { formatDateForDisplay } = require('../utils/index');

const getdiscoverUsData = async (req, res) => {
  try {
    const discoverUsData = await mongoose.connection.db.collection('discoverUs').find({ page_slug: 'discoverUs' }).toArray();

    const ourvaluesData = discoverUsData.find(item => item.page_section === 'value-container')?.page_content || [];
    const blogDataRaw = discoverUsData.find(item => item.page_section === 'blogs-card')?.page_content || [];
    const bannerData = discoverUsData.find(item => item.page_section === 'discover-banner')?.page_content || [];

    const blogData = blogDataRaw.map(blog => ({
      ...blog,
      blog_date: formatDateForDisplay(blog.blog_date, true),
      timeToRead: blog.blog_time // Ensure consistency for the list view
    }));

    const homeData = await mongoose.connection.db.collection('home').find({ page_slug: 'home' }).toArray();
    const reviewsData = homeData.find(item => item.page_section === 'reviews')?.page_content || [];

    res.render('discoverUs', {
      ourvaluesData,
      blogData,
      bannerData,
      reviewsData
    });
  } catch (error) {
    console.error('Error fetching discoverUs data:', error);
    res.render('discoverUs', {
      ourvaluesData: [],
      blogData: [],
      bannerData: []
    });
  }
};

const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    // Fetch all sections for discoverUs to get both blogs and potentially a banner
    const discoverUsData = await mongoose.connection.db.collection('discoverUs').find({ page_slug: 'discoverUs' }).toArray();

    if (!discoverUsData || discoverUsData.length === 0) {
      return res.status(404).send('Blog data not found');
    }

    const blogsSection = discoverUsData.find(item => item.page_section === 'blogs-card');
    const bannerData = discoverUsData.find(item => item.page_section === 'discover-banner')?.page_content || [];

    if (!blogsSection) {
      return res.status(404).send('Blog section not found');
    }

    const blogs = blogsSection.page_content || [];
    const blog = blogs.find(b => (b.blog_id && b.blog_id.toString() === id));

    if (!blog) {
      return res.status(404).send('Blog not found');
    }

    const formattedBlog = {
      ...blog,
      blog_date: formatDateForDisplay(blog.blog_date, true),
      timeToRead: blog.blog_time // Key mismatch fix: template expects timeToRead
    };

    res.render('BlogPage', {
      blog: formattedBlog,
      bannerData
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