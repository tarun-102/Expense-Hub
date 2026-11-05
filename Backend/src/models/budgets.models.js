import mongoose from "mongoose";

const BudgetsSchema = new mongoose.Schema(
    
    {
        userid: {
            type: mongoose.Types.ObjectId,
            ref: "users"
        },

        categoryid: {
            type: mongoose.Types.ObjectId,
            ref: "categories"
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },
        
        month: {
           type: String,
           required: true
        }
    },
    {
        timestamps: true
    }
)  

export const Budgets = mongoose.model("budgets", BudgetsSchema)