const BASE_URL = process.env.ACCOUNTPE_BASE_URL;
const EMAIL = process.env.ACCOUNTPE_EMAIL;
const PASSWORD = process.env.ACCOUNTPE_PASSWORD;

export const accountpe = {
  // 1. Get Authentication Token
  getToken: async () => {
    try {
      console.log("AccountPe: Logging in...");
      const res = await fetch(`${BASE_URL}/admin/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        console.error("AccountPe Login Failed:", data);
        throw new Error(data.message || "Login failed");
      }
      
      // Try finding the token in different common spots
      const token = data.token || data.data?.token || data.access_token;
      if (!token) throw new Error("No token returned from login");
      
      return token;
    } catch (error: any) {
      console.error("Auth Error:", error.message);
      return null;
    }
  },

  // 2. Initialize Payment
  initialize: async (data: { name: string; email: string; amount: number; ref: string; mobile?: string }) => {
    try {
      const token = await accountpe.getToken();
      if (!token) return { status: false, error: "Authentication failed. Check Email/Password in Env." };

      const payload = {
        country_code: "NG", // Try NG first. If this fails, we try US.
        name: data.name,
        email: data.email,
        mobile: data.mobile || "08000000000",
        amount: data.amount, 
        transaction_id: data.ref,
        description: "Payment",
        pass_digital_charge: false
      };

      console.log("AccountPe Payload:", JSON.stringify(payload));

      const response = await fetch(`${BASE_URL}/create_payment_links`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("AccountPe Result:", result);
      
      // Check for success
      if (response.ok && (result.status === 200 || result.status === 1 || result.status === true)) {
        const link = result.data?.payment_url || result.data?.link || result.data?.url;
        if (link) return { status: true, paymentUrl: link };
      }

      // Return the specific error message from AccountPe
      return { 
        status: false, 
        error: result.message || JSON.stringify(result.data) || "Unknown Gateway Error" 
      };

    } catch (error: any) {
      return { status: false, error: error.message };
    }
  },

  // 3. Verify Payment
  verify: async (reference: string) => {
    try {
      const token = await accountpe.getToken();
      if (!token) return { status: false };

      const response = await fetch(`${BASE_URL}/payment_link_status`, {
        method: 'POST', 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transaction_id: reference })
      });

      const result = await response.json();
      if (result.status === 200 || result.message?.toLowerCase().includes('success')) {
        return { status: true };
      }
      return { status: false };
    } catch (error) {
      return { status: false };
    }
  }
};