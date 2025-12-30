const { Op } = require("sequelize");
const { RateLimit } = require("../models/index.js");
// Adjust path to your model

async function ratelimit(sessionId) {
  try {
    const currentTime = new Date();
    const countLimit = parseInt(process.env.RATE_LIMT, 10); // Convert environment variable to integer
    const timeLimitMinutes = parseInt(process.env.RATE_LIMT_TIMEBTN, 10); // Time limit in minutes
    const timeLimitMilliseconds = timeLimitMinutes * 60 * 1000;

    // Check if a session already exists within the time range
    const validateSessionLimit = await RateLimit.findOne({
      where: {
        sessionId,
        fromDate: { [Op.lte]: currentTime },
        toDate: { [Op.gte]: currentTime },
      },
    });
    //console.log("🚀 ~ ratelimit ~ validateSessionLimit:", validateSessionLimit)

    if (!validateSessionLimit) {
      // If no session exists, create a new one
      const toTime = new Date(currentTime.getTime() + timeLimitMilliseconds); // Add time limit in milliseconds
      await RateLimit.create({
        sessionId,
        fromDate: currentTime,
        toDate: toTime,
      });

      return "allow";
    } else {
      // If session exists, check the rate limit
      if (validateSessionLimit.count <= countLimit) {
        //console.log("🚀 ~ ratelimit ~ validateSessionLimitcount:", validateSessionLimit.count);
        // Increment the rate limit count
        await validateSessionLimit.increment("count");
        return "allow";
      } else {
        //console.log("🚀 ~ ratelimit ~ validateSessionLimit:block",);
        return "block"; // Block the session as the limit is reached
      }
    }
  } catch (error) {
    console.error("Error in rate limiting:", error);
    return error.message;
  }
}

module.exports = ratelimit;
