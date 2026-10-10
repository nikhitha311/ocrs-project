const { authenticate } = require("@google-cloud/local-auth");
const path = require("path");

async function getRefreshToken() {
    console.log("Starting Google authentication...");
    console.log("Using credentials.json...");

    try {
        const auth = await authenticate({
            keyfilePath: path.join(__dirname, "credentials.json"),
            scopes: ["https://mail.google.com/"],
        });

        console.log("\nAUTHENTICATION SUCCESSFUL!\n");

        console.log("Refresh Token:");
        console.log(auth.credentials.refresh_token);

        console.log("\nKeep this token SECRET!");
    } catch (error) {
        console.error("\nAuthentication failed:");
        console.error(error);
    }
}

getRefreshToken();