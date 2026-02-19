const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { ObjectId } = require("mongodb");
const { formatDateForDisplay, formatDateShortSimple } = require('../../utils/index');
const { asyncHandler, ValidationError, NotFoundError } = require('../../utils/errorHandler');

const renderInventoryForm = asyncHandler(async (req, res) => {
    res.render('admin/projects', {
        activeLink: 'Projects',
        title: 'Projects'
    });
});


const getInventoryList = asyncHandler(async (req, res) => {
    const collection = mongoose.connection.db.collection("projects");

    const upcomingData = await collection.find({
        page_slug: "projects",
        page_section: "ongoing-gallery"
    }).toArray();

    const completedData = await collection.find({
        page_slug: "projects",
        page_section: "completed-gallery"
    }).toArray();

    const upcomingProjects = upcomingData.map((project, index) => ({
        ...project,
        id: (project.project_id || project._id).toString(),
        name: project.project_name,
        location: project.project_location,
        timeline: formatDateForDisplay(project.project_date),
        coverImage: project.card_image,
        description: project.card_footer_text,
        type: 'upcoming',
        index: index,
        createdAt: formatDateShortSimple(project.createdAt),
        formattedDate: formatDateForDisplay(project.createdAt, true)
    }));

    const completedProjects = completedData.map((project, index) => ({
        ...project,
        id: (project.project_id || project._id).toString(),
        name: project.project_name,
        location: project.project_location,
        timeline: formatDateForDisplay(project.project_date),
        coverImage: project.card_image,
        description: project.card_footer_text,
        type: 'completed',
        index: index,
        createdAt: formatDateShortSimple(project.createdAt),
        formattedDate: formatDateForDisplay(project.createdAt, true)
    }));

    const allProjects = [...upcomingProjects, ...completedProjects];

    res.render('admin/projectsList', {
        title: 'Projects',
        projects: allProjects,
        activeLink: 'Projects',
        rowsPerPage: 5,
        rowsPerPageOptions: [5, 10, 20]
    });
});

const addInventoryItem = asyncHandler(async (req, res) => {
    const projectsArr = JSON.parse(req.body.projectsArr || '[]');

    if (!projectsArr.length) {
        throw new ValidationError("No projects data provided");
    }

    const collection = mongoose.connection.db.collection("projects");

    const projectsToAdd = [];

    for (let i = 0; i < projectsArr.length; i++) {
        const file = req.files.find(f => f.fieldname === `file_${i}`);
        if (!file) {
            throw new ValidationError(`File required for project ${i + 1}`);
        }

        const rawDate = projectsArr[i].project_date || '';
        let storedDate = rawDate;
        if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
            const dateObj = dayjs(rawDate);
            const day = dateObj.date().toString().padStart(2, '0');
            const month = (dateObj.month() + 1).toString().padStart(2, '0');
            const year = dateObj.year();
            storedDate = `${day}-${month}-${year}`;
        }

        const projectData = {
            page_slug: "projects",
            page_section: projectsArr[i].type === 'completed' ? "completed-gallery" : "ongoing-gallery",
            project_name: projectsArr[i].project_name,
            project_location: projectsArr[i].project_location,
            project_date: storedDate,
            card_footer_text: projectsArr[i].card_footer_text || projectsArr[i].project_summary,
            card_image: `${process.env.PROJECT_URL}uploads/gallery/${file.filename}`,
            project_id: new ObjectId(), // keeping project_id for now
            createdAt: new Date(),
            updatedAt: new Date()
        };
        projectsToAdd.push(projectData);
    }

    if (projectsToAdd.length > 0) {
        await collection.insertMany(projectsToAdd);
    }

    const projectsAdded = projectsToAdd.map(p => ({
        id: (p.project_id || p._id).toString(),
        type: p.page_section === 'completed-gallery' ? 'completed' : 'upcoming'
    }));

    res.json({
        success: true,
        message: "Projects added successfully",
        projects: projectsAdded,
        projectIds: projectsAdded.map(p => p.id) // For backward compatibility if needed
    });
});

const updateInventoryItem = asyncHandler(async (req, res) => {
    const { type, id } = req.params; // Changed index to id
    const collection = mongoose.connection.db.collection("projects");
    const section = type === 'completed' ? "completed-gallery" : "ongoing-gallery";

    const updateFields = {};
    if (req.body.project_name) updateFields.project_name = req.body.project_name;
    if (req.body.project_location) updateFields.project_location = req.body.project_location;
    if (req.body.project_date) {
        const rawDate = req.body.project_date;
        if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
            const dateObj = dayjs(rawDate);
            const day = dateObj.date().toString().padStart(2, '0');
            const month = (dateObj.month() + 1).toString().padStart(2, '0');
            const year = dateObj.year();
            updateFields.project_date = `${day}-${month}-${year}`;
        } else {
            updateFields.project_date = rawDate;
        }
    }
    if (req.body.card_footer_text) updateFields.card_footer_text = req.body.card_footer_text;

    if (req.file) {
        updateFields.card_image = `${process.env.PROJECT_URL}uploads/gallery/${req.file.filename}`;
    }

    updateFields.updatedAt = new Date();

    // Handle status change if needed
    if (req.body.new_type && req.body.new_type !== type) {
        const newSection = req.body.new_type === 'completed' ? "completed-gallery" : "ongoing-gallery";
        updateFields.page_section = newSection;
    }

    const query = ObjectId.isValid(id)
        ? { $or: [{ _id: new ObjectId(id) }, { project_id: new ObjectId(id) }] }
        : { project_id: id };

    const result = await collection.updateOne(
        query,
        { $set: updateFields }
    );

    if (result.matchedCount === 0) {
        throw new NotFoundError('Project not found');
    }

    res.json({ success: true, message: 'Project updated successfully!' });
});

const deleteInventoryItem = asyncHandler(async (req, res) => {
    const { type, id } = req.params; // Changed index to id
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

const getInventoryJSON = asyncHandler(async (req, res) => {
    const collection = mongoose.connection.db.collection("projects");
    const { type } = req.query;

    let query = { page_slug: "projects" };
    if (type === 'upcoming') query.page_section = "ongoing-gallery";
    else if (type === 'completed') query.page_section = "completed-gallery";
    else query.page_section = { $in: ["ongoing-gallery", "completed-gallery"] };

    const projectsData = await collection.find(query).toArray();

    const allProjects = projectsData.map((p, idx) => ({
        ...p,
        id: (p.project_id || p._id).toString(),
        type: p.page_section === 'completed-gallery' ? 'completed' : 'upcoming',
        index: idx
    }));

    res.json({ success: true, data: allProjects });
});

module.exports = {
    renderInventoryForm,
    getInventoryList,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    getInventoryJSON
};
