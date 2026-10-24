const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Meal = require("../models/Meal");


// =====================================================
// CREATE UPLOADS FOLDER IF IT DOES NOT EXIST
// =====================================================

const uploadDirectory = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true
    });
}


// =====================================================
// MULTER STORAGE
// =====================================================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, uploadDirectory);
    },

    filename: function (req, file, cb) {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1000000000) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }

});


// =====================================================
// FILE FILTER
// =====================================================

const fileFilter = function (req, file, cb) {

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (allowedTypes.includes(file.mimetype)) {

        cb(null, true);

    } else {

        cb(
            new Error(
                "Only JPG, JPEG, PNG and WEBP images are allowed."
            )
        );

    }

};


// =====================================================
// MULTER UPLOAD
// =====================================================

const upload = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024
    }

});


// =====================================================
// CREATE MEAL
// POST /api/meals/create
// =====================================================

router.post(
    "/create",
    upload.single("image"),
    async (req, res) => {

        try {

            const {
                name,
                description,
                mealType,
                foodType,
                price,
                available,
                date
            } = req.body;


            // Check required fields
            if (
                !name ||
                !description ||
                !mealType ||
                !foodType ||
                price === undefined ||
                !date
            ) {

                return res.status(400).json({
                    message:
                        "Please provide all required meal details."
                });

            }


            // Validate meal type
            if (
                ![
                    "Breakfast",
                    "Lunch",
                    "Dinner"
                ].includes(mealType)
            ) {

                return res.status(400).json({
                    message: "Invalid meal type."
                });

            }


            // Validate food type
            if (
                ![
                    "Vegetarian",
                    "Non-Vegetarian"
                ].includes(foodType)
            ) {

                return res.status(400).json({
                    message: "Invalid food type."
                });

            }


            // Validate price
            if (Number(price) < 0) {

                return res.status(400).json({
                    message: "Price cannot be negative."
                });

            }


            // Image path
            let imagePath = "";

            if (req.file) {

                imagePath =
                    "/uploads/" +
                    req.file.filename;

            }


            // Create meal
            const meal = new Meal({

                name: name.trim(),

                description:
                    description.trim(),

                mealType,

                foodType,

                price: Number(price),

                image: imagePath,

                available:
                    available !== undefined
                        ? available === true ||
                          available === "true"
                        : true,

                date

            });


            await meal.save();


            res.status(201).json({

                message:
                    "Meal created successfully.",

                meal

            });

        } catch (error) {

            console.error(
                "Create meal error:",
                error
            );

            res.status(500).json({
                message:
                    "Server error while creating meal."
            });

        }

    }
);


// =====================================================
// GET ALL MEALS
// GET /api/meals/all
// =====================================================

router.get("/all", async (req, res) => {

    try {

        const meals = await Meal.find()
            .sort({
                date: 1,
                mealType: 1
            });


        res.status(200).json({

            message:
                "Meals fetched successfully.",

            count: meals.length,

            meals

        });

    } catch (error) {

        console.error(
            "Get all meals error:",
            error
        );

        res.status(500).json({
            message:
                "Server error while fetching meals."
        });

    }

});


// =====================================================
// GET AVAILABLE MEALS
// GET /api/meals/available
// =====================================================

router.get(
    "/available",
    async (req, res) => {

        try {

            const meals = await Meal.find({
                available: true
            }).sort({
                date: 1,
                mealType: 1
            });


            res.status(200).json({

                message:
                    "Available meals fetched successfully.",

                count: meals.length,

                meals

            });

        } catch (error) {

            console.error(
                "Get available meals error:",
                error
            );

            res.status(500).json({
                message:
                    "Server error while fetching available meals."
            });

        }

    }
);


// =====================================================
// GET MEALS BY DATE
// GET /api/meals/date/:date
// =====================================================

router.get(
    "/date/:date",
    async (req, res) => {

        try {

            const date = req.params.date;


            // Validate date format
            if (
                !/^\d{4}-\d{2}-\d{2}$/.test(date)
            ) {

                return res.status(400).json({
                    message:
                        "Invalid date format. Use YYYY-MM-DD."
                });

            }


            const startDate =
                new Date(`${date}T00:00:00.000Z`);

            const endDate =
                new Date(`${date}T23:59:59.999Z`);


            // Check whether date is valid
            if (
                Number.isNaN(startDate.getTime()) ||
                Number.isNaN(endDate.getTime())
            ) {

                return res.status(400).json({
                    message:
                        "Invalid date."
                });

            }


            const meals = await Meal.find({

                date: {
                    $gte: startDate,
                    $lte: endDate
                }

            }).sort({

                mealType: 1

            });


            res.status(200).json({

                message:
                    "Meals fetched successfully.",

                date,

                count:
                    meals.length,

                meals

            });

        } catch (error) {

            console.error(
                "Get meals by date error:",
                error
            );

            res.status(500).json({

                message:
                    "Server error while fetching meals by date."

            });

        }

    }
);


// =====================================================
// GET MEALS BY TYPE
// GET /api/meals/type/:mealType
// =====================================================

router.get(
    "/type/:mealType",
    async (req, res) => {

        try {

            const mealType =
                req.params.mealType;


            if (
                ![
                    "Breakfast",
                    "Lunch",
                    "Dinner"
                ].includes(mealType)
            ) {

                return res.status(400).json({
                    message:
                        "Invalid meal type."
                });

            }


            const meals = await Meal.find({

                mealType,

                available: true

            }).sort({
                date: 1
            });


            res.status(200).json({

                message:
                    "Meals fetched successfully.",

                count:
                    meals.length,

                meals

            });

        } catch (error) {

            console.error(
                "Get meals by type error:",
                error
            );

            res.status(500).json({

                message:
                    "Server error while fetching meals."

            });

        }

    }
);


// =====================================================
// GET MEALS BY FOOD TYPE
// GET /api/meals/food-type/:foodType
// =====================================================

router.get(
    "/food-type/:foodType",
    async (req, res) => {

        try {

            const foodType =
                req.params.foodType;


            if (
                ![
                    "Vegetarian",
                    "Non-Vegetarian"
                ].includes(foodType)
            ) {

                return res.status(400).json({

                    message:
                        "Invalid food type."

                });

            }


            const meals = await Meal.find({

                foodType,

                available: true

            }).sort({

                date: 1

            });


            res.status(200).json({

                message:
                    "Meals fetched successfully.",

                count:
                    meals.length,

                meals

            });

        } catch (error) {

            console.error(
                "Get meals by food type error:",
                error
            );

            res.status(500).json({

                message:
                    "Server error while fetching meals."

            });

        }

    }
);


// =====================================================
// UPDATE MEAL
// PUT /api/meals/update/:id
// =====================================================

router.put(
    "/update/:id",
    upload.single("image"),
    async (req, res) => {

        try {

            const {
                name,
                description,
                mealType,
                foodType,
                price,
                available,
                date
            } = req.body;


            const meal =
                await Meal.findById(
                    req.params.id
                );


            if (!meal) {

                return res.status(404).json({

                    message:
                        "Meal not found."

                });

            }


            // Update name
            if (name !== undefined) {

                meal.name =
                    name.trim();

            }


            // Update description
            if (description !== undefined) {

                meal.description =
                    description.trim();

            }


            // Update meal type
            if (mealType !== undefined) {

                meal.mealType =
                    mealType;

            }


            // Update food type
            if (foodType !== undefined) {

                meal.foodType =
                    foodType;

            }


            // Update price
            if (price !== undefined) {

                if (Number(price) < 0) {

                    return res.status(400).json({

                        message:
                            "Price cannot be negative."

                    });

                }

                meal.price =
                    Number(price);

            }


            // Update availability
            if (available !== undefined) {

                meal.available =
                    available === true ||
                    available === "true";

            }


            // Update date
            if (date !== undefined) {

                meal.date =
                    date;

            }


            // Replace image if new image uploaded
            if (req.file) {

                // Delete old image
                if (meal.image) {

                    const oldImagePath =
                        path.join(
                            __dirname,
                            "..",
                            meal.image
                        );


                    if (
                        fs.existsSync(
                            oldImagePath
                        )
                    ) {

                        fs.unlinkSync(
                            oldImagePath
                        );

                    }

                }


                meal.image =
                    "/uploads/" +
                    req.file.filename;

            }


            await meal.save();


            res.status(200).json({

                message:
                    "Meal updated successfully.",

                meal

            });

        } catch (error) {

            console.error(
                "Update meal error:",
                error
            );

            res.status(500).json({

                message:
                    "Server error while updating meal."

            });

        }

    }
);


// =====================================================
// TOGGLE MEAL AVAILABILITY
// PUT /api/meals/toggle/:id
// =====================================================

router.put(
    "/toggle/:id",
    async (req, res) => {

        try {

            const meal =
                await Meal.findById(
                    req.params.id
                );


            if (!meal) {

                return res.status(404).json({

                    message:
                        "Meal not found."

                });

            }


            meal.available =
                !meal.available;


            await meal.save();


            res.status(200).json({

                message:
                    meal.available
                        ? "Meal is now available."
                        : "Meal is now unavailable.",

                meal

            });

        } catch (error) {

            console.error(
                "Toggle meal availability error:",
                error
            );

            res.status(500).json({

                message:
                    "Server error while changing meal availability."

            });

        }

    }
);


// =====================================================
// DELETE MEAL
// DELETE /api/meals/delete/:id
// =====================================================

router.delete(
    "/delete/:id",
    async (req, res) => {

        try {

            const deletedMeal =
                await Meal.findByIdAndDelete(
                    req.params.id
                );


            if (!deletedMeal) {

                return res.status(404).json({

                    message:
                        "Meal not found."

                });

            }


            // Delete associated image
            if (deletedMeal.image) {

                const imagePath =
                    path.join(
                        __dirname,
                        "..",
                        deletedMeal.image
                    );


                if (
                    fs.existsSync(
                        imagePath
                    )
                ) {

                    fs.unlinkSync(
                        imagePath
                    );

                }

            }


            res.status(200).json({

                message:
                    "Meal deleted successfully.",

                meal:
                    deletedMeal

            });

        } catch (error) {

            console.error(
                "Delete meal error:",
                error
            );

            res.status(500).json({

                message:
                    "Server error while deleting meal."

            });

        }

    }
);


// =====================================================
// GET SINGLE MEAL
// GET /api/meals/:id
// =====================================================

router.get(
    "/:id",
    async (req, res) => {

        try {

            const meal =
                await Meal.findById(
                    req.params.id
                );


            if (!meal) {

                return res.status(404).json({

                    message:
                        "Meal not found."

                });

            }


            res.status(200).json({

                message:
                    "Meal fetched successfully.",

                meal

            });

        } catch (error) {

            console.error(
                "Get single meal error:",
                error
            );

            res.status(500).json({

                message:
                    "Invalid meal ID or server error."

            });

        }

    }
);


module.exports = router;