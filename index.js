import express from "express";
import path from 'path';
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwd from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'


// connected with mongoose database
mongoose.connect('mongodb://127.0.0.1:27017', {
    dbName: "backend",
}).then(() => console.log("database connected")).catch(e => console.log(e));


// create schema which is defined what details in database
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password : String,
});

//  pehli line schema ko define kar rahi hai, aur dusri line model ko schema ke saath j
// od rahi hai. Model banane ke baad hum model ka upyog karke MongoDB
// collection ke saath CRUD (create, read, update, delete) operations kar sakte hain.
const User = mongoose.model('User', userSchema);


// express ko use krna 
const app = express();


// view engine set krana
app.set("view engine", "ejs");



// Using middlewares
app.use(express.static(path.join(path.resolve(), 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// authencitcation krna 
const isAuthenticated = async(req, res, next) => {
    const { token } = req.cookies;
    if(token){
    const decoded =  jwd.verify(token,'ar4545ishek')
    req.user = await User.findById(decoded._id)
    next() ;
   } else {
      res.redirect('/login');
    }
}



// authenticated method apply krana
app.get('/', isAuthenticated, (req, res) => {
    res.render('logout' , {name: req.user.name});
});

app.get('/login',(req, res)=>{
    res.render('login')
})

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/login',async(req,res)=>{
    const {email,password} = req.body
    let user = await User.findOne({email})
    if(!user) return res.redirect('/register')
    const ismatchcpassword = await bcryptjs.compare(password ,user.password)
    if(!ismatchcpassword) return res.render("login",{message :"incorrect password"})
 
    const token = jwd.sign({_id : user._id },"ar4545ishek")
    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000)
    });
    res.redirect('/');

})

app.post('/register', async (req, res) => {
    const { name, email , password} = req.body;
    const existuser = await User.findOne({email})
    if(existuser){
        return res.redirect('/login')
    }

    const hashpassword = await bcryptjs.hash(password,10)
    const user = await User.create({
        name,
        email,
        password : hashpassword,
    });
    const token = jwd.sign({_id : user._id },"ar4545ishek")
    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000)
    });
    res.redirect('/');
});


app.get('/logout', (req, res) => {
    res.cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now())
    });
    res.redirect('/');
});


// listening on port
app.listen(8000, () => {
    console.log("Server is working");
});
