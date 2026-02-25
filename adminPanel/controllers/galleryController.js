const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { ObjectId } = require('mongodb');
const { asyncHandler, ValidationError, NotFoundError } = require('../../utils/errorHandler');
const { formatDateForDisplay, formatedDate } = require('../../utils/index');
const { ListFilter } = require('../utils/filterUtils');

const renderGalleryMainPage = asyncHandler(async (req, res) => {
    res.render('admin/gallery');
});

const getGallery = asyncHandler(async (req, res) => {
    let { search, fromDate, toDate, page = 1, limit = 5, is_filter = false, type = 'all' } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 5;
    const skip = (page - 1) * limit;

    const collection = mongoose.connection.db.collection("project_details");

    const baseQuery = {
        page_slug: "project_details",
        page_section: "gallery-wrapper"
    };

    if (type !== 'all') {
        baseQuery.projectType = type;
    }

    const { query, isFiltered } = ListFilter(baseQuery, req);

    const totalItems = await collection.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    const data = await collection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();

    const galleryItems = data.map((item, index) => ({
        ...item,
        id: (item._id || index).toString(),
        name: item.projectName,
        type: item.projectType,
        title: item.title,
        text: item.text,
        coverImage: item.coverImage,
        index: skip + index,
        formattedDate: formatedDate(item.createdAt || item.created_at)
    }));

    const response = {
        title: 'Gallery Management',
        galleryItems,
        pagination: {
            totalItems,
            totalPages,
            currentPage: page,
            limit,
            start: skip + 1,
            end: Math.min(skip + limit, totalItems)
        },
        activeLink: 'gallery',
        rowsPerPage: limit,
        rowsPerPageOptions: [5, 10, 20],
        filters: { search, fromDate, toDate, type },
        is_filtered: isFiltered
    };

    if (is_filter) {
        return res.json({ success: true, ...response });
    }

    res.render('admin/gallery_list', response);
});

const getGalleryByProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { search, fromDate, toDate } = req.query;
    const collection = mongoose.connection.db.collection("project_details");

    let query = {
        page_slug: "project_details",
        page_section: "gallery-wrapper",
        project_id: new ObjectId(projectId)
    };

    const { query: queryWithFilters } = ListFilter(query, req);

    let filtered = await collection.find(queryWithFilters).toArray();

    res.json({ success: true, data: filtered });
});

const addGalleryItem = asyncHandler(async (req, res) => {
    const galleryArr = JSON.parse(req.body.galleryArr || '[]');
    const files = req.files || [];

    if (!galleryArr.length) {
        throw new ValidationError("No gallery data provided");
    }

    const db = mongoose.connection.db;
    const collection = db.collection("project_details");
    const galleriesToAdd = [];

    for (let i = 0; i < galleryArr.length; i++) {
        const item = galleryArr[i];
        const itemImages = [];

        for (let j = 0; j < item.imageCount; j++) {
            const fieldname = `gallery_${i}_file_${j}`;
            const file = files.find(f => f.fieldname === fieldname);
            if (file) {
                itemImages.push(`${process.env.PROJECT_URL}uploads/gallery/${file.filename}`);
            }
        }

        if (itemImages.length === 0) {
            throw new ValidationError(`At least one image is required for gallery ${i + 1}`);
        }

        const projectIdValid = item.project_id && ObjectId.isValid(item.project_id);

        galleriesToAdd.push({
            page_slug: "project_details",
            page_section: "gallery-wrapper",
            project_id: projectIdValid ? new ObjectId(item.project_id) : null,
            projectType: item.projectType,
            projectName: item.projectName,
            projectLocation: item.projectLocation,
            title: item.title,
            text: item.text,
            coverImage: itemImages[0],
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }

    if (galleriesToAdd.length > 0) {
        await collection.insertMany(galleriesToAdd);
    }

    res.json({ success: true, message: "Gallery items added successfully" });
});

const updateGalleryItem = asyncHandler(async (req, res) => {
    const { id } = req.params; // Changed index to id
    const collection = mongoose.connection.db.collection("project_details");

    const updateFields = {};
    if (req.body.projectName) updateFields.projectName = req.body.projectName;
    if (req.body.projectType) updateFields.projectType = req.body.projectType;
    if (req.body.title) updateFields.title = req.body.title;
    if (req.body.text) updateFields.text = req.body.text;

    if (req.file) {
        updateFields.coverImage = `${process.env.PROJECT_URL}uploads/gallery/${req.file.filename}`;
    }

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
        throw new NotFoundError('Gallery item not found');
    }

    res.json({ success: true, message: 'Gallery item updated successfully!' });
});

const deleteGalleryItem = asyncHandler(async (req, res) => {
    const { id } = req.params; // Changed index to id
    const collection = mongoose.connection.db.collection("project_details");

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
        throw new NotFoundError('Gallery item not found');
    }

    res.json({ success: true, message: 'Gallery item deleted successfully!' });
});

module.exports = { renderGalleryMainPage, getGallery, getGalleryByProject, addGalleryItem, updateGalleryItem, deleteGalleryItem };
