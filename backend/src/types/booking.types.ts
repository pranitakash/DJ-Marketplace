export interface IBooking {
    userId: string;
    djId: string;
    eventDate: string;
    eventLocation: string;
    packageSelected: string;
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    createdAt: FirebaseFirestore.Timestamp;
    updatedAt: FirebaseFirestore.Timestamp;
}