// Import the required modules
const express = require("express")
const router = express.Router()

const { capturePayment,getTotalAmount,payStatus} = require("../controllers/Payments")
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth")
router.post("/getTotalAmount", auth, isStudent, getTotalAmount)
router.post("/capturePayment", auth, isStudent, capturePayment)
router.get("/payStatus", payStatus)
// router.post("/verifySignature", verifySignature)

module.exports = router