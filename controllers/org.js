// const Organization = require("../models/Organization");
// const Team = require("../models/Team");
// const User = require("../models/User");

// exports.fetchallmembers = async (req, res) => {
//   try {
//     const { orgid } = req.body;
//     const org = await Organization.findById(orgid).populate(
//       "users",
//       "dp name username"
//     );
//     if (org) {
//       let data = [];
//       for (let i = 0; i < org.users.length; i++) {
//         const dp = process.env.URL + org.users[i].dp;
//         let d = {
//           dp,
//           name: org.users[i].name,
//           username: org.users[i].username,
//         };
//         data.push(d);
//       }
//       res.status(200).json({ success: true, data });
//     } else {
//       res.status(404).json({ success: false });
//     }
//   } catch (e) {
//     console.log(e);
//     res.status(400).json({ success: false });
//   }
// };

// exports.createTeam = async (req, res) => {
//   try {
//     const { orgid, userId } = req.params;
//     const { teamname, email } = req.body;

//     const organization = await Organization.findById(orgid);

//     console.log(organization.title);

//     const team = new Team({
//       admin: userId,
//       email,
//       teamname,
//       members: [userId],
//       totalMembers: 1,
//       organization: {
//         id: organization._id,
//         name: organization.title,
//       },
//     });

//     const savedTeam = await team.save();

//     await User.updateOne(
//       { _id: userId },
//       { $addToSet: { joinedteam: savedTeam._id } }
//     );
//     await Organization.updateOne(
//       { _id: orgid },
//       { $addToSet: { teams: savedTeam._id } }
//     );

//     res
//       .status(200)
//       .json({ success: true, message: "Team Created Successfully!" });
//   } catch (error) {
//     console.log(error);
//     res.status(400).json({ success: false, message: "Something Went Wrong!" });
//   }
// };

// exports.getteams = async (req, res) => {
//   try {
//     const { orgid } = req.params;
//     const organisation = await Organization.findById(orgid);

//     let teams = [];
//     //console.log(organisation.teams.length, "organisation.teams.length");
//     for (let i = 0; i < organisation.teams.length; i++) {
//       const team = await Team.findById(organisation.teams[i])
//         .populate({
//           path: "members admin totalMembers",
//         })
//         .populate({
//           path: "assignedtasks",
//           populate: {
//             path: "assignedBy",
//             model: "User", // Assuming assignedBy is a reference to the User model
//           },
//         });
//       teams.push(team);
//     }
//     res.status(200).json({ success: true, teams });
//   } catch (error) {
//     console.log(error);
//     res.status(400).json({ success: false, message: "Something Went Wrong!" });
//   }
// };

// exports.joinedteam = async (req, res) => {
//   try {
//     const { teamid, userId } = req.params;

//     const user = await User.findById(userId);
//     const team = await Team.findById(teamid);

//     if (!team) {
//       return res
//         .status(200)
//         .json({ success: false, message: "Team Not Found" });
//     }
//     await Team.updateOne(
//       { _id: team._id },
//       { $addToSet: { members: user._id }, $inc: { totalMembers: 1 } }
//     );
//     await User.updateOne(
//       { _id: user._id },
//       { $addToSet: { joinedteam: team._id } }
//     );

//     res
//       .status(200)
//       .json({ success: true, message: "Team Joined Successfully!" });
//   } catch (error) {
//     console.log(error);
//   }
// };
const Message = require("../models/Message");
const Organization = require("../models/Organization");
const mongoose = require("mongoose");
const User = require("../models/User");
const Team = require("../models/Team");

exports.fetchallmembers = async (req, res) => {
  try {
    const { orgid } = req.body;
    const org = await Organization.findById(orgid).populate(
      "users",
      "dp name username"
    );
    if (org) {
      let data = [];
      for (let i = 0; i < org.users.length; i++) {
        const dp = process.env.URL + org.users[i].dp;
        let d = {
          dp,
          name: org.users[i].name,
          username: org.users[i].username,
        };
        data.push(d);
      }
      res.status(200).json({ success: true, data });
    } else {
      res.status(404).json({ success: false });
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({ success: false });
  }
};

exports.createTeam = async (req, res) => {
  try {
    const { orgid, userId } = req.params;
    const { teamname, email } = req.body;

    console.log(orgid, userId, teamname, email);

    const organization = await Organization.findById(orgid);

    if (!organization) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No organization found for this user",
        });
    }

    const team = new Team({
      admin: userId,
      email,
      teamname,
      members: [userId],
      totalMembers: 1,
      organization: {
        id: organization._id,
        name: organization.title,
      },
      messages: [],
    });



    await team.save();

    const latestMessage = await Message.findOne().sort("-mesId");
    const newMesId = latestMessage ? latestMessage.mesId + 1 : 1;

    const defaultMessage = new Message({
      teamconvId: team._id,
      sender: userId,
      text: `Welcome to ${teamname}!`,
      mesId: newMesId,
      typ: "message",
      status: "active",
      orgid: orgid,
      sequence: 1,
      timestamp: new Date().toISOString(),
      isread: false,
      readby: [],
    });

    await defaultMessage.save();

    await Team.updateOne(
      { _id: team._id },
      { $push: { messages: defaultMessage._id } }
    );

    await User.updateOne(
      { _id: userId },
      {
        $addToSet: {
          organization: organization._id,

        },
      }
    );

    await Organization.updateOne(
      { _id: orgid },
      { $addToSet: { teams: team._id } }
    );

    res
      .status(200)
      .json({ success: true, message: "Team Created Successfully!" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: "Something Went Wrong!" });
  }
};

exports.getteams = async (req, res) => {
  try {
    const { orgid } = req.params;

    const organisation = await Organization.findById(orgid);

    if (!organisation) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }

    if (!organisation.teams || organisation.teams.length === 0) {
      return res.status(200).json({ success: true, teams: [] });
    }

    const teams = await Promise.all(
      organisation.teams.map(
        (teamId) =>
          Team.findById(teamId).populate({
            path: "members admin totalMembers",
          })
        // .populate({
        //   path: "assignedtasks",
        //   populate: {
        //     path: "assignedBy",
        //     model: "User",
        //   },
        //   })
      )
    );

    // Return the teams in the response
    res.status(200).json({ success: true, teams });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while fetching teams",
      });
  }
};

exports.getTeamChats = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const teams = await Team.aggregate([
      { $match: { members: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "messages",
          localField: "_id",
          foreignField: "teamconvId",
          as: "messages",
        },
      },
      {
        $addFields: {
          lastMessage: { $arrayElemAt: ["$messages", -1] },
        },
      },
      { $sort: { "lastMessage.timestamp": -1 } },
      {
        $project: {
          teamname: 1,
          email: 1,
          lastMessageText: "$lastMessage.text",
        },
      },
    ]);
    transformTeam = teams.map((team) => {
      return {
        _id: team._id,
        chatname: team.teamname,
        email: team.email,
        lastMessageText: team.lastMessageText,
        type: "team",
      };
    });

    res.status(200).json({ success: true, data: transformTeam });
  } catch (error) {
    console.error("Error fetching user team chats:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while fetching user team chats",
      });
  }
};

exports.getAddMembers = async (req, res) => {
  try {
    const { teamId, userid } = req.params;

    const team = await Team.findById(teamId).populate("organization.id");
    console.log(team)
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const members = await User.find({
      organization: team.organization.id,
      _id: { $ne: userid },
    });

    const teamMembers = await User.find({
      _id: { $in: team.members },
    }).select("_id");


    const teamMemberIds = teamMembers.map((member) => member._id);

    res.status(200).json({ members, teamMembers: teamMemberIds });
  } catch (e) {
    console.error("Error in Fetching Data", e);
    res.status(400).json({ error: "Error in Fetching Data" });
  }
};




exports.joinedteam = async (req, res) => {
  try {
    const { userId, teamId } = req.params;
    const { userIds } = req.body;

    console.log(userId, teamId)

    const team = await Team.findById(teamId);

    if (!team) {
      return res
        .status(404)
        .json({ success: false, message: "Team Not Found" });
    }
    console.log(team)


    if (team.admin.toString() !== userId) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not authorized to make changes to this team",
        });
    }

    const users = await User.find({ _id: { $in: userIds } });

    if (users.length !== userIds.length) {
      return res
        .status(404)
        .json({ success: false, message: "Some users not found" });
    }

    team.members = [...new Set(userIds)];
    team.totalMembers = team.members.length;
    await team.save();

    await User.updateMany(
      { _id: { $in: userIds } },
      { $addToSet: { joinedteam: team._id } }
    );

    await User.updateMany(
      { _id: { $nin: userIds }, joinedteam: team._id },
      { $pull: { joinedteam: team._id } }
    );

    res
      .status(200)
      .json({ success: true, message: "Team members updated successfully!" });
  } catch (error) {
    console.error("Error updating team members:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while updating team members",
      });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const { userId, teamId, orgid } = req.params

    const team = await Team.findById(teamId)


    if (team.admin.toString() !== userId) {
      return res.status(400).json({ success: false, message: "You are not authorized to delete Team" })
    } else {
      await Team.findByIdAndDelete(teamId)
      await Organization.updateOne({ _id: orgid }, { $pull: { teams: teamId } })
      return res.status(200).json({ success: true, message: "Successfully Deleted!" })
    }
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while updating team members",
      });
  }
}