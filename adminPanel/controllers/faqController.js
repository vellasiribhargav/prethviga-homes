const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { ObjectId } = require('mongodb');
const { formatDateForDisplay } = require('../../utils/index');

const FAQ_CONFIG = {
    project: {
        slug: "projects",
        collection: "faq",
        section: "faq-section-header",
        label: "Project Page"
    },
    ongoing: {
        slug: "project_details",
        collection: "faq",
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
        const collectionName = FAQ_CONFIG[slug]?.collection || "faq";
        const collection = mongoose.connection.db.collection(collectionName);
        const config = FAQ_CONFIG[slug] || { collection: collectionName, slug: slug, section: section };

        const data = await collection.find({
            page_slug: config.slug,
            page_section: section
        }).toArray();

        const faqs = data.map((f, index) => ({
            ...f,
            id: f._id.toString(),
            question: f.question || f.faq_question,
            answer: f.answer || f.faq_answer,
            formattedDate: formatDateForDisplay(f.createdAt, true),
            index: index
        }));

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
        const collectionName = FAQ_CONFIG[slug]?.collection || "faq";
        const collection = mongoose.connection.db.collection(collectionName);
        const config = FAQ_CONFIG[slug] || { collection: collectionName, slug: slug };

        const data = await collection.find({
            page_slug: config.slug,
            page_section: section
        }).toArray();

        res.json({ success: true, data: data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addFaqs = async (req, res) => {
    try {
        const { slug, section } = req.params;
        const faqArr = JSON.parse(req.body.faqArr || '[]');
        const collectionName = FAQ_CONFIG[slug]?.collection || "faq";
        const collection = mongoose.connection.db.collection(collectionName);
        const config = FAQ_CONFIG[slug] || { collection: collectionName, slug: slug };

        const faqs = faqArr.map((f) => ({
            page_slug: config.slug,
            page_section: section,
            question: f.question,
            answer: f.answer,
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        if (faqs.length > 0) {
            await collection.insertMany(faqs);
        }

        res.json({ success: true, message: 'FAQ added successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateFaq = async (req, res) => {
    try {
        const { slug, section, id } = req.params; // Changed index to id
        const collectionName = FAQ_CONFIG[slug]?.collection || "faq";
        const collection = mongoose.connection.db.collection(collectionName);

        const updateFields = {};
        if (req.body.question) updateFields.question = req.body.question;
        if (req.body.answer) updateFields.answer = req.body.answer;

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    ...updateFields,
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
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
        const { slug, section, id } = req.params; // Changed index to id
        const collectionName = FAQ_CONFIG[slug]?.collection || "faq";
        const collection = mongoose.connection.db.collection(collectionName);

        const result = await collection.deleteOne({
            _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'FAQ not found' });
        }

        res.json({ success: true, message: 'FAQ deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { renderFaqMainPage, getFaqsList, getFaqs, addFaqs, updateFaq, deleteFaq };
