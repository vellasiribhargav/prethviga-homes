const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const getGallery = async (req, res) => {
    try {
        const collection = mongoose.connection.db.collection("OnGoingPage");
        const data = await collection.findOne({
            page_slug: "OnGoingPage",
            page_section: "gallery-wrapper"
        });
        res.json({ success: true, data: data?.page_content || [] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getGalleryByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const collection = mongoose.connection.db.collection("Gallery");
        const galleries = await collection.find({ project_id: projectId }).toArray();
        res.json({ success: true, data: galleries });
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
        if (!db) {
            throw new Error('Database connection not established');
        }

        const collection = db.collection("OnGoingPage");
        const galleriesToAdd = [];

        for (let i = 0; i < galleryArr.length; i++) {
            const item = galleryArr[i];
            const itemImages = [];

            // Find all files belonging to this gallery item
            for (let j = 0; j < item.imageCount; j++) {
                const fieldname = `gallery_${i}_file_${j}`;
                const file = files.find(f => f.fieldname === fieldname);

                if (file) {
                    itemImages.push(`${process.env.PROJECT_URL}uploads/gallery/${file.filename}`);
                }
            }

            if (itemImages.length === 0) {
                return res.status(422).json({
                    success: false,
                    message: `At least one image is required for gallery ${i + 1}`,
                    debug: {
                        expectedFieldname: `gallery_${i}_file_0`,
                        receivedFiles: files.map(f => f.fieldname)
                    }
                });
            }

            // Validate project_id
            const projectIdValid = item.project_id && ObjectId.isValid(item.project_id);

            galleriesToAdd.push({
                project_id: projectIdValid ? new ObjectId(item.project_id) : null,
                projectType: item.projectType,
                projectName: item.projectName,
                projectLocation: item.projectLocation,
                title: item.title,
                text: item.text,
                coverImage: itemImages[0],
                images: itemImages,
                created_at: new Date()
            });
        }
        const pageSlug = "OnGoingPage";
        const pageSection = "gallery-wrapper";

        // checking page & section
        const page = await collection.findOne({ page_slug: pageSlug, page_section: pageSection });

        if (!page) {
            await collection.insertOne({
                page_slug: pageSlug,
                page_section: pageSection,
                page_content: galleriesToAdd
            });

            return res.json({ success: true, message: "New page and new section created with gallery" });
        } else {
            await collection.updateOne(
                { page_slug: pageSlug, page_section: pageSection },
                {
                    $push: {
                        page_content: { $each: galleriesToAdd }
                    }
                }
            );

            return res.json({ success: true, message: "New section created in existing page and gallery added" });
        }
    } catch (error) {
        console.error('Error in addGalleryItem:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateGalleryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const collection = mongoose.connection.db.collection("Gallery");
        await collection.updateOne(
            { _id: new mongoose.Types.ObjectId(id) },
            { $set: { ...req.body, updated_at: new Date() } }
        );
        res.json({ success: true, message: 'Gallery item updated successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteGalleryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const collection = mongoose.connection.db.collection("Gallery");
        await collection.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
        res.json({ success: true, message: 'Gallery item deleted successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getGallery, getGalleryByProject, addGalleryItem, updateGalleryItem, deleteGalleryItem };