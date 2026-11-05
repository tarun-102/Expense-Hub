import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
const UserSchema = new mongoose.Schema(
    {

        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true
        },
         refreshtoken: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

UserSchema.pre("save", async function () {

    if(!this.isModified("password")) {
        return
    }

    this.password = await bcrypt.hash(this.password,10)
})

// check password

UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

//Generated Access token 
 UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,

        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
 }

//Refresh token generate

UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY     
        }
    )
}

export const User = mongoose.model("users", UserSchema)