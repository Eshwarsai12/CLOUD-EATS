const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());


// ==========================================
// SERVE UPLOADED IMAGES
// ==========================================

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);


// ==========================================
// ROUTES
// ==========================================

const authRoutes = require("./routes/auth");
const subscriptionRoutes = require("./routes/subscriptions");
const addressRoutes = require("./routes/addresses");
const mealPreferenceRoutes = require("./routes/mealPreferences");
const mealRoutes = require("./routes/meals");


// ==========================================
// API ROUTES
// ==========================================

app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/meal-preferences", mealPreferenceRoutes);
app.use("/api/meals", mealRoutes);


// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
    res.json({
        message: "Cloud Eats Backend is running successfully!"
    });
});


// ==========================================
// MONGODB CONNECTION
// ==========================================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {

        console.log("MongoDB connected successfully.");

        app.listen(5000, () => {
            console.log(
                "Cloud Eats server running on http://localhost:5000"
            );
        });

    })
    .catch((error) => {

        console.error(
            "MongoDB connection error:",
            error
        );

    });