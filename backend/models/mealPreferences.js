const mongoose = require("mongoose");


// ======================================================
// CLOUD EATS MEAL PREFERENCES SCHEMA
// ======================================================

const cloudEatsMealPreferencesSchema =
    new mongoose.Schema(
        {

            // Logged-in customer
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "CloudEatsUser",
                required: true,
                unique: true,
                index: true
            },


            // ==================================================
            // FOOD PREFERENCE
            // ==================================================

            foodPreference: {
                type: String,

                enum: [
                    "Vegetarian",
                    "Non-Vegetarian"
                ],

                required: true
            },


            // ==================================================
            // BREAKFAST
            // ==================================================

            breakfast: {
                type: Boolean,

                default: false
            },


            // ==================================================
            // LUNCH
            // ==================================================

            lunch: {
                type: Boolean,

                default: true
            },


            // ==================================================
            // DINNER
            // ==================================================

            dinner: {
                type: Boolean,

                default: false
            },


            // ==================================================
            // FOOD ALLERGIES
            // ==================================================

            allergies: {
                type: String,

                trim: true,

                maxlength: 500,

                default: ""
            },


            // ==================================================
            // SPECIAL INSTRUCTIONS
            // ==================================================

            specialInstructions: {
                type: String,

                trim: true,

                maxlength: 500,

                default: ""
            }

        },

        {
            timestamps: true,

            // Explicit MongoDB collection
            collection: "mealPreferences"
        }
    );


// ======================================================
// CREATE MODEL
// ======================================================

const CloudEatsMealPreferences =
    mongoose.model(
        "CloudEatsMealPreferences",
        cloudEatsMealPreferencesSchema
    );


// ======================================================
// EXPORT
// ======================================================

module.exports =
    CloudEatsMealPreferences;