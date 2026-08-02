import { useFlutterwave as useFlutterwaveSdk, closePaymentModal } from 'flutterwave-react-v3';

interface FlutterwaveConfig {
  email: string;
  amount: number;
  name?: string;
  phone?: string;
  onSuccess?: (txRef: string) => void;
  onClose?: () => void;
}

const FALLBACK_FLUTTERWAVE_PUBLIC_KEY = 'FLWPUBK_TEST-6682ace78adcf7705fd62afa3848b5f9-X';

export const resolveFlutterwavePublicKey = (
  env: Record<string, string | undefined> = process.env
) => {
  const resolvedKey =
    env.CRYSTAL_GREEN_GOLD_FLUTTERWAVE_PUBLIC_KEY ||
    env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY ||
    env.VITE_FLUTTERWAVE_PUBLIC_KEY ||
    FALLBACK_FLUTTERWAVE_PUBLIC_KEY;

  return resolvedKey?.trim() || FALLBACK_FLUTTERWAVE_PUBLIC_KEY;
};

export const useFlutterwave = ({
  email,
  amount,
  name,
  phone,
  onSuccess,
  onClose,
}: FlutterwaveConfig) => {
  const publicKey = resolveFlutterwavePublicKey();
  const config = {
    public_key: publicKey,
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
    if (!publicKey) {
      throw new Error('Flutterwave is not configured. Please set CRYSTAL_GREEN_GOLD_FLUTTERWAVE_PUBLIC_KEY or NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY.');
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Please enter a valid payment amount before continuing.');
    }

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
