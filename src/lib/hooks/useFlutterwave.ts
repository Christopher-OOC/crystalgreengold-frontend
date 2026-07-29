import { useFlutterwave as useFlutterwaveSdk, closePaymentModal } from 'flutterwave-react-v3';

interface FlutterwaveConfig {
  email: string;
  amount: number;
  name?: string;
  phone?: string;
  onSuccess?: (txRef: string) => void;
  onClose?: () => void;
}

export const useFlutterwave = ({
  email,
  amount,
  name,
  phone,
  onSuccess,
  onClose,
}: FlutterwaveConfig) => {
  const config = {
    public_key:
      process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY ||
      process.env.VITE_FLUTTERWAVE_PUBLIC_KEY ||
      '',
    tx_ref: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    amount,
    currency: 'NGN' as const,
    payment_options: 'card,mobilemoney,ussd,banktransfer' as const,
    customer: {
      email,
      phone_number: phone || '',
      name: name || '',
    },
    customizations: {
      title: 'CrystalGreenGold Payment',
      description: 'Complete your payment securely',
      logo: '',
    },
  };

  const handleFlutterPayment = useFlutterwaveSdk(config);

  const pay = () => {
    handleFlutterPayment({
      callback: (response) => {
        if (response.status === 'successful') {
          console.log('Flutterwave payment successful:', response);
          onSuccess?.(response.tx_ref);
        }
      },
      onClose: () => {
        onClose?.();
      },
    });
  };

  return { pay, closePaymentModal };
};
