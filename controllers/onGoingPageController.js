const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const getonGoingPageData = async (req, res) => {
  try {
    const { id } = req.params;
    const onGoingPageData = await mongoose.connection.db.collection('OnGoingPage').find({ page_slug: 'OnGoingPage' }).toArray();

    const projectData = onGoingPageData.find(item => item.page_section === 'hero-section')?.page_content || [];
    const floorData = onGoingPageData.find(item => item.page_section === 'floor-image')?.page_content || [];
    const featureData = onGoingPageData.find(item => item.page_section === 'features-grid')?.page_content || [];
    const amenityData = onGoingPageData.find(item => item.page_section === 'amenities-list')?.page_content || [];
    const locationData = onGoingPageData.find(item => item.page_section === 'location-container')?.page_content || [];

    const allGallery = onGoingPageData.find(item => item.page_section === 'gallery-wrapper')?.page_content || [];

    let galleryData = allGallery;
    if (id && ObjectId.isValid(id)) {
      const filteredGalleryData = allGallery.filter(item =>
        item.project_id && item.project_id.toString() === new ObjectId(id).toString()
      );
      if (filteredGalleryData.length > 0) {
        galleryData = filteredGalleryData;
      }
    }

    const frequencyData = onGoingPageData.find(item => item.page_section === 'faq-items-container')?.page_content || [];
    res.render('OnGoingPage', {
      projectData,
      floorData,
      featureData,
      amenityData,
      locationData,
      galleryData,
      frequencyData
    });
  } catch (error) {
    console.error('Error fetching OnGoingPage data:', error);
    res.render('OnGoingPage', {
      projectData: [],
      floorData: [],
      featureData: [],
      amenityData: [],
      locationData: [],
      galleryData: [],
      frequencyData: []
    });
  }
};

module.exports = {
  getonGoingPageData
};