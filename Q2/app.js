const express = require("express");
const session = require("express-session");
const FileStore = require("session-file-store")(session);

const app = express();

// View engine setup
app.set("view engine", "ejs");

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Express Session configuration with FileStore
app.use(
    session({
        store: new FileStore({ path: "./sessions" }),
        secret: "mysecretkey123",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 30 * 60 * 1000 // 30 minutes session limit
        }
    })
);

// Authentication middleware to guard protected pages
function checkLogin(req, res, next) {
    if (req.session.username) {
        next();
    } else {
        res.redirect("/");
    }
}

// GET: Display login page
app.get("/", function (req, res) {
    res.render("login", { error: "" });
});

// POST: Process user login
app.post("/login", function (req, res) {
    const { username, password } = req.body;

    // Verify credentials
    if (username === "admin" && password === "12345") {
        req.session.username = username;
        res.redirect("/home");
    } else {
        res.render("login", {
            error: "Invalid username or password"
        });
    }
});

// Protected routes (Only accessible if logged in)
app.get("/home", checkLogin, function (req, res) {
    res.render("home",{ username: req.session.username });
    // res.send("welcome "+ req.session.username);
});

app.get("/profile", checkLogin, function (req, res) {
    res.render("profile", { username: req.session.username });
});

app.get("/dashboard", checkLogin, function (req, res) {
    res.render("dashboard", { username: req.session.username });
});

// GET: Destroy session and log out
app.get("/logout", function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            return res.send("Logout failed");
        }
        res.redirect("/");
    });
});

// Start server on port 3000
app.listen(3000, function () {
    console.log("Server running at http://localhost:3000");
});