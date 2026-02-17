const mongoose = require('mongoose');
const { ObjectId } = require("mongodb");
const { formatDateForDisplay } = require('../../utils/index');

const renderCompletedPage = async (req, res) => {
    try {
        res.render('admin/completed');
    } catch (error) {
        console.error('Error rendering completed page:', error);
        res.render('admin/completed');
    }
};

const getcompletedGallery = async (req, res) => {
    try {
        const collection = mongoose.connection.db.collection("ProjectPage");
        const data = await collection.findOne({
            page_slug: "ProjectPage",
            page_section: "completed-gallery"
        });

        // Ensure each project has proper ID mapping and convert ObjectId to string
        const projects = data?.page_content?.map((project, index) => ({
            ...project,
            id: (project.project_id || project._id)?.toString() || index,
            name: project.project_name, // Map for table
            location: project.project_location, // Map for table
            timeline: formatDateForDisplay(project.project_date), // Map for table
            coverImage: project.card_image, // Map for table preview
            description: project.card_footer_text, // Map for edit form
            index: index // Important for edit/delete
        })) || [];

        res.render('admin/completed_projects', {
            title: 'Completed Projects',
            projects,
            activeLink: 'completed',
            rowsPerPage: 5,
            rowsPerPageOptions: [5, 10]
        });
    } catch (error) {
        console.error('Error fetching details:', error);
        res.render('admin/completed_projects', {
            title: 'Completed Projects',
            projects: [],
            activeLink: 'completed',
            error: error.message
        });
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
                project_name: completedArr[i].project_name,
                project_location: completedArr[i].project_location,
                project_date: completedArr[i].completion_date,
                card_footer_text: completedArr[i].project_summary,
                card_image: `${process.env.PROJECT_URL}uploads/gallery/${file.filename}`, // Use relative path consistency
                project_id: new ObjectId(),
                createdAt: new Date()
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

            return res.json({
                success: true,
                message: "New page and new section created with project",
                projectIds: projectsToAdd.map(p => p.project_id.toString())
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

            return res.json({
                success: true,
                message: "New section created in existing page and project added",
                projectIds: projectsToAdd.map(p => p.project_id.toString())
            });
        }

    } catch (error) {
        console.error("Error adding project:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

const updatecompletedItem = async (req, res) => {
    try {
        const index = parseInt(req.params.index);
        const { project_name, project_location, project_date, card_footer_text } = req.body;
        const file = req.file;

        const collection = mongoose.connection.db.collection("ProjectPage");

        const updateFields = {
            [`page_content.${index}.project_name`]: project_name,
            [`page_content.${index}.project_location`]: project_location,
            [`page_content.${index}.project_date`]: project_date,
            [`page_content.${index}.card_footer_text`]: card_footer_text
        };

        if (file) {
            updateFields[`page_content.${index}.card_image`] = `${process.env.PROJECT_URL}uploads/gallery/${file.filename}`;
        }

        await collection.updateOne(
            { page_slug: "ProjectPage", page_section: "completed-gallery" },
            { $set: updateFields }
        );

        return res.json({ success: true, message: "Project updated successfully" });
    } catch (error) {
        console.error("Error updating project:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const deletecompletedItem = async (req, res) => {
    try {
        const index = parseInt(req.params.index);
        const collection = mongoose.connection.db.collection("ProjectPage");

        const page = await collection.findOne({ page_slug: "ProjectPage", page_section: "completed-gallery" });
        if (!page || !page.page_content) return res.status(404).json({ success: false, message: "Page not found" });

        const newContent = [...page.page_content];
        if (index < 0 || index >= newContent.length) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        newContent.splice(index, 1);

        await collection.updateOne(
            { page_slug: "ProjectPage", page_section: "completed-gallery" },
            { $set: { page_content: newContent } }
        );

        return res.json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
        console.error("Error deleting project:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const getCompletedProjectsJSON = async (req, res) => {
    try {
        const collection = mongoose.connection.db.collection("ProjectPage");
        const data = await collection.findOne({
            page_slug: "ProjectPage",
            page_section: "completed-gallery"
        });

        const projects = data?.page_content?.map((project, index) => ({
            ...project,
            id: (project.project_id || project._id)?.toString() || index,
            project_id: (project.project_id || project._id)?.toString(),
            project_name: project.project_name,
            project_location: project.project_location,
            isSeeded: !!project.isSeeded
        })) || [];

        res.json({ success: true, data: projects });
    } catch (error) {
        console.error('Error fetching completed projects JSON:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    renderCompletedPage,
    getcompletedGallery,
    addcompletedItem,
    updatecompletedItem,
    deletecompletedItem,
    getCompletedProjectsJSON
};
