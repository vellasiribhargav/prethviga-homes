const mongoose = require('mongoose');

const getHomeData = async (req, res) => {
  try {
    const homeData = await mongoose.connection.db.collection('home').find({ page_slug: 'home' }).toArray();
    
    const bannerData = homeData.find(item => item.page_section === 'home_banner')?.page_content || [];
    const projectsData = homeData.find(item => item.page_section === 'recent_projects')?.page_content || [];
    const techData = homeData.find(item => item.page_section === 'home_tech')?.page_content || [];
    const reviewsData = homeData.find(item => item.page_section === 'reviews')?.page_content || [];
    
    res.render('home', {
      bannerData,
      projectsData,
      techData,
      reviewsData
    });
  } catch (error) {
    console.error('Error fetching home data:', error);
    res.render('home', {
      bannerData: [],
      projectsData: [],
      techData: [],
      reviewsData: []
    });
  }
};

module.exports = {
  getHomeData
};