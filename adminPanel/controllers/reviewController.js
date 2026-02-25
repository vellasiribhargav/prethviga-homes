const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { ObjectId } = require('mongodb');
const { asyncHandler, ValidationError, NotFoundError } = require('../../utils/errorHandler');
const { formatDateForDisplay, formatedDate } = require('../../utils/index');
const { ListFilter } = require('../utils/filterUtils');

// GET reviews management page
const renderReviewsPage = asyncHandler(async (req, res) => {
    res.render('admin/reviews', {
        title: 'User Reviews Management',
        activeLink: 'userReviews'
    });
});

// GET reviews list page
const renderReviewsListPage = asyncHandler(async (req, res) => {
    let { search, fromDate, toDate, page = 1, limit = 5, is_filter = false } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 5;
    const skip = (page - 1) * limit;

    const collection = mongoose.connection.db.collection("reviews");

    let query = {
        page_slug: "home",
        page_section: "reviews"
    };

    const { query: filteredQuery, isFiltered } = ListFilter(query, req);

    let allData = await collection.find(filteredQuery).toArray();

    // Separate header/title from review items
    const filteredReviews = allData.filter(item => !item['review-title']);
    const totalItems = filteredReviews.length;
    const totalPages = Math.ceil(totalItems / limit);

    const reviews = filteredReviews.slice(skip, skip + limit).map((item, index) => ({
        ...item,
        id: item._id.toString(),
        reviewer_name: item['client-name'] || item.reviewer_name || '',
        review_text: item['review-text'] || item.review_text || '',
        review_footer: item['review-footer'] || item.review_footer || '',
        index: skip + index,
        formattedDate: formatedDate(item.createdAt)
    })) || [];

    const response = {
        title: 'Review Inventory',
        reviews,
        pagination: {
            totalItems,
            totalPages,
            currentPage: page,
            limit,
            start: skip + 1,
            end: Math.min(skip + limit, totalItems)
        },
        activeLink: 'userReviews',
        rowsPerPage: limit,
        rowsPerPageOptions: [5, 10, 20],
        filters: { search, fromDate, toDate },
        is_filtered: isFiltered
    };

    if (is_filter) {
        return res.json({ success: true, ...response });
    }

    res.render('admin/reviews_list', response);
});

const getReviews = asyncHandler(async (req, res) => {
    const { search, fromDate, toDate } = req.query;
    const collection = mongoose.connection.db.collection("reviews");

    let query = {
        page_slug: "home",
        page_section: "reviews"
    };

    const { query: filteredQuery, isFiltered } = ListFilter(query, req);
    query = filteredQuery;

    let page_content = await collection.find(query).toArray();

    res.json({
        success: true,
        data: { page_slug: "home", page_section: "reviews", page_content: page_content || [] }
    });
});

// UPDATE - Still handles bulk update as requested by the current frontend logic
const updateReviews = asyncHandler(async (req, res) => {
    const { page_content } = req.body;

    if (!Array.isArray(page_content)) {
        throw new ValidationError("Invalid data format");
    }

    const collection = mongoose.connection.db.collection("reviews");

    // Delete existing reviews for this section
    await collection.deleteMany({
        page_slug: "home",
        page_section: "reviews"
    });

    // Insert new reviews
    const insertDocs = page_content.map(item => {
        const doc = {
            page_slug: "home",
            page_section: "reviews",
            createdAt: item.createdAt || new Date(),
            updatedAt: dayjs().toDate()
        };

        if (item['review-title']) {
            doc['review-title'] = item['review-title'];
        } else {
            // Map to underscored names for consistency
            doc.review_text = item.review_text || item['review-text'] || '';
            doc.reviewer_name = item.reviewer_name || item['client-name'] || '';
            doc.reviewer_role = item.reviewer_role || item['client-role'] || '';
            doc.review_footer = item.review_footer || item['review-footer'] || '';
        }
        return doc;
    });

    if (insertDocs.length > 0) {
        await collection.insertMany(insertDocs);
    }

    res.json({ success: true, message: "Reviews updated successfully" });
});

// DELETE individual review
const deleteReview = asyncHandler(async (req, res) => {
    const { index } = req.params; // Using 'index' variable name but expecting an ID string

    if (!ObjectId.isValid(index)) {
        throw new ValidationError("Invalid ID");
    }

    const collection = mongoose.connection.db.collection("reviews");

    const result = await collection.deleteOne({ _id: new ObjectId(index) });

    if (result.deletedCount === 0) {
        throw new NotFoundError("Review not found");
    }

    res.json({ success: true, message: "Review deleted successfully" });
});

module.exports = {
    renderReviewsPage,
    renderReviewsListPage,
    getReviews,
    updateReviews,
    deleteReview
};
