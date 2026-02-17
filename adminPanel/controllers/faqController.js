const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const FAQ_CONFIG = {
  project: {
    slug: "ProjectPage",
    collection: "ProjectPage",
    section: "faq-section-header",
    label: "Project Page"
  },
  ongoing: {
    slug: "OnGoingPage",
    collection: "OnGoingPage",
    section: "faq-items-container",
    label: "OnGoing Page"
  }
};

const renderFaqMainPage = async (req, res) => {
  try {
    res.render('admin/faq');
  } catch (error) {
    console.error('Error rendering faq page:', error);
    res.render('admin/faq');
  }
};

const getFaqsList = async (req, res) => {
  try {
    const slug = req.params.slug || "project";
    const section = req.params.section || (slug === 'ongoing' ? 'faq-items-container' : 'faq-section-header');
    const collectionName = FAQ_CONFIG[slug]?.collection || slug;
    const collection = mongoose.connection.db.collection(collectionName);
    const config = FAQ_CONFIG[slug] || { collection: collectionName, slug: slug, section: section };

    const data = await collection.findOne({
      page_slug: config.slug,
      page_section: section
    });

    const faqs = data?.page_content?.map((f, index) => ({
      ...f,
      id: (f.faq_id || index).toString(),
      question: f.question || f.faq_question,
      answer: f.answer || f.faq_answer,
      index: index
    })) || [];

    res.render('admin/faq_list', {
      title: 'FAQ Management',
      faqs,
      slug,
      section,
      activeLink: 'faq',
      label: config.label,
      rowsPerPage: 5,
      rowsPerPageOptions: [5, 10]
    });
  } catch (error) {
    console.error('Error fetching faqs:', error);
    res.render('admin/faq_list', {
      title: 'FAQ Management',
      faqs: [],
      slug: req.params.slug,
      section: req.params.section,
      activeLink: 'faq',
      error: error.message
    });
  }
};

const getFaqs = async (req, res) => {
  try {
    const { slug, section } = req.params;
    const collectionName = FAQ_CONFIG[slug]?.collection || slug;
    const collection = mongoose.connection.db.collection(collectionName);
    const config = FAQ_CONFIG[slug] || { collection: collectionName, slug: slug };

    const data = await collection.findOne({
      page_slug: config.slug,
      page_section: section
    });

    res.json({ success: true, data: data?.page_content || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addFaqs = async (req, res) => {
  try {
    const { slug, section } = req.params;
    const faqArr = JSON.parse(req.body.faqArr || '[]');
    const collectionName = FAQ_CONFIG[slug]?.collection || slug;
    const collection = mongoose.connection.db.collection(collectionName);
    const config = FAQ_CONFIG[slug] || { collection: collectionName, slug: slug };

    const faqs = faqArr.map((f) => ({
      question: f.question,
      answer: f.answer,
      faq_id: new ObjectId(),
      createdAt: new Date()
    }));

    await collection.updateOne(
      { page_slug: config.slug, page_section: section },
      { $push: { page_content: { $each: faqs } } },
      { upsert: true }
    );

    res.json({ success: true, message: 'FAQ added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateFaq = async (req, res) => {
  try {
    const { slug, section, index } = req.params;
    const collectionName = FAQ_CONFIG[slug]?.collection || slug;
    const collection = mongoose.connection.db.collection(collectionName);
    const config = FAQ_CONFIG[slug] || { collection: collectionName, slug: slug };

    const updateFields = {};
    if (req.body.question) updateFields[`page_content.${index}.question`] = req.body.question;
    if (req.body.answer) updateFields[`page_content.${index}.answer`] = req.body.answer;

    const result = await collection.updateOne(
      { page_slug: config.slug, page_section: section },
      { $set: updateFields }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: 'No changes made or FAQ not found' });
    }

    res.json({ success: true, message: 'FAQ updated successfully!' });
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteFaq = async (req, res) => {
  try {
    const { slug, section, index } = req.params;
    const collectionName = FAQ_CONFIG[slug]?.collection || slug;
    const collection = mongoose.connection.db.collection(collectionName);
    const config = FAQ_CONFIG[slug] || { collection: collectionName, slug: slug };

    const page = await collection.findOne({
      page_slug: config.slug,
      page_section: section
    });

    if (page && page.page_content) {
      page.page_content.splice(Number(index), 1);

      await collection.updateOne(
        { page_slug: config.slug, page_section: section },
        { $set: { page_content: page.page_content } }
      );
      res.json({ success: true, message: 'FAQ deleted' });
    } else {
      res.status(404).json({ success: false, message: 'FAQ not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { renderFaqMainPage, getFaqsList, getFaqs, addFaqs, updateFaq, deleteFaq };