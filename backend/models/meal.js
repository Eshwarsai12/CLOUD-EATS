const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        mealType: {
            type: String,
            required: true,
            enum: ["Breakfast", "Lunch", "Dinner"]
        },

        foodType: {
            type: String,
            required: true,
            enum: ["Vegetarian", "Non-Vegetarian"]
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        image: {
            type: String,
            default: ""
        },

        available: {
            type: Boolean,
            default: true
        },

        date: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Meal", mealSchema);