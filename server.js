const dotenv = require("dotenv");
const express = require("express");
const connectDB = require("./src/Config/db");
const connect_Cloudinary = require("./src/Config/cloudinary");
const adminRouter = require("./src/Routes/adminRoute");
const doctorRouter = require("./src/Routes/doctorRoute");
const userRouter = require("./src/Routes/userRouter");
const cookieParser = require("cookie-parser");
const cors = require("cors");

dotenv.config();

const app = express();

app.get("/", (req, res) => {
  res.send("KS Wellness ");
});

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: [
      "http://localhost:5173",
      "https://wellness-rust-gamma.vercel.app",
      "https://wellness-admin-alpha.vercel.app"
    ],  
  credentials:true
}))

app.use("/api/admin",adminRouter);
app.use("/api/doctor",doctorRouter);
app.use("/api/user",userRouter);


connectDB().then(() => {
  console.log("connected to db");
  app.listen(4000, () => {
    console.log("server listening at port 4000");
    connect_Cloudinary();
    console.log("connected to cloud");
    
  });
}).catch(() =>{
    console.log("DB isn't connected.");
    
});
