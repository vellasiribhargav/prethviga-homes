const mongoose = require('mongoose');
const {ObjectId} = require("mongodb");

const renderUpcomingPage = async (req, res) => {
    try {
        // console.log('Rendering admin/upcoming page');
        res.render('admin/upcoming');
    }catch (error) {
        console.error('Error fetching upcoming data:', error);
        res.render('upcoming');
    }
};

const getupcomingGallery = async (req, res) => {
    try {
        const collection = mongoose.connection.db.collection("ProjectPage");
        const data = await collection.findOne({
            page_slug: "ProjectPage",
            page_section: "ongoing-gallery"
        });
        
        // Ensure each project has proper ID mapping
        const projects = data?.page_content?.map(project => ({
            ...project,
            id: project.project_id || project._id
        })) || [];
        
        res.json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addupcomingItem = async (req, res) => {
    try {
        // console.log('Request body:', req.body);
        // console.log('Request files:', req.files);
        
        const upcomingArr = JSON.parse(req.body.upcomingArr || '[]');
        
        if (!upcomingArr.length) {
            return res.status(422).json({success: false, message: "No projects data provided"});
        }

        const collection = mongoose.connection.db.collection("ProjectPage");
        const projectsToAdd = [];

        for (let i = 0; i < upcomingArr.length; i++) {
            const file = req.files.find(f => f.fieldname === `file_${i}`);
            if (!file) {
                return res.status(422).json({success: false, message: `File required for project ${i + 1}`});
            }

            projectsToAdd.push({
                ...upcomingArr[i],
                card_image: `${process.env.PROJECT_URL}uploads/gallery/${file.filename}`,
                project_id: new ObjectId(),
            });
        }

        await collection.updateOne(
            { page_slug: "ProjectPage", page_section: "ongoing-gallery" },
            { $push: { page_content: { $each: projectsToAdd } } },
            { upsert: true }
        );

        res.json({ success: true, message: `${projectsToAdd.length} projects added successfully!` });
    } catch (error) {
        console.error('Error in addupcomingItem:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateupcomingItem = async (req, res) => {
    try {
        const file = req.file || req.files;
        console.log('file',file)
        if(!file){
            return res.status(422).json({success:false, message:"file is not uploaded or file is required"});
        }
        const upcomingArr = req.body.upcomingArr;

        const { index } = req.params;
        console.log('index',index)
        const collection = mongoose.connection.db.collection("ProjectPage");
        
        const updateData = {
            ...req.body,
            image: req.file ? `/uploads/gallery/${req.file.filename}` : null
        };

        await collection.updateOne(
            { page_slug: "ProjectPage", page_section: "ongoing-gallery" },
            { $set: { [`page_content.${index}`]: updateData } }
        );
        res.json({ success: true, message: 'Ongoing project updated successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteupcomingItem = async (req, res) => {
    try {
        const { index } = req.params;
        const collection = mongoose.connection.db.collection("ProjectPage");
        const data = await collection.findOne({
            page_slug: "ProjectPage",
            page_section: "ongoing-gallery"
        });
        
        if (data?.page_content) {
            data.page_content.splice(parseInt(index), 1);
            await collection.updateOne(
                { page_slug: "ProjectPage", page_section: "ongoing-gallery" },
                { $set: { page_content: data.page_content } }
            );
        }
        res.json({ success: true, message: 'Ongoing project deleted successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { renderUpcomingPage, getupcomingGallery, addupcomingItem, updateupcomingItem, deleteupcomingItem };
// module.exports = { getupcomingGallery, addupcomingItem, updateupcomingItem, deleteupcomingItem };