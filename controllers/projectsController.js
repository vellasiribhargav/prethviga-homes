const mongoose = require('mongoose');

const getProjectsData = async (req, res) => {
  try {
    const ProjectsData = await mongoose.connection.db.collection('ProjectPage').find({ page_slug: 'ProjectPage' }).toArray();
    
    const completed = ProjectsData.find(item => item.page_section === 'completed-gallery')?.page_content || [];
    const ongoing = ProjectsData.find(item => item.page_section === 'ongoing-gallery')?.page_content || [];
    const faqSection = ProjectsData.find(item => item.page_section === 'faq-section-header')?.page_content || [];
    const bannerData = ProjectsData.find(item => item.page_section === 'project-banner')?.page_content || [];

    res.render('ProjectPage', {
      ongoing,
      completed,
      frequencyData: faqSection,
      bannerData
    });
  } catch (error) {
    console.error('Error fetching ProjectPage data:', error);
    res.render('ProjectPage', {
      ongoing: [],
      completed: [],
      upcoming: [],
      frequencyData: []
    });
  }
};

module.exports = {
  getProjectsData
};