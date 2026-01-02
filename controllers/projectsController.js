const mongoose = require('mongoose');

const getProjectsData = async (req, res) => {
  try {
    const ProjectsData = await mongoose.connection.db.collection('ProjectPage').find({ page_slug: 'ProjectPageConnection' }).toArray();
    console.log("ProjectsData",ProjectsData);
    const ongoing = ProjectsData.find(item => item.page_section === 'ongoing-gallery')?.page_content || [];
    console.log("ongoing",ongoing);
    const completed = ProjectsData.find(item => item.page_section === 'completed-gallery')?.page_content || [];
    res.render('ProjectPage', {
      ongoing,
      completed,
    });
  } catch (error) {
    console.error('Error fetching ProjectPage data:', error);
    res.render('ProjectPage', {
      ongoing: [],
      completed: []
    });
  }
};

module.exports = {
  getProjectsData
};