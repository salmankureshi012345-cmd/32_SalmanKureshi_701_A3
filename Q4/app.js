const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");
const app = express();
require("dotenv").config();
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }

});

const Employee = require("./models/employee");

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use(
    session({
        secret: "erpsecret123",
        resave: false,
        saveUninitialized: false
    })
);

mongoose.connect("mongodb://127.0.0.1:27017/erpdb")
    .then(function () {

        console.log("MongoDB connected");

    })
    .catch(function (error) {

        console.log("MongoDB connection error");
        console.log(error);

    });


function checkLogin(req, res, next) {

    if (req.session.admin) {

        next();

    } else {

        res.redirect("/");

    }

}


app.get("/", function (req, res) {

    res.render("login", {
        error: ""
    });

});


app.post("/login", function (req, res) {

    const username = req.body.username;
    const password = req.body.password;

    if (username == "admin" && password == "admin123") {

        req.session.admin = username;

        res.redirect("/dashboard");

    } else {

        res.render("login", {
            error: "Invalid username or password"
        });

    }

});


app.get("/dashboard", checkLogin, function (req, res) {

    res.render("dashboard");

});

app.get("/add", checkLogin, function (req, res) {

    res.render("addemp");

});

app.post("/add", checkLogin, async function (req, res) {

    const name = req.body.name;
    const email = req.body.email;
    const department = req.body.department;
    const basicSalary = Number(req.body.basicSalary);

    const count = await Employee.countDocuments();

    const empid = "EMP" + (1001 + count);

    const password = Math.random().toString(36).substring(2, 8);

    const encryptedPassword = await bcrypt.hash(password, 10);

    const hra = basicSalary * 0.20;

    const da = basicSalary * 0.10;

    const totalSalary = basicSalary + hra + da;

    const employee = new Employee({

        empid: empid,
        name: name,
        email: email,
        department: department,
        basicSalary: basicSalary,
        hra: hra,
        da: da,
        totalSalary: totalSalary,
        password: encryptedPassword

    });

    await employee.save();
const mailOptions = {

    from: process.env.EMAIL_USER,

    to: email,

    subject: "Employee Account Details",

    text:
        "Hello " + name + ",\n\n" +
        "Your employee account has been created.\n\n" +
        "Employee ID: " + empid + "\n" +
        "Password: " + password + "\n" +
        "Department: " + department + "\n" +
        "Basic Salary: " + basicSalary + "\n" +
        "HRA: " + hra + "\n" +
        "DA: " + da + "\n" +
        "Total Salary: " + totalSalary + "\n\n" +
        "Please keep your login details safe."

};

await transporter.sendMail(mailOptions);

    res.send(
        "Employee added successfully<br><br>" +
        "Employee ID: " + empid +
        "<br>Password: " + password
    );

});

app.get("/employees", checkLogin, async function (req, res) {

    const employees = await Employee.find();

    res.render("employees", {
        employees: employees
    });

});

app.get("/edit/:id", checkLogin, async function (req, res) {

    const id = req.params.id;

    const employee = await Employee.findById(id);

    res.render("editemp", {
        employee: employee
    });

});

app.post("/edit/:id", checkLogin, async function (req, res) {

    const id = req.params.id;

    const name = req.body.name;
    const email = req.body.email;
    const department = req.body.department;
    const basicSalary = Number(req.body.basicSalary);

    const hra = basicSalary * 0.20;

    const da = basicSalary * 0.10;

    const totalSalary = basicSalary + hra + da;

    await Employee.findByIdAndUpdate(id, {

        name: name,
        email: email,
        department: department,
        basicSalary: basicSalary,
        hra: hra,
        da: da,
        totalSalary: totalSalary

    });

    res.redirect("/employees");

});

app.get("/delete/:id", checkLogin, async function (req, res) {

    const id = req.params.id;

    await Employee.findByIdAndDelete(id);

    res.redirect("/employees");

});

app.get("/logout", function (req, res) {

    req.session.destroy(function (err) {

        res.redirect("/");

    });

});
app.listen(3000, function () {

    console.log("Server started at http://localhost:3000");

});