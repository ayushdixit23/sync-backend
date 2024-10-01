const { default: mongoose } = require("mongoose");
const Assigntasks = require("../models/Assigntasks");
const Task = require("../models/Tasks");
const Team = require("../models/Team");
const User = require("../models/User");

exports.newtask = async (req, res) => {
  try {
    const { id, text, assignedby } = req.body;
    const user = await User.findById(id);
    if (user) {
      const task = new Task({
        creator: user._id,
        text,
        assignedby: assignedby,
      });
      await task.save();
      await User.updateOne(
        { _id: user._id },
        { $addToSet: { tasks: task._id } }
      );
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "User not found!" });
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({ success: false });
  }
};

//mytasks
exports.fetchalltasks = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).populate({
      path: "tasks",
      select: "text creator assignedby status createdAt _id",
      match: { isactive: true },
      populate: [
        {
          path: "assignedby",
          select: "_id username name dp",
        },
        {
          path: "creator",
          select: "_id username name dp",
        },
      ],
    });

    if (user) {
      let data = [];
      for (let i = 0; i < user.tasks.length; i++) {
        const d = {
          // dp: process.env.URL + user.tasks[i].creator.dp,
          text: user.tasks[i].text,
          assignedby: user.tasks[i].assignedby.name,
          status: user.tasks[i].status,
          createdAt: user.tasks[i].createdAt,
          _id: user.tasks[i]._id,
          creator: user.tasks[i].creator.name,
        };
        data.push(d);
      }
      res
        .status(200)
        .json({ success: true, tasks: user.tasks, wholedata: user });
    } else {
      res.status(404).json({ success: false });
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({ success: false });
  }
};

//teamtasks

exports.updatetask = async (req, res) => {
  try {
    const { id, taskid, text, status } = req.body;
    const user = await User.findById(id);
    if (user) {
      await Task.updateOne(
        { _id: taskid },
        { $set: { text: text, status: status } }
      );
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ success: false });
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({ success: false });
  }
};

exports.deletetask = async (req, res) => {
  try {
    const { id, taskid } = req.body;
    const user = await User.findById(id);
    if (user) {
      await User.updateOne({ _id: user._id }, { $pull: { tasks: taskid } });
      await Task.updateOne({ _id: taskid }, { $set: { isactive: false } });
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ success: false });
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({ success: false });
  }
};

// Assigning tasks to teams and users
exports.assigntask = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedteams, assignedusers, task, orgid } = req.body;

    console.log(req.body)

    if (!id || !task) {
      return res
        .status(404)
        .json({ success: false, message: "Task or user not found" });
    }

    const newTaskAssignment = new Assigntasks({
      task: task,
      assignedBy: id,
      orgid: orgid, // Assuming orgid is provided in the request body
      assignedteams: assignedteams || [],
      assignedusers: assignedusers || [],
      progress: "Not Started",
    });

    // await newTaskAssignment.save();

    // Assign the task to users
    if (assignedusers && assignedusers.length > 0) {
      for (const userId of assignedusers) {
        const user = await User.findById(userId);
        if (user) {
          user.assignedtasks.push({ task: newTaskAssignment._id });
          await user.save();
        }
      }
    }

    // Assign the task to teams and their members
    if (assignedteams && assignedteams.length > 0) {
      const teams = await Team.find({ _id: { $in: assignedteams } });
      for (const team of teams) {
        team.assignedtasks.push(newTaskAssignment._id);
        await team.save();

        // Assign the task to each member of the team
        for (const memberId of team.members) {
          const member = await User.findById(memberId);
          if (member) {
            member.assignedtasks.push({
              task: newTaskAssignment._id,
              team: team._id,
            });
            await member.save();
          }
        }
      }
    }
    await newTaskAssignment.save();
    res
      .status(200)
      .json({ success: true, message: "Task assigned successfully" });
  } catch (e) {
    console.log(e);
    res.status(400).json({ success: false });
  }
};

//Get assigned tasks
exports.getAssignedTasks = async (req, res) => {
  try {
    const { id } = req.params;

    const assignedTasks = await Assigntasks.find({
      assignedBy: id,
    })
      .populate({
        path: "assignedteams",
        model: "Team",
        select: "teamname members",
        populate: {
          path: "members",
          model: "User",
          select: "name jobrole", // Adjust the fields as necessary
        },
      })
      .populate({
        path: "assignedusers",
        model: "User",
        select: "name jobrole", // Adjust the fields as necessary
      })
      .populate({
        path: "assignedBy",
        model: "User",
        select: "name",
      })
      .exec();

    // Format the data to include the team ID, team name, and members length
    const formattedTasks = assignedTasks.map((task) => {
      const formattedTeams = task.assignedteams.map((team) => ({
        teamId: team._id,
        teamName: team.teamname,
        membersLength: team.members.length,
        members: team.members.map((member) => ({
          userId: member._id,
          name: member.name,
          jobRole: member.jobrole,
        })),
      }));

      const formattedUsers = task.assignedusers.map((user) => ({
        userId: user._id,
        name: user.name,
        jobRole: user.jobrole,
      }));

      return {
        ...task._doc,
        assignedteams: formattedTeams,
        assignedusers: formattedUsers,
      };
    });

    console.log(formattedTasks, "formattedTasks")
    res.status(200).json({ success: true, assignedTasks: formattedTasks });
  } catch (e) {
    console.log(e);
    res
      .status(400)
      .json({ success: false, message: "Error fetching assigned tasks" });
  }
};

// Assigned tasks(my tasks)
exports.fetchgettasks = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).populate({
      path: "assignedtasks",
      select: "task team _id",

      populate: [
        {
          path: "task",
          select: "_id task assignedBy assignedAt progress",
          populate: {
            path: "assignedBy",
            select: "_id jobrole username name dp",
          },
        },
        {
          path: "team",
          select: "_id teamname ",
        },
      ],
    });

    if (user) {
      let data = [];
      for (let i = 0; i < user.assignedtasks.length; i++) {
        const d = {
          // dp: process.env.URL + user.tasks[i].creator.dp,
          task: user.assignedtasks[i].task,
          team: user.assignedtasks[i].team,
        };
        data.push(d);
      }
      res.status(200).json({ success: true, data: data });
    } else {
      res.status(404).json({ success: false });
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({ success: false });
  }
};

// All assigned tasks
// exports.getAllassignedtasks=async(req,res)=>{
//   const {id}=req.params;
//   const allassigntask=await Assigntasks.find();
//   allassigntask.map((d,index)=>{
//     for(let i=0;i<)
//   })

// }
