const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema(
    {
        conversationId: {
            type: String
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
        reciever : {
            type : String
        },
        name: {
            type: String
        },
        text: {
            type: String
        },
        image: {
            type: String
        },
        video: {
            type: String
        },
        gif : {
            type : String
        },
        audio: {
            type: String
        },
        pdf: {
            type: String
        },
        isRead: {
            type: Boolean,
            default: false
        },
        isDeliver : {
            type : Boolean,
            default: false
        },
        isDelete : {
            type : Boolean,
            default : false
        },
        isUpdate : {
            type : Boolean,
            required : false
        }
    },
    { timestamps: true }
);



module.exports = mongoose.model('message', MessageSchema)