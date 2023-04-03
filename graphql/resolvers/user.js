const User = require("../../models/User");
const Contact = require("../../models/Contact");
const bcrypt = require("bcrypt");
const generateToken = require("../../utils/jwt");
const { errorName } = require("../error/constants");
const {
  createUser,
  updateUser,
  getUserById,
  getRelatedProfiles,
  getManyUsersByIds,
} = require("../../services/user");

const {
  generateAuthenticationToken,
} = require("../../services/authentication");
const {
  createFollower,
  getFollowersByUserIds,
} = require("../../services/follower");
const Notification = require("../../models/Notification");
const BlockUser = require("../../models/BlockUser");
const Session = require("../../models/Session");
const Token = require("../../models/Token");
const ForgetPassword = require("../../models/ForgetPassword");
const VyzmoWallet = require("../../models/VyzmoWallet");
const randomstring = require("randomstring");
const { sendEmail } = require("../../utils/emailService");

// generateAuthenticationToken("rishat.5081@gmail.com");
module.exports = {
  registerUser: async ({ userCredentials }, req) => {
    try {
      console.log("Registration ---", userCredentials);
      let isUserExist = await User.findOne({
        $or: [
          {
            email: userCredentials.email,
          },
          {
            username: userCredentials.username,
          },
        ],
      });

      if (isUserExist !== null) {
        return new Error("Email or username Already exists");
        // return {
        //   status: false,
        //   message: "Email or username Already exists",
        // };
      } else {
        userCredentials.username = userCredentials.username.toLowerCase();
        let hashPw = await bcrypt.hash(userCredentials.password, 10);

        userCredentials.password = hashPw;

        let createdUser = await createUser(userCredentials);
        console.log("---- Email ", userCredentials.email);
        const jwttt = await generateAuthenticationToken(userCredentials.email);

        await createFollower({ userId: createdUser._id });
        await Notification.create({
          notification_user_id: createdUser._id,
          count: 0,
        });
        await BlockUser.create({ userId: createdUser._id });
        await VyzmoWallet.create({ userId: createdUser._id });
        await Session.create({ userId: createdUser._id });
        // return "Sucessfully registered";
        if (jwttt)
          return {
            status: true,
            message: `Email has been send to ${userCredentials.email} Verify your email.`,
          };
      }
    } catch (err) {
      console.log(
        "🚀 ~ file: resolvers.js ~ line 26 ~ registerUser: ~ err",
        err
      );
      return new Error(errorName.SERVER_ERROR);
    }
  },
  uploadPhotoToGallery: async ({ title, date, description, url }, ctx) => {
    try {
      if (!ctx.isAuth) {
        return new Error(errorName.UN_AUTHORIZED);
      }
      const { user } = ctx;
      const existingUser = await getUserById(user.id);
      existingUser.gallery.unshift({ title, date, description, url });
      existingUser.save();
      return "SUCCESS";
    } catch (err) {
      console.log(
        "🚀 ~ file: user.js ~ line 53 ~ uploadPhotoToGallery: ~ err",
        err
      );
      return new Error(errorName.SERVER_ERROR);
    }
  },
  getAllUserGallerImages: async ({ userId }, ctx) => {
    try {
      const existingUser = await getUserById(userId);

      return existingUser.gallery;
    } catch (err) {
      console.log(
        "🚀 ~ file: user.js ~ line 71 ~ getAllUserGallerImages: ~ err",
        err
      );
      return new Error(errorName.SERVER_ERROR);
    }
  },
  deleteUserGalleryImage: async ({ image_id }, ctx) => {
    try {
      if (!ctx.isAuth) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      const { user } = ctx;
      const existingUser = await getUserById(user.id);
      const imageIndex = existingUser.gallery.findIndex(
        (i) => i._id == image_id
      );
      existingUser.gallery.splice(imageIndex, 1);

      await existingUser.save();
      return "SUCCESS";
    } catch (err) {
      console.log(
        "🚀 ~ file: user.js ~ line 53 ~ uploadPhotoToGallery: ~ err",
        err
      );
      return new Error(errorName.SERVER_ERROR);
    }
  },
  loginUser: async ({ loginCredentials }, req) => {
    console.log("🚀 ~ file: user.js ~ ", loginCredentials);
    try {
      let isUserExist;
      let usernameUser;
      if (loginCredentials.email.indexOf("@") !== -1) {
        isUserExist = await User.findOne({ email: loginCredentials.email });
      } else {
        usernameUser = await User.findOne({ username: loginCredentials.email });
        isUserExist = usernameUser;
      }

      console.log("isUserExist --", isUserExist);
      console.log("usernameUser --", usernameUser);
      if (!isUserExist && !usernameUser)
        return new Error(errorName.INVALID_CREDENTIALS);

      const isMatch = await bcrypt.compare(
        loginCredentials.password,
        isUserExist.password
      );

      if (!isMatch) return new Error("Wrong Password");
      // if (usernameUser.deleted) return new Error("Account is Deleted");
      if (usernameUser?.deleted || isUserExist?.deleted)
        return new Error("Account is Deleted");

      const payload = {
        user: {
          id: isUserExist._id,
          email: isUserExist.email,
        },
      };

      const token = await generateToken(payload);

      const tokenUpdate = await User.updateOne(
        { email: isUserExist.email, username: isUserExist.username },
        { $set: { token } }
      );

      if (!isUserExist.twoFactorAuthentication)
        return new Error("Please Confirm your Email");
      else {
        return {
          ...isUserExist._doc,
          token,
        };
      }
    } catch (err) {
      console.log("🚀 ~ file: resolvers.js ~ line 65 ~ loginUser: ~ err", err);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  verifyAuth: async ({ loginCredentials }, req) => {
    try {
      let isUserExist = await User.findOne({ email: loginCredentials.email });
      const payload = {
        user: {
          id: isUserExist._id,
          email: isUserExist.email,
        },
      };

      const token = await generateToken(payload);

      return {
        ...isUserExist._doc,
        token,
      };
    } catch (err) {
      console.log("🚀 ~ file: resolvers.js ~ line 65 ~ loginUser: ~ err", err);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  users: async ({}, ctx) => {
    try {
      const { user } = ctx;

      if (!user) {
        return new Error(errorName.UN_AUTHORIZED);
      }
      let users = await User.find();
      let index = users.findIndex((u) => u._id == user.id);
      users.splice(index, 1);
      return users;
    } catch (err) {
      console.log("🚀 ~ file: user.js ~ line 183 ~ users: ~ err", err);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  getUserFromId: async ({ user_id }, ctx) => {
    try {
      let user = await User.findOne({ _id: user_id });
      return user;
    } catch (err) {
      console.log("🚀 ~ file: user.js ~ line 192 ~ getUserFromId: ~ err", err);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  editPassword: async ({ editedPassword }, ctx) => {
    try {
      if (!editedPassword) return new Error(errorName.BAD_REQUEST);
      const { oldPassword, newPassword, forgot } = editedPassword;
      let getUser;

      if (forgot) {
        const isFound = await ForgetPassword.findOne({ passcode: oldPassword });
        if (isFound) {
          getUser = await getUserById(isFound.userId);
          let hashPw = await bcrypt.hash(newPassword, 12);
          getUser.password = hashPw;
          await getUser.save();
          return "SuccessFully Updated";
        } else {
          return "Not Updated";
        }
      } else {
        const { user } = ctx;
        if (!ctx.isAuth) {
          return new Error(errorName.UN_AUTHORIZED);
        }

        getUser = await getUserById(user.id);

        const isMatch = await bcrypt.compare(oldPassword, getUser.password);

        if (!isMatch) {
          return new Error(errorName.CONFLICT);
        }

        let hashPw = await bcrypt.hash(newPassword, 12);

        getUser.password = hashPw;

        await getUser.save();
        return "SuccessFully Updated";
      }
    } catch (err) {
      console.log("🚀 ~ file: user.js ~ line 96 ~ editPassword: ~ err", err);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  updateAvatar: async ({ url }, ctx) => {
    try {
      if (!ctx.isAuth) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      const { user } = ctx;

      const getUser = await getUserById(user.id);

      let updatedUser = await updateUser(user.id, { avatar: url });
      return updatedUser;
    } catch (err) {
      console.log("🚀 ~ file: user.js ~ line 96 ~ editPassword: ~ err", err);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  getUserById: async ({ id }, ctx) => {
    try {
      const user = getUserById(id);
      return user;
    } catch (err) {
      console.log("🚀 ~ file: user.js ~ line 96 ~ editPassword: ~ err", err);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  onOffTwoFactorAuthentication: async ({ isOn }, ctx) => {
    try {
      if (!ctx.isAuth) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      const { user } = ctx;

      await updateUser(user.id, { twoFactorAuthentication: isOn });

      return "SUCCESS";
    } catch (err) {
      console.log("🚀 ~ file: user.js ~ line 96 ~ editPassword: ~ err", err);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  postUserRating: async ({ userId, ratingPoint }, ctx) => {
    try {
      if (!ctx.isAuth) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      const { user } = ctx;

      const ratedUser = await getUserById(userId);

      const isIndex = ratedUser.rating.findIndex((u) => u.userId == user.id);

      if (isIndex !== -1) {
        ratedUser.rating[isIndex].point = ratingPoint;
        await ratedUser.save();
        return "SUCCESS";
      }

      ratedUser.rating.push({ userId: user.id, point: ratingPoint });
      await ratedUser.save();
      return "SUCCESS";
    } catch (err) {
      console.log("🚀 ~ file: user.js ~ line 96 ~ editPassword: ~ err", err);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  editUser: async ({ editedUser }, ctx) => {
    try {
      const { user } = ctx;

      if (!ctx.isAuth) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      let getUser = await getUserById(user.id);

      if (editedUser.password) {
        let isMatch = await bcrypt.compare(
          editedUser.password,
          getUser.password
        );

        if (!isMatch) {
          return new Error(errorName.BAD_REQUEST);
        }
        if (editedUser.about.length > 72)
          return new Error("About Must be less than 72 Characters");
        else {
          let hashPw = await bcrypt.hash(editedUser.newPassword, 12);
          editedUser.password = hashPw;
        }
      }

      let userBack = await updateUser(ctx.user.id, editedUser);
      return userBack;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  relatedProfiles: async ({ username }, ctx) => {
    try {
      const { user } = ctx;
      // console.log("🚀 ~ file: user.js ~ line 343 ~ relatedProfiles: ~ user", user)

      let usersBack = await getRelatedProfiles(username);
      const ids = [];
      usersBack.forEach((u) => ids.push(u._id));
      // console.log("🚀 ~ file: user.js ~ line 350 ~ relatedProfiles: ~ usersBack", usersBack)

      const followers = await getFollowersByUserIds(ids);
      // console.log("🚀 ~ file: user.js ~ line 352 ~ relatedProfiles: ~ followers", followers)

      for (let i = 0; i < usersBack.length; i++) {
        const findFollowerObject = followers?.find(
          (f) => f.userId == usersBack[i]._id.toString()
        );
        // console.log("🚀 ~ file: user.js ~ line 358 ~ relatedProfiles: ~ findFollowerObject", findFollowerObject)
        if (findFollowerObject) {
          usersBack[i].followBy = findFollowerObject.followBy;
        } else {
          usersBack[i].followBy = [];
        }
      }
      if (user?.id) {
        for (let i = 0; i < usersBack.length; i++) {
          const isUserFind = usersBack[i]?.followBy?.find(
            (u) => u.userId == user.id
          );
          if (isUserFind) {
            usersBack[i].am_i_followed = true;
          } else {
            usersBack[i].am_i_followed = false;
          }
        }
      } else {
        usersBack.forEach((u) => (u.am_i_followed = false));
      }

      // console.log("🚀 ~ file: user.js ~ line 358 ~ relatedProfiles: ~ usersBack[0].followBy", usersBack)

      // console.log("🚀 ~ file: user.js ~ line 356 ~ relatedProfiles: ~ usersBack", usersBack)

      return usersBack;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  user: async ({ friendId }, ctx) => {
    try {
      const { user } = ctx;

      if (!user) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      let usersBack = await getManyUsersByIds(friendId);
      return usersBack;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  getUserNotifications: async ({ friendId }, ctx) => {
    try {
      const { user } = ctx;

      if (!user) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      let notificationsBack = await Notification.findOne({
        notification_user_id: user.id,
      });
      return notificationsBack;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  deleteUserAccount: async ({ password }, ctx) => {
    try {
      const { user } = ctx;

      if (!user) {
        return new Error(errorName.UN_AUTHORIZED);
      }
      let isUserExist = await User.findOne({ _id: user.id });
      if (!isUserExist) {
        return new Error(errorName.INVALID_CREDENTIALS);
      }

      const isMatch = await bcrypt.compare(password, isUserExist.password);

      if (!isMatch) {
        return new Error(errorName.INVALID_CREDENTIALS);
      }

      await User.findOneAndDelete({ _id: user.id });
      return "SUCCESS";
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  addUserReview: async ({ userId, point }, ctx) => {
    try {
      const { user } = ctx;

      if (!user) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      let userDoc = await getUserById(userId);
      let findedUser = userDoc.rating.find((r) => r.userId == user.id);
      let findIndex = userDoc.rating.findIndex((r) => r.userId == user.id);

      if (findedUser) {
        userDoc.rating[findIndex].points = point;
        await userDoc.save();
        return "SUCCESS";
      }
      userDoc.rating.push({ userId: user.id, points: point });
      await userDoc.save();

      return "SUCCESS";
    } catch (error) {
      console.log(
        "🚀 ~ file: user.js ~ line 326 ~ addUserReview: ~ error",
        error
      );

      return new Error(errorName.SERVER_ERROR);
    }
  },
  searchArticles: async ({ title }, ctx) => {
    try {
      const { user } = ctx;

      if (!user) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      return "SUCCESS";
    } catch (error) {
      console.log(
        "🚀 ~ file: user.js ~ line 326 ~ addUserReview: ~ error",
        error
      );

      return new Error(errorName.SERVER_ERROR);
    }
  },
  forgotUserPasscode: async ({ email }, ctx) => {
    try {
      const user = await User.findOne({ email });
      if (user === null) {
        return "No User Found";
      }
      let forgetCode = randomstring.generate({
        length: 10,
        charset: "hex",
      });

      let isTokenExist = await Token.findOne({ userId: user._id });

      let forgetPasswordCode = new ForgetPassword({
        userId: user._id,
        passcode: forgetCode,
      });

      await forgetPasswordCode.save();
      if (isTokenExist) {
        isTokenExist.token = forgetCode;

        const fingerprint = await randomstring.generate({
          length: 36,
          charset: "alphanumeric",
          capitalization: "uppercase",
        });

        await sendEmail(user, forgetCode, fingerprint);
        await isTokenExist.save();
        return "Success";
      }
      let userToken = new Token({
        userId: user._id,
        token: forgetCode,
      });
      await sendEmail(user, forgetCode);
      await userToken.save();
      return "Success";
    } catch (err) {
      console.log(
        "🚀 ~ file: user.js ~ line 556 ~ forgotUserPasscode: ~ err",
        err
      );
      return new Error(errorName.BAD_REQUEST);
    }
  },
  verifyToken: async ({ token }, ctx) => {
    try {
      let isTokenExist = await Token.findOne({ token });

      if (isTokenExist) {
        return "Success";
      }

      return new Error(errorName.UN_AUTHORIZED);
    } catch (err) {
      console.log("🚀 ~ file: user.js ~ line 593 ~ verifyToken: ~ err", err);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  seenNotifications: async ({ email }, ctx) => {
    try {
      const { user } = ctx;

      if (!user) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      const notificaions = await Notification.findOne({
        notification_user_id: user.id,
      });
      notificaions.count = 0;
      await notificaions.save();
      return "Success";
    } catch (err) {
      console.log(
        "🚀 ~ file: user.js ~ line 611 ~ seenNotifications: ~ err",
        err
      );
      return new Error(errorName.SERVER_ERROR);
    }
  },
  updateSidebarAvatar: async ({ sidebar_avatar }, ctx) => {
    try {
      // await User.updateMany({}, { "$set": { "sideBarAvatar": null } });

      const { user } = ctx;

      if (!ctx.isAuth) {
        return new Error(errorName.UN_AUTHORIZED);
      }
      await updateUser(user.id, { sideBarAvatar: sidebar_avatar });
      return "Success";
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  contactUs: async ({ email, firstName, lastName, message }, ctx) => {
    try {
      await Contact.create({ email, firstName, lastName, message });
      return "Success";
    } catch (err) {
      console.log("🚀 ~ file: user.js ~ line 611 ~ contactUs: ~ err", err);
      return new Error(errorName.SERVER_ERROR);
    }
  },
};
