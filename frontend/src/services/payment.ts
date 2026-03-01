import api from './api';
import type {
    CreateOrderPayload,
    CreateOrderResponse,
    VerifyPaymentPayload,
    VerifyPaymentResponse,
} from '../types/payment';

/**
 * Calls backend to create a Razorpay order with full booking data.
 * Amount is calculated server-side for security.
 */
export const createOrder = async (
    payload: CreateOrderPayload
): Promise<CreateOrderResponse> => {
    const { data } = await api.post<CreateOrderResponse>(
        '/payment/create-order',
        payload
    );
    return data;
};

/**
 * Sends payment details + booking data to backend for signature verification + booking creation.
 */
export const verifyPayment = async (
    payload: VerifyPaymentPayload
): Promise<VerifyPaymentResponse> => {
    const { data } = await api.post<VerifyPaymentResponse>(
        '/payment/verify-payment',
        payload
    );
    return data;
};

/**
 * Dynamically loads the Razorpay checkout script once.
 */
export const loadRazorpayScript = (): Promise<boolean> => {
    const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
    return new Promise((resolve) => {
        if (document.querySelector(`script[src="${SCRIPT_URL}"]`)) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = SCRIPT_URL;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};
