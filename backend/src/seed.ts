import { auth, db } from "./config/firebase.js";

const genres = ["Techno", "House", "Minimal", "Ambient", "Disco", "Experimental", "Garage", "Trance", "Drum and Bass", "Dubstep"];
const locations = ["Berlin", "London", "Tokyo", "Zurich", "New York", "Paris", "Amsterdam", "Ibiza", "Los Angeles", "Detroit"];
const images = [
    "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1470229722913-7c090be5bc03?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1516280440502-d986b62edba1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1493225457224-06c10ff5e28a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function seedDatabase() {
    console.log("Starting Database Seeding...");

    // 1. Create Admin
    try {
        const adminEmail = "admin@djmarketplace.com";
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

    // 2. Create 5 Users
    for (let i = 1; i <= 5; i++) {
        try {
            const userEmail = `user${i}@djmarketplace.com`;
            const userPw = "user1234";
            const userRecord = await auth.createUser({
                email: userEmail,
                password: userPw,
                displayName: `Client ${i}`
            });
            await db.collection("users").doc(userRecord.uid).set({
                email: userEmail,
                name: `Client ${i}`,
                role: "user",
                uid: userRecord.uid,
                createdAt: new Date(),
            });
            console.log(`Created User: ${userEmail}`);
            await sleep(500); // Prevent rate limiting
        } catch (e: any) { console.log(`User ${i} exists or error:`, e.message); }
    }

    // 3. Create 20 DJs
    for (let i = 1; i <= 20; i++) {
        try {
            const djEmail = `dj${i}@djmarketplace.com`;
            const djPw = "dj123456";
            const djName = `DJ Artist ${i}`;
            const djRecord = await auth.createUser({
                email: djEmail,
                password: djPw,
                displayName: djName
            });

            const genre = genres[Math.floor(Math.random() * genres.length)];
            const location = locations[Math.floor(Math.random() * locations.length)];
            const hourlyRate = Math.floor(Math.random() * 200) + 50;
            const imageUrl = images[Math.floor(Math.random() * images.length)];

            // Create user doc
            await db.collection("users").doc(djRecord.uid).set({
                email: djEmail,
                name: djName,
                role: "dj",
                uid: djRecord.uid,
                createdAt: new Date(),
            });

            // Create DJ profile
            await db.collection("djs").doc(djRecord.uid).set({
                userId: djRecord.uid,
                name: djName,
                email: djEmail,
                genre,
                hourlyRate,
                location,
                bio: `Professional ${genre} selector based in ${location}. Spinning tracks that move the floor.`,
                imageUrl,
                rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
                createdAt: new Date(),
            });

            console.log(`Created DJ: ${djEmail} (${genre} / ${location})`);
            await sleep(500);
        } catch (e: any) { console.log(`DJ ${i} exists or error:`, e.message); }
    }

    console.log("Seeding Complete!");
    process.exit(0);
}

seedDatabase();
