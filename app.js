// Load environment variables (Must be first)
require("dotenv").config();

// ----------------- Imports -----------------
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
const redisClient = require("./redisClient");


// ----------------- Models -----------------
const User = require("./models/User");
const Booking = require("./models/Booking");
const mockEvents = require("./models/mockEvents");



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
const PORT = process.env.PORT || 3000;
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
    .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/event-management", {
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
        user: "krishna1234isha@gmail.com",
        pass: "gwjk uagx grci zgjf",
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

    // --- MODIFIED QUERIES START HERE ---
    const [recentUsersDB, allUsersDB, recentBookingsDB, allBookings] = await Promise.all([
        // 1. Query for RECENT USERS (Dashboard Overview - LIMIT 5)
        User.find(NON_ADMIN_FILTER)
            .sort({ createdAt: -1 })
            .limit(5) // <-- ADDED LIMIT FOR DASHBOARD OVERVIEW
            .select("name email role createdAt")
            .lean(),

        // 2. Query for ALL USERS (Users Tab - NO LIMIT)
        User.find(NON_ADMIN_FILTER)
            .sort({ createdAt: -1 })
            .select("name email role createdAt")
            .lean(), // <-- ADDED QUERY FOR ALL USERS

        // 3. Query for Recent Bookings (already limited to 5)
        Booking.find()
            .sort({ _id: -1 })
            .limit(5)
            .select("_id eventName fullName totalAmount ticketType status")
            .lean(),

        // 4. Query for All Bookings
        Booking.find()
            .sort({ createdAt: -1 })
            .select("eventName fullName ticketType ticketsQuantity totalAmount status createdAt")
            .lean(),
    ]);
    // --- MODIFIED QUERIES END HERE ---


    const recentBookings = recentBookingsDB.map((b) => ({
        id: `#${String(b._id).slice(-5)}`,
        eventName: b.eventName,
        fullName: b.fullName,
        ticketType: b.ticketType,
        amount: b.totalAmount.toFixed(2),
        status: b.status || "Pending",
    }));

    return {
        totalUsers: totalUsers,
        totalBookings: totalBookings,
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
            totalAmount: b.totalAmount.toFixed(2),
            status: b.status || "Pending",
            bookingDate: b.createdAt
                ? b.createdAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                  })
                : "N/A",
        })),
        recentBookings,
        // --- MODIFIED MAPPING START HERE ---
        // Top 5 users for the Overview tab
        recentUsers: recentUsersDB.map((u) => ({
            name: u.name,
            email: u.email,
            joined: u.createdAt ? u.createdAt.toLocaleDateString("en-US") : "N/A",
        })),
        // All users for the dedicated Users tab
        allUsers: allUsersDB.map((u) => ({ // <-- NEW PROPERTY
            name: u.name,
            email: u.email,
            joined: u.createdAt ? u.createdAt.toLocaleDateString("en-US") : "N/A",
        })),
        // --- MODIFIED MAPPING END HERE ---
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
    const isLocked = await redisClient.get(lockKey);
    if (isLocked) {
      const ttl = await redisClient.ttl(lockKey);
      return res.render("login", {
        error: `Too many attempts. Try again after ${ttl} seconds.`,
        ttl,
      });
    }

    // 2️⃣ FETCH USER
    const user = await User.findOne({ email, role });
    const passwordOk = user
      ? await bcrypt.compare(password, user.password)
      : false;

    // 3️⃣ WRONG PASSWORD
    if (!user || !passwordOk) {
      const attempts = await redisClient.incr(attemptsKey);

      // set TTL ONLY once
      if (attempts === 1) {
        await redisClient.expire(attemptsKey, LOCK_TIME);
      }

      // LOCK USER
      if (attempts >= MAX_ATTEMPTS) {
        await redisClient.set(lockKey, "LOCKED", { EX: LOCK_TIME });
        const ttl = await redisClient.ttl(lockKey);
        return res.render("login", {
          error: `Account locked for ${ttl} seconds.`,
          ttl,
        });
      }

      return res.render("login", {
        error: `Invalid credentials. ${MAX_ATTEMPTS - attempts} attempts left.`,
        ttl: 0,
      });
    }

    // 4️⃣ SUCCESS → RESET EVERYTHING
    await redisClient.del(attemptsKey);
    await redisClient.del(lockKey);

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

        await transporter.sendMail({
            from: "krishna1234isha@gmail.com",
            to: REVIEW_NOTIFICATION_EMAIL,
            subject: "⭐ New Customer Review Posted on Converza! ⭐",
            text: `A new ${newReview.rating}-star review has been submitted on Converza.\nReviewer: ${newReview.name}\nRating: ${newReview.rating} out of 5\nComment: ${newReview.comment || 'No comment'}\nDate: ${newReview.createdAt.toLocaleString()}\nCurrent Average Rating: ${avg} (${count} reviews)`,
        });

        res.json({ message: "Review submitted successfully", review: newReview, avg, count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error processing review." });
    }
});

// ----------------- Events -----------------
const getCategories = () => [...new Set(mockEvents.map(e => e.category))].sort();

app.get("/events", requireAuth, (req, res) => {
    const { category, query } = req.query;
    const allCategories = getCategories();
    const currentCategory = category && allCategories.includes(category) ? category : allCategories[0] || null;

    let filteredEvents = mockEvents;
    const safeQuery = String(query || "").trim();

    if (currentCategory) filteredEvents = filteredEvents.filter(e => e.category === currentCategory);
    if (safeQuery.length > 0) {
        const lowerCaseQuery = safeQuery.toLowerCase();
        filteredEvents = filteredEvents.filter(
            e => e.name.toLowerCase().includes(lowerCaseQuery) || e.location.toLowerCase().includes(lowerCaseQuery)
        );
    }

    filteredEvents.sort((a, b) => a.startTime - b.startTime);

    res.render("events-list", { events: filteredEvents, allCategories, selectedCategory: currentCategory, searchQuery: query || "" });
});

app.get("/events-list", requireAuth, (req, res) => res.redirect("/events"));

// ----------------- Booking Routes -----------------
app.get("/book/:eventId", requireAuth, (req, res) => {
    const event = mockEvents.find(e => e._id === req.params.eventId);
    if (event) res.render("book-ticket", { event });
    else res.status(404).send("Event not found.");
});

app.post("/api/bookings", requireAuth, async (req, res) => {
    try {
        const { eventId, fullName, contactNo, location, ticketType, ticketsQuantity, pricePerTicket, totalAmount, paymentMethod } = req.body;
        const event = mockEvents.find(e => e._id === eventId);
        if (!event) return res.status(400).send("Invalid event ID.");

        const newBooking = new Booking({
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

        res.render("success", { message: "Your tickets have been booked successfully!", bookingDetails: newBooking, eventName: event.name, returnLink: "/events" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error processing your booking. Please try again.");
    }
});

// ----------------- Contact Routes -----------------
app.get("/contact", (req, res) => res.render("contact"));

app.post("/send-email", async (req, res) => {
    const { name, email, message } = req.body;
    const CONTACT_EMAIL = "deepalirana518@gmail.com";

    if (!name || !email || !message) return res.status(400).json({ message: "❌ Please fill all fields" });

    try {
        await ContactMessage.create({ name, email, message });
        await transporter.sendMail({
            from: `"${name}" <${email}>`,
            to: CONTACT_EMAIL,
            subject: `New message from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
        });
        res.json({ message: "Email sent successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "❌ Failed to send email." });
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