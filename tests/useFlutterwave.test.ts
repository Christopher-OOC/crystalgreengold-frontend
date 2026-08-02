import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveFlutterwavePublicKey } from '../src/lib/hooks/useFlutterwave.ts';

test('prefers the app-specific Flutterwave public key when present', () => {
  const env = {
    NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY: 'generic-key',
    CRYSTAL_GREEN_GOLD_FLUTTERWAVE_PUBLIC_KEY: 'app-specific-key',
    VITE_FLUTTERWAVE_PUBLIC_KEY: 'vite-key',
  };

  assert.equal(resolveFlutterwavePublicKey(env), 'app-specific-key');
});

test('falls back to the generic public key when the app-specific key is missing', () => {
  const env = {
    NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY: 'generic-key',
    CRYSTAL_GREEN_GOLD_FLUTTERWAVE_PUBLIC_KEY: '',
    VITE_FLUTTERWAVE_PUBLIC_KEY: 'vite-key',
  };

  assert.equal(resolveFlutterwavePublicKey(env), 'generic-key');
});

test('uses the built-in Flutterwave test key when no runtime env is available', () => {
  const env = {
    NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY: '',
    CRYSTAL_GREEN_GOLD_FLUTTERWAVE_PUBLIC_KEY: '',
    VITE_FLUTTERWAVE_PUBLIC_KEY: '',
  };

  assert.equal(resolveFlutterwavePublicKey(env), 'FLWPUBK_TEST-6682ace78adcf7705fd62afa3848b5f9-X');
});
