const mongoose = require('mongoose');
const { formatDateForDisplay } = require('../utils/index');
const dayjs = require('dayjs');

const getHomeData = async (req, res) => {
  try {
    // home_details (Multi-document for different sections)
    const homeData = await mongoose.connection.db.collection('home_details').find({ page_slug: 'home' }).toArray();

    // banner (Multi-document)
    const bannerDocs = await mongoose.connection.db.collection('banner').find({ page_slug: 'home' }).toArray();

    // reviews (Multi-document)
    const reviewsData = await mongoose.connection.db.collection('reviews').find({ page_slug: 'home', page_section: 'reviews' }).toArray();

    // blogs (Multi-document, fetching from discoverUs section)
    const blogsData = await mongoose.connection.db.collection('blogs').find({ page_slug: 'discoverUs', page_section: 'blogs-card' }).toArray();

    // projects (Multi-document)
    const projectsDataRaw = await mongoose.connection.db.collection('projects').find({ page_slug: 'projects', page_section: 'completed-gallery' }).toArray();

    const bannerData = bannerDocs.filter(item => item.page_section === 'home_banner');
    const bannerReview = bannerDocs.filter(item => item.page_section === 'home_reviews');
    const techData = homeData.filter(item => item.page_section === 'home_tech');

    const blogData = blogsData.map(blog => ({
      ...blog,
      blog_id: blog._id.toString(),
      blog_date: dayjs(blog.blog_date).format('MMMM D, YYYY')
    }));

    // Fetch and format completed projects
    const completedProjects = projectsDataRaw.map(p => ({
      ...p,
      project_date: formatDateForDisplay(p.project_date || p['project-date']),
      project_name: p.project_name || p['project-name'],
      card_image: p.card_image || p['card-image'],
      project_area: p.project_area || p['project-location'] || p.project_location,
      card_footer_text: p.card_footer_text || p['card-footer-text']
    })).slice(-3);

    res.render('home', {
      bannerData,
      bannerReview,
      projectsData: completedProjects,
      techData,
      reviewsData,
      blogData
    });
  } catch (error) {
    console.error('Error fetching home data:', error);
    res.render('home', {
      bannerData: [],
      bannerReview: [],
      projectsData: [],
      techData: [],
      reviewsData: [],
      blogData: []
    });
  }
};

module.exports = {
  getHomeData
};