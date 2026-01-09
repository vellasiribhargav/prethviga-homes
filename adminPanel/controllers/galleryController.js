const mongoose = require('mongoose');

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

const addGalleryItem = async (req, res) => {
    try {
        const file = req.file || req.files;
        console.log('file',file)
        if(!file){
            return res.status(422).json({success:false, message:"file is not uploaded or file is required"});
        }
        const galleryArr = req.body.galleryArr;

        const collection = mongoose.connection.db.collection("OnGoingPage");
        const galleryData = {
            ...req.body,
            image: req.file ? `/uploads/gallery/${req.file.filename}` : null
        };
        
        await collection.updateOne(
            { page_slug: "OnGoingPage", page_section: "gallery-wrapper" },
            { $push: { page_content: galleryData } }
        );
        res.json({ success: true, message: 'Gallery item added successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateGalleryItem = async (req, res) => {
    try {
        const { index } = req.params;
        const collection = mongoose.connection.db.collection("OnGoingPage");
        await collection.updateOne(
            { page_slug: "OnGoingPage", page_section: "gallery-wrapper" },
            { $set: { [`page_content.${index}`]: req.body } }
        );
        res.json({ success: true, message: 'Gallery card updated successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteGalleryItem = async (req, res) => {
    try {
        const { index } = req.params;
        const collection = mongoose.connection.db.collection("OnGoingPage");
        const data = await collection.findOne({
            page_slug: "OnGoingPage",
            page_section: "gallery-wrapper"
        });
        
        if (data?.page_content) {
            data.page_content.splice(parseInt(index), 1);
            await collection.updateOne(
                { page_slug: "OnGoingPage", page_section: "gallery-wrapper" },
                { $set: { page_content: data.page_content } }
            );
        }
        res.json({ success: true, message: 'Gallery card deleted successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getGallery, addGalleryItem, updateGalleryItem, deleteGalleryItem };