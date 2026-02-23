export interface IUser {
    uid: string;
    name: string;
    email: string;
    role: 'user' | 'dj' | 'admin';
    createdAt: FirebaseFirestore.Timestamp
}
