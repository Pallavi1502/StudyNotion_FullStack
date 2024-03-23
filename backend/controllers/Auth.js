const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const { passwordUpdated} = require("../mail/templates/passwordUpdateEmail");
const Profile = require("../models/Profile");
require("dotenv").config();

//send OTP
exports.sendOTP = async (req,res) => {
    try{
        //fetch email
        const {email} = req.body;

        //user exists or not
        const checkUserPresent = await User.findOne({email});

        //user exists
        if(checkUserPresent) {
            return res.status(401).json({
                success:false,
                message:'User already exists',
            })
        }

        //generate otp
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        console.log("OTP generated: ", otp);

        //check for unique otp
        // let result = await OTP.findOne({otp: otp});
        // while(result){
        //     otp = otpGenerator.generate(6,{
        //         upperCaseAlphabets:false,
        //         lowerCaseAlphabets:false,
        //         specialChars:false,
        //     });
        //     result = await OTP.findOne({otp: otp});
        // }

        const result = await OTP.findOne({ otp: otp });
		console.log("OTP", otp);
		console.log("Result", result);
		while (result) {
			otp = otpGenerator.generate(6, {
				upperCaseAlphabets: false,
			});
            result = await OTP.findOne({ otp: otp });
		}


        const otpPayload = {email, otp};

        //create entry  for otp
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        return res.status(200).json({
            success:true,
            message:'OTP sent successfully',
            otp,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "error occured: " + error.message,
        });
    }

};

//SignUp
exports.signup = async (req,res) =>{
    try{
            //fetch data
        const {
            accountType,
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            // contactNumber,
            otp,
        } = req.body;
        //validation
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp ){
            return res.status(403).json({
                success: false,
                message:" All fields are requird",
            });
        }

        //2 pwds match
        if(password !== confirmPassword){
            return res.status(400).json({
                success: false,
                message:"Password and Confirm password doesnt match",
            });
        }

        // check user already exists 
        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({
                success:false,
                message:'User already registered',
            });
        }

        //find most recent otp in db
        const recentOTP = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log("recent otp", recentOTP);

        //validate otp
        if(recentOTP.length === 0){
            //otp not found
            return res.status(400).json({
                success:false,
                message:"The OTP is not valid",
            })
        }else if(otp !== recentOTP[0].otp){
            //invalid otp
            return res.status(400).json({
                success:false,
                message:"Invalid OTP",
            });
        }


        // hash password
        const hashedPassword = await bcrypt.hash(password,10);


        //create additional details 
        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null
        });
        const user = await User.create({
            firstName,
            lastName,
            email,
            password:hashedPassword,
            accountType,
            contactNumber,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })

        return res.status(200).json({
            success:true,
            message:"User registered successfully",
            user,
        });

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered: "+ error,
        })
    }
};

//logIn
exports.login = async (req,res) => {
    try{
        //get data
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }

        //user exists or not
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                success:false,
                message:'User is not registered',
            });
        }

        //password checking and JWT generation
        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "24h",
            });
            user.token = token;
            user.password=undefined;

            //create cookie and send response
            const options = {
            expires: new Date(Date.now() + 3*24*60*60*1000),
                     httpOnly:true,
                };
            res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                user,
                message:'user logged in successfully',
            });
        }
        else {
            return res.status(401).json({
                success:false,
                message:'Password is incorrect',
            });
        }

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Login Failure, please try again',
        });
    }
};


//changePassword
exports.changePassword = async (req, res) => {
    //get data from req body
    //get oldPassword, newPassword, confirmNewPassowrd
    //validation
    //update pwd in DB
    //send mail - Password updated
    //return response

    try {
		// Get user data from req.user
		const userDetails = await User.findById(req.user.id);

		// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword, confirmNewPassword } = req.body;

		// Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}

		// Match new password and confirm new password
		if (newPassword !== confirmNewPassword) {
			// If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}

		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

		// Send notification email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });
	} catch (error) {
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}

};
