import express, { urlencoded } from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

app.use(cors(
    {
        origin: [
            "http://localhost:5173",
            process.env.CLIENT_URL
        ],

        credentials: true,
    }
))

app.use(express.json(
    {
        limit: "16kb"
    }
))

app.use(urlencoded({
    extended: true,
    limit: "16kb"
}))

app.use(cookieParser())


//routes import
import userRouter from "./routes/user.routes.js"
import categoryRouter from "./routes/category.routes.js"
import transactionRouter from "./routes/transaction.routes.js"
import partyMasterRouter from "./routes/party.route.js";3
import budgetRouter from "./routes/budgets.routes.js"
//routes declaration

app.use("/api/v1/users", userRouter)
app.use("/api/category", categoryRouter)
app.use("/api/transaction", transactionRouter)
app.use("/api/partymaster", partyMasterRouter);
app.use("/api/budgets", budgetRouter);
app.use((err, req,res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";

    return res.status(statusCode).json({
        statusCode,
        success: false,
        message,
        error: err.error || []
    })
})

export { app }