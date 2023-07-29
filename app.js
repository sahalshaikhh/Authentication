//jshint esversion:6
// require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const mongoose = require("mongoose");
// const Encryption = require("mongoose-field-encryption").fieldEncryption;
const bcrypt = require("bcrypt");
const saltRounds = 10;

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

    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
        // Store hash in your password DB.
        const user = req.body.username;
        const Password = hash;
        const newUser = new NewUser({
            "userName": user,
            "password": Password
        })
        newUser.save()
            .then(() => {
                res.render("secrets")
            })
    });



});

app.post("/login", (req, res) => {
    const user = req.body.username;
    const password = req.body.password;

    NewUser.findOne({
        userName: user,
    })
        .then((foundData) => {
            if (foundData) {
                bcrypt.compare(password, foundData.password, function (err, result) {
                    // result == true
                    if (result === true) {
                        res.render("secrets")
                    } else {
                        res.send("Password incorret")
                    }
                });
            } else {
                res.send("Please Register first")
            }
        })
})


app.listen("3000", (req, res) => {
    console.log(`Server is running on port 3000`);
})