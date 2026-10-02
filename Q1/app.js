const express = require("express");
const multer = require("multer");
const path = require("path");
const { body, validationResult } = require("express-validator");

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });

const uploadFields = upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "otherPics", maxCount: 5 }
]);

const registerValidations = [
    body("username")
        .notEmpty().withMessage("Username is required")
        .isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

    body("confirmPassword")
        .notEmpty().withMessage("Confirm password is required")
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords do not match");
            }
            return true;
        }),

    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Enter a valid email"),

    body("gender")
        .notEmpty().withMessage("Please select gender"),

    body("hobbies")
        .notEmpty().withMessage("Please select at least one hobby")
];

app.get("/", function (req, res) {
    res.render("register", {
        errors: [],
        oldData: {},
        oldHobbies: []
    });
});

app.post("/register", uploadFields, registerValidations, function (req, res) {
    const errors = validationResult(req);

    let oldHobbies = [];
    if (req.body.hobbies) {
        oldHobbies = Array.isArray(req.body.hobbies) ? req.body.hobbies : [req.body.hobbies];
    }

    const oldData = {
        username: req.body.username,
        email: req.body.email,
        gender: req.body.gender
    };

    if (!errors.isEmpty()) {
        return res.render("register", {
            errors: errors.array(),
            oldData: oldData,
            oldHobbies: oldHobbies
        });
    }

    if (!req.files || !req.files.profilePic) {
        return res.render("register", {
            errors: [{ msg: "Profile picture is required" }],
            oldData: oldData,
            oldHobbies: oldHobbies
        });
    }

    const profilePic = req.files.profilePic[0];
    const otherPics = req.files.otherPics || [];

    res.render("result", {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        gender: req.body.gender,
        hobbies: oldHobbies,
        profilePic: profilePic.filename,
        otherPics: otherPics
    });
});

app.get("/download/:filename", function (req, res) {
    const filePath = path.join(__dirname, "uploads", req.params.filename);
    res.download(filePath);
});

app.listen(3000, function () {
    console.log("Server running at http://localhost:3000");
});