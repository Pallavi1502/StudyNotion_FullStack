const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema({

    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60,
    }

});

// function to send mail for otp for email verification
async function sendVerificationEmail (email,otp){
    try{
        const mailResponse = await mailSender (email, "Verification Email from StudyNotion", otp);
        console.log("Email sent successfully:", mailResponse);
    }
    catch(error){
        console.log("Error occured while sending mails:", error);
        throw error;
    }
}

OTPSchema.pre("save", async function(next){
    await sendVerificationEmail(this.email, this.otp);
    next();
})


//function to send mail

async function sendVerificationEmail(email, otp) {
	// Create a transporter to send emails
	// Define the email options
	// Send the email

	try {
		const mailResponse = await mailSender(
			email,
			"Verification Email",
			emailTemplate(otp)
		);

		console.log("Email sent successfully: ", mailResponse.response);
	} catch (error) {
		console.log("Error occurred while sending email: ", error);
		throw error;
	}
}

//pre-save hook 
OTPSchema.pre("save", async function (next) {
	console.log("New document saved to database");

	// Only send an email when a new document is created
	if (this.isNew) {
		await sendVerificationEmail(this.email, this.otp);
	}
	next();
});


module.exports = mongoose.model("OTP" , OTPSchema);