const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { formatDateForDisplay } = require('../utils/index');

const getProjectsData = async (req, res) => {
  try {
    const { search, fromDate, toDate } = req.query;

    // projects (Multi-document)
    const projectsDocs = await mongoose.connection.db.collection('projects').find({ page_slug: 'projects' }).toArray();

    // banner (Multi-document)
    const bannerDocs = await mongoose.connection.db.collection('banner').find({ page_slug: 'projects', page_section: 'project-banner' }).toArray();

    // faq (Multi-document)
    const faqData = await mongoose.connection.db.collection('faq').find({ page_slug: 'projects', page_section: 'faq-section-header' }).toArray();

    // blogs (Multi-document, from discoverUs)
    const blogsData = await mongoose.connection.db.collection('blogs').find({ page_slug: 'discoverUs', page_section: 'blogs-card' }).toArray();

    const completed = projectsDocs.filter(item => item.page_section === 'completed-gallery').map(p => ({
      ...p,
      project_date: formatDateForDisplay(p.project_date)
    }));

    const ongoing = projectsDocs.filter(item => item.page_section === 'ongoing-gallery').map(p => ({
      ...p,
      project_date: formatDateForDisplay(p.project_date)
    }));

    const faqSection = faqData.filter(
      item => item.question && item.question.trim() && item.answer && item.answer.trim()
    );

    const bannerData = bannerDocs;

    const blogData = blogsData.map(blog => ({
      ...blog,
      blog_id: blog._id.toString(),
      blog_date: dayjs(blog.blog_date).format('MMMM D, YYYY')
    }));

    res.render('ProjectPage', {
      ongoing,
      completed,
      frequencyData: faqSection,
      bannerData,
      blogData,
      filters: { search, fromDate, toDate }
    });
  } catch (error) {
    console.error('Error fetching ProjectPage data:', error);
    res.render('ProjectPage', {
      ongoing: [],
      completed: [],
      upcoming: [],
      frequencyData: [],
      bannerData: [],
      blogData: [],
      filters: {}
    });
  }
};

module.exports = {
  getProjectsData
};