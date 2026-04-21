const nodemailer = require("nodemailer");

const sendTicketEmail = async (userEmail, bookingData, qrCodeImage) => {
    try {

        // 🔥 DEBUG (put it INSIDE function)
        console.log("bookingData =", bookingData);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: "🎟️ Ticket Booking Confirmation",
            html: `
                <h2>Booking Confirmed ✅</h2>
                <p><b>Name:</b> ${bookingData.name}</p>
                <p><b>Event:</b> ${bookingData.event}</p>
                <p><b>Date:</b> ${bookingData.date}</p>
                <p><b>Seats:</b> ${bookingData.seats}</p>
                <p><b>Price:</b> ₹${bookingData.price}</p>

                <h3>Your Entry QR Code</h3>
                <img src="cid:qrcode" width="200"/>

                <p>Please show this QR at entry.</p>
            `,
            attachments: [
                {
                    filename: "qr.png",
                    content: qrCodeImage.split("base64,")[1],
                    encoding: "base64",
                    cid: "qrcode"
                }
            ]
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully 🎉");

    } catch (error) {
        console.log("Email error:", error);
    }
};

module.exports = sendTicketEmail;