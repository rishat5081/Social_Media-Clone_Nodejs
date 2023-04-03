const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HistorySchema = new Schema(
    {
        user_fingerprint: {
            type: String,
            required: true,
        },
        history: [
            {
                history_video_id: {
                    type: Schema.Types.ObjectId,
                    ref: 'video',
                    required: true,
                },
                createdAt: {
                    type: Date,
                }

            }
        ]
    },
    { timestamps: true }
);



module.exports = mongoose.model('history', HistorySchema)