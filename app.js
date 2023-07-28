//jshint esversion:6
// require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const mongoose = require("mongoose");
const Encryption = require("mongoose-field-encryption").fieldEncryption;
const md5 = require('md5');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// Databse Checking

// Connection with db
mongoose.connect("mongodb://localhost:27017/UsersDB");

// Creating Schema

const NewUserSchema = new mongoose.Schema({
    userName: String,
    password: String
});


// NewUserSchema.plugin(Encryption, { fields: ["password"], secret: process.env.SECRET });(LEVEL:2 Security)

// level THREE security
// console.log(md5('sahal'));


// Making model

const NewUser = mongoose.model("User", NewUserSchema);

app.get("/", (req, res) => {
    res.render('home')
});

app.get("/register", (req, res) => {
    res.render('register')
});

app.get("/login", (req, res) => {
    res.render("login")
});

app.post("/register", (req, res) => {
    const user = req.body.username;
    const Password = md5(req.body.password);
    const newUser = new NewUser({
        "userName": user,
        "password": Password
    })
    newUser.save()
        .then(() => {
            res.render("secrets")
        })
});

app.post("/login", (req, res) => {
    const user = req.body.username;

    NewUser.findOne({
        userName: user,
    })

        .then((foundData) => {
            if (foundData) {
                if (foundData.password === md5(req.body.password)) {
                    res.render('secrets')
                } else {
                    res.send("Password Incorrect")
                }
            } else {
                res.send("Please Register first")
            }
        })
})


app.listen("3000", (req, res) => {
    console.log(`Server is running on port 3000`);
})