const mongoose = require("mongoose");


// ======================================================
// CLOUD EATS SUBSCRIPTION SCHEMA
// ======================================================

const cloudEatsSubscriptionSchema =
    new mongoose.Schema(
        {

            // Customer who owns this subscription
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "CloudEatsUser",
                required: true
            },


            // Selected plan
            plan: {
                type: String,

                enum: [
                    "2 Meals / Day",
                    "3 Meals / Day"
                ],

                required: true
            },


            // Number of meals per day
            mealsPerDay: {
                type: Number,

                enum: [2, 3],

                required: true
            },


            // Monthly price
            price: {
                type: Number,

                required: true
            },


            // Delivery days
            // Sunday is intentionally excluded
            deliveryDays: {
                type: [String],

                default: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday"
                ]
            },


            // Subscription status
            status: {
                type: String,

                enum: [
                    "pending",
                    "active",
                    "paused",
                    "cancelled"
                ],

                default: "pending"
            },


            // Subscription start date
            startDate: {
                type: Date,

                default: Date.now
            }

        },

        {
            timestamps: true,

            // IMPORTANT:
            // This forces MongoDB collection name
            collection: "subscriptions"
        }
    );


// ======================================================
// CREATE MODEL
// ======================================================

const CloudEatsSubscription =
    mongoose.model(
        "CloudEatsSubscription",
        cloudEatsSubscriptionSchema
    );


module.exports =
    CloudEatsSubscription;