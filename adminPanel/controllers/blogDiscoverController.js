const mongoose = require('mongoose');
const { ObjectId } = require("mongodb");

// const renderBlogDiscoverPage = async (req, res) => {
//     try {
//         console.log('Rendering admin/blogDiscover page');
//         res.render('admin/blogDiscover');
//     } catch (error) {
//         console.error('Error rendering blogDiscover page:', error);
//         res.render('admin/blogDiscover');
//     }
// };

const getBlogDiscover = async (req, res) => {
    try {
        const collection = mongoose.connection.db.collection("discoverUs");
        const data = await collection.findOne({
            page_slug: "discoverUs",
            page_section: "blogs-card"
        });
        res.json({ success: true, data: data?.page_content || [] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addBlogDiscoverItem = async (req, res) => {
    try {
        const blogArr = JSON.parse(req.body.blogArr || '[]');

        if (!blogArr.length) {
            return res.status(422).json({ success: false, message: "No blog data provided" });
        }

        const collection = mongoose.connection.db.collection("discoverUs");
        const blogsToAdd = [];

        for (let i = 0; i < blogArr.length; i++) {
            const file = req.files.find(f => f.fieldname === `file_${i}`);
            if (!file) {
                return res.status(422).json({ success: false, message: `Cover image required for blog ${i + 1}` });
            }

            blogsToAdd.push({
                inner_img: `${process.env.PROJECT_URL}uploads/blogDiscover/${file.filename}`,
                badge_text: blogArr[i].blogTag,
                blog_date: blogArr[i].publicationDate,
                blog_text: blogArr[i].blogTitle,
                blog_description: blogArr[i].blogDescription,
                blog_id: new ObjectId(),
            });
        }

        await collection.updateOne(
            { page_slug: "discoverUs", page_section: "blogs-card" },
            { $push: { page_content: { $each: blogsToAdd } } },
            { upsert: true }
        );

        res.json({ success: true, message: `${blogsToAdd.length} blog posts added successfully!` });
    } catch (error) {
        console.error('Error in addBlogDiscoverItem:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateBlogDiscoverItem = async (req, res) => {
    try {
        const { index } = req.params;
        const collection = mongoose.connection.db.collection("discoverUs");

        const updateData = {
            inner_img: req.file ? `${process.env.PROJECT_URL}uploads/blogDiscover/${req.file.filename}` : req.body.inner_img,
            badge_text: req.body.blogTag,
            blog_date: req.body.publicationDate,
            blog_text: req.body.blogTitle,
            blog_description: req.body.blogDescription,
            updated_at: new Date()
        };

        await collection.updateOne(
            { page_slug: "discoverUs", page_section: "blogs-card" },
            { $set: { [`page_content.${index}`]: updateData } }
        );
        res.json({ success: true, message: 'Blog post updated successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteBlogDiscoverItem = async (req, res) => {
    try {
        const { index } = req.params;
        const collection = mongoose.connection.db.collection("discoverUs");
        const data = await collection.findOne({
            page_slug: "discoverUs",
            page_section: "blogs-card"
        });

        if (data?.page_content) {
            data.page_content.splice(parseInt(index), 1);
            await collection.updateOne(
                { page_slug: "discoverUs", page_section: "blogs-card" },
                { $set: { page_content: data.page_content } }
            );
        }
        res.json({ success: true, message: 'Blog post deleted successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getBlogDiscover, addBlogDiscoverItem, updateBlogDiscoverItem, deleteBlogDiscoverItem };