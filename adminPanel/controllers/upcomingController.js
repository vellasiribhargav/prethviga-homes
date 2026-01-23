const mongoose = require('mongoose');
const { ObjectId } = require("mongodb");

const renderUpcomingPage = async (req, res) => {
    try {
        res.render('admin/upcoming');
    } catch (error) {
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

        // Ensure each project has proper ID mapping and convert ObjectId to string
        const projects = data?.page_content?.map((project, index) => ({
            ...project,
            id: (project.project_id || project._id)?.toString() || index,
            name: project.project_name, // Map for table
            location: project.project_location, // Map for table
            timeline: project.project_date, // Map for table
            coverImage: project.card_image, // Map for table preview
            description: project.card_footer_text, // Map for edit form
            index: index // Important for edit/delete
        })) || [];

        res.render('admin/upcoming_projects', {
            title: 'Upcoming Projects',
            projects,
            activeLink: 'upcoming'
        });
    } catch (error) {
        console.error('Error fetching details:', error);
        res.render('admin/upcoming_projects', {
            title: 'Upcoming Projects',
            projects: [],
            activeLink: 'upcoming',
            error: error.message
        });
    }
};

const addupcomingItem = async (req, res) => {
    try {
        const upcomingArr = JSON.parse(req.body.upcomingArr || '[]');

        if (!upcomingArr.length) {
            return res.status(422).json({ success: false, message: "No projects data provided" });
        }

        const collection = mongoose.connection.db.collection("ProjectPage");
        const projectsToAdd = [];

        for (let i = 0; i < upcomingArr.length; i++) {
            const file = req.files.find(f => f.fieldname === `file_${i}`);
            if (!file) {
                return res.status(422).json({ success: false, message: `File required for project ${i + 1}` });
            }

            projectsToAdd.push({
                project_name: upcomingArr[i].project_name,
                project_location: upcomingArr[i].project_location,
                project_date: upcomingArr[i].project_date,
                card_footer_text: upcomingArr[i].card_footer_text,
                card_image: `/uploads/gallery/${file.filename}`, // Use relative path
                project_id: new ObjectId(),
                createdAt: new Date()
            });
        }

        const pageSlug = "ProjectPage";
        const pageSection = "ongoing-gallery";

        const page = await collection.findOne({ page_slug: pageSlug, page_section: pageSection });

        if (!page) {
            await collection.insertOne({
                page_slug: pageSlug,
                page_section: pageSection,
                page_content: projectsToAdd
            });
        } else {
            await collection.updateOne(
                { page_slug: pageSlug, page_section: pageSection },
                {
                    $push: {
                        page_content: { $each: projectsToAdd }
                    }
                }
            );
        }

        return res.json({ success: true, message: "Projects added successfully" });

    } catch (error) {
        console.error('Error in addupcomingItem:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateupcomingItem = async (req, res) => {
    try {
        const { index } = req.params;

        const collection = mongoose.connection.db.collection("ProjectPage");

        // Construct update object dynamically to avoid overwriting image if not provided
        const updateFields = {};
        if (req.body.project_name) updateFields[`page_content.${index}.project_name`] = req.body.project_name;
        if (req.body.project_location) updateFields[`page_content.${index}.project_location`] = req.body.project_location;
        if (req.body.project_date) updateFields[`page_content.${index}.project_date`] = req.body.project_date;
        if (req.body.card_footer_text) updateFields[`page_content.${index}.card_footer_text`] = req.body.card_footer_text;

        if (req.file) {
            updateFields[`page_content.${index}.card_image`] = `/uploads/gallery/${req.file.filename}`;
        }

        const result = await collection.updateOne(
            { page_slug: "ProjectPage", page_section: "ongoing-gallery" },
            { $set: updateFields }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ success: false, message: 'No changes made or project not found' });
        }

        res.json({ success: true, message: 'Project updated successfully!' });
    } catch (error) {
        console.error('Update Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteupcomingItem = async (req, res) => {
    try {
        const { index } = req.params;
        const idx = parseInt(index);

        const collection = mongoose.connection.db.collection("ProjectPage");

        // Use $unset to allow removing by index, then $pull nulls if needed, or just fetch-splice-save logic which is safer for arrays without IDs
        // However, standard specific index removal in Mongo is tricky without unique IDs. 
        // Best approach for reliable index removal:

        const data = await collection.findOne({
            page_slug: "ProjectPage",
            page_section: "ongoing-gallery"
        });

        if (data?.page_content && data.page_content[idx]) {
            data.page_content.splice(idx, 1);

            await collection.updateOne(
                { page_slug: "ProjectPage", page_section: "ongoing-gallery" },
                { $set: { page_content: data.page_content } }
            );
            res.json({ success: true, message: 'Project deleted successfully!' });
        } else {
            res.status(404).json({ success: false, message: 'Project not found' });
        }
    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getUpcomingProjectsJSON = async (req, res) => {
    try {
        const collection = mongoose.connection.db.collection("ProjectPage");
        const data = await collection.findOne({
            page_slug: "ProjectPage",
            page_section: "ongoing-gallery"
        });

        const projects = data?.page_content?.map((project, index) => ({
            ...project,
            id: (project.project_id || project._id)?.toString() || index,
            project_id: (project.project_id || project._id)?.toString(),
            project_name: project.project_name,
            project_location: project.project_location
        })) || [];

        res.json({ success: true, data: projects });
    } catch (error) {
        console.error('Error fetching upcoming projects JSON:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { renderUpcomingPage, getupcomingGallery, addupcomingItem, updateupcomingItem, deleteupcomingItem, getUpcomingProjectsJSON };