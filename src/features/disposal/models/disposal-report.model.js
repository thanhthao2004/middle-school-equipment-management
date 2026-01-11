const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

/* ======================
   DISPOSAL ITEM
   1 thiết bị trong biên bản
====================== */
const DisposalItemSchema = new Schema(
    {
        device: {
            type: Types.ObjectId,
            ref: "Device",
            required: true
        },

        broken_date: {
            type: Date,
            default: Date.now
        },

        level: {
            type: String,
            trim: true
        },

        reason: {
            type: String,
            trim: true
        },

        price: {
            type: Number,
            default: 0
        }
    },
    {
        _id: false
    }
);

/* ======================
   DISPOSAL REPORT
====================== */
const DisposalReportSchema = new Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        year: {
            type: String,
            required: true
        },

        created_at: {
            type: Date,
            default: Date.now
        },

        items: {
            type: [DisposalItemSchema],
            default: []
        },

        status: {
            type: String,
            enum: ["Hoạt động", "Đã duyệt", "Hủy"],
            default: "Hoạt động"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("DisposalReport", DisposalReportSchema);
