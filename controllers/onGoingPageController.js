const mongoose = require('mongoose');

const getonGoingPageData = async (req, res) => {
  try {
    console.log('OnGoingPage controller called');
    const onGoingPageData = await mongoose.connection.db.collection('OnGoingPage').find({ page_slug: 'OnGoingPage' }).toArray();
        
    const featureData = onGoingPageData.find(item => item.page_section === 'features-grid')?.page_content || [];    
    const amenitiesData = onGoingPageData.find(item => item.page_section === 'amenities-list')?.page_content || [];
    const locationData = onGoingPageData.find(item => item.page_section === 'location-section')?.page_content || [];
    const frequencyData = onGoingPageData.find(item => item.page_section === 'faq-section-header')?.page_content || [];
    
    res.render('OnGoingPage', {
      featureData,
      amenitiesData,
      locationData,
      frequencyData
    });
  } catch (error) {
    console.error('Error fetching home data:', error);
    res.render('OnGoingPage', {
      featureData: [],
      amenitiesData: [],
      locationData: [],
      frequencyData: []
    });
  }
};

module.exports = {
  getonGoingPageData
};