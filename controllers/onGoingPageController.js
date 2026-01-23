const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const getonGoingPageData = async (req, res) => {
  try {
    const { id } = req.params;
    const onGoingPageData = await mongoose.connection.db.collection('OnGoingPage').find({ page_slug: 'OnGoingPage' }).toArray();
    const projectPageData = await mongoose.connection.db.collection('ProjectPage').find({ page_slug: 'ProjectPage' }).toArray();

    // Fetch all projects (ongoing and completed)
    const upcomingProjects = projectPageData.find(item => item.page_section === 'ongoing-gallery')?.page_content || [];
    const completedProjects = projectPageData.find(item => item.page_section === 'completed-gallery')?.page_content || [];
    const allProjects = [...upcomingProjects, ...completedProjects];

    let projectDetails = {};
    if (id && ObjectId.isValid(id)) {
      const foundProject = allProjects.find(p => (p.project_id && p.project_id.toString() === new ObjectId(id).toString()) || (p._id && p._id.toString() === new ObjectId(id).toString()));
      if (foundProject) {
        projectDetails = {
          title: foundProject.project_name,
          buiding_name: foundProject.project_name, // Using project_name as building_name for now
          date: foundProject.project_date,
          location: foundProject.project_location,
          pimage: foundProject.card_image
        };
      }
    }

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
      projectDetails, // Pass the found project details
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
      projectDetails: {},
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