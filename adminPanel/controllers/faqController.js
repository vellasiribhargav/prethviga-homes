const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { ObjectId } = require('mongodb');
const { formatDateForDisplay, formatDateShortSimple, formatedDate } = require('../../utils/index');
const { ListFilter } = require('../utils/filterUtils');

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
        const pageSlug = req.params.slug || req.query.slug || req.cookies.admin_faq_slug || 'project';
        const pageSection = req.params.section || req.query.section || req.cookies.admin_faq_section || 'faq-section-header';
        res.render('admin/faq', { pageSlug, pageSection });
    } catch (error) {
        console.error('Error rendering faq page:', error);
        res.render('admin/faq');
    }
};

const getFaqsList = async (req, res) => {
    try {
        const slug = req.params.slug || req.query.slug || req.cookies.admin_faq_slug || "project";
        const section = req.params.section || req.query.section || req.cookies.admin_faq_section || "faq-section-header";
        let { page = 1, limit = 5, is_filter = false } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 5;
        const skip = (page - 1) * limit;
        const collectionName = FAQ_CONFIG[slug]?.collection || "faq";
        const collection = mongoose.connection.db.collection(collectionName);
        const config = FAQ_CONFIG[slug] || { collection: collectionName, slug: slug, section: section };

        const baseQuery = {
            page_slug: config.slug,
            page_section: section
        };

        const { query, isFiltered } = ListFilter(baseQuery, req);

        const totalItems = await collection.countDocuments(query);
        const totalPages = Math.ceil(totalItems / limit);
        const data = await collection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();

        const faqs = data.map((f, index) => ({
            ...f,
            id: f._id.toString(),
            question: f.question || f.faq_question,
            answer: f.answer || f.faq_answer,
            formattedDate: formatedDate(f.createdAt),
            index: skip + index
        }));

        const response = {
            title: 'FAQ Management',
            faqs,
            pagination: {
                totalItems,
                totalPages,
                currentPage: page,
                limit,
                start: skip + 1,
                end: Math.min(skip + limit, totalItems)
            },
            slug,
            section,
            activeLink: 'faq',
            label: config.label,
            rowsPerPage: limit,
            rowsPerPageOptions: [5, 10, 20],
            filters: { search: req.query.search, fromDate: req.query.fromDate, toDate: req.query.toDate },
            is_filtered: isFiltered
        };

        if (is_filter) {
            return res.json({ success: true, ...response });
        }

        res.render('admin/faq_list', response);
    } catch (error) {
        console.error('Error fetching faqs:', error);
        res.render('admin/faq_list', {
            title: 'FAQ Management',
            faqs: [],
            slug: req.params.slug,
            section: req.params.section,
            activeLink: 'faq',
            error: error.message,
            filters: {}
        });
    }
};

const getFaqs = async (req, res) => {
    try {
        const slug = req.params.slug || req.query.slug || req.cookies.admin_faq_slug || "project";
        const section = req.params.section || req.query.section || req.cookies.admin_faq_section || "faq-section-header";
        const collectionName = FAQ_CONFIG[slug]?.collection || "faq";
        const collection = mongoose.connection.db.collection(collectionName);
        const config = FAQ_CONFIG[slug] || { collection: collectionName, slug: slug };

        const baseQuery = {
            page_slug: config.slug,
            page_section: section
        };

        const { query: filteredQuery } = ListFilter(baseQuery, req);
        const query = filteredQuery;

        const data = await collection.find(query).toArray();

        res.json({ success: true, data: data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addFaqs = async (req, res) => {
    try {
        const slug = req.params.slug || req.query.slug || req.cookies.admin_faq_slug || "project";
        const section = req.params.section || req.query.section || req.cookies.admin_faq_section || "faq-section-header";
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
        const slug = req.params.slug || req.query.slug || req.cookies.admin_faq_slug || "project";
        const section = req.params.section || req.query.section || req.cookies.admin_faq_section || "faq-section-header";
        const id = req.params.id || req.query.id; // Changed index to id, now checks req.query as well
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
        const slug = req.params.slug || req.query.slug || req.cookies.admin_faq_slug || "project";
        const section = req.params.section || req.query.section || req.cookies.admin_faq_section || "faq-section-header";
        const { id } = req.params; // Changed index to id
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
