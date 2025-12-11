// lib/swychr.ts

const SECRET_KEY = process.env.SWYCHR_SECRET_KEY;
const BASE_URL = process.env.SWYCHR_BASE_URL;

export const swychr = {
  // 1. Initialize Payment
  initialize: async (data: { email: string; amount: number; callbackUrl: string; ref: string }) => {
    try {
      const response = await fetch(`${BASE_URL}/transaction/initialize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          amount: data.amount, // Ensure this matches their unit (e.g., cents vs dollars)
          currency: 'USD',
          reference: data.ref,
          callback_url: data.callbackUrl,
        }),
      });

      const result = await response.json();
      return result; // Should contain { status: true, data: { authorization_url: '...' } }
    } catch (error) {
      console.error("Swychr Init Error:", error);
      return null;
    }
  },

  // 2. Verify Payment
  verify: async (reference: string) => {
    try {
      const response = await fetch(`${BASE_URL}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result; // Should return status: 'success'
    } catch (error) {
      console.error("Swychr Verify Error:", error);
      return null;
    }
  }
};