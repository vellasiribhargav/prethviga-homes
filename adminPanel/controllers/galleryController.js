const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { ObjectId } = require('mongodb');
const { asyncHandler, ValidationError, NotFoundError } = require('../../utils/errorHandler');
const { formatDateForDisplay } = require('../../utils/index');

const renderGalleryMainPage = asyncHandler(async (req, res) => {
    res.render('admin/gallery');
});

const getGallery = asyncHandler(async (req, res) => {
    const collection = mongoose.connection.db.collection("project_details");
    const data = await collection.find({
        page_slug: "project_details",
        page_section: "gallery-wrapper"
    }).toArray();

    const galleryItems = data.map((item, index) => ({
        ...item,
        id: (item._id || index).toString(),
        name: item.projectName,
        type: item.projectType,
        title: item.title,
        text: item.text,
        coverImage: item.coverImage,
        index: index,
        formattedDate: formatDateForDisplay(item.createdAt || item.created_at, true)
    }));

    res.render('admin/gallery_list', {
        title: 'Gallery Management',
        galleryItems,
        activeLink: 'gallery',
        rowsPerPage: 5,
        rowsPerPageOptions: [5, 10]
    });
});

const getGalleryByProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const collection = mongoose.connection.db.collection("project_details");
    const filtered = await collection.find({
        page_slug: "project_details",
        page_section: "gallery-wrapper",
        project_id: new ObjectId(projectId)
    }).toArray();

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
