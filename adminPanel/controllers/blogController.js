const mongoose = require('mongoose');

const getBlog = async (req, res) => {
    try {
        const collection = mongoose.connection.db.collection("discoverUs");
        const data = await collection.findOne({
            page_slug: "discoverUs",
            page_section: "blogs-card"
        });
        res.json({ success: true, data: data?.page_content || [] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addBlogItem = async (req, res) => {
    try {
        const file = req.file || req.files;
        console.log('file',file)
        if(!file){
            return res.status(422).json({success:false, message:"file is not uploaded or file is required"});
        }
        const blogArr = req.body.blogArr;
        const collection = mongoose.connection.db.collection("discoverUs");
        
        const blogData = {
            ...req.body,
            image: req.file ? `/uploads/gallery/${req.file.filename}` : null
        };

        await collection.updateOne(
            { page_slug: "discoverUs", page_section: "blogs-card" },
            { $push: { page_content: blogData } }
        );

        res.json({ success: true, message: 'Gallery card added successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateBlogItem = async (req, res) => {
    try {
        const { index } = req.params;
        const collection = mongoose.connection.db.collection("discoverUs");
        await collection.updateOne(
            { page_slug: "discoverUs", page_section: "blogs-card" },
            { $set: { [`page_content.${index}`]: req.body } }
        );
        res.json({ success: true, message: 'Gallery card updated successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteBlogItem = async (req, res) => {
    try {
        const { index } = req.params;
        const collection = mongoose.connection.db.collection("discoverUs");
        const data = await collection.findOne({
            page_slug: "discoverUs",
            page_section: "blogs-card"
        });
        
        if (data?.page_content) {
            data.page_content.splice(parseInt(index), 1);
            await collection.updateOne(
                { page_slug: "discoverUs", page_section: "blogs-card" },
                { $set: { page_content: data.page_content } }
            );
        }
        res.json({ success: true, message: 'Gallery card deleted successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getBlog, addBlogItem, updateBlogItem, deleteBlogItem };