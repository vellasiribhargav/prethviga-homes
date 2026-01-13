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
        // console.log('Request body:', req.body);
        // console.log('Files received:', req.files);
        
        const files = req.files || [];
        if(!files || files.length === 0){
            // console.log('No files received');
            return res.status(422).json({success:false, message:"files are required"});
        }

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection not established');
        }
        
        const collection = db.collection("OnGoingPage");
        const file = files.map(file => `${process.env.PROJECT_URL}uploads/gallery/${file.filename}`)
        const imgPath = file[0];
        const galleryData = {
            project_id: new ObjectId(req.body.project_id),
            projectType: req.body.projectType,
            projectName: req.body.projectName,
            projectLocation: req.body.projectLocation,
            title: req.body.title,
            text: req.body.text,
            coverImage: imgPath,
            created_at: new Date()
        };
        
        // console.log('Gallery data to insert:', galleryData);
        
        await collection.updateOne(
            { page_slug: "OnGoingPage", page_section: "gallery-wrapper" },
            { $push: { page_content: galleryData } },
            { upsert: true }
        );
        
        // console.log('Gallery item added to ProjectPage collection');
        res.json({ success: true, message: 'Gallery item added successfully!' });
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