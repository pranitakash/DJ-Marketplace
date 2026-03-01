// ─── Razorpay Window Types ───────────────────────────────────────────────────

export interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    order_id: string;
    handler: (response: RazorpayPaymentResponse) => void;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    theme?: {
        color?: string;
    };
    modal?: {
        ondismiss?: () => void;
    };
}

export interface RazorpayPaymentResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface RazorpayInstance {
    open: () => void;
    close: () => void;
    on: (event: string, handler: (response: any) => void) => void;
}

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
    }
}

// ─── API Types ───────────────────────────────────────────────────────────────

export interface CreateOrderPayload {
    djId: string;
    djName: string;
    userId: string;
    userName: string;
    targetDate: string;
    hours: number;
    venueLocation: string;
}

export interface CreateOrderResponse {
    success: boolean;
    order: {
        id: string;
        amount: number;
        currency: string;
    };
    totalAmount: number;
}

export interface VerifyPaymentPayload {
    djId: string;
    djName: string;
    userId: string;
    userName: string;
    targetDate: string;
    hours: number;
    venueLocation: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface VerifyPaymentResponse {
    success: boolean;
    message: string;
    bookingId?: string;
}

// ─── Component Props ─────────────────────────────────────────────────────────

export type PaymentStatus = 'idle' | 'loading' | 'success' | 'failed';
