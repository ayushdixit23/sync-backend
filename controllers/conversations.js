const Conversations = require("../models/Conversations");
const Message = require("../models/Message");
const User = require("../models/User");

// exports.conversations = async (req, res) => {
//   try {
//     const { senderId, receiverId } = req.body;
//     let conversation;
//     let savedConversation;
//     conversation = await Conversations.findOne({
//       members: { $all: [senderId, receiverId] },
//     });
//     if (!conversation) {
//       conversation = new Conversations({
//         members: [senderId, receiverId],
//       });
//       savedConversation = await conversation.save();
//       res.status(204).json({
//         message: "Conversation created",
//         convId: savedConversation._id,
//       });
//     } else {
//       res
//         .status(202)
//         .json({ message: "Already exist", convId: conversation._id });
//     }

//     // res.status(200).json({ message: "Conversation updated" });
//   } catch (e) {
//     console.error("No conversation fetched", e);
//     res.status(400).json({ e: "Error in Fetching conversation" });
//   }
// };
exports.conversations = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    console.log(senderId, receiverId);

    if (senderId === receiverId) {
      return res.status(201).json({ message: "invalid input" });
    }

    if (
      (senderId == null || receiverId == null,
      senderId == undefined || receiverId == undefined)
    ) {
      return res.status(201).json({ message: "invalid input" });
    }

    let conversation = await Conversations.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversations({
        members: [senderId, receiverId],
      });
      await conversation.save();
      return res.status(201).json({
        message: "Conversation created",
        convId: conversation._id,
      });
    } else {
      return res
        .status(202)
        .json({ message: "Already exists", convId: conversation._id });
    }
  } catch (e) {
    console.error("Error in fetching or creating conversation", e);
    res
      .status(400)
      .json({ error: "Error in fetching or creating conversation" });
  }
};
// exports.getConversation = async (req, res) => {
//   try {
//     const { receiverId } = req.params;
//     // receiverID=myid
//     let conversation = await Conversations.find({
//       members: { $in: [receiverId] },
//     });

//     if (!conversation) {
//       return res.status(201).json({
//         success: true,
//         message: "No conversation exists",
//       });
//     } else {
//       const data = [];
//       for (let i = 0; i < conversation.length; i++) {
//         let frndname = "";
//         let email = "";
//         const lastMessageId =
//           conversation[i].message[conversation[i].message.length - 1];
//         let lastText = "";
//         if (conversation[i].members[0] != receiverId) {
//           const senderid = await User.findById(conversation[i].members[0]);
//           console.log(senderid, "senderid0");
//           if (senderid) {
//             frndname = senderid.name;
//             email = senderid.email;
//           }
//         } else {
//           const senderid = await User.findById(conversation[i].members[1]);
//           console.log(senderid, "senderid1");
//           if (senderid) {
//             frndname = senderid.name;
//             email = senderid.email;
//           }
//         }
//         if (lastMessageId) {
//           const lastMessage = await Message.findById(lastMessageId);
//           if (lastMessage) {
//             lastText = lastMessage.text;
//           }
//         }

//         const myData = {
//           _id: conversation._id,
//           members: conversation.members,
//           lastMessageText: lastText,
//           frndname: frndname,
//           email: email,
//         };

//         data.push(myData);
//       }

//       return res.status(200).json({
//         success: true,
//         message: "Conversation found",
//         data: data,
//       });
//     }
//   } catch (e) {
//     console.error("Error fetching or creating conversation", e);
//     return res.status(500).json({
//       success: true,
//       message: "Error fetching or creating conversation",
//     });
//   }
// };

exports.getConversation = async (req, res) => {
  try {
    const { receiverId } = req.params;

    // Find conversations that include the receiverId in their members
    const conversations = await Conversations.find({
      members: receiverId,
    }).populate("members message"); // Populate members and message fields

    if (conversations.length === 0) {
      return res.status(201).json({
        success: true,
        message: "No conversation exists",
      });
    }

    const data = await Promise.all(
      conversations.map(async (conversation) => {
        const lastMessageId =
          conversation.message[conversation.message.length - 1];
        let lastText = "";
        let frndname = "";
        let email = "";

        // Determine the friend (other member in the conversation)
        const friendId = conversation.members.find(
          (member) => member._id.toString() !== receiverId
        );
        if (friendId) {
          const friend = await User.findById(friendId);
          if (friend) {
            frndname = friend.name;
            email = friend.email;
          }
        }

        // Get the last message text
        if (lastMessageId) {
          const lastMessage = await Message.findById(lastMessageId);
          if (lastMessage) {
            lastText = lastMessage.text;
          }
        }

        return {
          _id: conversation._id,
          members: conversation.members,
          lastMessageText: lastText,
          chatname: frndname,
          email: email,
          type: "user",
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Conversation found",
      data: data,
    });
  } catch (e) {
    console.error("Error fetching or creating conversation", e);
    return res.status(500).json({
      success: false,
      message: "Error fetching or creating conversation",
    });
  }
};
