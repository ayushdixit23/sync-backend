const User = require("../models/User");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const aesjs = require("aes-js");
const Organization = require("../models/Organization");
const uuid = require("uuid").v4;
const jwt = require("jsonwebtoken");

const BUCKET_NAME = process.env.BUCKET_NAME;
const Msgbucket = process.env.MSG_BUCKET;

const s3 = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});
let k = [16, 12, 3, 7, 9, 5, 11, 6, 3, 2, 10, 1, 13, 3, 13, 4];

//encryption and decryption
const encryptaes = (data) => {
  try {
    const textBytes = aesjs.utils.utf8.toBytes(data);
    const aesCtr = new aesjs.ModeOfOperation.ctr(k, new aesjs.Counter(5));
    const encryptedBytes = aesCtr.encrypt(textBytes);
    const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
    return encryptedHex;
  } catch (e) {
    console.log(e);
  }
};

function generateAccessToken(data) {
  const access_token = jwt.sign(data, process.env.MY_SECRET_KEY, {
    expiresIn: "5d",
  });
  return access_token;
}
function generateRefreshToken(data) {
  const refresh_token = jwt.sign(data, process.env.MY_SECRET_KEY, {
    expiresIn: "10d",
  });
  return refresh_token;
}

const decryptaes = (data) => {
  try {
    if (data === undefined) {
      throw new Error("Invalid data for decryption");
    }

    let d;
    if (typeof data !== "string") {
      d = JSON.stringify(data);
    } else {
      d = data;
    }

    const encryptedBytes = aesjs.utils.hex.toBytes(d);

    if (encryptedBytes.some(isNaN)) {
      throw new Error("Invalid data for decryption");
    }

    const aesCtr = new aesjs.ModeOfOperation.ctr(k, new aesjs.Counter(5));
    const decryptedBytes = aesCtr.decrypt(encryptedBytes);

    if (decryptedBytes.some(isNaN)) {
      throw new Error("Invalid data after decryption");
    }

    const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
    return decryptedText;
  } catch (e) {
    console.error("Decryption error:", e);
    throw new Error("Decryption failed");
  }
};

// exports.signup = async (req, res) => {
//   try {
//     const { email, jobrole, password, org, username } = req.body;

//     const em = await User.findOne({ email });
//     if (em) {
//       //when user already exists with same email
//       res.status(200).json({ data: em, userexists: true, success: true });
//     } else {
//       //when user doesn't exists
//       // const encrpypass = encryptaes(password);
//       const uuidString = uuid();
//       let objectName = "default.png";
//       if (req.file) {
//         objectName = `${Date.now()}_${uuidString}_${req.file.originalname}`;
//         const result = await s3.send(
//           new PutObjectCommand({
//             Bucket: BUCKET_NAME,
//             Key: objectName,
//             Body: req.file.buffer,
//             ContentType: req.file.mimetype,
//           })
//         );
//       }

//       const organization = await Organization.findOne({ title: org });

//       if (organization) {
//         const user = new User({
//           email,
//           jobrole,
//           password: password,
//           dp: objectName,

//           name: username,
//         });
//         await user.save();
//         await Organization.updateOne(
//           { _id: organization._id },
//           { $addToSet: { users: user._id }, $inc: { userscount: 1 } }
//         );
//         await User.updateOne(
//           { _id: user._id },
//           {
//             $addToSet: {
//               organization: organization.title,
//               orgid: organization._id,
//             },
//           }
//         );
//       } else {
//         const user = new User({
//           email,
//           jobrole,
//           password: password,
//           dp: objectName,
//           name: username,
//         });
//         await user.save();
//         const or = new Organization({ title: org, creator: user._id });
//         await or.save();
//         await User.updateOne(
//           { _id: user._id },
//           { $addToSet: { orgid: or._id, organization: or.title } }
//         );
//         await Organization.updateOne(
//           { _id: or._id },
//           { $addToSet: { users: user._id }, $inc: { userscount: 1 } }
//         );
//       }

//       res.status(200).json({ success: true });
//     }
//   } catch (e) {
//     console.log(e);
//     res.status(400).json({ success: false });
//   }
// };

// exports.signin = async (req, res) => {
//   try {
//     const { email, pass, org } = req.body;

//     const user = await User.findOne({ email });

//     if (user) {
//       //  const decp = decryptaes(user.password);

//       if (user.password === pass && user.organization.includes(org)) {
//         res.status(200).json({ user, success: true });
//       } else {
//         res.status(203).json({ success: false, message: "Incorrect Password" });
//       }
//     } else {
//       res.status(404).json({ success: false });
//     }
//   } catch (e) {
//     console.log(e);
//     res.status(400).json({ success: false });
//   }
// };

exports.forgotpass = async (req, res) => {
  try {
  } catch (e) {
    console.log(e);
    res.status(400).json({ success: false });
  }
};

function createUsername(fullname) {
  // Convert the full name to lowercase and replace spaces with nothing
  let username = fullname.toLowerCase().replace(/\s+/g, "");

  // Generate a random 4-digit number
  let randomDigits = Math.floor(1000 + Math.random() * 9000);

  // Concatenate the username with the 4 random digits
  return `${username}${randomDigits}`;
}

exports.signup = async (req, res) => {
  try {
    const { email, jobrole, password, org, fullname } = req.body;

    const user = await User.findOne({ email: email });
    if (user) {
      const data = {
        id: user?._id,
        organization: user?.organization,
        admin: user?.admin,
        dp: process.env.URL + user?.dp,
        username: user?.username,
        name: user?.name,
        orgid: user?.orgid,
        jobrole: user?.jobrole,
      };

      const access_token = generateAccessToken(data);
      const refresh_token = generateRefreshToken(data);

      res
        .status(200)
        .json({ data: user, success: true, data, access_token, refresh_token });
      //when user already exists with same email
    } else {
      let savedUser;
      const uuidString = uuid();
      let objectName = "default.png";
      if (req.file) {
        objectName = `${Date.now()}_${uuidString}_${req.file.originalname}`;
        const result = await s3.send(
          new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: objectName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
          })
        );
      }

      const organization = await Organization.findOne({ title: org });

      if (organization) {
        const user = new User({
          email,
          jobrole,
          password: password,
          dp: objectName,
          name: fullname,
          username: createUsername(fullname),
        });
        await user.save();
        await Organization.updateOne(
          { _id: organization._id },
          { $addToSet: { users: user._id }, $inc: { userscount: 1 } }
        );
        await User.updateOne(
          { _id: user._id },
          {
            $addToSet: {
              organization: organization.title,
              orgid: organization._id,
            },
          }
        );
      } else {
        const user = new User({
          email,
          jobrole,
          password: password,
          dp: objectName,
          name: fullname,
          username: createUsername(fullname),
        });
        savedUser = await user.save();
        const or = new Organization({ title: org, creator: user._id });
        await or.save();
        await User.updateOne(
          { _id: user._id },
          { $addToSet: { orgid: or._id, organization: or.title } }
        );
        await Organization.updateOne(
          { _id: or._id },
          { $addToSet: { users: user._id }, $inc: { userscount: 1 } }
        );
      }

      const data = {
        id: savedUser?._id,
        organization: savedUser?.organization,
        orgid: savedUser?.orgid,
        admin: savedUser?.admin,
        dp: process.env.URL + savedUser?.dp,
        username: savedUser?.username,
        name: savedUser?.name,
        jobrole: savedUser?.jobrole,
      };

      const access_token = generateAccessToken(data);
      const refresh_token = generateRefreshToken(data);

      res.status(200).json({ success: true, access_token, refresh_token });
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({ success: false });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, pass, org } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      if (user.password === pass && user.organization.includes(org)) {
        const data = {
          id: user?._id,
          organization: user?.organization,
          admin: user?.admin,
          dp: process.env.URL + user?.dp,
          username: user?.username,
          name: user?.name,
          orgid: user?.orgid,
          jobrole: user?.jobrole,
        };

        const access_token = generateAccessToken(data);
        const refresh_token = generateRefreshToken(data);

        res
          .status(200)
          .json({ user, success: true, data, access_token, refresh_token });
      } else {
        res.status(203).json({ success: false, message: "Incorrect Details" });
      }
    } else {
      res.status(204).json({ success: false, message: "User not found" });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//update details
exports.updatedetails = async (req, res) => {
  try {
    const { id, email, password, role, name } = req.body;
    const user = await User.findById(id);
    if (user) {
      await User.updateOne(
        { _id: user._id },
        {
          $set: { email: email, password: password, jobrole: role, name: name },
        }
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

// get userdata
exports.getuserdata = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (user) {
      console.log(user?.dp);
      const profile = process.env.URL + user?.dp;
      res.status(200).json({ success: true, user, profile });
    } else {
      res.status(304).json({ success: false });
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({ success: false });
  }
};

// ayush's routes

exports.getuserdatanew = async (req, res) => {
  try {
    const { id } = req.params;
    const { orgid } = req.body;
    const user = await User.findById(id);
    const org = await Organization.findById(orgid);

    const code = org.code;
    if (user) {
      console.log(user?.dp);
      const profile = process.env.URL + user?.dp;
      res.status(200).json({ success: true, user, profile, code });
    } else {
      res.status(304).json({ success: false });
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({ success: false });
  }
};

exports.getorgname = async () => {
  try {
    const org = await Organization.find()
      .select("title users admin")
      .populate("admin", "name");
    res.status(200).json({ success: true, org });
  } catch (error) {
    res.status(400).json({ success: false });
    console.log(error);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, pass } = req.body;
    const user = await User.findOne({ email }).populate(
      "organization",
      "title _id"
    );

    if (user) {
      if (user.password === pass) {
        const data = {
          id: user?._id,
          dp: process.env.URL + user?.dp,
          username: user?.username,
          name: user?.name,
          jobrole: user?.jobrole,
        };

        console.log(data, "data");
        const access_token = generateAccessToken(data);
        const refresh_token = generateRefreshToken(data);

        res.status(200).json({
          user,
          success: true,
          data,
          access_token,
          refresh_token,
          organistions: user?.organization,
        });
      } else {
        res.status(203).json({ success: false, message: "Incorrect Details" });
      }
    } else {
      res.status(204).json({ success: false, message: "User not found" });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// exports.signupnew = async (req, res) => {
//   try {
//     const { email, jobrole, password, org, fullname, orgid, inviteCode } =
//       req.body;
//     // Check if user already exists with the given email
//     let user = await User.findOne({ email }).populate("organization");

//     if (user) {
//       const data = {
//         id: user._id,
//         dp: process.env.URL + user.dp,
//         username: user.username,
//         name: user.name,
//         jobrole: user.jobrole,
//       };

//       const access_token = generateAccessToken(data);
//       const refresh_token = generateRefreshToken(data);

//       return res.status(200).json({
//         data: user,
//         success: true,
//         access_token,
//         refresh_token,
//         organisations: user.organization,
//       });
//     }

//     // Handle file uploads (both user profile pic and organization profile pic)
//     let userProfilePic;
//     let orgProfilePic;

//     console.log(req.files);

//     if (req.files && req.files.length > 0) {
//       // Loop through uploaded files and assign them appropriately
//       req.files.forEach(async (file) => {
//         const uuidString = uuid();
//         const objectName = `${Date.now()}_${uuidString}_${file.originalname}`;

//         // Upload the file to S3
//         await s3.send(
//           new PutObjectCommand({
//             Bucket: BUCKET_NAME,
//             Key: objectName,
//             Body: file.buffer,
//             ContentType: file.mimetype,
//           })
//         );
//         console.log(file.fieldname, "fieldname");
//         // Assign the correct file as user or organization profile pic based on fieldname
//         if (file.fieldname === "dp") {
//           console.log("first", file.fieldname === "dp");
//           userProfilePic = objectName;
//         } else if (file.fieldname === "profile") {
//           orgProfilePic = objectName;
//           console.log("secod", file.fieldname === "profile");
//         }
//       });
//     }

//     let organization;
//     // Find the organization, if exists
//     if (orgid) {
//       organization = await Organization.findById(orgid);
//     } else {
//       organization = await Organization.findOne({ title: org });
//     }

//     const newUser = new User({
//       email,
//       jobrole,
//       password,

//       dp: userProfilePic,
//       name: fullname,
//       username: createUsername(fullname),
//     });

//     // If organization exists, update it with the new user
//     if (organization) {
//       await Organization.updateOne(
//         { _id: organization._id },
//         {
//           $addToSet: { users: newUser._id },
//           $inc: { userscount: 1 },
//         }
//       );

//       // Add organization to user directly
//       newUser.organization = organization._id;
//     } else {
//       // Create a new organization with profile picture and add the new user to it
//       organization = new Organization({
//         title: org,
//         creator: newUser._id,
//         code: inviteCode,
//         profile: orgProfilePic, // Save org profile picture
//       });
//       await organization.save();

//       // Add the new organization to the user
//       newUser.organization = organization._id;
//     }

//     console.log(userProfilePic, orgProfilePic, "procghvjk");

//     console.log(organization, newUser);

//     // Save the new user with organization info
//     const savedUser = await newUser.save();

//     const data = {
//       id: savedUser._id,
//       dp: process.env.URL + savedUser.dp,
//       username: savedUser.username,
//       name: savedUser.name,
//       jobrole: savedUser.jobrole,
//     };

//     const access_token = generateAccessToken(data);
//     const refresh_token = generateRefreshToken(data);

//     // Respond with user data, tokens, and organization information
//     return res.status(200).json({
//       success: true,
//       access_token,
//       data,
//       refresh_token,
//       organisations: savedUser.organization ? [organization] : [],
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(400).json({ success: false });
//   }
// };

exports.signupnew = async (req, res) => {
  try {
    const { email, jobrole, password, org, fullname, orgid, inviteCode } =
      req.body;

    // Check if user already exists with the given email
    let user = await User.findOne({ email }).populate("organization");

    if (user) {
      const data = {
        id: user._id,
        dp: process.env.URL + user.dp,
        username: user.username,
        name: user.name,
        jobrole: user.jobrole,
      };

      const access_token = generateAccessToken(data);
      const refresh_token = generateRefreshToken(data);

      return res.status(200).json({
        data: user,
        success: true,
        access_token,
        refresh_token,
        organisations: user.organization,
      });
    }

    // Initialize profile picture variables
    let userProfilePic = "default.png";
    let orgProfilePic = "default.png";

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const uuidString = uuid();
        const objectName = `${Date.now()}_${uuidString}_${file.originalname}`;

        // Upload the file to S3
        await s3.send(
          new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: objectName,
            Body: file.buffer,
            ContentType: file.mimetype,
          })
        );

        // Assign the correct file as user or organization profile pic
        if (file.fieldname === "dp") {
          userProfilePic = objectName;
        } else if (file.fieldname === "profile") {
          orgProfilePic = objectName;
        }
      });

      // Wait for all uploads to finish
      await Promise.all(uploadPromises);
    }

    let organization;
    // Find the organization, if exists
    if (orgid) {
      organization = await Organization.findById(orgid);
    } else {
      organization = await Organization.findOne({ title: org });
    }

    const newUser = new User({
      email,
      jobrole,
      password,
      dp: userProfilePic,
      name: fullname,
      username: createUsername(fullname),
    });

    // If organization exists, update it with the new user
    if (organization) {
      await Organization.updateOne(
        { _id: organization._id },
        {
          $addToSet: { users: newUser._id },
          $inc: { userscount: 1 },
        }
      );

      // Add organization to user directly
      newUser.organization = organization._id;
    } else {
      // Create a new organization with profile picture and add the new user to it
      organization = new Organization({
        title: org,
        creator: newUser._id,
        code: inviteCode,
        profile: orgProfilePic, // Save org profile picture
      });
      await organization.save();

      // Add the new organization to the user
      newUser.organization = organization._id;
    }

    // Save the new user with organization info
    const savedUser = await newUser.save();

    const data = {
      id: savedUser._id,
      dp: process.env.URL + savedUser.dp,
      username: savedUser.username,
      name: savedUser.name,
      jobrole: savedUser.jobrole,
    };

    const orgId = savedUser.organization;

    const access_token = generateAccessToken(data);
    const refresh_token = generateRefreshToken(data);

    // Respond with user data, tokens, and organization information
    return res.status(200).json({
      success: true,
      access_token,
      data,
      orgId,
      refresh_token,
      organisations: savedUser.organization ? [organization] : [],
    });
  } catch (e) {
    console.log(e);
    res.status(400).json({ success: false });
  }
};

exports.signupind = async (req, res) => {
  try {
    const { email, password, fullname } = req.body;

    // Check if user already exists with the given email
    let user = await User.findOne({ email });

    if (user) {
      const data = {
        id: user._id,
        dp: process.env.URL + user.dp,
        username: user.username,
        name: user.name,
        jobrole: user.jobrole,
      };

      const access_token = generateAccessToken(data);
      const refresh_token = generateRefreshToken(data);

      return res.status(200).json({
        data: user,
        success: true,
        access_token,
        refresh_token,
      });
    }

    let objectName = "default.png";

    const file = req.file;

    console.log(file, "file");

    if (file) {
      const uuidString = uuid();
      objectName = `${Date.now()}_${uuidString}_${file.originalname}`;
      // Upload the file to S3
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: objectName,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
      );
    }

    const newUser = new User({
      email,

      password,
      dp: objectName,
      name: fullname,
      username: createUsername(fullname),
    });

    // Save the new user with organization info
    const savedUser = await newUser.save();

    const data = {
      id: savedUser._id,
      dp: process.env.URL + savedUser.dp,
      username: savedUser.username,
      name: savedUser.name,
    };

    const access_token = generateAccessToken(data);
    const refresh_token = generateRefreshToken(data);

    // Respond with user data, tokens, and organization information
    return res.status(200).json({
      success: true,
      access_token,
      data,
      refresh_token,
    });
  } catch (e) {
    console.log(e);
    res.status(400).json({ success: false });
  }
};

exports.fetchAllOrganisation = async (req, res) => {
  try {
    const organization = await Organization.find()
      .select("_id creator profile title")
      .populate("creator", "name username dp");
    res.status(200).json({ success: true, organization, url: process.env.URL });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.checkInviteCode = async (req, res) => {
  try {
    const { orgid } = req.params;
    const { code } = req.body;
    const org = await Organization.findById(orgid);

    let isMatched = false;

    if (code == org.code) {
      isMatched = true;
    }
    res.status(200).json({ success: true, isMatched });
  } catch (error) {
    console.log(error);
  }
};
