const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { ObjectId } = require('mongodb');
const { asyncHandler, ValidationError, NotFoundError } = require('../../utils/errorHandler');
const { formatDateForDisplay, formatDateShortSimple } = require('../../utils/index');

// GET reviews management page
const renderReviewsPage = asyncHandler(async (req, res) => {
    res.render('admin/reviews', {
        title: 'User Reviews Management',
        activeLink: 'userReviews'
    });
});

// GET reviews list page
const renderReviewsListPage = asyncHandler(async (req, res) => {
    const collection = mongoose.connection.db.collection("reviews");

    const data = await collection.find({
        page_slug: "home",
        page_section: "reviews"
    }).toArray();

    // Separate header/title from review items
    const reviews = data.filter(item => !item['review-title']).map((item, index) => ({
        ...item,
        id: item._id.toString(),
        index: index,
        createdAt: formatDateShortSimple(item.createdAt),
        formattedDate: formatDateForDisplay(item.createdAt, true)
    })) || [];

    res.render('admin/reviews_list', {
        title: 'Review Inventory',
        reviews,
        activeLink: 'userReviews',
        rowsPerPage: 5,
        rowsPerPageOptions: [5, 10, 20]
    });
});

const getReviews = asyncHandler(async (req, res) => {
    const collection = mongoose.connection.db.collection("reviews");

    const page_content = await collection.find({
        page_slug: "home",
        page_section: "reviews"
    }).toArray();

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

    // Insert new reviews as individual documents with metadata
    const insertDocs = page_content.map(item => ({
        ...item,
        page_slug: "home",
        page_section: "reviews",
        createdAt: item.createdAt || new Date(),
        updatedAt: dayjs().toDate()
    }));

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
