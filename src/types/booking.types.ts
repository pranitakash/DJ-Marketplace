export interface IBooking{
    userId: string;
    djId: string;
    eventDate: string;
    eventLoaction: string;
    packageSelected: string;
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'completed';
    createdAt: FirebaseFirestore.Timestamp;
    updatedAt: FirebaseFirestore.Timestamp;
}