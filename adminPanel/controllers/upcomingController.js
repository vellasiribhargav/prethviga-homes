const mongoose = require('mongoose');
const { ObjectId } = require("mongodb");
const { formatDateForDisplay } = require('../../utils/index');
const { asyncHandler, ValidationError, NotFoundError, DatabaseError } = require('../../utils/errorHandler');

const renderUpcomingPage = asyncHandler(async (req, res) => {
    res.render('admin/upcoming');
});

const getupcomingGallery = asyncHandler(async (req, res) => {
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
        timeline: formatDateForDisplay(project.project_date), // Map for table
        coverImage: project.card_image, // Map for table preview
        description: project.card_footer_text, // Map for edit form
        index: index // Important for edit/delete
    })) || [];

    res.render('admin/upcoming_projects', {
        title: 'Upcoming Projects',
        projects,
        activeLink: 'upcoming',
        rowsPerPage: 5,
        rowsPerPageOptions: [5, 10]
    });
});

const addupcomingItem = asyncHandler(async (req, res) => {
    const upcomingArr = JSON.parse(req.body.upcomingArr || '[]');

    if (!upcomingArr.length) {
        throw new ValidationError("No projects data provided");
    }

    const collection = mongoose.connection.db.collection("ProjectPage");
    const projectsToAdd = [];

    for (let i = 0; i < upcomingArr.length; i++) {
        const file = req.files.find(f => f.fieldname === `file_${i}`);
        if (!file) {
            throw new ValidationError(`File required for project ${i + 1}`);
        }

        projectsToAdd.push({
            project_name: upcomingArr[i].project_name,
            project_location: upcomingArr[i].project_location,
            project_date: upcomingArr[i].project_date,
            card_footer_text: upcomingArr[i].card_footer_text,
            card_image: `${process.env.PROJECT_URL}uploads/gallery/${file.filename}`,
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

    res.json({ success: true, message: "Projects added successfully", projectIds: projectsToAdd.map(p => p.project_id.toString()) });
});

const updateupcomingItem = asyncHandler(async (req, res) => {
    const { index } = req.params;

    const collection = mongoose.connection.db.collection("ProjectPage");

    // Construct update object dynamically to avoid overwriting image if not provided
    const updateFields = {};
    if (req.body.project_name) updateFields[`page_content.${index}.project_name`] = req.body.project_name;
    if (req.body.project_location) updateFields[`page_content.${index}.project_location`] = req.body.project_location;
    if (req.body.project_date) updateFields[`page_content.${index}.project_date`] = req.body.project_date;
    if (req.body.card_footer_text) updateFields[`page_content.${index}.card_footer_text`] = req.body.card_footer_text;

    if (req.file) {
        updateFields[`page_content.${index}.card_image`] = `${process.env.PROJECT_URL}uploads/gallery/${req.file.filename}`;
    }

    const result = await collection.updateOne(
        { page_slug: "ProjectPage", page_section: "ongoing-gallery" },
        { $set: updateFields }
    );

    if (result.modifiedCount === 0) {
        throw new NotFoundError('No changes made or project not found');
    }

    res.json({ success: true, message: 'Project updated successfully!' });
});

const deleteupcomingItem = asyncHandler(async (req, res) => {
    const { index } = req.params;
    const idx = parseInt(index);

    const collection = mongoose.connection.db.collection("ProjectPage");

    const data = await collection.findOne({
        page_slug: "ProjectPage",
        page_section: "ongoing-gallery"
    });

    if (!data?.page_content || !data.page_content[idx]) {
        throw new NotFoundError('Project not found');
    }

    data.page_content.splice(idx, 1);

    await collection.updateOne(
        { page_slug: "ProjectPage", page_section: "ongoing-gallery" },
        { $set: { page_content: data.page_content } }
    );

    res.json({ success: true, message: 'Project deleted successfully!' });
});

const getUpcomingProjectsJSON = asyncHandler(async (req, res) => {
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
        project_location: project.project_location,
        isSeeded: !!project.isSeeded
    })) || [];

    res.json({ success: true, data: projects });
});

module.exports = {
    renderUpcomingPage,
    getupcomingGallery,
    addupcomingItem,
    updateupcomingItem,
    deleteupcomingItem,
    getUpcomingProjectsJSON
};