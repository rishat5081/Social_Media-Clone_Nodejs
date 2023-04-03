const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReportSchema = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        
        video_id: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        message : {
            type : String,
            required : true,
        }
        
    },
    { timestamps: true }
);



module.exports = mongoose.model('report', ReportSchema)