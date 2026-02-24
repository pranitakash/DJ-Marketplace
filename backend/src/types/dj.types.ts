export interface IDJ {
    userId: string;
    stageName: string;
    location: string;
    genres: string[];
    hourlyRate: number;
    rating: number;
    bio: string;
    createdAt: FirebaseFirestore.Timestamp
}