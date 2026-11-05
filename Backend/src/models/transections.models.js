import mongoose from "mongoose";

const TransactionsSchema = new mongoose.Schema(
    {
        userid: {
            type: mongoose.Types.ObjectId,
            ref: "users",
            required: true,
        },
        
        categoryid: {
            type: mongoose.Types.ObjectId,
            ref: "categories",
            required: true
        },

        type: {
            type: String,
            enum: ["expense", "income", "investment"],
            lowercase: true
        },
        partyid: {
            type: mongoose.Types.ObjectId,
            ref: "partyMaster",
            required: true
        },
        title: {
            type: String,
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        date: {
            type: Date,
            default: Date.now,
            required: true
        },

        description: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

export const Transactions =  mongoose.model("transactions", TransactionsSchema);