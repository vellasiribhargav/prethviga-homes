const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { ObjectId } = require("mongodb");
const { formatDateForDisplay } = require('../../utils/index');
const { asyncHandler, ValidationError, NotFoundError, DatabaseError } = require('../../utils/errorHandler');

const renderUpcomingPage = asyncHandler(async (req, res) => {
    res.render('admin/upcoming');
});

const getupcomingGallery = asyncHandler(async (req, res) => {
    const collection = mongoose.connection.db.collection("projects");
    const data = await collection.find({
        page_slug: "projects",
        page_section: "ongoing-gallery"
    }).toArray();

    // Ensure each project has proper ID mapping and convert ObjectId to string
    const projects = data.map((project, index) => ({
        ...project,
        id: project._id.toString(),
        name: project.project_name, // Map for table
        location: project.project_location, // Map for table
        timeline: formatDateForDisplay(project.project_date), // Map for table
        coverImage: project.card_image, // Map for table preview
        description: project.card_footer_text, // Map for edit form
        index: index, // Keeping index for potential UI needs, but not for ID
        createdAt: formatDateForDisplay(project.createdAt, true)
    }));

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

    const collection = mongoose.connection.db.collection("projects");
    const projectsToAdd = [];

    for (let i = 0; i < upcomingArr.length; i++) {
        const file = req.files.find(f => f.fieldname === `file_${i}`);
        if (!file) {
            throw new ValidationError(`File required for project ${i + 1}`);
        }

        projectsToAdd.push({
            page_slug: "projects",
            page_section: "ongoing-gallery",
            project_name: upcomingArr[i].project_name,
            project_location: upcomingArr[i].project_location,
            project_date: upcomingArr[i].project_date,
            card_footer_text: upcomingArr[i].card_footer_text,
            card_image: `${process.env.PROJECT_URL}uploads/gallery/${file.filename}`,
            project_id: new ObjectId(),
            createdAt: dayjs().toDate(),
            updatedAt: dayjs().toDate()
        });
    }

    if (projectsToAdd.length > 0) {
        await collection.insertMany(projectsToAdd);
    }

    res.json({ success: true, message: "Projects added successfully", projectIds: projectsToAdd.map(p => p.project_id.toString()) });
});

const updateupcomingItem = asyncHandler(async (req, res) => {
    const { id } = req.params; // Changed index to id

    const collection = mongoose.connection.db.collection("projects");

    // Construct update object dynamically to avoid overwriting image if not provided
    const updateFields = {};
    if (req.body.project_name) updateFields.project_name = req.body.project_name;
    if (req.body.project_location) updateFields.project_location = req.body.project_location;
    if (req.body.project_date) updateFields.project_date = req.body.project_date;
    if (req.body.card_footer_text) updateFields.card_footer_text = req.body.card_footer_text;

    if (req.file) {
        updateFields.card_image = `${process.env.PROJECT_URL}uploads/gallery/${req.file.filename}`;
    }

    const query = ObjectId.isValid(id)
        ? { $or: [{ _id: new ObjectId(id) }, { project_id: new ObjectId(id) }] }
        : { project_id: id };

    const result = await collection.updateOne(
        query,
        {
            $set: {
                ...updateFields,
                updatedAt: new Date()
            }
        }
    );

    if (result.matchedCount === 0) {
        throw new NotFoundError('No changes made or project not found');
    }

    res.json({ success: true, message: 'Project updated successfully!' });
});

const deleteupcomingItem = asyncHandler(async (req, res) => {
    const { id } = req.params; // Changed index to id

    const collection = mongoose.connection.db.collection("projects");

    const query = ObjectId.isValid(id)
        ? { $or: [{ _id: new ObjectId(id) }, { project_id: new ObjectId(id) }] }
        : { project_id: id };

    const result = await collection.deleteOne(query);

    if (result.deletedCount === 0) {
        throw new NotFoundError('Project not found');
    }

    res.json({ success: true, message: 'Project deleted successfully!' });
});

const getUpcomingProjectsJSON = asyncHandler(async (req, res) => {
    const collection = mongoose.connection.db.collection("projects");
    const data = await collection.find({
        page_slug: "projects",
        page_section: "ongoing-gallery"
    }).toArray();

    const projects = data.map((project, index) => ({
        ...project,
        id: project._id.toString(),
        project_id: (project.project_id || project._id).toString(),
        project_name: project.project_name,
        project_location: project.project_location,
        isSeeded: !!project.isSeeded
    }));

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
