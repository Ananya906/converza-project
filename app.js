// Load environment variables (Must be first)
require("dotenv").config();

// ----------------- Imports -----------------
const crypto = require("crypto");
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const QRCode = require("qrcode");
const Banner = require("./models/modelbanner");
const sendTicketEmail = require("./utils/sendEmail");

// const redisClient = require("./redisClient");


// ----------------- Models -----------------
const User = require("./models/User");
const Booking = require("./models/Booking");
//const mockEvents = require("./models/mockEvents");
const Event = require("./models/Event");



// --- REVIEW SCHEMA & MODEL ---
const reviewSchema = new mongoose.Schema({
    name: { type: String, default: "Anonymous" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: "" },
    createdAt: { type: Date, default: Date.now },
});
const Review = mongoose.model("Review", reviewSchema);

// --- CONTACT MESSAGE SCHEMA & MODEL ---
const contactMessageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    receivedAt: { type: Date, default: Date.now },
});
const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);

// ----------------- App Setup -----------------
const app = express();
const PORT = process.env.PORT || 3000 ;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

if (!JWT_SECRET) {
    console.error("❌ JWT_SECRET not set in .env. Exiting.");
    process.exit(1);
}

// ----------------- Admin Seeding -----------------
const ADMINS_TO_SEED = [
  { name: "Admin One", email: "ananya@gmail.com", role: "admin", envVar: "ADMIN1_PASS" },
  { name: "Admin Two", email: "ishita@gmail.com", role: "admin", envVar: "ADMIN2_PASS" },
  { name: "Admin Three", email: "deepali@gmail.com", role: "admin", envVar: "ADMIN3_PASS" },
];


async function seedAdmins() {
  try {
    for (const adminData of ADMINS_TO_SEED) {
      const existingAdmin = await User.findOne({ email: adminData.email });
      if (!existingAdmin) {
        const rawPassword = process.env[adminData.envVar];
        if (!rawPassword) {
          console.warn(`❌ Password for ${adminData.email} not set in .env`);
          continue;
        }
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        await User.create({
          name: adminData.name,
          email: adminData.email,
          role: adminData.role,
          password: hashedPassword,
        });
        console.log(`👤 Seeded admin: ${adminData.email}`);
      }
    }
  } catch (error) {
    console.error("❌ Error during admin seeding:", error);
  }
}


// ----------------- MongoDB Connection -----------------
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("✅ MongoDB connected to 'event-management' database.");
        seedAdmins();
    })
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    });


  

// ----------------- Nodemailer Setup -----------------
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});



// ----------------- View Engine -----------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ----------------- Middlewares -----------------
app.use(express.static(path.join(__dirname, "public")));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/ai-banner", require("./routes/aiBanner"));

// ----------------- Helper Functions -----------------
function createTokenAndSetCookie(res, payload) {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60,
    });
}

function getUserFromCookie(req) {
    try {
        const token = req.cookies.token;
        if (!token) return null;
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

function requireAuth(req, res, next) {
    const user = req.user;
    if (!user) return res.redirect("/login");
    next();
}

// Global middleware to attach user and res.locals
app.use((req, res, next) => {
    req.user = getUserFromCookie(req);
    res.locals.siteName = "Converza";
    res.locals.isAuthenticated = !!req.user;
    res.locals.user = req.user;
    next();
});

// ----------------- Dashboard Metrics (Revenue Removed) -----------------
const getDashboardMetrics = async () => {
    const NON_ADMIN_FILTER = { role: { $ne: "admin" } };

    const [totalUsers, totalBookings, contactCount, reviewCount] = await Promise.all([
        User.countDocuments(NON_ADMIN_FILTER),
        Booking.countDocuments(),
        ContactMessage.countDocuments(),
        Review.countDocuments(),
    ]);

    const [recentUsersDB, allUsersDB, recentBookingsDB, allBookings] = await Promise.all([
        // Recent Users (Top 5)
        User.find(NON_ADMIN_FILTER)
            .sort({ createdAt: -1 })
            .limit(5)
            .select("name email role createdAt")
            .lean(),

        // All Users
        User.find(NON_ADMIN_FILTER)
            .sort({ createdAt: -1 })
            .select("name email role createdAt")
            .lean(),

        // Recent Bookings (Top 5)
        Booking.find()
            .sort({ _id: -1 })
            .limit(5)
            .select("_id eventName fullName totalAmount ticketType status")
            .lean(),

        // All Bookings
        Booking.find()
            .sort({ createdAt: -1 })
            .select("eventName fullName ticketType ticketsQuantity totalAmount status createdAt")
            .lean(),
    ]);

    // 🔥 TOTAL REVENUE CALCULATION
    const totalRevenue = allBookings.reduce((sum, booking) => {
        return sum + Number(booking.totalAmount || 0);
    }, 0);

    // Format recent bookings
    const recentBookings = recentBookingsDB.map((b) => ({
        id: `#${String(b._id).slice(-5)}`,
        eventName: b.eventName,
        fullName: b.fullName,
        ticketType: b.ticketType,
        amount: Number(b.totalAmount || 0).toFixed(2),
        status: b.status || "Pending",
    }));

    return {
        totalUsers: totalUsers,
        totalBookings: totalBookings,
        totalRevenue: totalRevenue, // ✅ NEW

        totalContactMessages: contactCount,
        totalReviews: reviewCount,

        activeUsers: totalUsers,
        newUsers: 0,
        suspendedUsers: 0,
        bookingTypePercentages: [0, 0, 0],

        allBookings: allBookings.map((b) => ({
            eventName: b.eventName,
            fullName: b.fullName,
            ticketType: b.ticketType,
            ticketsQuantity: b.ticketsQuantity,
            totalAmount: Number(b.totalAmount || 0).toFixed(2),
            status: b.status || "Pending",
            bookingDate: b.createdAt
                ? new Date(b.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                  })
                : "N/A",
        })),

        recentBookings,

        // Recent Users (Top 5)
        recentUsers: recentUsersDB.map((u) => ({
            name: u.name,
            email: u.email,
            joined: u.createdAt
                ? new Date(u.createdAt).toLocaleDateString("en-US")
                : "N/A",
        })),

        // All Users
        allUsers: allUsersDB.map((u) => ({
            name: u.name,
            email: u.email,
            joined: u.createdAt
                ? new Date(u.createdAt).toLocaleDateString("en-US")
                : "N/A",
        })),

        chartData: {},
    };
};




//----------------------------------------------
// GET route

// ----------------- Routes -----------------




// app.post("/login", async (req, res) => {
//     try {
//         const { email, password, role } = req.body;
//         if (!email || !password || !role)
//             return res.render("login", { error: "All fields are required" });

//         const user = await User.findOne({ email, role });
//         if (!user) return res.render("login", { error: "Invalid credentials or role" });

//         const ok = await bcrypt.compare(password, user.password);
//         if (!ok) return res.render("login", { error: "Invalid credentials" });

//         createTokenAndSetCookie(res, {
//             id: user._id,
//             email: user.email,
//             name: user.name,
//             role: user.role,
//         });

//         if (user.role === "admin") return res.redirect("/dashboard");
//         res.redirect("/index");
//     } catch (err) {
//         console.error(err);
//         res.render("login", { error: "Server error" });
//     }
// });



app.get("/", (req, res) => {
    res.clearCookie("token");
    res.render("login", { error: null });
});


app.get("/login", (req, res) => {
    res.clearCookie("token");
    res.render("login", { error: null });
});



const MAX_ATTEMPTS = 3;
const LOCK_TIME = 60; // 60 seconds

app.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.render("login", { error: "All fields are required" });
    }

    const attemptsKey = `login:attempts:${email}`;
    const lockKey = `login:lock:${email}`;

    // 1️⃣ CHECK LOCK FIRST
    // const isLocked = await redisClient.get(lockKey);
    // if (isLocked) {
    //   const ttl = await redisClient.ttl(lockKey);
    //   return res.render("login", {
    //     error: `Too many attempts. Try again after ${ttl} seconds.`,
    //     ttl,
    //   });
    // }

    // 2️⃣ FETCH USER
    const user = await User.findOne({ email, role });
    const passwordOk = user
      ? await bcrypt.compare(password, user.password)
      : false;






if (!user || !passwordOk) {
  return res.render("login", {
    error: "Invalid credentials",
    ttl: 0,
  });
}




    // 3️⃣ WRONG PASSWORD
    // if (!user || !passwordOk) {
    //   const attempts = await redisClient.incr(attemptsKey);

    //   // set TTL ONLY once
    //   if (attempts === 1) {
    //     await redisClient.expire(attemptsKey, LOCK_TIME);
    //   }

      // LOCK USER
    //   if (attempts >= MAX_ATTEMPTS) {
    //     await redisClient.set(lockKey, "LOCKED", { EX: LOCK_TIME });
    //     const ttl = await redisClient.ttl(lockKey);
    //     return res.render("login", {
    //       error: `Account locked for ${ttl} seconds.`,
    //       ttl,
    //     });
    //   }

    //   return res.render("login", {
    //     error: `Invalid credentials. ${MAX_ATTEMPTS - attempts} attempts left.`,
    //     ttl: 0,
    //   });
    // }

    // // 4️⃣ SUCCESS → RESET EVERYTHING
    // await redisClient.del(attemptsKey);
    // await redisClient.del(lockKey);

    createTokenAndSetCookie(res, {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    if (user.role === "admin") return res.redirect("/dashboard");
    res.redirect("/index");

  } catch (err) {
    console.error(err);
    res.render("login", { error: "Server error", ttl: 0 });
  }
});















app.get("/register", (req, res) => {
    res.clearCookie("token");
    res.render("register", { error: null });
});

app.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password)
            return res.render("register", { error: "All fields are required" });

        const existing = await User.findOne({ email });
        if (existing) return res.render("register", { error: "Email already registered" });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashed,
            role: role || "user",
        });

        createTokenAndSetCookie(res, {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
        });

        res.redirect("/index");
    } catch (err) {
        console.error(err);
        res.render("register", { error: "Server error" });
    }
});

// ----------------- Protected Pages -----------------
app.get("/index", requireAuth, (req, res) => res.render("index"));
app.get("/event", requireAuth, (req, res) => res.render("event"));

// ----------------- Admin Dashboard -----------------
app.get("/dashboard", requireAuth, async (req, res) => {
    if (req.user.role !== "admin") return res.redirect("/index");
    try {
        const metrics = await getDashboardMetrics();
        res.render("dashboard", { metrics });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error: Could not load dashboard data.");
    }
});

// ----------------- About Page -----------------
app.get("/about", async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        const count = reviews.length;
        const avg = count > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / count).toFixed(1) : 0;

        res.render("about", {
            features: [
                { title: "Corporate Events", desc: "We handle conferences, seminars, and meetings." },
                { title: "Private Parties", desc: "From birthdays to anniversaries, we make them special." },
                { title: "Public Events", desc: "Festivals, concerts, and exhibitions organized flawlessly." },
            ],
            avg,
            count,
            reviews,
            faqs: [
                { question: "Do you offer catering services?", answer: "Yes, we provide catering with multiple cuisine options." },
                { question: "Can I customize my event theme?", answer: "Absolutely! We specialize in custom themes." },
                { question: "Do you handle corporate bookings?", answer: "Yes, we manage corporate events of all sizes." },
            ],
        });
    } catch (error) {
        console.error(error);
        res.render("about", { features: [], avg: 0, count: 0, reviews: [], faqs: [] });
    }
});

app.post("/about/rate", async (req, res) => {
    const { name, rating, comment } = req.body;
    const REVIEW_NOTIFICATION_EMAIL = "goyalananya555@gmail.com";

    if (!rating || rating < 1 || rating > 5)
        return res.status(400).json({ error: "A valid rating (1-5) is required." });

    try {
        const newReview = await Review.create({
            name: name || "Anonymous",
            rating: parseInt(rating),
            comment: (comment || "").trim(),
            createdAt: new Date(),
        });

        const reviews = await Review.find().select("rating");
        const count = reviews.length;
        const avg = (reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1);










        // try sending email separately (won’t break app)
try {
    await transporter.sendMail({
        from: "krishna1234isha@gmail.com",
        to: REVIEW_NOTIFICATION_EMAIL,
        subject: "⭐ New Customer Review Posted on Converza! ⭐",
        text: `A new ${newReview.rating}-star review has been submitted.\nReviewer: ${newReview.name}`
    });
} catch (emailError) {
    console.log("Email failed but review saved:", emailError.message);
}







        res.json({ message: "Review submitted successfully", review: newReview, avg, count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error processing review." });
    }
});

// ----------------- Events -----------------
//const getCategories = () => [...new Set(mockEvents.map(e => e.category))].sort();
const getCategories = async () => {
    const categories = await Event.distinct("category");
    return categories.sort();
};

app.get("/events", requireAuth, async (req, res) => {
    const { category, query } = req.query;

const allCategories = await getCategories();

const filter = {};

// ✅ Apply filter ONLY if category is selected and not "All"
if (category && category !== "All") {
    filter.category = category;
}

// ✅ Search filter
if (query) {
    filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } }
    ];
}

const filteredEvents = await Event.find(filter).sort({ startTime: 1 });

const selectedCategory = category ? category : "All";

res.render("events-list", {
    events: filteredEvents,
    allCategories,
    selectedCategory,
    searchQuery: query || ""
});
});

app.get("/events-list", requireAuth, (req, res) => res.redirect("/events"));

// ----------------- Booking Routes -----------------
app.get("/book/:eventId", requireAuth, async (req, res) => {
    const event = await Event.findById(req.params.eventId);
    if (event) res.render("book-ticket", { event });
    else res.status(404).send("Event not found.");
});
app.post("/api/bookings", requireAuth, async (req, res) => {
    try {
        const { ticketId,eventId, fullName, contactNo, location, ticketType, ticketsQuantity, pricePerTicket, totalAmount, paymentMethod } = req.body;
        const event = await Event.findById(eventId);
        if (!event) return res.status(400).send("Invalid event ID.");

        const newBooking = new Booking({
             ticketId,
            eventId,
            eventName: event.name,
            fullName,
            contactNo,
            location,
            ticketType,
            ticketsQuantity: parseInt(ticketsQuantity),
            pricePerTicket: parseFloat(pricePerTicket),
            totalAmount: parseFloat(totalAmount),
            paymentMethod,
            status: "Confirmed",
        });

        await newBooking.save();
const qrData = `http://192.168.1.10:3000/ticket/${ticketId}`;

const qrCodeImage = await QRCode.toDataURL(qrData);


// ✅ ADD EMAIL HERE
const bookingData = {
    name: fullName,
    event: event.name,
    date: new Date(event.startTime).toLocaleString("en-IN", {
    dateStyle: "long",
    timeStyle: "short"
}),
    seats: ticketsQuantity,
    price: totalAmount
};

const userEmail = req.user.email;

await sendTicketEmail(userEmail, bookingData, qrCodeImage);




        res.render("success", { message: "Your tickets have been booked successfully!", bookingDetails: newBooking, eventName: event.name, returnLink: "/events" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error processing your booking. Please try again.");
    }
});

app.post("/book-ticket", requireAuth, async (req, res) => {
    try {

        const ticketId = "EVT" + Date.now();

        const booking = new Booking({
            ...req.body,
            ticketId
        });

        await booking.save();

        // QR CODE
      const qrData = `http://192.168.1.10:3000/ticket/${ticketId}`;
        const qrCodeImage = await QRCode.toDataURL(qrData);
        console.log("QR GENERATED:", qrCodeImage);

        // EMAIL
        const userEmail = req.user.email;

       await sendTicketEmail(userEmail, bookingData, qrCodeImage);

        res.send("Ticket booked successfully 🎉");

    } catch (error) {
        console.log(error);
        res.send("Booking failed");
    }
});
app.get("/ticket/:ticketId", async (req, res) => {
    const booking = await Booking.findOne({ ticketId: req.params.ticketId });

    if (!booking) return res.send("Invalid Ticket ❌");

    res.render("ticket", { booking });
});

// ----------------- Contact Routes -----------------
app.get("/contact", (req, res) => res.render("contact"));

app.post("/send-email", async (req, res) => {
    const { name, email, message } = req.body;
    const CONTACT_EMAIL = "goyalananya555@gmail.com";

    if (!name || !email || !message) {
        return res.status(400).json({ message: "❌ Please fill all fields" });
    }

    try {
        // ✅ Save to MongoDB
        await ContactMessage.create({ name, email, message });

        // ✅ Try email separately (IMPORTANT FIX)
        try {
            await transporter.sendMail({
                from: `"${name}" <${email}>`,
                to: CONTACT_EMAIL,
                subject: `New message from ${name}`,
                text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
            });
        } catch (emailError) {
            console.log("Email failed but message saved:", emailError.message);
        }

        // ✅ Always success response
        res.json({ message: "Message saved successfully!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
//-------------------------------------
app.get("/ticket", (req, res) => {
    res.render("ticket"); // ticket.ejs
});
// Render banner page
app.get("/banner", (req, res) => {
  res.render("banner");
});

// Create event + generate QR
app.post("/create-event", async (req, res) => {
  try {
    const { title, tag, time, venue, contact, category } = req.body;

    // Unique event ID
    const eventId = Date.now();
    const link =` /event/${eventId}`;

    // QR Content
    const qrContent = `Event: ${title}\n${tag}\n${time}\n${venue}\n${contact}`;
// Generate QR code (Base64)
    const qrData = await QRCode.toDataURL(qrContent, {
      errorCorrectionLevel: "H",
      width: 300,
    });

    res.json({
      ok: true,
      link,
      qr: qrData,
      qrCode: qrData, // for frontend compatibility
    });
  } catch (err) {
    console.error("QR Create Error:", err);
    res.status(500).json({ ok: false, message: "Failed to generate QR" });
  }
});

// Optional: Save banner to MongoDB
app.post("/save-banner", async (req, res) => {
  try {
    const banner = new Banner(req.body);
    await banner.save();

    res.json({ ok: true, message: "Banner saved", id: banner._id });
  } catch (err) {
    console.error("Error saving banner:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

app.get("/forgot-password", (req, res) => {
  res.render("forgot-password");
});
app.post("/forgot-password", async (req, res) => {

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.send("User not found");
  }

  const crypto = require("crypto");

  const token = crypto.randomBytes(32).toString("hex");

  user.resetToken = token;
  user.resetTokenExpire = Date.now() + 3600000;

  await user.save();

  // EMAIL SENDING PART
  const nodemailer = require("nodemailer");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ishita160217@gmail.com",
      pass: "lton syge sywf trbt"
    }
  });

  const resetLink = `http://localhost:3000/reset-password/${token}`;

  await transporter.sendMail({
    to: user.email,
    subject: "Password Reset",
    html: `<p>Click the link below to reset your password:</p>
           <a href="${resetLink}">${resetLink}</a>`
  });

  res.json({ success:true, message:"Reset link sent to your email" });
});


app.get("/reset-password/:token", (req, res) => {
  res.render("reset-password", { token: req.params.token });
});
app.post("/reset-password/:token", async (req, res) => {

  const user = await User.findOne({
    resetToken: req.params.token,
    resetTokenExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.send("Token invalid or expired");
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  user.password = hashedPassword;

  user.resetToken = undefined;
  user.resetTokenExpire = undefined;

  await user.save();

  res.send("Password reset successful. You can now login.");
});




// ----------------- Share Link -----------------
app.get("/generate-share-link/:eventId", (req, res) => {
    const eventId = req.params.eventId;
    if (!eventId) return res.status(400).json({ error: "Event ID required" });
    const link = `${req.protocol}://${req.get("host")}/event?eventId=${eventId}`;
    res.json({ link });
});

// ----------------- Logout -----------------
// Modified to use app.get for anchor tag compatibility, clear cookie, and redirect.
app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

// ----------------- Start Server -----------------
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});