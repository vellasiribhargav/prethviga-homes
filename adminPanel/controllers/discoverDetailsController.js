const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { asyncHandler, ValidationError } = require('../../utils/errorHandler');

// Render GET
const renderDiscoverDetailsPage = asyncHandler(async (req, res) => {
    res.render('admin/discoverDetails', {
        title: 'Discover Details Management',
        activeLink: 'discoverDetails'
    });
});

// GET
const getDiscoverDetails = asyncHandler(async (req, res) => {
    const collection = mongoose.connection.db.collection("discover_details");
    const valuesData = await collection.findOne({ page_slug: "discoverUs", page_section: "value-container" });
    const buyerData = await collection.findOne({ page_slug: "discoverUs", page_section: "buyer-container" });

    res.json({
        success: true,
        data: {
            values: valuesData?.page_content || [],
            buyer: buyerData?.page_content?.[0] || { heading: { title: '', description: '' }, rows: [] }
        }
    });
});

// POST
const saveDiscoverDetails = asyncHandler(async (req, res) => {
    const { section, pageContent } = req.body;
    if (!section || !pageContent) {
        throw new ValidationError("Missing section or page content");
    }

    const collection = mongoose.connection.db.collection("discover_details");
    let content;
    try {
        content = JSON.parse(pageContent);
    } catch (e) {
        throw new ValidationError("Invalid JSON content");
    }

    // If it's the buyer guide, it's usually wrapped in an array or object depending on seed
    // Seed says: "page_content": [ { "heading": { ... }, "rows": [ ... ] } ]
    const dataToSave = (section === 'buyer-container' && !Array.isArray(content)) ? [content] : content;

    await collection.updateOne(
        { page_slug: "discoverUs", page_section: section },
        {
            $set: {
                page_content: dataToSave,
                updatedAt: dayjs().toDate()
            }
        },
        { upsert: true }
    );

    res.json({ success: true, message: `${section} updated successfully` });
});

// GET UNIQUE GUIDE ROWS
const getUniqueGuideRows = asyncHandler(async (req, res) => {
    const collection = mongoose.connection.db.collection("discover_details");

    const pipeline = [
        { $match: { page_slug: 'discoverUs', page_section: 'buyer-container' } },
        { $unwind: "$page_content" },
        { $unwind: "$page_content.rows" },
        { $group: { _id: null, uniqueRows: { $addToSet: "$page_content.rows.row_description" } } }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    const rows = result[0]?.uniqueRows || [];

    res.json({ success: true, rows: rows.sort() });
});

module.exports = {
    renderDiscoverDetailsPage,
    getDiscoverDetails,
    saveDiscoverDetails,
    getUniqueGuideRows
};
