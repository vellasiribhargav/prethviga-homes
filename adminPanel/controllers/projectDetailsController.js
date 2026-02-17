const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { asyncHandler } = require('../../utils/errorHandler');

const renderDetailsPage = asyncHandler(async (req, res) => {
    res.render('admin/projectDetails', {
        title: 'Project Details Management',
        activeLink: 'projectDetails'
    });
});

const getProjectsList = asyncHandler(async (req, res) => {
    const collection = mongoose.connection.db.collection("ProjectPage");
    const ongoingData = await collection.findOne({ page_slug: "ProjectPage", page_section: "ongoing-gallery" });
    const completedData = await collection.findOne({ page_slug: "ProjectPage", page_section: "completed-gallery" });

    const ongoingProjects = ongoingData?.page_content?.map((p, i) => ({ ...p, type: 'upcoming', index: i })) || [];
    const completedProjects = completedData?.page_content?.map((p, i) => ({ ...p, type: 'completed', index: i })) || [];

    const allProjects = [...ongoingProjects, ...completedProjects].map(p => ({
        ...p,
        id: (p.project_id || p._id)?.toString()
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
        return res.status(400).json({ success: false, message: "Invalid Project ID" });
    }

    // Resolve the actual project_id from ProjectPage first to handle cases where projectId might be _id
    const projectPageCollection = mongoose.connection.db.collection("ProjectPage");
    const projectPageDoc = await projectPageCollection.findOne({
        page_slug: "ProjectPage",
        page_content: { $elemMatch: { $or: [{ project_id: new ObjectId(projectId) }, { _id: new ObjectId(projectId) }] } }
    });

    let actualProjectId = projectId;
    let projectInfo = null;
    if (projectPageDoc) {
        projectInfo = projectPageDoc.page_content.find(p =>
            (p.project_id?.toString() === projectId) || (p._id?.toString() === projectId)
        );
        if (projectInfo && projectInfo.project_id) {
            actualProjectId = projectInfo.project_id.toString();
        }
    }

    const collection = mongoose.connection.db.collection("OnGoingPage");
    const projectDoc = await collection.findOne({ project_id: new ObjectId(actualProjectId) });

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
        return res.status(400).json({ success: false, message: "Invalid or missing Project ID" });
    }

    // Resolve the actual project_id from ProjectPage first
    const projectPageCollection = mongoose.connection.db.collection("ProjectPage");
    const projectPageDoc = await projectPageCollection.findOne({
        page_slug: "ProjectPage",
        page_content: { $elemMatch: { $or: [{ project_id: new ObjectId(projectId) }, { _id: new ObjectId(projectId) }] } }
    });

    let actualProjectId = projectId;
    if (projectPageDoc) {
        const foundProject = projectPageDoc.page_content.find(p =>
            (p.project_id?.toString() === projectId) || (p._id?.toString() === projectId)
        );
        if (foundProject && foundProject.project_id) {
            actualProjectId = foundProject.project_id.toString();
        }
    }

    const collection = mongoose.connection.db.collection("OnGoingPage");
    let pageContent = JSON.parse(req.body.pageContent);

    // console.log(`[Backend] Saving section: ${section} for projectId: ${projectId}`);
    // console.log(`[Backend] Resolved actualProjectId: ${actualProjectId}`);
    // console.log(`[Backend] pageContent items: ${pageContent.length}`);

    if (req.files?.length > 0) {
        // console.log(`[Backend] Files received: ${req.files.length}`);
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

    const doc = await collection.findOne({ project_id: new ObjectId(actualProjectId) });
    const sectionExists = doc?.sections?.some(s => s.page_section === section);

    if (sectionExists) {
        await collection.updateOne(
            { project_id: new ObjectId(actualProjectId) },
            { $set: { [`sections.$[elem].page_content`]: pageContent, updatedAt: new Date() } },
            { arrayFilters: [{ "elem.page_section": section }] }
        );
    } else {
        await collection.updateOne(
            { project_id: new ObjectId(actualProjectId) },
            { $push: { sections: { page_section: section, page_content: pageContent } }, $set: { project_id: new ObjectId(actualProjectId), page_slug: "OnGoingPage", updatedAt: new Date() } },
            { upsert: true }
        );
    }

    res.json({ success: true, message: `${section} updated successfully` });
});

module.exports = {
    renderDetailsPage,
    getProjectsList,
    getDetailsByProject,
    saveProjectDetails
};