const express = require("express");
const jwt = require("jsonwebtoken");

const Address =
    require("../models/addresses");

const router = express.Router();


// ======================================================
// AUTHENTICATION MIDDLEWARE
// ======================================================

function cexAuthenticateAddressUser(
    req,
    res,
    next
) {

    try {

        const authorization =
            req.headers.authorization;


        // Check authorization header

        if (!authorization) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required"

            });

        }


        // Expected format:
        // Bearer YOUR_JWT_TOKEN

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


        // Store logged-in user's ID

        req.userId =
            decoded.userId;


        next();

    }

    catch (error) {

        console.error(
            "Address authentication error:",
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
// CREATE DELIVERY ADDRESS
// ======================================================

router.post(
    "/create",
    cexAuthenticateAddressUser,
    async (req, res) => {

        try {

            const {

                houseNumber,
                street,
                area,
                city,
                state,
                pincode,
                landmark,
                addressType

            } = req.body;


            // ==================================================
            // VALIDATE REQUIRED FIELDS
            // ==================================================

            if (
                !houseNumber ||
                !street ||
                !area ||
                !city ||
                !state ||
                !pincode
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please complete all required address fields"

                });

            }


            // ==================================================
            // VALIDATE PINCODE
            // ==================================================

            if (
                !/^[0-9]{6}$/.test(
                    String(pincode)
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please enter a valid 6-digit pincode"

                });

            }


            // ==================================================
            // CHECK EXISTING ADDRESS
            // ==================================================

            const existingAddress =
                await Address.findOne({

                    user:
                        req.userId

                });


            if (existingAddress) {

                return res.status(409).json({

                    success: false,

                    message:
                        "You already have a delivery address. You can update it later."

                });

            }


            // ==================================================
            // CREATE ADDRESS
            // ==================================================

            const newAddress =
                new Address({

                    user:
                        req.userId,

                    houseNumber:
                        String(houseNumber).trim(),

                    street:
                        String(street).trim(),

                    area:
                        String(area).trim(),

                    city:
                        String(city).trim(),

                    state:
                        String(state).trim(),

                    pincode:
                        String(pincode).trim(),

                    landmark:
                        landmark
                            ? String(landmark).trim()
                            : "",

                    addressType:
                        addressType || "Home"

                });


            // ==================================================
            // SAVE TO MONGODB
            // ==================================================

            const savedAddress =
                await newAddress.save();


            console.log(
                "=========================================="
            );

            console.log(
                "Cloud Eats delivery address saved"
            );

            console.log(
                "Address ID:",
                savedAddress._id
            );

            console.log(
                "Customer ID:",
                savedAddress.user
            );

            console.log(
                "=========================================="
            );


            // ==================================================
            // RESPONSE
            // ==================================================

            return res.status(201).json({

                success: true,

                message:
                    "Delivery address saved successfully",

                address: {

                    id:
                        savedAddress._id,

                    user:
                        savedAddress.user,

                    houseNumber:
                        savedAddress.houseNumber,

                    street:
                        savedAddress.street,

                    area:
                        savedAddress.area,

                    city:
                        savedAddress.city,

                    state:
                        savedAddress.state,

                    pincode:
                        savedAddress.pincode,

                    landmark:
                        savedAddress.landmark,

                    addressType:
                        savedAddress.addressType,

                    createdAt:
                        savedAddress.createdAt

                }

            });

        }

        catch (error) {

            console.error(
                "Address creation error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to save delivery address"

            });

        }

    }
);


// ======================================================
// GET MY DELIVERY ADDRESS
// ======================================================

router.get(
    "/my-address",
    cexAuthenticateAddressUser,
    async (req, res) => {

        try {

            const address =
                await Address.findOne({

                    user:
                        req.userId

                });


            if (!address) {

                return res.status(404).json({

                    success: false,

                    message:
                        "No delivery address found"

                });

            }


            return res.json({

                success: true,

                address:
                    address

            });

        }

        catch (error) {

            console.error(
                "Address fetch error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to fetch delivery address"

            });

        }

    }
);


// ======================================================
// UPDATE MY DELIVERY ADDRESS
// ======================================================

router.put(
    "/update",
    cexAuthenticateAddressUser,
    async (req, res) => {

        try {

            const {

                houseNumber,
                street,
                area,
                city,
                state,
                pincode,
                landmark,
                addressType

            } = req.body;


            // Validate pincode if provided

            if (
                pincode &&
                !/^[0-9]{6}$/.test(
                    String(pincode)
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please enter a valid 6-digit pincode"

                });

            }


            const updatedAddress =
                await Address.findOneAndUpdate(

                    {
                        user:
                            req.userId
                    },

                    {

                        houseNumber:
                            houseNumber
                                ? String(houseNumber).trim()
                                : undefined,

                        street:
                            street
                                ? String(street).trim()
                                : undefined,

                        area:
                            area
                                ? String(area).trim()
                                : undefined,

                        city:
                            city
                                ? String(city).trim()
                                : undefined,

                        state:
                            state
                                ? String(state).trim()
                                : undefined,

                        pincode:
                            pincode
                                ? String(pincode).trim()
                                : undefined,

                        landmark:
                            landmark !== undefined
                                ? String(landmark).trim()
                                : undefined,

                        addressType:
                            addressType || undefined

                    },

                    {
                        new: true,

                        runValidators: true
                    }

                );


            if (!updatedAddress) {

                return res.status(404).json({

                    success: false,

                    message:
                        "No delivery address found"

                });

            }


            return res.json({

                success: true,

                message:
                    "Delivery address updated successfully",

                address:
                    updatedAddress

            });

        }

        catch (error) {

            console.error(
                "Address update error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to update delivery address"

            });

        }

    }
);


// ======================================================
// DELETE MY DELIVERY ADDRESS
// ======================================================

router.delete(
    "/delete",
    cexAuthenticateAddressUser,
    async (req, res) => {

        try {

            const deletedAddress =
                await Address.findOneAndDelete({

                    user:
                        req.userId

                });


            if (!deletedAddress) {

                return res.status(404).json({

                    success: false,

                    message:
                        "No delivery address found"

                });

            }


            return res.json({

                success: true,

                message:
                    "Delivery address deleted successfully"

            });

        }

        catch (error) {

            console.error(
                "Address deletion error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to delete delivery address"

            });

        }

    }
);


module.exports =
    router;