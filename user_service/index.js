const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

app.use(bodyParser.json());

//mongoose.connect('mongodb://localhost:27017/users').then(()=>console.log("Connected to mongodb"))//for localhost
mongoose.connect('mongodb://mongo:27017/users').then(()=>console.log("Connected to mongodb"))
.catch(err => console.error("MongoDB connection error : ",err))
//for containee

const UserSchema = new mongoose.Schema({
    name: String,
    email : String,
    password : String 
})

const User = mongoose.model('User', UserSchema);

app.get('/',async(req,res)=>{
    res.send('Hello');
})

app.get('/users', async(req,res)=>{
    let users = await User.find();
    res.json( users.map(user => {
      const obj = user.toObject();   
      obj.password = null;          
      return obj;
    }))
})
app.post('/user/signup',async(req,res)=>{
    console.log(req.body);
    const {name, email, password }= req.body; 
    try{
        const user = new User({name, email, password});
        await user.save();
        res.status(200).json(user)
    }catch(err){
        console.error("Error in signup : ", err);
        res.status(500).json({
            error : `internal Server Error ${err}`
        })
    }
})

app.listen(PORT, console.log("User service running on port : ", PORT));