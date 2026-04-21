// Helper function to convert the price string (e.g., 'Rs. 7,999') to a number (7999)
const parsePrice = (rateString) => {
    if (typeof rateString !== 'string') return 0;
    const cleanString = rateString.replace('Rs.', '').replace(',', '').trim();
    return parseInt(cleanString, 10);
};

// --- Note: The generic helper function is removed. All ticket types are defined manually below. ---


const mockEvents = [
    
    // --- Technology (5 Events) ---
    { 
        _id: 't1', 
        name: 'AI & Data Workshop', 
        description: 'Deep dive into machine learning models and big data analysis techniques.', 
        startTime: new Date('2026-07-10T10:00:00Z'), 
        location: 'SF Convention Center', 
        category: 'Technology', 
        imageUrl: '/images/events-list1.jpeg', 
        ticketTypes: [
            { name: 'Full Workshop Pass', price: 7999 },
            { name: 'VIP Networking Bundle', price: 12000 },
            { name: 'Student Rate (Valid ID Req.)', price: 4000 }
        ]
    },
    { 
        _id: 't2', 
        name: 'Future of Web Development', 
        description: 'Exploring WebAssembly, Serverless functions, and next-gen frameworks like Svelte.', 
        startTime: new Date('2026-05-15T09:00:00Z'), 
        location: 'Innovation Hub', 
        category: 'Technology', 
        imageUrl: '/images/events-list2.jpeg', 
        ticketTypes: [
            { name: 'Developer Day Pass', price: 800 },
            { name: 'All-Track Access + Recording', price: 1500 }
        ]
    },
    { 
        _id: 't3', 
        name: 'Cybersecurity Masterclass', 
        description: 'Learn ethical hacking and defense strategies for enterprise environments.', 
        startTime: new Date('2026-11-20T13:00:00Z'), 
        location: 'Tech Tower 404', 
        category: 'Technology', 
        imageUrl: '/images/events-list3.jpg', 
        ticketTypes: [
            { name: 'Ethical Hacking Certificate Course', price: 19999 },
            { name: 'Virtual Stream Access', price: 10000 }
        ]
    },
    { 
        _id: 't4', 
        name: 'Blockchain Essentials 101', 
        description: 'A beginner\'s guide to decentralized ledger technology and smart contracts.', 
        startTime: new Date('2026-04-20T18:00:00Z'), 
        location: 'Online Webinar', 
        category: 'Technology', 
        imageUrl: '/images/events-list4.png', 
        ticketTypes: [
            { name: 'Online Stream Pass', price: 400 },
            { name: 'Stream + Q&A Access', price: 700 }
        ]
    },
    { 
        _id: 't5', 
        name: 'Product Management Summit', 
        description: 'Strategies for launching successful tech products and managing agile teams.', 
        startTime: new Date('2026-09-01T10:00:00Z'), 
        location: 'SF Convention Center', 
        category: 'Technology', 
        imageUrl: '/images/events-list5.png', 
        ticketTypes: [
            { name: 'Summit Standard Seat', price: 39999 },
            { name: 'Executive Strategy Session', price: 55000 }
        ]
    },

    // --------------------------------------------------------------------------------------
    // --- Food & Drink (5 Events) ---
    { 
        _id: 'f1', 
        name: 'Global Cuisine Festival', 
        description: 'Taste international dishes from 50+ vendors, including Asian, European, and Latin food.', 
        startTime: new Date('2026-10-18T17:00:00Z'), 
        location: 'City Park Grounds', 
        category: 'Food & Drink', 
        imageUrl: '/images/events-list6.jpeg', 
        ticketTypes: [
            { name: 'General Entry', price: 2800 },
            { name: 'Unlimited Tasting Pass', price: 5500 },
            { name: 'Family Package (4 pax)', price: 8000 }
        ]
    },
    { 
        _id: 'f2', 
        name: 'Local Wine Tasting Event', 
        description: 'Sample the best vintages from regional vineyards paired with artisan cheeses.', 
        startTime: new Date('2026-06-25T19:00:00Z'), 
        location: 'The Winery Cellar', 
        category: 'Food & Drink', 
        imageUrl: '/images/events-list7.jpg', 
        ticketTypes: [
            { name: 'Standard Tasting', price: 4500 },
            { name: 'Sommelier Reserve Flight', price: 7000 }
        ]
    },
    { 
        _id: 'f3', 
        name: 'Dessert Masterclass', 
        description: 'Learn to bake professional-level pastries and advanced cake decorating techniques.', 
        startTime: new Date('2026-05-08T14:00:00Z'), 
        location: 'Culinary Institute', 
        category: 'Food & Drink', 
        imageUrl: '/images/events-list8.jpg', 
        ticketTypes: [
            { name: 'Masterclass Seat', price: 6500 },
            { name: 'Masterclass + Take-home Kit', price: 8500 }
        ]
    },
    { 
        _id: 'f4', 
        name: 'Brewers Showcase', 
        description: 'Try new craft beers, IPAs, and stouts, and meet the passionate local brewers.', 
        startTime: new Date('2026-06-15T18:00:00Z'), 
        location: 'Brewery District', 
        category: 'Food & Drink', 
        imageUrl: '/images/events-list9.jpeg', 
        ticketTypes: [
            { name: 'Tasting Entry', price: 1600 },
            { name: 'VIP Meet the Brewer', price: 3000 }
        ]
    },
    { 
        _id: 'f5', 
        name: 'Farm-to-Table Dinner', 
        description: 'A five-course meal featuring fresh, locally sourced ingredients in a beautiful outdoor setting.', 
        startTime: new Date('2026-07-05T20:00:00Z'), 
        location: 'The Green Farm', 
        category: 'Food & Drink', 
        imageUrl: '/images/events-list10.jpeg', 
        ticketTypes: [
            { name: 'Dinner Reservation', price: 9500 },
            { name: 'Chef\'s Table Experience', price: 15000 }
        ]
    },

    // --------------------------------------------------------------------------------------
    // --- Concerts (5 Events) ---
    { 
        _id: 'c1', 
        name: 'Jazz Fusion Night', 
        description: 'Award-winning quartet live on stage for a night of improvisational music.', 
        startTime: new Date('2026-08-28T21:00:00Z'), 
        location: 'The Apollo Theatre', 
        category: 'Concerts', 
        imageUrl: '/images/events-list11.jpg', 
        ticketTypes: [
            { name: 'Balcony Seating', price: 4500 },
            { name: 'Orchestra Floor Seat', price: 6500 },
            { name: 'VIP Backstage Access', price: 10000 }
        ]
    },
    { 
        _id: 'c2', 
        name: 'Symphony Orchestra Gala', 
        description: 'A performance of Beethoven\'s 5th and modern classical pieces.', 
        startTime: new Date('2026-09-01T19:30:00Z'), 
        location: 'City Concert Hall', 
        category: 'Concerts', 
        imageUrl: '/images/events-list12.jpeg', 
        ticketTypes: [
            { name: 'General Seating', price: 6000 },
            { name: 'Patron Box Seats', price: 9500 }
        ]
    },
    { 
        _id: 'c3', 
        name: 'Local Rock Band Showcase', 
        description: 'Five rising rock bands compete in the annual music battle.', 
        startTime: new Date('2026-07-19T20:00:00Z'), 
        location: 'The Velvet Room', 
        category: 'Concerts', 
        imageUrl: '/images/events-list13.jpeg', 
        ticketTypes: [
            { name: 'Standing Room Entry', price: 1200 },
            { name: 'Reserved Table', price: 2500 }
        ]
    },
    { 
        _id: 'c4', 
        name: 'Electronic Music Fest', 
        description: 'All-night dance party featuring world-renowned DJs and light shows.', 
        startTime: new Date('2026-05-10T22:00:00Z'), 
        location: 'Warehouse 12', 
        category: 'Concerts', 
        imageUrl: '/images/events-list14.jpg', 
        ticketTypes: [
            { name: 'Standard Festival Entry', price: 3200 },
            { name: 'Backstage Lounge Access', price: 6000 }
        ]
    },
    { 
        _id: 'c5', 
        name: 'Acoustic Folk Session', 
        description: 'Relaxed evening with intimate performances by singer-songwriters.', 
        startTime: new Date('2026-06-05T18:00:00Z'), 
        location: 'The Coffee Bean', 
        category: 'Concerts', 
        imageUrl: '/images/events-list15.jpg', 
        ticketTypes: [
            { name: 'General Admission', price: 800 },
            { name: 'Front Row Seating', price: 1500 }
        ]
    },

    // --------------------------------------------------------------------------------------
    // --- Sports (5 Events) ---
    { 
        _id: 's1', 
        name: 'Annual City Marathon', 
        description: 'Run the full 26.2 miles through the downtown streets.', 
        startTime: new Date('2026-09-20T07:00:00Z'), 
        location: 'City Stadium Start Line', 
        category: 'Sports', 
        imageUrl: '/images/events-list16.jpg', 
        ticketTypes: [
            { name: 'Full Marathon (42km)', price: 4800 },
            { name: 'Half Marathon (21km)', price: 3000 },
            { name: 'Fun Run (5km)', price: 1500 }
        ]
    },
    { 
        _id: 's2', 
        name: 'Basketball Championship Final', 
        description: 'Watch the two best teams battle for the league title.', 
        startTime: new Date('2026-07-03T20:00:00Z'), 
        location: 'Arena X', 
        category: 'Sports', 
        imageUrl: '/images/events-list17.jpeg', 
        ticketTypes: [
            { name: 'Upper Tier Seating', price: 6500 },
            { name: 'Courtside VIP', price: 15000 }
        ]
    },
    { 
        _id: 's3', 
        name: 'Local Soccer Derby', 
        description: 'The heated rivalry match between the two biggest local clubs.', 
        startTime: new Date('2026-08-25T15:00:00Z'), 
        location: 'Metro Field', 
        category: 'Sports', 
        imageUrl: '/images/events-list18.jpg', 
        ticketTypes: [
            { name: 'General Stand Ticket', price: 2000 },
            { name: 'Supporter Section', price: 2500 }
        ]
    },
    { 
        _id: 's4', 
        name: 'Yoga and Meditation Retreat', 
        description: 'A weekend of mindfulness, stretching, and wellness practices.', 
        startTime: new Date('2026-06-15T09:00:00Z'), 
        location: 'Mountain View Resort', 
        category: 'Sports', 
        imageUrl: '/images/events-list19.jpeg', 
        ticketTypes: [
            { name: 'Day Pass', price: 15999 },
            { name: 'Full Weekend Retreat', price: 25000 }
        ]
    },
    { 
        _id: 's5', 
        name: 'Cycling Endurance Race', 
        description: 'Test your limits in a 100km cycling event.', 
        startTime: new Date('2026-05-10T08:30:00Z'), 
        location: 'Coastal Highway', 
        category: 'Sports', 
        imageUrl: '/images/events-list20.jpeg', 
        ticketTypes: [
            { name: 'Race Entry', price: 3500 },
            { name: 'Race Entry + Jersey', price: 5000 }
        ]
    },
    
    // --------------------------------------------------------------------------------------
    // --- Workshops (5 Events) ---
    { 
        _id: 'w1', 
        name: 'Public Speaking Skills', 
        description: 'Overcome fear and master techniques for engaging presentations.', 
        startTime: new Date('2026-05-24T18:00:00Z'), 
        location: 'Community Center', 
        category: 'Workshops', 
        imageUrl: '/images/events-list21.jpg', 
        ticketTypes: [
            { name: 'Full Day Workshop', price: 5999 },
            { name: 'Premium 1-on-1 Coaching', price: 9000 }
        ]
    },
    { 
        _id: 'w2', 
        name: 'Beginner Photography', 
        description: 'Learn the fundamentals of camera settings, composition, and light.', 
        startTime: new Date('2026-07-07T14:00:00Z'), 
        location: 'Art Studio 3', 
        category: 'Workshops', 
        imageUrl: '/images/events-list22.jpeg', 
        ticketTypes: [
            { name: 'Workshop Seat', price: 9500 },
            { name: 'Workshop + Gear Rental', price: 12000 }
        ]
    },
    { 
        _id: 'w3', 
        name: 'Budgeting & Finance 101', 
        description: 'Practical skills for managing personal finances and saving money.', 
        startTime: new Date('2026-06-20T19:00:00Z'), 
        location: 'Library Annex', 
        category: 'Workshops', 
        imageUrl: '/images/events-list23.jpeg', 
        ticketTypes: [
            { name: 'Seminar Access', price: 1600 },
            { name: 'Seminar + Financial Toolkit', price: 2500 }
        ]
    },
    { 
        _id: 'w4', 
        name: 'DIY Home Repairs', 
        description: 'Hands-on training for basic plumbing, electrical, and carpentry fixes.', 
        startTime: new Date('2026-06-03T10:00:00Z'), 
        location: 'Vocational College', 
        category: 'Workshops', 
        imageUrl: '/images/events-list24.jpg', 
        ticketTypes: [
            { name: 'General Enrollment', price: 5200 },
            { name: 'Enrollment + Safety Gear', price: 6500 }
        ]
    },
    { 
        _id: 'w5', 
        name: 'Creative Writing Lab', 
        description: 'Generate new ideas and receive feedback on short story drafts.', 
        startTime: new Date('2026-05-15T18:30:00Z'), 
        location: 'Online Classroom', 
        category: 'Workshops', 
        imageUrl: '/images/events-list25.jpg', 
        ticketTypes: [
            { name: 'Virtual Seat', price: 400 },
            { name: 'Feedback Session Add-on', price: 1000 }
        ]
    },

    // --------------------------------------------------------------------------------------
    // --- Conferences (5 Events) ---
    { 
        _id: 'co1', 
        name: 'Marketing Strategy 2026', 
        description: 'Keynote speakers on digital marketing, SEO, and social media trends.', 
        startTime: new Date('2026-06-30T09:00:00Z'), 
        location: 'Grand Hyatt Ballroom', 
        category: 'Conferences', 
        imageUrl: '/images/events-list26.jpeg', 
        ticketTypes: [
            { name: 'Standard Conference Pass', price: 31999 },
            { name: 'Executive Suite Access', price: 45000 }
        ] 
    },
    { 
        _id: 'co2', 
        name: 'Environmental Policy Summit', 
        description: 'Discussions on global climate change initiatives and local sustainability efforts.', 
        startTime: new Date('2026-06-14T08:30:00Z'), 
        location: 'University Auditorium', 
        category: 'Conferences', 
        imageUrl: '/images/events-list27.png', 
        ticketTypes: [
            { name: 'Standard Attendee', price: 12000 },
            { name: 'Policy Maker Roundtable', price: 18000 }
        ] 
    },
    { 
        _id: 'co3', 
        name: 'Healthcare Innovation Forum', 
        description: 'Presentations on telemedicine, AI diagnostics, and patient care advancements.', 
        startTime: new Date('2026-07-08T10:00:00Z'), 
        location: 'Medical Research Center', 
        category: 'Conferences', 
        imageUrl: '/images/events-list28.jpeg', 
        ticketTypes: [
            { name: 'General Forum Pass', price: 23999 },
            { name: 'Research Paper Presentation', price: 30000 }
        ] 
    },
    { 
        _id: 'co4', 
        name: 'Future of Finance Expo', 
        description: 'Explore FinTech, blockchain, and the future of banking and investment.', 
        startTime: new Date('2026-05-20T09:30:00Z'), 
        location: 'Business Expo Center', 
        category: 'Conferences', 
        imageUrl: '/images/events-list29.jpeg', 
        ticketTypes: [
            { name: 'Expo Floor Access', price: 14000 },
            { name: 'Speaker Meet & Greet', price: 20000 }
        ] 
    },
    { 
        _id: 'co5', 
        name: 'Urban Planning and Design', 
        description: 'A two-day conference on modern city infrastructure and sustainable living.', 
        startTime: new Date('2026-06-10T09:00:00Z'), 
        location: 'City Hall Annex', 
        category: 'Conferences', 
        imageUrl: '/images/events-list30.jpeg', 
        ticketTypes: [
            { name: 'Single Day Pass', price: 10000 },
            { name: 'Full Two-Day Pass', price: 15999 }
        ] 
    },
    
    // --------------------------------------------------------------------------------------
    // --- Networking (5 Events) ---
    { 
        _id: 'n1', 
        name: 'Startup Founders Meetup', 
        description: 'Casual evening for startup founders to exchange ideas and find partners.', 
        startTime: new Date('2026-07-17T18:30:00Z'), 
        location: 'The Hive Coworking', 
        category: 'Networking', 
        imageUrl: '/images/events-list31.jpeg', 
        ticketTypes: [
            { name: 'General Admission', price: 800 },
            { name: 'Founders Circle (Priority Entry)', price: 1500 }
        ]
    },
    { 
        _id: 'n2', 
        name: 'Women in Tech Mixer', 
        description: 'An event celebrating and connecting female professionals in the technology sector.', 
        startTime: new Date('2026-09-06T19:00:00Z'), 
        location: 'Skyline Lounge', 
        category: 'Networking', 
        imageUrl: '/images/events-list32.jpeg', 
        ticketTypes: [
            { name: 'Networking Entry', price: 1200 },
            { name: 'Executive Mentorship Session', price: 3000 }
        ] 
    },
    { 
        _id: 'n3', 
        name: 'Professional Speed Dating', 
        description: 'Quick one-on-one sessions to expand your professional contacts across industries.', 
        startTime: new Date('2026-08-28T18:00:00Z'), 
        location: 'Downtown Hotel Bar', 
        category: 'Networking', 
        imageUrl: '/images/events-list33.jpeg', 
        ticketTypes: [
            { name: 'Speed Dating Session', price: 2400 },
            { name: 'Session + Drink Tokens', price: 3500 }
        ] 
    },
    { 
        _id: 'n4', 
        name: 'Creative Arts Professionals', 
        description: 'Networking night for designers, artists, writers, and filmmakers.', 
        startTime: new Date('2026-06-12T20:00:00Z'), 
        location: 'Gallery 77', 
        category: 'Networking', 
        imageUrl: '/images/events-list34.jpg', 
        ticketTypes: [
            { name: 'Gallery Access', price: 1600 },
            { name: 'Portfolio Review', price: 2500 }
        ] 
    },
    { 
        _id: 'n5', 
        name: 'Chamber of Commerce Luncheon', 
        description: 'Formal luncheon with local business leaders and policy makers.', 
        startTime: new Date('2026-05-25T12:00:00Z'), 
        location: 'City Club', 
        category: 'Networking', 
        imageUrl: '/images/events-list35.jpeg', 
        ticketTypes: [
            { name: 'Luncheon Reservation', price: 4000 },
            { name: 'Premium Table Seating', price: 6000 }
        ] 
    },

    // --------------------------------------------------------------------------------------
    // --- Exhibitions (5 Events) ---
    { 
        _id: 'e1', 
        name: 'Modern Sculpture Display', 
        description: 'A temporary exhibition featuring works from minimalist sculptors.', 
        startTime: new Date('2026-08-19T11:00:00Z'), 
        location: 'Art Museum West Wing', 
        category: 'Exhibitions', 
        imageUrl: '/images/events-list36.jpg', 
        ticketTypes: [
            { name: 'Day Ticket', price: 960 },
            { name: 'All-Week Pass', price: 2500 }
        ]
    },
    { 
        _id: 'e2', 
        name: 'Historical Photography', 
        description: 'Photos documenting the city\'s development over the last century.', 
        startTime: new Date('2026-07-04T10:00:00Z'), 
        location: 'City Archive Hall', 
        category: 'Exhibitions', 
        imageUrl: '/images/events-list37.jpg', 
        ticketTypes: [
            { name: 'General Entry', price: 500 },
            { name: 'Curator Guided Tour', price: 1500 }
        ] 
    },
    { 
        _id: 'e3', 
        name: 'Interactive Science Fair', 
        description: 'Hands-on exhibits for all ages exploring physics, chemistry, and biology.', 
        startTime: new Date('2026-06-21T09:00:00Z'), 
        location: 'Science Center', 
        category: 'Exhibitions', 
        imageUrl: '/images/events-list38.jpg', 
        ticketTypes: [
            { name: 'Single Day Admission', price: 1440 },
            { name: 'Family Pass (4 pax)', price: 4000 }
        ] 
    },
    { 
        _id: 'e4', 
        name: 'Automotive Showcase 2026', 
        description: 'Display of the newest electric vehicles and concept cars.', 
        startTime: new Date('2026-05-07T13:00:00Z'), 
        location: 'Convention Center Halls', 
        category: 'Exhibitions', 
        imageUrl: '/images/events-list39.jpeg', 
        ticketTypes: [
            { name: 'Expo Floor Entry', price: 2000 },
            { name: 'Concept Car Preview', price: 3500 }
        ] 
    },
    { 
        _id: 'e5', 
        name: 'Jewelry and Gem Expo', 
        description: 'A large collection of fine jewelry and loose gemstones for viewing and purchase.', 
        startTime: new Date('2026-05-18T10:00:00Z'), 
        location: 'Jewelry Mart', 
        category: 'Exhibitions', 
        imageUrl: '/images/events-list40.jpeg', 
        ticketTypes: [
            { name: 'Entry Ticket', price: 400 },
            { name: 'Private Viewing Hour', price: 1000 }
        ] 
    },

    // --------------------------------------------------------------------------------------
    // --- Theater (5 Events) ---
    { 
        _id: 'th1', 
        name: 'Broadway Hit: Wicked', 
        description: 'The long-running musical returns for a limited run in the city.', 
        startTime: new Date('2026-07-26T19:00:00Z'), 
        location: 'Majestic Theatre', 
        category: 'Theater', 
        imageUrl: '/images/events-list41.jpeg', 
        ticketTypes: [
            { name: 'Upper Balcony', price: 5000 },
            { name: 'Main Floor Seating', price: 7500 },
            { name: 'Premium Box Seat', price: 12000 }
        ]
    },
    { 
        _id: 'th2', 
        name: 'Local Play: The Glass House', 
        description: 'A modern, emotional drama written and performed by local talent.', 
        startTime: new Date('2026-08-10T20:00:00Z'), 
        location: 'Fringe Stage', 
        category: 'Theater', 
        imageUrl: '/images/events-list42.jpg', 
        ticketTypes: [
            { name: 'Fringe Seat', price: 2000 },
            { name: 'Director\'s Q&A Add-on', price: 500 }
        ] 
    },
    { 
        _id: 'th3', 
        name: 'Classical Ballet: Swan Lake', 
        description: 'A stunning performance of Tchaikovsky\'s classic ballet.', 
        startTime: new Date('2026-09-02T19:30:00Z'), 
        location: 'Opera House', 
        category: 'Theater', 
        imageUrl: '/images/events-list43.jpeg', 
        ticketTypes: [
            { name: 'Standard Dress Circle', price: 4000 },
            { name: 'Front Orchestra', price: 7000 }
        ] 
    },
    { 
        _id: 'th4', 
        name: 'Stand-up Comedy Night', 
        description: 'A lineup of three national touring comedians and local favorites.', 
        startTime: new Date('2026-08-20T21:00:00Z'), 
        location: 'The Comedy Cellar', 
        category: 'Theater', 
        imageUrl: '/images/events-list44.jpg', 
        ticketTypes: [
            { name: 'General Admission', price: 2800 },
            { name: 'VIP Booth', price: 5000 }
        ] 
    },
    { 
        _id: 'th5', 
        name: 'Children\'s Puppet Show', 
        description: 'An engaging, family-friendly show with puppets and music.', 
        startTime: new Date('2026-06-08T11:00:00Z'), 
        location: 'Children\'s Museum', 
        category: 'Theater', 
        imageUrl: '/images/events-list45.jpg', 
        ticketTypes: [
            { name: 'Child Ticket', price: 800 },
            { name: 'Adult Ticket', price: 800 }
        ] 
    },

    // --------------------------------------------------------------------------------------
    // --- Parties (5 Events) ---
    { 
        _id: 'p1', 
        name: '80s Retro Night', 
        description: 'Dress up in your best 80s gear and dance to classic hits.', 
        startTime: new Date('2026-05-31T22:00:00Z'), 
        location: 'Club Paradise', 
        category: 'Parties', 
        imageUrl: '/images/events-list46.jpg', 
        ticketTypes: [
            { name: 'General Entry', price: 1600 },
            { name: 'VIP Booth Reservation', price: 5000 }
        ]
    },
    { 
        _id: 'p2', 
        name: 'Rooftop Summer Closer', 
        description: 'Drinks and music with a sunset view from the city\'s tallest rooftop bar.', 
        startTime: new Date('2026-05-16T17:00:00Z'), 
        location: 'The Penthouse Bar', 
        category: 'Parties', 
        imageUrl: '/images/events-list47.jpeg', 
        ticketTypes: [
            { name: 'Entry + 1 Drink', price: 3600 },
            { name: 'Open Bar Access', price: 6500 }
        ] 
    },
    { 
        _id: 'p3', 
        name: 'New Year\'s Eve Countdown', 
        description: 'Formal attire event with open bar and champagne toast at midnight.', 
        startTime: new Date('2026-05-10T21:00:00Z'), 
        location: 'Grand Hotel Ballroom', 
        category: 'Parties', 
        imageUrl: '/images/events-list48.jpg', 
        ticketTypes: [
            { name: 'Standard Gala Ticket', price: 12000 },
            { name: 'VIP Table for 4', price: 40000 }
        ] 
    },
    { 
        _id: 'p4', 
        name: 'Taco and Tequila Tuesday', 
        description: 'Casual weekday party with unlimited tacos and discounted tequila specials.', 
        startTime: new Date('2026-06-13T18:00:00Z'), 
        location: 'El Fuego Cantina', 
        category: 'Parties', 
        imageUrl: '/images/events-list49.jpeg', 
        ticketTypes: [
            { name: 'Entry + Unlimited Tacos', price: 1200 },
            { name: 'Tequila Tasting Flight', price: 2500 }
        ] 
    },
    { 
        _id: 'p5', 
        name: 'Silent Disco Experience', 
        description: 'Party where everyone wears headphones and controls their own music choice.', 
        startTime: new Date('2026-06-01T20:30:00Z'), 
        location: 'City Skate Rink', 
        category: 'Parties', 
        imageUrl: '/images/events-list50.jpeg', 
        ticketTypes: [
            { name: 'Standard Headset Rental', price: 2400 },
            { name: 'Premium Headset + Priority DJ Channel', price: 3500 }
        ] 
    },

    // --------------------------------------------------------------------------------------
    // --- Online Events (5 Events) ---
    { 
        _id: 'o1', 
        name: 'Remote Job Fair', 
        description: 'Connect with companies hiring remotely in tech, marketing, and finance.', 
        startTime: new Date('2026-07-23T11:00:00Z'), 
        location: 'Zoom Platform', 
        category: 'Online Events', 
        imageUrl: '/images/events-list51.png', 
        ticketTypes: [
            { name: 'Attendee Pass', price: 1200 },
            { name: 'Premium CV Review', price: 2000 }
        ]
    },
    { 
        _id: 'o2', 
        name: 'Virtual Cooking Class', 
        description: 'Learn to make authentic Italian pasta from a chef in Rome.', 
        startTime: new Date('2026-05-09T17:00:00Z'), 
        location: 'Twitch Stream', 
        category: 'Online Events', 
        imageUrl: '/images/events-list52.jpeg', 
        ticketTypes: [
            { name: 'Class Access', price: 3200 },
            { name: 'Class + Ingredient List', price: 3500 }
        ] 
    },
    { 
        _id: 'o3', 
        name: 'Global Book Club Meeting', 
        description: 'Discussing the monthly selection with members from around the world.', 
        startTime: new Date('2026-06-29T19:00:00Z'), 
        location: 'Google Meet', 
        category: 'Online Events', 
        imageUrl: '/images/events-list53.jpg', 
        ticketTypes: [
            { name: 'Free Membership', price: 0 },
            { name: 'Premium Author Q&A', price: 400 }
        ] 
    },
    { 
        _id: 'o4', 
        name: 'Gaming Tournament Finals', 
        description: 'Watch the final matches of the largest eSports tournament of the year.', 
        startTime: new Date('2026-07-19T20:00:00Z'), 
        location: 'YouTube Live', 
        category: 'Online Events', 
        imageUrl: '/images/events-list54.jpg', 
        ticketTypes: [
            { name: 'Standard Stream', price: 2600 },
            { name: 'Caster VIP Chat Access', price: 4000 }
        ] 
    },
    { 
        _id: 'o5', 
        name: 'Digital Art Portfolio Review', 
        description: 'Get constructive feedback on your digital art from industry professionals.', 
        startTime: new Date('2026-06-29T18:00:00Z'), 
        location: 'Discord Server', 
        category: 'Online Events', 
        imageUrl: '/images/events-list55.jpeg', 
        ticketTypes: [
            { name: 'Viewer Pass', price: 2000 },
            { name: 'Submit Portfolio Slot', price: 4500 }
        ] 
    },

    // --------------------------------------------------------------------------------------
    // --- Festivals (5 Events) ---
    { 
        _id: 'fe1', 
        name: 'Harvest Music Festival', 
        description: 'Three days of music, camping, and food to celebrate the harvest season.', 
        startTime: new Date('2026-06-25T12:00:00Z'), 
        location: 'Fairgrounds Park', 
        category: 'Festivals', 
        imageUrl: '/images/events-list56.jpeg', 
        ticketTypes: [
            { name: 'Single Day Pass', price: 5600 },
            { name: 'Weekend Pass (3 Days)', price: 12000 },
            { name: 'Camping & Weekend Pass', price: 15000 }
        ]
    },
    { 
        _id: 'fe2', 
        name: 'International Film Festival', 
        description: 'Screenings of independent films from over 30 countries.', 
        startTime: new Date('2026-07-11T10:00:00Z'), 
        location: 'Various Theaters', 
        category: 'Festivals', 
        imageUrl: '/images/events-list57.jpg', 
        ticketTypes: [
            { name: 'Single Screening Ticket', price: 3350 },
            { name: 'Full Festival Badge', price: 8000 }
        ] 
    },
    { 
        _id: 'fe3', 
        name: 'Winter Lights Festival', 
        description: 'A display of thousands of animated lights and ice sculptures.', 
        startTime: new Date('2026-05-01T17:00:00Z'), 
        location: 'Botanic Garden', 
        category: 'Festivals', 
        imageUrl: '/images/events-list58.jpg', 
        ticketTypes: [
            { name: 'Evening Admission', price: 1440 },
            { name: 'Family Package (4 pax)', price: 4000 }
        ] 
    },
    { 
        _id: 'fe4', 
        name: 'Comic Book and Pop Culture Expo', 
        description: 'Meet celebrities, buy rare comics, and celebrate fandom.', 
        startTime: new Date('2026-05-17T09:00:00Z'), 
        location: 'Convention Center', 
        category: 'Festivals', 
        imageUrl: '/images/events-list59.jpeg', 
        ticketTypes: [
            { name: 'Day Entry', price: 2400 },
            { name: 'Creator Meet & Greet Pass', price: 4000 }
        ] 
    },
    { 
        _id: 'fe5', 
        name: 'Dragon Boat Race Festival', 
        description: 'Teams compete in traditional dragon boat races on the river.', 
        startTime: new Date('2026-05-05T08:00:00Z'), 
        location: 'Riverfront Park', 
        category: 'Festivals', 
        imageUrl: '/images/events-list60.jpg', 
        ticketTypes: [
            { name: 'Spectator Entry', price: 3600 },
            { name: 'Team Registration Fee', price: 8000 }
        ] 
    }
];

module.exports = mockEvents;