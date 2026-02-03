const mongoose = require('mongoose');
const { formatDateForDisplay } = require('../utils/index');

const getHomeData = async (req, res) => {
  try {
    const homeData = await mongoose.connection.db.collection('home').find({ page_slug: 'home' }).toArray();
    const ProjectsData = await mongoose.connection.db.collection('ProjectPage').find({ page_slug: 'ProjectPage' }).toArray();

    const bannerData = homeData.find(item => item.page_section === 'home_banner')?.page_content || [];
    const bannerReview = homeData.find(item => item.page_section === 'home_reviews')?.page_content || [];
    const techData = homeData.find(item => item.page_section === 'home_tech')?.page_content || [];
    const reviewsData = homeData.find(item => item.page_section === 'reviews')?.page_content || [];

    const blogDataRaw = homeData.find(item => item.page_section === 'blogs-card')?.page_content || [];

    const blogData = blogDataRaw.map(blog => ({
      ...blog,
      blog_date: formatDateForDisplay(blog.blog_date, true)
    }));

    // Fetch completed projects from ProjectPage collection
    const completedProjects = (ProjectsData.find(item => item.page_section === 'completed-gallery')?.page_content || []).map(p => ({
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