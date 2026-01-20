const mongoose = require('mongoose');
const { ObjectId } = require("mongodb");

const getcompletedGallery = async (req, res) => {
    try {
        const collection = mongoose.connection.db.collection("ProjectPage");
        const data = await collection.findOne({
            page_slug: "ProjectPage",
            page_section: "completed-gallery"
        });

        // Ensure each project has proper ID mapping and convert ObjectId to string
        const projects = data?.page_content?.map(project => ({
            ...project,
            id: (project.project_id || project._id)?.toString(),
            project_id: project.project_id?.toString()
        })) || [];

        res.json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addcompletedItem = async (req, res) => {
    try {
        const completedArr = JSON.parse(req.body.completedArr || '[]');

        if (!completedArr.length) {
            return res.status(422).json({ success: false, message: "No projects data provided" });
        }

        const collection = mongoose.connection.db.collection("ProjectPage");
        const projectsToAdd = [];

        for (let i = 0; i < completedArr.length; i++) {
            const file = req.files.find(f => f.fieldname === `file_${i}`);
            if (!file) {
                return res.status(422).json({ success: false, message: `File required for project ${i + 1}` });
            }

            projectsToAdd.push({
                ...completedArr[i],
                project_id: new ObjectId(),
                card_image: `${process.env.PROJECT_URL}uploads/gallery/${file.filename}`
            });
        }
        const pageSlug = "ProjectPage";
        const pageSection = "completed-gallery";

        // checking page & section
        const page = await collection.findOne({ page_slug: pageSlug, page_section: pageSection });

        if (!page) {
            await collection.insertOne({
                page_slug: pageSlug,
                page_section: pageSection,
                page_content: projectsToAdd
            });

            return res.json({ success: true, message: "New page and new section created with project" });
        } else {
            await collection.updateOne(
                { page_slug: pageSlug, page_section: pageSection },
                {
                    $push: {
                        page_content: { $each: projectsToAdd }
                    }
                }
            );

            return res.json({ success: true, message: "New section created in existing page and project added" });
        }
    } catch (error) {
        console.error('Error in addcompletedItem:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updatecompletedItem = async (req, res) => {
    try {
        const file = req.file || req.files;
        // console.log('file',file)
        if (!file) {
            return res.status(422).json({ success: false, message: "file is not uploaded or file is required" });
        }
        const completedArr = req.body.completedArr;
        const collection = mongoose.connection.db.collection("ProjectPage");
        const updateData = {
            ...req.body,
            image: req.file ? `${process.env.PROJECT_URL}uploads/gallery/${req.file.filename}` : null
        };

        await collection.updateOne(
            { page_slug: "ProjectPage", page_section: "completed-gallery" },
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
            page_section: "completed-gallery"
        });

        if (data?.page_content) {
            data.page_content.splice(parseInt(index), 1);
            await collection.updateOne(
                { page_slug: "ProjectPage", page_section: "completed-gallery" },
                { $set: { page_content: data.page_content } }
            );
        }
        res.json({ success: true, message: 'Ongoing project deleted successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getcompletedGallery, addcompletedItem, updatecompletedItem, deletecompletedItem };