const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PlaylistSchema = new Schema(
    {
        user_playlist: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        name : String,
        privacy : {
            type : String,
            enum : ["public","private"],
            required : false
        },
        playlist: [
            {
                playlist_video_id: {
                    type: Schema.Types.ObjectId,
                    ref: 'video',
                    required: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now(),
                    required : true
                },
               

            }
        ]
    },
    { timestamps: true }
);



module.exports = mongoose.model('playlist', PlaylistSchema)