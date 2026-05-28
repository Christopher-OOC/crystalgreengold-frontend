import { usePaystackPayment } from 'react-paystack';

interface PaystackConfig {
  email: string;
  amount: number;
  name?: string;
  phone?: string;
  onSuccess?: (reference: string) => void;
  onClose?: () => void;
}

export const usePaystack = ({
  email,
  amount,
  name,
  phone,
  onSuccess,
  onClose,
}: PaystackConfig) => {
  const config = {
    email,
    amount: amount * 100,
    publicKey:
      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
      process.env.VITE_PAYSTACK_PUBLIC_KEY ||
      '',
    metadata: { name, phone, custom_fields: [] },
  };

  const initializePayment = usePaystackPayment(config);

  const pay = () => {
    initializePayment({
      onSuccess: (res: any) => onSuccess?.(res.reference), // just pass reference up
      onClose: () => onClose?.(),
    });
  };

  return { pay };
};
