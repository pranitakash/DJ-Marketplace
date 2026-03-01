import { useCallback, useEffect, useRef, useState } from 'react';
import { createOrder, verifyPayment, loadRazorpayScript } from '../services/payment';
import type {
    PaymentStatus,
    RazorpayPaymentResponse,
    CreateOrderPayload,
} from '../types/payment';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

interface UseRazorpayOptions {
    onSuccess?: (data: any) => void;
    onFailure?: (error: string) => void;
}

/**
 * Hook to handle Booking + Razorpay Payment flow.
 * Aligned with backend requirements for server-side amount calculation and Firestore persistence.
 */
export function useRazorpay(options: UseRazorpayOptions = {}) {
    const [status, setStatus] = useState<PaymentStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const optionsRef = useRef(options);

    // Keep ref in sync
    useEffect(() => {
        optionsRef.current = options;
    }, [options]);

    const initiatePayment = useCallback(async (bookingData: CreateOrderPayload, userEmail?: string, userPhone?: string) => {
        const opts = optionsRef.current;
        setStatus('loading');
        setError(null);

        try {
            // 1. Load Razorpay script (using shared service)
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                throw new Error('Failed to load Razorpay SDK. Check your internet connection.');
            }

            // 2. Create order on backend (amount calculated server-side based on bookingData.hours)
            const { order } = await createOrder(bookingData);

            // 3. Open Razorpay checkout
            const razorpay = new window.Razorpay({
                key: RAZORPAY_KEY,
                amount: order.amount,
                currency: order.currency,
                name: 'DJ Night',
                description: `Booking: ${bookingData.djName} — ${bookingData.hours}hr`,
                order_id: order.id,
                handler: async (response: RazorpayPaymentResponse) => {
                    try {
                        // 4. Verify payment on backend (this also creates the booking in Firestore)
                        const result = await verifyPayment({
                            ...bookingData,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (result.success) {
                            setStatus('success');
                            opts.onSuccess?.(result);
                        } else {
                            setStatus('failed');
                            setError(result.message || 'Payment verification failed.');
                            opts.onFailure?.(result.message);
                        }
                    } catch (err: any) {
                        setStatus('failed');
                        const msg = err.response?.data?.message || 'Payment verification failed.';
                        setError(msg);
                        opts.onFailure?.(msg);
                    }
                },
                prefill: {
                    name: bookingData.userName || '',
                    email: userEmail || '',
                    contact: userPhone || '',
                },
                theme: {
                    color: '#ffffff',
                },
                modal: {
                    ondismiss: () => {
                        setStatus('idle');
                    },
                },
            });

            razorpay.on('payment.failed', (response: any) => {
                setStatus('failed');
                const msg = response?.error?.description || 'Payment failed. Please try again.';
                setError(msg);
                opts.onFailure?.(msg);
            });

            razorpay.open();
        } catch (err: any) {
            setStatus('failed');
            const msg = err.response?.data?.message || err.message || 'Something went wrong.';
            setError(msg);
            opts.onFailure?.(msg);
        }
    }, []);

    const reset = useCallback(() => {
        setStatus('idle');
        setError(null);
    }, []);

    return { status, error, initiatePayment, reset };
}
