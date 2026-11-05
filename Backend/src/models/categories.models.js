import mongoose from "mongoose";



const CategoriesSchema = new mongoose.Schema(
    {
        category_name: {
            type: String,
            required: true,
        },

        userid: {
            type: mongoose.Types.ObjectId,
            ref: "users"
        },

        type: {
            type: String,
            enum: ["expense", "income", "investment"], 
            lowercase: true
        },
        
        icon: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

export const Categories = mongoose.model("categories", CategoriesSchema)