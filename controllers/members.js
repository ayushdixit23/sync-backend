const User = require("../models/User");

exports.members = async (req, res) => {
  try {
    const { orgid, userid } = req.params;

    // Fetch users whose 'organization' array includes the orgid, excluding the current user
    const data = await User.find({
      organization: { $in: [orgid] },   // Check if orgid is in the 'organization' array
      _id: { $ne: userid }              // Exclude the user with userid
    });

    res.status(200).json(data);
  } catch (e) {
    console.error("No data fetched", e);
    res.status(400).json({ e: "Error in Fetching Data" });
  }
};
