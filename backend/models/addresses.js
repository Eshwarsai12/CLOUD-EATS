const mongoose = require("mongoose");


// ======================================================
// CLOUD EATS DELIVERY ADDRESS SCHEMA
// ======================================================

const cloudEatsAddressSchema = new mongoose.Schema(
    {

        // Customer who owns this address
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CloudEatsUser",
            required: true,
            index: true
        },


        // House / Flat number
        houseNumber: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },


        // Street name
        street: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },


        // Area / locality
        area: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },


        // City
        city: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },


        // State
        state: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },


        // Indian 6-digit PIN code
        pincode: {
            type: String,
            required: true,
            trim: true,
            match: /^[0-9]{6}$/
        },


        // Optional landmark
        landmark: {
            type: String,
            trim: true,
            maxlength: 200,
            default: ""
        },


        // Address type
        addressType: {
            type: String,
            enum: [
                "Home",
                "Work",
                "Other"
            ],
            default: "Home"
        }

    },

    {
        timestamps: true,

        // Explicit MongoDB collection name
        collection: "addresses"
    }
);


// ======================================================
// CREATE MODEL
// ======================================================

const CloudEatsAddress =
    mongoose.model(
        "CloudEatsAddress",
        cloudEatsAddressSchema
    );


module.exports =
    CloudEatsAddress;