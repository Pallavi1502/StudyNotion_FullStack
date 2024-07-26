import { toast } from "react-hot-toast"


// const dotenv = require("dotenv");
// dotenv.config();

import { resetCart } from "../../Slices/cartSlice"
import { setPaymentLoading } from "../../Slices/courseSlice"
import { apiConnector } from "../apiConnector"
import { studentEndpoints } from "../apis"


// import axios from "axios"
// const sha256 = require("sha256") 
// const Buffer = require('buffer').Buffer 

const {
  GET_TOTAL_AMOUNT,
  COURSE_PAYMENT_API,
  COURSE_PAYMENT_STATUS,
  SEND_PAYMENT_SUCCESS_EMAIL_API,
} = studentEndpoints

// Buy the Course
export async function BuyCourse(
  token,
  courses,
  user_details,
  navigate,
  dispatch
) {
  console.log("courseid,courses in studentfeatures", courses)
  const toastId = toast.loading("Loading...")
  try {

    console.log("before get total amt call")
    const total_amt  = await apiConnector(
      "POST", 
      GET_TOTAL_AMOUNT,
      {courses},
      {
        Authorization:`Bearer ${token}`,
      }
    )
    if (!total_amt.data) {
      throw new Error("Could Not Fetch total amt")
    }
    const amount=total_amt.data.data
    console.log("PAYMENT total RESPONSE FROM BACKEND............", total_amt, total_amt.data)
// -------------------------------------
    console.log("api call for capPay")
    const orderResponse =await apiConnector(
      "POST",
      COURSE_PAYMENT_API,
      {amount},
      {
        Authorization: `Bearer ${token}`,
      }
    )

    if (!orderResponse) {
      //throw new Error(orderResponse.data.message)
      console.log("ERROR IN COURSE_PAYMENT_API")
      toast.error("api call error")
    }


    //toast.success("payment successfull")
    console.log("=======================COURSE_PAYMENT_API ================")

    if(orderResponse.data.success === true){
      window.location.href= orderResponse.data.data.instrumentResponse.redirectInfo.url 
    }else{
      console.log("cant redirect success false")
    }

    console.log("before axios 2 call status studentFeatures FE")
    // const orderStatus =await apiConnector(
    //   "POST",
    //   COURSE_PAYMENT_STATUS,
    //   {amount},
    //   {
    //     Authorization: `Bearer ${token}`
    //   }
    // )
    // // ======================== write redirect code 2==========================================================

    // console.log("after status call in FE")
    // if (!orderStatus) {
    //   //throw new Error(orderResponse.data.message)
    //   console.log("ERROR IN COURSE_STATUS")
    //   toast.error("api call error")
    // }
    // if(orderStatus.data.success === true){
    //   console.log("ORDER STAT RES IN studentFeatures............................")
    //   console.log("orderStatus:" ,orderStatus)
    //   window.location.href= "http://localhost:3000/dashboard/enrolled-courses" 
    // }else{
    //   console.log("cant redirect ERROR IN ORDER STAT RES  success false")
    // }

    toast.success("payment complete")
  } catch (error) {
    console.log("PAYMENT API ERROR............", error)
    toast.error("Could Not make Payment.")
  }
  toast.dismiss(toastId)
}

// Verify the Payment
// async function verifyPayment(bodyData, token, navigate, dispatch) {
//   const toastId = toast.loading("Verifying Payment...")
//   dispatch(setPaymentLoading(true))
//   try {
//     const response = await apiConnector("POST", COURSE_VERIFY_API, bodyData, {
//       Authorization: `Bearer ${token}`,
//     })

//     console.log("VERIFY PAYMENT RESPONSE FROM BACKEND............", response)

//     if (!response.data.success) {
//       throw new Error(response.data.message)
//     }

//     toast.success("Payment Successful. You are Added to the course ")
//     navigate("/dashboard/enrolled-courses")
//     dispatch(resetCart())
//   } catch (error) {
//     console.log("PAYMENT VERIFY ERROR............", error)
//     toast.error("Could Not Verify Payment.")
//   }
//   toast.dismiss(toastId)
//   dispatch(setPaymentLoading(false))
// }

// Send the Payment Success Email
async function sendPaymentSuccessEmail(response, amount, token) {
  try {
    await apiConnector(
      "POST",
      SEND_PAYMENT_SUCCESS_EMAIL_API,
      {
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        amount,
      },
      {
        Authorization: `Bearer ${token}`,
      }
    )
  } catch (error) {
    console.log("PAYMENT SUCCESS EMAIL ERROR............", error)
  }
}
