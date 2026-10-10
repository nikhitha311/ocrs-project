require("dotenv").config();

const { sendEmail } = require("./emailService");

async function test() {
    try {
        console.log("Sending from:", process.env.EMAIL_USER);

        await sendEmail(
            process.env.EMAIL_USER,
            "WTS Email Test",
            "Your Gmail OAuth2 email system is working!"
        );

        console.log("Test completed successfully.");
    } catch (error) {
        console.error("Test failed:");
        console.error(error);
    }
}

test();