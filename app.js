//jshint esversion:6
// require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const mongoose = require("mongoose");
// const Encryption = require("mongoose-field-encryption").fieldEncryption;

// Level 4 Authentication: bycrypt
// const bcrypt = require("bcrypt");
// const saltRounds = 10;

// Level 5 
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose")

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));



// Session

app.use(session({
    secret: "MySecretisSecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 30 * 1000, // Keeping the sessions,
        httpOnly: true   // Prevent access to cookies from client side script
    }
}));

app.use(passport.initialize());
app.use(passport.session());


// Databse Checking

// Connection with db
mongoose.connect("mongodb://localhost:27017/UsersDB");

// Creating Schema

const NewUserSchema = new mongoose.Schema({
    userName: String,
    password: String
});

NewUserSchema.plugin(passportLocalMongoose);


// NewUserSchema.plugin(Encryption, { fields: ["password"], secret: process.env.SECRET });(LEVEL:2 Security)

// level THREE security
// console.log(md5('sahal'));


// Making model

const NewUser = mongoose.model("User", NewUserSchema);

passport.use(NewUser.createStrategy());

passport.serializeUser(NewUser.serializeUser());
passport.deserializeUser(NewUser.deserializeUser());

app.get("/", (req, res) => {
    res.render('home')
});

app.get("/register", (req, res) => {
    res.render('register')
});

app.get("/login", (req, res) => {
    res.render("login")
});

app.get("/secrets", (req, res) => {
    // Check for authentication before allowing access to secrets page
    if (req.isAuthenticated()) {
        res.render("secrets")
    } else {
        res.redirect("/login")
    }
})

app.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect("/")
    })
})

app.post("/register", (req, res) => {

    NewUser.register({ username: req.body.username }, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            res.redirect("/register")
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            })
        }
    })
});

app.post("/login", (req, res) => {
    // Use passport.authenticate middleware directly here
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            console.log("ERROR" + err);
            return;
        }
        if (!user) {
            // Authentication failed, handle the error or redirect to login again.
            console.log("Authentication failed!");
            return res.redirect("/login");
        }
        req.login(user, (err) => {
            if (err) {
                console.log("ERROR" + err);
            } else {
                // Successful authentication, redirect to the secrets page.
                res.redirect("/secrets");
            }
        });
    })(req, res);
});


app.listen("3000", (req, res) => {
    console.log(`Server is running on port 3000`);
})