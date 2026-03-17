const dayjs = require('dayjs');

const ListFilter = (baseQuery, req) => {
  const { search, fromDate, toDate, type, status } = req.query;
  const query = { ...baseQuery };
  let isFiltered = false;

  if (search) {
    query.$or = [
      { blog_title: { $regex: search, $options: 'i' } },
      { blog_description: { $regex: search, $options: 'i' } },
      { 'client-name': { $regex: search, $options: 'i' } },
      { 'review-text': { $regex: search, $options: 'i' } },
      { 'review-footer': { $regex: search, $options: 'i' } },
      { Heading: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { address: { $regex: search, $options: 'i' } },
      { project_name: { $regex: search, $options: 'i' } },
      { project_location: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { question: { $regex: search, $options: 'i' } },
      { answer: { $regex: search, $options: 'i' } },
      { reviewer_name: { $regex: search, $options: 'i' } },
      { review_text: { $regex: search, $options: 'i' } },
      { review_footer: { $regex: search, $options: 'i' } },
      { badge_text: { $regex: search, $options: 'i' } },
      { text: { $regex: search, $options: 'i' } },
      { projectName: { $regex: search, $options: 'i' } }
    ];
    isFiltered = true;
  }

  if (fromDate || toDate) {
    query.createdAt = {};
    if (fromDate) query.createdAt.$gte = dayjs ? dayjs(fromDate).toDate() : new Date(fromDate);
    if (toDate) {
      const endOfDay = dayjs ? dayjs(toDate).endOf('day').toDate() : new Date(new Date(toDate).setHours(23, 59, 59, 999));
      query.createdAt.$lte = endOfDay;
    }
    isFiltered = true;
  }

  const statusValue = type || status;
  if (statusValue && statusValue !== 'all') {
    query.page_section = statusValue === 'completed' ? 'completed-gallery' : 'ongoing-gallery';
    isFiltered = true;
  }

  return { query, isFiltered };
};

module.exports = { ListFilter };