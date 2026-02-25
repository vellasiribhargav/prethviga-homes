const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { ObjectId } = require("mongodb");
const { formatDateForDisplay, formatedDate } = require('../../utils/index');
const { asyncHandler, ValidationError, NotFoundError } = require('../../utils/errorHandler');
const { ListFilter } = require('../utils/filterUtils');

const renderCompletedPage = asyncHandler(async (req, res) => {
    res.render('admin/completed');
});

const getcompletedGallery = asyncHandler(async (req, res) => {
    let { page = 1, limit = 5, is_filter = false } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 5;
    const skip = (page - 1) * limit;

    const collection = mongoose.connection.db.collection("projects");
    const baseQuery = {
        page_slug: "projects",
        page_section: "completed-gallery"
    };

    const { query, isFiltered } = ListFilter(baseQuery, req);

    const totalItems = await collection.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    const data = await collection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();

    const projects = data.map((project, index) => ({
        ...project,
        id: project._id.toString(),
        name: project.project_name,
        location: project.project_location,
        timeline: formatDateForDisplay(project.project_date),
        coverImage: project.card_image,
        description: project.card_footer_text,
        index: skip + index,
        createdAt: formatedDate(project.createdAt)
    }));

    const response = {
        title: 'Completed Projects',
        projects,
        pagination: {
            totalItems,
            totalPages,
            currentPage: page,
            limit,
            start: skip + 1,
            end: Math.min(skip + limit, totalItems)
        },
        activeLink: 'completed',
        rowsPerPage: limit,
        rowsPerPageOptions: [5, 10, 20],
        filters: req.query,
        is_filtered: isFiltered
    };

    if (is_filter) {
        return res.json({ success: true, ...response });
    }

    res.render('admin/completed_projects', response);
});

const addcompletedItem = asyncHandler(async (req, res) => {
    const completedArr = JSON.parse(req.body.completedArr || '[]');

    if (!completedArr.length) {
        throw new ValidationError("No projects data provided");
    }

    const collection = mongoose.connection.db.collection("projects");
    const projectsToAdd = [];

    for (let i = 0; i < completedArr.length; i++) {
        const file = req.files.find(f => f.fieldname === `file_${i}`);
        if (!file) {
            throw new ValidationError(`File required for project ${i + 1}`);
        }

        projectsToAdd.push({
            page_slug: "projects",
            page_section: "completed-gallery",
            project_name: completedArr[i].project_name,
            project_location: completedArr[i].project_location,
            project_date: completedArr[i].completion_date,
            card_footer_text: completedArr[i].project_summary,
            card_image: `${process.env.PROJECT_URL}uploads/gallery/${file.filename}`,
            project_id: new ObjectId(),
            createdAt: dayjs().toDate(),
            updatedAt: dayjs().toDate()
        });
    }

    if (projectsToAdd.length > 0) {
        await collection.insertMany(projectsToAdd);
    }

    res.json({
        success: true,
        message: "Projects added successfully",
        projectIds: projectsToAdd.map(p => p.project_id.toString())
    });
});

const updatecompletedItem = asyncHandler(async (req, res) => {
    const id = req.params.id; // Changed index to id
    const { project_name, project_location, project_date, card_footer_text } = req.body;
    const file = req.file;

    const collection = mongoose.connection.db.collection("projects");

    const updateFields = {
        project_name,
        project_location,
        project_date,
        card_footer_text
    };

    if (file) {
        updateFields.card_image = `${process.env.PROJECT_URL}uploads/gallery/${file.filename}`;
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
        throw new NotFoundError('Project not found');
    }

    return res.json({ success: true, message: "Project updated successfully" });
});

const deletecompletedItem = asyncHandler(async (req, res) => {
    const id = req.params.id; // Changed index to id
    const collection = mongoose.connection.db.collection("projects");

    const query = ObjectId.isValid(id)
        ? { $or: [{ _id: new ObjectId(id) }, { project_id: new ObjectId(id) }] }
        : { project_id: id };

    const result = await collection.deleteOne(query);

    if (result.deletedCount === 0) {
        throw new NotFoundError('Project not found');
    }

    return res.json({ success: true, message: "Project deleted successfully" });
});

const getCompletedProjectsJSON = asyncHandler(async (req, res) => {
    const collection = mongoose.connection.db.collection("projects");
    const data = await collection.find({
        page_slug: "projects",
        page_section: "completed-gallery"
    }).toArray();

    const projects = data.map((project, index) => ({
        ...project,
        id: (project.project_id || project._id).toString(),
        project_id: (project.project_id || project._id).toString(),
        project_name: project.project_name,
        project_location: project.project_location,
        isSeeded: !!project.isSeeded
    }));

    res.json({ success: true, data: projects });
});

module.exports = {
    renderCompletedPage,
    getcompletedGallery,
    addcompletedItem,
    updatecompletedItem,
    deletecompletedItem,
    getCompletedProjectsJSON
};
