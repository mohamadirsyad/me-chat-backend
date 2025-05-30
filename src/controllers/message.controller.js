import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Get users for sidebar
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get messages for a specific user
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Edit message
// export const editMessage = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { text, image } = req.body;

//     let updatedMessage = await Message.findById(id);

//     if (!updatedMessage) {
//       return res.status(404).json({ error: "Message not found" });
//     }

//     // Check if the user is the sender of the message
//     if (updatedMessage.senderId.toString() !== req.user._id.toString()) {
//       return res
//         .status(403)
//         .json({ error: "Not authorized to edit this message" });
//     }

//     // Update message content
//     if (text) updatedMessage.text = text;
//     if (image) updatedMessage.image = image;

//     await updatedMessage.save();
//     res.status(200).json(updatedMessage);
//   } catch (error) {
//     console.error("Error in editMessage controller: ", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

export const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const updatedMessage = await Message.findById(id);

    if (!updatedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (updatedMessage.image) {
      return res
        .status(400)
        .json({ error: "Cannot edit messages with images" });
    }

    updatedMessage.text = text;
    await updatedMessage.save();

    res.status(200).json(updatedMessage);
  } catch (error) {
    console.log("Error in editMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const messageToDelete = await Message.findById(id);

    if (!messageToDelete) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check if the user is the sender of the message
    if (messageToDelete.senderId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this message" });
    }

    await Message.findByIdAndDelete(id);
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
