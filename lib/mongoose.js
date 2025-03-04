
// connectionTODB
import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://vedupadhye10:vedupadhye10@cluster0.bek2v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0" ; 
const connectionToDB = async () => {
   try {
    await mongoose.connect(MONGO_URI) 
    console.log("Connected to DB")
   } catch (error) {
    console.log(error)
   }
}

export default connectionToDB;