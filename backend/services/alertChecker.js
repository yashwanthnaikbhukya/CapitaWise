const cron = require("node-cron");
const nodemailer = require("nodemailer");
const Alert = require("../models/Alert");
const axios = require("axios");

// Configure Nodemailer with Gmail credentials
const transporter = nodemailer.createTransport({
    service: "gmail", // Gmail service
    auth: {
        user: process.env.MAIL, // Your Gmail email address
        pass: process.env.PASS, // Your Gmail password (or app-specific password if 2FA is enabled)
    },
});

// Cron job to check alerts every midnight (testing every 5 seconds: '*/5 * * * * *' '0 0 * * *'
cron.schedule('0 0 * * *', async () => { 
    try {
        const alerts = await Alert.find().populate("user");

        for (const alert of alerts) {
            // Simulate stock price fetching
            const currentPrice = 520; // Replace with actual API call for live data

            if (currentPrice >= alert.alertPrice) {
                // Send email to user email (from your Gmail account)
                console.log("Price crossed, sending email...");
                await transporter.sendMail({
                    from: '"CapitaWise" <no-reply@gmail.com>', // Your Gmail email address
                    to: alert.user.email, // Recipient's email (user's email)
                    subject: `Price Alert: ${alert.symbol}`,
                    text: `The stock ${alert.symbol} has reached your alert price of ${alert.alertPrice}. Current price: ${currentPrice}.`,
                });
                console.log(`Email sent to ${alert.user.email} for ${alert.symbol}`);
                await Alert.deleteOne({ _id: alert._id });
            }
        }
    } catch (error) {
        console.error("Error in cron job:", error.message);
    }
});
