const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { formatDateForDisplay } = require('../utils/index');

const getonGoingPageData = async (req, res) => {
  try {
    const { id } = req.params;

    const projectPageData = await mongoose.connection.db.collection('ProjectPage').find({ page_slug: 'ProjectPage' }).toArray();
    const upcomingProjects = projectPageData.find(item => item.page_section === 'ongoing-gallery')?.page_content || [];
    const completedProjects = projectPageData.find(item => item.page_section === 'completed-gallery')?.page_content || [];
    const allProjects = [...upcomingProjects, ...completedProjects];

    let projectDetails = {};
    if (id && ObjectId.isValid(id)) {
      const foundProject = allProjects.find(p => (p.project_id?.toString() === id) || (p._id?.toString() === id));
      if (foundProject) {
        projectDetails = {
          title: foundProject.project_name,
          buiding_name: foundProject.project_name,
          date: formatDateForDisplay(foundProject.project_date),
          location: foundProject.project_location,
          pimage: foundProject.card_image
        };
      }
    }

    let onGoingPageData = {};
    let hasProjectData = false;
    if (id && ObjectId.isValid(id)) {
      const projectDoc = await mongoose.connection.db.collection('OnGoingPage').findOne({ project_id: new ObjectId(id) });
      if (projectDoc?.sections) {
        hasProjectData = true;
        projectDoc.sections.forEach(section => {
          onGoingPageData[section.page_section] = section.page_content;
        });

        const heroData = onGoingPageData['hero-section']?.[0];
        if (heroData) {
          if (heroData.title) projectDetails.title = heroData.title;
          if (heroData.pimage && heroData.pimage.trim()) projectDetails.pimage = heroData.pimage;
          if (heroData.buiding_name) projectDetails.buiding_name = heroData.buiding_name;
          if (heroData.date) projectDetails.date = formatDateForDisplay(heroData.date);
          if (heroData.location) projectDetails.location = heroData.location;
        }
      }
    }

    const floorData = onGoingPageData['floor-image'] || [];
    const featureData = onGoingPageData['features-grid'] || [];

    const amenitiesContent = onGoingPageData['amenities-list'] || [];
    const amenitiesDescription = amenitiesContent.find(item => item.features_Description)?.features_Description;
    const amenityData = amenitiesContent.filter(item => !item.features_Description);

    const locationContent = onGoingPageData['location-container'] || [];
    const locationDescription = locationContent.find(item => item.location_Description)?.location_Description || '';
    const locationImgObj = locationContent.find(item => item.image);
    const locationDetailsObj = locationContent.find(item => item.details);
    const locationData = {
      image: locationImgObj?.image || '',
      details: locationDetailsObj?.details || []
    };

    const galleryContent = onGoingPageData['gallery-wrapper'] || [];
    const galleryDescription = galleryContent.find(item => item.gallery_Description)?.gallery_Description;
    const galleryData = galleryContent.filter(item => !item.gallery_Description);

    const globalFaqData = await mongoose.connection.db.collection('OnGoingPage').findOne({ page_slug: 'OnGoingPage', page_section: 'faq-items-container' });
    const frequencyData = onGoingPageData['faq-items-container'] || globalFaqData?.page_content || [];

    res.render('OnGoingPage', {
      projectData: onGoingPageData['hero-section'] || [],
      projectDetails,
      floorData,
      featureData,
      amenitiesDescription,
      amenityData,
      locationDescription,
      locationData,
      galleryDescription,
      galleryData,
      frequencyData,
      hasProjectData
    });
  } catch (error) {
    console.error('Error fetching OnGoingPage data:', error);
    res.render('OnGoingPage', {
      projectData: [],
      projectDetails: {},
      floorData: [],
      featureData: [],
      amenityData: [],
      locationData: { image: '', details: [] },
      galleryData: [],
      frequencyData: [],
      hasProjectData: false
    });
  }
};

module.exports = {
  getonGoingPageData
};