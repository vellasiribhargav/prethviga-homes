const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { ObjectId } = require('mongodb');
const { formatDateForDisplay } = require('../utils/index');

const getonGoingPageData = async (req, res) => {
  try {
    const { id } = req.params;

    // projects (Multi-document)
    const projectsDocs = await mongoose.connection.db.collection('projects').find({ page_slug: 'projects' }).toArray();

    // Format projects to find the matching one
    const allProjects = projectsDocs.map(p => ({
      ...p,
      id: (p.project_id || p._id).toString()
    }));

    let projectDetails = {};
    if (id && ObjectId.isValid(id)) {
      const foundProject = allProjects.find(p => p.id === id);
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
      // project_details: per-project sections (Single document with sections array)
      const projectDoc = await mongoose.connection.db.collection('project_details').findOne({ project_id: new ObjectId(id) });
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

    // faq: only show project-specific FAQ added by admin (filter out empty rows)
    let frequencyData = (onGoingPageData['faq-items-container'] || []).filter(
      item => item.question && item.question.trim() && item.answer && item.answer.trim()
    );

    // fallback to global project_details faq if project-specific is empty
    if (frequencyData.length === 0) {
      // FAQ fallbacks are now multi-document
      const globalFaqData = await mongoose.connection.db.collection('faq').find({
        page_slug: 'project_details',
        page_section: 'faq-items-container'
      }).toArray();
      frequencyData = globalFaqData || [];
    }

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
      hasProjectData,
      activePage: 'ProjectPage'
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
      activePage: 'ProjectPage',
      hasProjectData: false,
    });
  }
};

module.exports = {
  getonGoingPageData
};
