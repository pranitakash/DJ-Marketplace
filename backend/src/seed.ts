import { auth, db } from "./config/firebase.js";

const genres = ["Techno", "House", "Bollywood", "Punjabi", "Trance", "Commercial", "Hip Hop", "Tech House", "Deep House", "Indie"];
const locations = ["Mumbai", "Delhi", "Bengaluru", "Goa", "Pune", "Hyderabad", "Kolkata", "Chennai", "Jaipur", "Chandigarh"];

const indianNames = [
    "Arnav", "Priya", "Rahul", "Neha", "Aditya", "Sneha", "Rohit", "Pooja", "Vikram", "Anjali",
    "Karan", "Kavya", "Siddharth", "Simran", "Varun", "Riya", "Rishabh", "Tanvi", "Akash", "Shruti"
];

const indianSurnames = [
    "Sharma", "Patel", "Singh", "Kumar", "Gupta", "Desai", "Joshi", "Verma", "Reddy", "Rao",
    "Mukherjee", "Das", "Shukla", "Ahuja", "Kapoor", "Chopra", "Malhotra", "Nair", "Iyer", "Yadav"
];

const djImages = [
    "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1516280440502-d986b62edba1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
];

const bios = [
    "Bringing underground sounds to the mainstream.",
    "Resident selector at the top clubs.",
    "Creating sonic journeys that keep the dancefloor moving until sunrise.",
    "Blending traditional rhythms with modern electronic beats.",
    "Your go-to choice for high-energy commercial and Bollywood nights.",
    "Specializing in deep, driving basslines and euphoric melodies.",
    "A regular feature at top festivals across the country.",
    "Curating exclusive vibes for premium private events.",
    "Pushing the boundaries of the local electronic scene.",
    "Master of the decks with over a decade of live performance experience."
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function seedDatabase() {
    console.log("Starting Authentic Indian Database Seeding...");

    // 1. Create Admin
    try {
        const adminEmail = "admin@djmarketplace.in";
        const adminPw = "admin1234";
        const adminRecord = await auth.createUser({
            email: adminEmail,
            password: adminPw,
            displayName: "System Admin"
        });
        await db.collection("users").doc(adminRecord.uid).set({
            email: adminEmail,
            name: "System Admin",
            role: "admin",
            uid: adminRecord.uid,
            createdAt: new Date(),
        });
        console.log(`Created Admin: ${adminEmail}`);
    } catch (e: any) { console.log("Admin exists or error:", e.message); }

    // 2. Create 10 Users (Organisers)
    const organizerUids: string[] = [];
    for (let i = 1; i <= 10; i++) {
        try {
            const userEmail = `organizer${i}@djmarketplace.in`;
            const userPw = "user1234";
            const firstName = indianNames[Math.floor(Math.random() * indianNames.length)];
            const lastName = indianSurnames[Math.floor(Math.random() * indianSurnames.length)];
            const fullName = `${firstName} ${lastName}`;

            const userRecord = await auth.createUser({
                email: userEmail,
                password: userPw,
                displayName: fullName
            });
            await db.collection("users").doc(userRecord.uid).set({
                email: userEmail,
                name: fullName,
                role: "user",
                uid: userRecord.uid,
                createdAt: new Date(),
            });
            organizerUids.push(userRecord.uid);
            console.log(`Created User: ${userEmail} (${fullName})`);
            await sleep(500); // Prevent rate limiting
        } catch (e: any) { console.log(`User ${i} exists or error:`, e.message); }
    }

    // 3. Create 30 DJs
    const djIds: string[] = [];
    for (let i = 1; i <= 30; i++) {
        try {
            const djEmail = `dj${i}@djmarketplace.in`;
            const djPw = "dj123456";
            const firstName = indianNames[Math.floor(Math.random() * indianNames.length)];
            const baseName = `DJ ${firstName}`;
            const djRecord = await auth.createUser({
                email: djEmail,
                password: djPw,
                displayName: baseName
            });

            const genre = genres[Math.floor(Math.random() * genres.length)];
            const location = locations[Math.floor(Math.random() * locations.length)];
            const hourlyRate = Math.floor(Math.random() * 15000) + 5000; // Rate in INR
            const imageUrl = djImages[Math.floor(Math.random() * djImages.length)];
            const bioBase = bios[Math.floor(Math.random() * bios.length)];

            // Create user doc
            await db.collection("users").doc(djRecord.uid).set({
                email: djEmail,
                name: baseName,
                role: "dj",
                uid: djRecord.uid,
                createdAt: new Date(),
            });

            // Create DJ profile
            await db.collection("djs").doc(djRecord.uid).set({
                userId: djRecord.uid,
                name: baseName,
                email: djEmail,
                genre,
                hourlyRate,
                location,
                bio: `${bioBase} Based in ${location}, specializing in ${genre}.`,
                imageUrl,
                rating: (Math.random() * 1.5 + 3.5).toFixed(1), // 3.5 to 5.0
                createdAt: new Date(),
            });

            djIds.push(djRecord.uid);
            console.log(`Created DJ: ${djEmail} (${genre} / ${location})`);
            await sleep(500);
        } catch (e: any) { console.log(`DJ ${i} exists or error:`, e.message); }
    }

    // Configure interactions (if we have users and djs)
    if (organizerUids.length > 0 && djIds.length > 0) {
        console.log("Generating mock bookings and reviews...");

        // 4. Create Bookings
        const bookingStatuses = ["pending", "confirmed", "completed", "cancelled"];

        for (let i = 0; i < 40; i++) {
            const orgId = organizerUids[Math.floor(Math.random() * organizerUids.length)]!;
            const djId = djIds[Math.floor(Math.random() * djIds.length)]!;
            const status = bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)];

            // Random date within next 60 days
            const bookingDate = new Date();
            bookingDate.setDate(bookingDate.getDate() + Math.floor(Math.random() * 60));

            try {
                await db.collection("bookings").add({
                    userId: orgId,
                    djId: djId,
                    date: bookingDate,
                    status: status,
                    eventType: ["Wedding", "Corporate Event", "Club Night", "Private Party"][Math.floor(Math.random() * 4)],
                    location: locations[Math.floor(Math.random() * locations.length)],
                    durationHours: Math.floor(Math.random() * 4) + 2,
                    totalAmount: Math.floor(Math.random() * 50000) + 15000,
                    createdAt: new Date()
                });
                console.log(`Created ${status} booking between Org:${orgId.substring(0, 5)} and DJ:${djId.substring(0, 5)}`);
                await sleep(200);
            } catch (e: any) { console.log("Error creating booking:", e.message); }
        }

        // 5. Create Reviews for Completed Bookings
        const reviewText = [
            "Amazing set! Kept the crowd dancing all night.",
            "Very professional and punctual. Great song selection.",
            "Good performance, but arrived a bit late.",
            "Absolutely smashed it. Will definitely book again.",
            "The energy was insane! Highly recommended."
        ];

        for (let i = 0; i < 25; i++) {
            const orgId = organizerUids[Math.floor(Math.random() * organizerUids.length)]!;
            const djId = djIds[Math.floor(Math.random() * djIds.length)]!;
            const rating = Math.floor(Math.random() * 3) + 3; // 3 to 5 stars

            try {
                await db.collection("reviews").add({
                    djId,
                    userId: orgId,
                    rating,
                    comment: reviewText[Math.floor(Math.random() * reviewText.length)],
                    createdAt: new Date()
                });
                console.log(`Created ${rating}-star review for DJ:${djId.substring(0, 5)}`);
                await sleep(200);
            } catch (e: any) { console.log("Error creating review:", e.message); }
        }
    } else {
        console.log("Skipping interactions: User or DJ count is 0. Did authentication seeding fail?");
    }

    console.log("Seeding Complete!");
    process.exit(0);
}

seedDatabase();
