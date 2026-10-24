const express = require("express");
const jwt = require("jsonwebtoken");

const Subscription =
    require("../models/subscriptions");

const router = express.Router();


// ======================================================
// AUTHENTICATION
// ======================================================

function cexAuthenticateUser(
    req,
    res,
    next
) {

    try {

        const authorization =
            req.headers.authorization;


        // Check Authorization header

        if (!authorization) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required"

            });

        }


        // Expected:
        // Bearer eyJ...

        const parts =
            authorization.split(" ");


        if (
            parts.length !== 2 ||
            parts[0] !== "Bearer"
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid authorization format"

            });

        }


        const token =
            parts[1];


        // Verify JWT

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // Get user ID from token

        req.userId =
            decoded.userId;


        console.log(
            "Authenticated user:",
            req.userId
        );


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
                "Invalid or expired login token"

        });

    }

}


// ======================================================
// CREATE SUBSCRIPTION
// ======================================================

router.post(
    "/create",
    cexAuthenticateUser,
    async (req, res) => {

        try {

            console.log(
                "=========================================="
            );

            console.log(
                "Creating Cloud Eats subscription..."
            );


            const {
                plan,
                mealsPerDay
            } = req.body;


            console.log(
                "Plan:",
                plan
            );

            console.log(
                "Meals per day:",
                mealsPerDay
            );


            // ==================================================
            // VALIDATE PLAN
            // ==================================================

            let price;


            if (
                plan === "2 Meals / Day" &&
                Number(mealsPerDay) === 2
            ) {

                price = 4499;

            }

            else if (
                plan === "3 Meals / Day" &&
                Number(mealsPerDay) === 3
            ) {

                price = 5999;

            }

            else {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid Cloud Eats subscription plan"

                });

            }


            // ==================================================
            // CHECK EXISTING SUBSCRIPTION
            // ==================================================

            const existingSubscription =
                await Subscription.findOne({

                    user:
                        req.userId,

                    status: {
                        $in: [
                            "pending",
                            "active"
                        ]
                    }

                });


            if (existingSubscription) {

                return res.status(409).json({

                    success: false,

                    message:
                        "You already have an active or pending subscription",

                    subscription:
                        existingSubscription

                });

            }


            // ==================================================
            // CREATE SUBSCRIPTION
            // ==================================================

            const newSubscription =
                new Subscription({

                    user:
                        req.userId,

                    plan:
                        plan,

                    mealsPerDay:
                        Number(mealsPerDay),

                    price:
                        price,

                    deliveryDays: [

                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday"

                    ],

                    status:
                        "pending",

                    startDate:
                        new Date()

                });


            // ==================================================
            // SAVE TO MONGODB
            // ==================================================

            const savedSubscription =
                await newSubscription.save();


            console.log(
                "Subscription saved successfully!"
            );


            console.log(
                "Subscription ID:",
                savedSubscription._id
            );


            console.log(
                "MongoDB collection:",
                "subscriptions"
            );


            console.log(
                "=========================================="
            );


            // ==================================================
            // SEND RESPONSE
            // ==================================================

            return res.status(201).json({

                success: true,

                message:
                    "Subscription created successfully",

                subscription: {

                    id:
                        savedSubscription._id,

                    user:
                        savedSubscription.user,

                    plan:
                        savedSubscription.plan,

                    mealsPerDay:
                        savedSubscription.mealsPerDay,

                    price:
                        savedSubscription.price,

                    deliveryDays:
                        savedSubscription.deliveryDays,

                    status:
                        savedSubscription.status,

                    startDate:
                        savedSubscription.startDate,

                    createdAt:
                        savedSubscription.createdAt

                }

            });

        }

        catch (error) {

            console.error(
                "=========================================="
            );

            console.error(
                "SUBSCRIPTION ERROR"
            );

            console.error(
                error
            );

            console.error(
                "=========================================="
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to create subscription",

                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined

            });

        }

    }
);


// ======================================================
// GET CURRENT USER SUBSCRIPTION
// ======================================================

router.get(
    "/my-subscription",
    cexAuthenticateUser,
    async (req, res) => {

        try {

            const subscription =
                await Subscription.findOne({

                    user:
                        req.userId

                }).sort({

                    createdAt: -1

                });


            if (!subscription) {

                return res.status(404).json({

                    success: false,

                    message:
                        "No subscription found"

                });

            }


            return res.json({

                success: true,

                subscription:
                    subscription

            });

        }

        catch (error) {

            console.error(
                "Subscription fetch error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to fetch subscription"

            });

        }

    }
);


module.exports =
    router;