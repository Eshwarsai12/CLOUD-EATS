const express = require("express");
const jwt = require("jsonwebtoken");

const MealPreferences =
    require("../models/mealPreferences");

const router = express.Router();


// ======================================================
// AUTHENTICATION
// ======================================================

function authenticateUser(req, res, next) {

    try {

        const authorization =
            req.headers.authorization;

        if (!authorization) {

            return res.status(401).json({

                success: false,

                message:
                    "Please login first."

            });

        }


        const parts =
            authorization.split(" ");


        if (
            parts.length !== 2 ||
            parts[0] !== "Bearer" ||
            !parts[1]
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid authorization token."

            });

        }


        const token =
            parts[1];


        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        req.userId =
            decoded.userId;


        next();

    }

    catch (error) {

        console.error(
            "Authentication error:",
            error.message
        );


        return res.status(401).json({

            success: false,

            message:
                "Your login session is invalid or expired."

        });

    }

}


// ======================================================
// CREATE OR SAVE MEAL PREFERENCES
// ======================================================

router.post(
    "/save",
    authenticateUser,
    async function (req, res) {

        try {

            const {
                foodPreference,
                breakfast,
                lunch,
                dinner,
                allergies,
                specialInstructions
            } = req.body;


            // ==============================================
            // VALIDATE FOOD PREFERENCE
            // ==============================================

            if (
                foodPreference !== "Vegetarian" &&
                foodPreference !== "Non-Vegetarian"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please select a valid food preference."

                });

            }


            // ==============================================
            // CHECK THAT AT LEAST ONE MEAL IS SELECTED
            // ==============================================

            if (
                !breakfast &&
                !lunch &&
                !dinner
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please select at least one meal."

                });

            }


            // ==============================================
            // FIND EXISTING PREFERENCES
            // ==============================================

            let preferences =
                await MealPreferences.findOne({

                    user:
                        req.userId

                });


            // ==============================================
            // CREATE NEW DOCUMENT
            // ==============================================

            if (!preferences) {

                preferences =
                    new MealPreferences({

                        user:
                            req.userId

                    });

            }


            // ==============================================
            // UPDATE VALUES
            // ==============================================

            preferences.foodPreference =
                foodPreference;

            preferences.breakfast =
                Boolean(breakfast);

            preferences.lunch =
                Boolean(lunch);

            preferences.dinner =
                Boolean(dinner);

            preferences.allergies =
                allergies
                    ? String(allergies).trim()
                    : "";

            preferences.specialInstructions =
                specialInstructions
                    ? String(
                        specialInstructions
                    ).trim()
                    : "";


            // ==============================================
            // SAVE TO MONGODB
            // ==============================================

            const savedPreferences =
                await preferences.save();


            console.log(
                "=========================================="
            );

            console.log(
                "Meal preferences saved successfully"
            );

            console.log(
                "Customer ID:",
                savedPreferences.user
            );

            console.log(
                "Preference ID:",
                savedPreferences._id
            );

            console.log(
                "=========================================="
            );


            // ==============================================
            // RESPONSE
            // ==============================================

            return res.status(200).json({

                success: true,

                message:
                    "Meal preferences saved successfully.",

                preferences:
                    savedPreferences

            });

        }

        catch (error) {

            console.error(
                "Meal preferences save error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to save meal preferences."

            });

        }

    }
);


// ======================================================
// GET MY MEAL PREFERENCES
// ======================================================

router.get(
    "/my-preferences",
    authenticateUser,
    async function (req, res) {

        try {

            const preferences =
                await MealPreferences.findOne({

                    user:
                        req.userId

                });


            if (!preferences) {

                return res.status(404).json({

                    success: false,

                    message:
                        "No meal preferences found."

                });

            }


            return res.status(200).json({

                success: true,

                preferences:
                    preferences

            });

        }

        catch (error) {

            console.error(
                "Meal preferences fetch error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to fetch meal preferences."

            });

        }

    }
);


// ======================================================
// DELETE MY MEAL PREFERENCES
// ======================================================

router.delete(
    "/delete",
    authenticateUser,
    async function (req, res) {

        try {

            const deletedPreferences =
                await MealPreferences.findOneAndDelete({

                    user:
                        req.userId

                });


            if (!deletedPreferences) {

                return res.status(404).json({

                    success: false,

                    message:
                        "No meal preferences found."

                });

            }


            return res.status(200).json({

                success: true,

                message:
                    "Meal preferences deleted successfully."

            });

        }

        catch (error) {

            console.error(
                "Meal preferences delete error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to delete meal preferences."

            });

        }

    }
);


// ======================================================
// EXPORT
// ======================================================

module.exports =
    router;