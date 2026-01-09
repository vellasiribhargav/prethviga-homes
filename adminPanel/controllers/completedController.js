const mongoose = require('mongoose');

const getcompletedGallery = async (req, res) => {
    try {
        const collection = mongoose.connection.db.collection("ProjectPage");
        const data = await collection.findOne({
            page_slug: "ProjectPage",
            page_section: "card-grid-wrapper"
        });
        res.json({ success: true, data: data?.page_content || [] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addcompletedItem = async (req, res) => {
    try {
        const file = req.file || req.files;
        console.log('file',file)
        if(!file){
            return res.status(422).json({success:false, message:"file is not uploaded or file is required"});
        }
        const upcomingArr = req.body.upcomingArr;
        const collection = mongoose.connection.db.collection("ProjectPage");
        const ongoingData = {
            ...req.body,
            image: req.file ? `/uploads/gallery/${req.file.filename}` : null
        };

        await collection.updateOne(
            { page_slug: "ProjectPage", page_section: "card-grid-wrapper" },
            { $push: { page_content: ongoingData } }
        );

        res.json({ success: true, message: 'Ongoing project added successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updatecompletedItem = async (req, res) => {
    try {
        const file = req.file || req.files;
        console.log('file',file)
        if(!file){
            return res.status(422).json({success:false, message:"file is not uploaded or file is required"});
        }
        const upcomingArr = req.body.upcomingArr;
        const collection = mongoose.connection.db.collection("ProjectPage");
        const updateData = {
            ...req.body,
            image: req.file ? `/uploads/gallery/${req.file.filename}` : null
        };

        await collection.updateOne(
            { page_slug: "ProjectPage", page_section: "card-grid-wrapper" },
            { $set: { [`page_content.${index}`]: updateData } }
        );
        res.json({ success: true, message: 'Ongoing project updated successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deletecompletedItem = async (req, res) => {
    try {
        const { index } = req.params;
        const collection = mongoose.connection.db.collection("ProjectPage");
        const data = await collection.findOne({
            page_slug: "ProjectPage",
            page_section: "card-grid-wrapper"
        });
        
        if (data?.page_content) {
            data.page_content.splice(parseInt(index), 1);
            await collection.updateOne(
                { page_slug: "ProjectPage", page_section: "card-grid-wrapper" },
                { $set: { page_content: data.page_content } }
            );
        }
        res.json({ success: true, message: 'Ongoing project deleted successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getcompletedGallery, addcompletedItem, updatecompletedItem, deletecompletedItem };