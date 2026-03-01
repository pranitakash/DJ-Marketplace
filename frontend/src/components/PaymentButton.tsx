import React from 'react';
import { useRazorpay } from '../hooks/useRazorpay';
import type { CreateOrderPayload } from '../types/payment';
import { AlertCircle } from 'lucide-react';

export interface PaymentButtonProps {
    bookingData: CreateOrderPayload;
    customerEmail?: string;
    customerPhone?: string;
    onSuccess?: (data: any) => void;
    onFailure?: (error: string) => void;
    className?: string;
    children?: React.ReactNode;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  bookingData,
  customerEmail,
  customerPhone,
  onSuccess,
  onFailure,
  className,
  children,
}) => {
  const { status, error, initiatePayment, reset } = useRazorpay({
    onSuccess,
    onFailure,
  });

  // ─── Success State ───────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="space-y-3">
        <div className="p-4 border border-green-500/30 bg-green-500/10 flex items-center gap-3 text-green-400 font-mono text-sm">
          <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Payment successful! Booking confirmed.
        </div>
        <button
          type="button"
          onClick={reset}
          className="text-xs font-mono text-gray-400 hover:text-white underline transition-colors"
        >
          Dismiss
        </button>
      </div>
    );
  }

  // ─── Failed State ────────────────────────────────────────────────────────
  if (status === 'failed') {
    return (
      <div className="space-y-3">
        <div className="p-4 border border-red-500/30 bg-red-500/10 flex items-center gap-3 text-red-400 font-mono text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {error || 'Payment failed. Please try again.'}
        </div>
        <button
          type="button"
          onClick={() => {
            reset();
            initiatePayment(bookingData, customerEmail, customerPhone);
          }}
          className="w-full bg-white text-black font-display font-bold uppercase tracking-widest text-xs py-3 hover:bg-gray-200 transition-colors"
        >
          Retry Payment
        </button>
      </div>
    );
  }

  // ─── Default / Loading State ─────────────────────────────────────────────
  return (
    <button
      type="button"
      disabled={status === 'loading'}
      onClick={() => initiatePayment(bookingData, customerEmail, customerPhone)}
      className={
        className ||
        'w-full bg-white text-black font-display font-bold uppercase tracking-widest text-xs py-4 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3'
      }
    >
      {status === 'loading' ? (
        <>
          <div className="size-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          Processing...
        </>
      ) : (
        children || `Proceed to Pay`
      )}
    </button>
  );
};

export default PaymentButton;
