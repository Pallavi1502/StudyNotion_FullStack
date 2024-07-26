
const axios = require("axios")
const express = require("express")
//const { instance } = require("../config/razorpay")
const Course = require("../models/Course")
const crypto = require("crypto")
const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const mongoose = require("mongoose")
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail")
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")
const CourseProgress = require("../models/CourseProgress")
const dotenv = require("dotenv");
dotenv.config();

const sha256 = require("sha256") 
const Buffer = require('buffer').Buffer 


// total amount
exports.getTotalAmount = async (req, res) => {
  const  {courses} = req.body
  const userId = req.user.id
  console.log("inside getTotalAmount","couses type:" ,typeof(courses), courses)
  console.log("COURSES BEFORE COURSES.LEN",courses)

  
    if (courses.length ===0)
    {
      return res.json({ success: false, message: "Please Provide Course ID" })
    }
  

  let total_amount = 0

  try{

    //try{
      for (const courseid of courses) {
      let course

    
      // Find the course by its ID
      course = await Course.findById(courseid)

      // If the course is not found, return an error
      if (!course) {
        return res
          .status(200)
          .json({ success: false, message: "Could not find the Course" })
      }

      // Check if the user is already enrolled in the course
      console.log("checking if user already enrolled")
      const uid = new mongoose.Types.ObjectId(userId)
      if (course.studentsEnrolled.includes(uid)) {
        return res
          .status(200)
          .json({ success: false, message: "Student is already Enrolled" })
      }

      // Add the price of the course to the total amount
      total_amount += course.price
    }
    
    return res.json({success:true, data:total_amount, message:"calc total amt success"})
  }
    catch(error){
      console.log(error)
      return res.status(500).json({ success: false, message: error.message })
    }
}

// Capture the payment and initiate the Razorpay order
        const SALT_KEY="96434309-7796-489d-8924-ab56988a6076"
        const SALT_INDEX = 1;
        const PHONEPE_HOST_URL=" https://api-preprod.phonepe.com/apis/pg-sandbox"
        const MERCHANT_ID= "PGTESTPAYUAT86"
        const MERCHANT_USER_ID ="MUID123"
        
exports.capturePayment = async (req, res) => {
  const {amount} = req.body
  const user = req.user
  console.log("user in capPay:", user)
  console.log("amount in capPay:", amount)
   
  console.log("inside capture payment")
  try{
          // const generateTransactionID=() => {
          //   const randomNum= Math.floor(Math.random()*1000000)
          //   const Mprefix = 'MT'
          //   const transactionId= `${Mprefix}${randomNum}`
          //   return transactionId
          // }

        const merchantTransactionID= 'T'+Date.now()
        //const MERCHANT_TRANSACTION_ID=generateTransactionID()
        const payload ={
          merchantId: MERCHANT_ID,
          merchantTransactionId: merchantTransactionID,
          merchantUserId: MERCHANT_USER_ID ,
          amount: amount*100,
          name: "Pallavi",
          redirectUrl: `http://localhost:4000/api/v1/payment/payStatus`,
          redirectMode: "REDIRECT",
          //"callbackUrl": "https://webhook.site/callback-url",
          mobileNumber: "9999999999",
          paymentInstrument: {
            type: "PAY_PAGE"
          }
        }

        const bufferObj= Buffer.from(JSON.stringify(payload),"utf8");
        const base64EncodedPayload=bufferObj.toString("base64")
        const xVerify=sha256(base64EncodedPayload+"/pg/v1/pay"+SALT_KEY)+"###"+SALT_INDEX

        const options = {
          method: 'post',
          url: `${PHONEPE_HOST_URL}/pg/v1/pay`,
          headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY' : xVerify
                },
          data: {
            request:base64EncodedPayload
          }
        };



        console.log("BEFORE AXIOS CALL");
        await axios
          .request(options)
              .then(function (response) {
                //const url=response.data.data.instrumentResponse.redirectInfo
                console.log("INSIDE AXIOS CALL");
                console.log("modal before data:", response.data)
                return res.send(response.data)
               //return res.send(response.data.data.instrumentResponse.redirectInfo.url)
               //return res.redirect(url)
          })
          .catch(function (error) {
            console.log("ERROR IN REDIRECT PAY MODAL");
            //console.error(error);
          });

        // const redirectRes= await axios.post(
        //   `${PHONEPE_HOST_URL}/pg/v1/pay`,
        //   {
        //     request:base64EncodedPayload
        //   },
        //   {
        //     headers: {
        //       accept: 'application/json',
        //       'Content-Type': 'application/json',
        //       'X-VERIFY' : xVerify
        //       },
        //   }
        // )

        // const redirectURL= redirectRes.data.data.instrumentResponse.redirectInfo.url
        // router.push(redirectURL)

  }
        catch(error){
          //console.log(error)
          console.log("error in cappay catch")
          return res.status(500).json({ success: false, message: error.message })
        }

  }

exports.payStatus = async(req,res) =>{
  console.log("res.req.body is:",res.req.body)
  return console.log("res.req.body is:",res.req.body)
  
  console.log("INSIDE controller paymentstatus")
  console.log("indise paymentStatus printing:",res.req.body)
  console.log("req.query is:",req.query)
  const {id} = req.query
  
  // const userId = req.user.id
  // console.log("useertd in stats:",userId)
  try{
  
    console.log("inside paymentStatus controller")
    const merchantId= MERCHANT_ID
    const saltIndex= SALT_INDEX

    // const string = `/pg/v1/status/${merchantId}/${MERCHANT_TRANSACTION_ID}`+saltIndex 
    // const sha256 = crypto.createHash('sha256').update(string).digest('hex') 
    // const checksum = sha256 + '###' + saltIndex 
    xVerify=sha256(`/pg/v1/status/${merchantId}/${merchantTransactionID}`+ saltIndex) +'###'+ saltIndex
    
    const options = {
      method: 'get',
      url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionID}`,
      headers: {
            accept:'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY' : xVerify,
            'X-MERCHANT-ID' : merchantTransactionID
            },
    };

    await axios
      .request(options)
          .then(function (response) {
            console.log("INSIDE 2 AXIOS CALL STATUS")
          console.log(response.data);
          //const url = "http://localhost:3000/dashboard/enrolled-courses"
          //return res.redirect(url)
          return res.json(response.data)
          
      })
      .catch(function (error) {
        console.log("error in redirect to enroll-page")
        console.error(error);
      });
  }catch(error){
    console.log(error)
  }


}
// verify the payment
// exports.verifyPayment = async (req, res) => {
//   const razorpay_order_id = req.body?.razorpay_order_id
//   const razorpay_payment_id = req.body?.razorpay_payment_id
//   const razorpay_signature = req.body?.razorpay_signature
//   const courses = req.body?.courses

//   const userId = req.user.id

//   if (
//     !razorpay_order_id ||
//     !razorpay_payment_id ||
//     !razorpay_signature ||
//     !courses ||
//     !userId
//   ) {
//     return res.status(200).json({ success: false, message: "Payment Failed" })
//   }

//   let body = razorpay_order_id + "|" + razorpay_payment_id

//   const expectedSignature = crypto
//     .createHmac("sha256", process.env.RAZORPAY_SECRET)
//     .update(body.toString())
//     .digest("hex")

//   if (expectedSignature === razorpay_signature) {
//     await enrollStudents(courses, userId, res)
//     return res.status(200).json({ success: true, message: "Payment Verified" })
//   }

//   return res.status(200).json({ success: false, message: "Payment Failed" })
// }

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body

  const userId = req.user.id

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" })
  }

  try {
    const enrolledStudent = await User.findById(userId)

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    )
  } catch (error) {
    console.log("error in sending mail", error)
    return res
      .status(400)
      .json({ success: false, message: "Could not send email" })
  }
}

// enroll the student in the courses
const enrollStudents = async (courses, userId, res) => {
  if (!courses || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please Provide Course ID and User ID" })
  }

  for (const courseId of courses) {
    try {
      // Find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnroled: userId } },
        { new: true }
      )

      if (!enrolledCourse) {
        return res
          .status(500)
          .json({ success: false, error: "Course not found" })
      }
      console.log("Updated course: ", enrolledCourse)

      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      })
      // Find the student and add the course to their list of enrolled courses
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      )

      console.log("Enrolled student: ", enrolledStudent)
      // Send an email notification to the enrolled student
      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      )

      console.log("Email sent successfully: ", emailResponse.response)
    } catch (error) {
      console.log(error)
      return res.status(400).json({ success: false, error: error.message })
    }
  }
}