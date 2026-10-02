const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({

    empid: {
        type: String,
        unique: true
    },

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    department: {
        type: String,
        required: true
    },

    basicSalary: {
        type: Number,
        required: true
    },

    hra: {
        type: Number
    },

    da: {
        type: Number
    },

    totalSalary: {
        type: Number
    },

    password: {
        type: String,
        required: true
    }

});

module.exports = mongoose.model("Employee", employeeSchema);