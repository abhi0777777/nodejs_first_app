import  express  from "express";
import mongoose from "mongoose";


const app = express()

mongoose.connect('mongodb://127.0.0.1:27017',{
    dbName : 'backend'
}).then(()=>console.log("database connected")).catch(()=>console.log(e))



app.set("view-engine",'ejs')
app.get('/',(req,res)=>{
    res.render("login")
})



app.listen(5000,()=>{
    console.log("Server is listen port 5000")
})