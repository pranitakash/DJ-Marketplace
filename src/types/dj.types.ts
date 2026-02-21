export interface IDJ{
    userId: string;
    stageName: string;
    loaction: string;
    genres: string[];
    priceStarting: number[];
    rating: number;
    bio: string;
    createdAt: FirebaseFirestore.Timestamp
}