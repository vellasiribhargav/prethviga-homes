const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const renderGalleryMainPage = async (req, res) => {
    try {
        res.render('admin/gallery');
    } catch (error) {
        console.error('Error rendering gallery page:', error);
        res.render('admin/gallery');
    }
};

const getGallery = async (req, res) => {
    try {
        const collection = mongoose.connection.db.collection("OnGoingPage");
        const data = await collection.findOne({
            page_slug: "OnGoingPage",
            page_section: "gallery-wrapper"
        });

        const galleryItems = data?.page_content?.map((item, index) => ({
            ...item,
            id: (item._id || index).toString(),
            name: item.projectName,
            type: item.projectType,
            title: item.title,
            text: item.text,
            coverImage: item.coverImage,
            index: index
        })) || [];

        res.render('admin/gallery_list', {
            title: 'Gallery Management',
            galleryItems,
            activeLink: 'gallery'
        });
    } catch (error) {
        console.error('Error fetching gallery details:', error);
        res.render('admin/gallery_list', {
            title: 'Gallery Management',
            galleryItems: [],
            activeLink: 'gallery',
            error: error.message
        });
    }
};

const getGalleryByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const collection = mongoose.connection.db.collection("OnGoingPage");
        const data = await collection.findOne({
            page_slug: "OnGoingPage",
            page_section: "gallery-wrapper"
        });

        const filtered = data?.page_content?.filter(item => item.project_id?.toString() === projectId) || [];
        res.json({ success: true, data: filtered });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addGalleryItem = async (req, res) => {
    try {
        const galleryArr = JSON.parse(req.body.galleryArr || '[]');
        const files = req.files || [];

        if (!galleryArr.length) {
            return res.status(422).json({ success: false, message: "No gallery data provided" });
        }

        const db = mongoose.connection.db;
        const collection = db.collection("OnGoingPage");
        const galleriesToAdd = [];

        for (let i = 0; i < galleryArr.length; i++) {
            const item = galleryArr[i];
            const itemImages = [];

            for (let j = 0; j < item.imageCount; j++) {
                const fieldname = `gallery_${i}_file_${j}`;
                const file = files.find(f => f.fieldname === fieldname);
                if (file) {
                    itemImages.push(`/uploads/gallery/${file.filename}`);
                }
            }

            if (itemImages.length === 0) {
                return res.status(422).json({ success: false, message: `At least one image is required for gallery ${i + 1}` });
            }

            const projectIdValid = item.project_id && ObjectId.isValid(item.project_id);

            galleriesToAdd.push({
                project_id: projectIdValid ? new ObjectId(item.project_id) : null,
                projectType: item.projectType,
                projectName: item.projectName,
                projectLocation: item.projectLocation,
                title: item.title,
                text: item.text,
                coverImage: itemImages[0],
                created_at: new Date()
            });
        }
        const pageSlug = "OnGoingPage";
        const pageSection = "gallery-wrapper";

        const page = await collection.findOne({ page_slug: pageSlug, page_section: pageSection });

        if (!page) {
            await collection.insertOne({
                page_slug: pageSlug,
                page_section: pageSection,
                page_content: galleriesToAdd
            });
        } else {
            await collection.updateOne(
                { page_slug: pageSlug, page_section: pageSection },
                { $push: { page_content: { $each: galleriesToAdd } } }
            );
        }

        return res.json({ success: true, message: "Gallery items added successfully" });
    } catch (error) {
        console.error('Error in addGalleryItem:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateGalleryItem = async (req, res) => {
    try {
        const { index } = req.params;
        const collection = mongoose.connection.db.collection("OnGoingPage");

        const updateFields = {};
        if (req.body.projectName) updateFields[`page_content.${index}.projectName`] = req.body.projectName;
        if (req.body.projectType) updateFields[`page_content.${index}.projectType`] = req.body.projectType;
        if (req.body.title) updateFields[`page_content.${index}.title`] = req.body.title;
        if (req.body.text) updateFields[`page_content.${index}.text`] = req.body.text;

        if (req.file) {
            updateFields[`page_content.${index}.coverImage`] = `/uploads/gallery/${req.file.filename}`;
        }

        const result = await collection.updateOne(
            { page_slug: "OnGoingPage", page_section: "gallery-wrapper" },
            { $set: updateFields }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ success: false, message: 'No changes made or gallery item not found' });
        }

        res.json({ success: true, message: 'Gallery item updated successfully!' });
    } catch (error) {
        console.error('Update Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteGalleryItem = async (req, res) => {
    try {
        const { index } = req.params;
        const idx = parseInt(index);
        const collection = mongoose.connection.db.collection("OnGoingPage");

        const data = await collection.findOne({
            page_slug: "OnGoingPage",
            page_section: "gallery-wrapper"
        });

        if (data?.page_content && data.page_content[idx]) {
            data.page_content.splice(idx, 1);
            await collection.updateOne(
                { page_slug: "OnGoingPage", page_section: "gallery-wrapper" },
                { $set: { page_content: data.page_content } }
            );
            res.json({ success: true, message: 'Gallery item deleted successfully!' });
        } else {
            res.status(404).json({ success: false, message: 'Gallery item not found' });
        }
    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { renderGalleryMainPage, getGallery, getGalleryByProject, addGalleryItem, updateGalleryItem, deleteGalleryItem };
