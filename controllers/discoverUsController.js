const mongoose = require('mongoose');

const getdiscoverUsData = async (req, res) => {
  try {
    const discoverUsData = await mongoose.connection.db.collection('discoverUs').find({ page_slug: 'discoverUs' }).toArray();

    const ourvaluesData = discoverUsData.find(item => item.page_section === 'value-container')?.page_content || [];
    const blogData = discoverUsData.find(item => item.page_section === 'blogs-card')?.page_content || [];
    const bannerData = discoverUsData.find(item => item.page_section === 'discover-banner')?.page_content || [];


    res.render('discoverUs', {
      ourvaluesData,
      blogData,
      bannerData
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

module.exports = {
  getdiscoverUsData
};