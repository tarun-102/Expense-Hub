import mongoose from "mongoose";

const connectToDB = async() => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONDODB_URL}`)
        console.log("mongodb connected successfully!")
    } catch (err) {
         console.log("mongodb connection error",err)
        process.exit(1)
    }
}

export default connectToDB;