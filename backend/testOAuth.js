require("dotenv").config();

const { google } = require("googleapis");

async function testOAuth() {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        "http://localhost"
    );

    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    try {
        const { token } = await oauth2Client.getAccessToken();

        console.log("OAuth token generated:", !!token);
        console.log("OAuth2 is working!");
    } catch (err) {
        console.error(
            "OAuth refresh failed:",
            err.response?.data || err.message
        );
    }
}

testOAuth();