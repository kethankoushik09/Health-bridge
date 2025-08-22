const dotenv = require("dotenv");
const express = require("express");
const connectDB = require("./src/Config/db");
const connect_Cloudinary = require("./src/Config/cloudinary");
const adminRouter = require("./src/Routes/adminRoute");
const doctorRouter = require("./src/Routes/doctorRoute");
const cookieParser = require("cookie-parser");
const cors = require("cors");

dotenv.config();

const app = express();

// app.get("/", (req, res) => {
//   res.send("kethan");
// });

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
}))

app.use("/api/admin",adminRouter);
app.use("api/doctor",doctorRouter);


connectDB().then(() => {
  console.log("connected to db");
  app.listen(4000, () => {
    console.log("server listening at port 4000");
    // connect_Cloudinary();
    // console.log("connected to cloud");
    
  });
}).catch(() =>{
    console.log("DB isn't connected.");
    
});
