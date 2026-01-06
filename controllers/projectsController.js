const mongoose = require('mongoose');

const getProjectsData = async (req, res) => {
  try {
    const ProjectsData = await mongoose.connection.db.collection('ProjectPage').find({ page_slug: 'ProjectPage' }).toArray();
    const ongoing = ProjectsData.find(item => item.page_section === 'card-grid-wrapper')?.page_content || [];
    const completed = ProjectsData.find(item => item.page_section === 'ongoing-gallery')?.page_content || [];
    const faqSection = ProjectsData.find(item => item.page_section === 'faq-section-header')?.page_content || [];


    res.render('ProjectPage', {
      ongoing,
      completed,
      frequencyData:faqSection
    });
  } catch (error) {
    console.error('Error fetching ProjectPage data:', error);
    res.render('ProjectPage', {
      ongoing: [],
      completed: [],
      frequencyData: []
    });
  }
};

module.exports = {
  getProjectsData
};