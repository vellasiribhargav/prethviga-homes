const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { ObjectId } = require('mongodb');
const { formatDateForDisplay, formatDateShortSimple } = require('../../utils/index');
const { asyncHandler, ValidationError, NotFoundError } = require('../../utils/errorHandler');

const renderDetailsPage = asyncHandler(async (req, res) => {
    res.render('admin/projectDetails', {
        title: 'Project Details Management',
        activeLink: 'projectDetails'
    });
});

const getProjectsList = asyncHandler(async (req, res) => {
    const collection = mongoose.connection.db.collection("projects");

    // Fetch all projects (both ongoing and completed)
    const projects = await collection.find({
        page_slug: "projects"
    }).toArray();

    const allProjects = projects.map(p => ({
        ...p,
        id: (p.project_id || p._id).toString(),
        type: p.page_section === 'completed-gallery' ? 'completed' : 'upcoming',
        project_name: p.project_name,
        createdAt: formatDateShortSimple(p.createdAt),
        formattedDate: formatDateForDisplay(p.createdAt, true)
    }));

    res.render('admin/projectDetailsList', {
        title: 'Project Details List',
        projects: allProjects,
        activeLink: 'projectDetails',
        rowsPerPage: 10,
        rowsPerPageOptions: [5, 10, 20]
    });
});

const getDetailsByProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    if (!ObjectId.isValid(projectId)) {
        throw new ValidationError("Invalid Project ID");
    }

    const collection = mongoose.connection.db.collection("project_details");
    const projectDoc = await collection.findOne({ project_id: new ObjectId(projectId) });

    const sectionData = {};

    // Map existing sections if document exists
    if (projectDoc?.sections) {
        projectDoc.sections.forEach(section => {
            const key = section.page_section === 'hero-section' ? 'hero' :
                section.page_section === 'floor-image' ? 'floor' :
                    section.page_section === 'features-grid' ? 'features' :
                        section.page_section === 'amenities-list' ? 'amenities' :
                            section.page_section === 'location-container' ? 'location' :
                                section.page_section === 'gallery-wrapper' ? 'gallery' :
                                    section.page_section === 'faq-items-container' ? 'faq' : null;

            if (key) {
                sectionData[key] = (key === 'hero' || key === 'floor') ? (section.page_content?.[0] || {}) : (section.page_content || []);
            }
        });
    }
    res.json({
        success: true,
        data: sectionData
    });
});

const saveProjectDetails = asyncHandler(async (req, res) => {
    const { projectId, section } = req.body;
    if (!projectId || !ObjectId.isValid(projectId)) {
        throw new ValidationError("Invalid or missing Project ID");
    }

    const collection = mongoose.connection.db.collection("project_details");
    let pageContent;
    try {
        pageContent = JSON.parse(req.body.pageContent);
    } catch (e) {
        throw new ValidationError("Invalid JSON content");
    }

    if (req.files?.length > 0) {
        const fileMap = {};
        req.files.forEach(file => {
            fileMap[file.fieldname] = `${process.env.PROJECT_URL}uploads/projects/${file.filename}`;
        });

        if (section === 'hero-section' && fileMap['heroImage']) pageContent[0].pimage = fileMap['heroImage'];
        else if (section === 'floor-image' && fileMap['floorImage']) pageContent[0].floor_image = fileMap['floorImage'];
        else if (section === 'location-container' && fileMap['locationImage']) {
            const imgIdx = pageContent.findIndex(p => p.hasOwnProperty('image'));
            if (imgIdx !== -1) pageContent[imgIdx].image = fileMap['locationImage'];
        } else if (section === 'gallery-wrapper') {
            pageContent.forEach(item => {
                if (item.fieldName && fileMap[item.fieldName]) item.coverImage = fileMap[item.fieldName];
                delete item.fieldName;
            });
        }
    }

    const doc = await collection.findOne({ project_id: new ObjectId(projectId) });
    const sectionExists = doc?.sections?.some(s => s.page_section === section);

    if (sectionExists) {
        await collection.updateOne(
            { project_id: new ObjectId(projectId) },
            { $set: { [`sections.$[elem].page_content`]: pageContent, updatedAt: dayjs().toDate() } },
            { arrayFilters: [{ "elem.page_section": section }] }
        );
        res.json({ success: true, message: `Content updated` });
    } else {
        await collection.updateOne(
            { project_id: new ObjectId(projectId) },
            {
                $push: { sections: { page_section: section, page_content: pageContent } },
                $set: {
                    project_id: new ObjectId(projectId),
                    page_slug: "project_details",
                    updatedAt: dayjs().toDate()
                }
            },
            { upsert: true }
        );
        res.json({ success: true, message: `Content saved` });
    }
});

const getUniqueAmenities = asyncHandler(async (req, res) => {
    const collection = mongoose.connection.db.collection("project_details");

    const pipeline = [
        { $unwind: "$sections" },
        { $match: { "sections.page_section": "amenities-list" } },
        { $unwind: "$sections.page_content" },
        { $match: { "sections.page_content.features_Description": { $exists: false } } },
        {
            $project: {
                amenityName: {
                    $ifNull: ["$sections.page_content.title", { $ifNull: ["$sections.page_content.feature", "$sections.page_content.text"] }]
                }
            }
        },
        { $match: { amenityName: { $ne: null } } },
        { $group: { _id: null, uniqueAmenities: { $addToSet: "$amenityName" } } }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    const amenities = result[0]?.uniqueAmenities || [];

    res.json({ success: true, amenities: amenities.sort() });
});

module.exports = {
    renderDetailsPage,
    getProjectsList,
    getDetailsByProject,
    saveProjectDetails,
    getUniqueAmenities
};
