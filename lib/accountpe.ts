const BASE_URL = process.env.ACCOUNTPE_BASE_URL;
const EMAIL = process.env.ACCOUNTPE_EMAIL;
const PASSWORD = process.env.ACCOUNTPE_PASSWORD;

export const accountpe = {
  // 1. Get Authentication Token
  getToken: async () => {
    try {
      console.log("AccountPe: Attempting Auth...");
      const res = await fetch(`${BASE_URL}/admin/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: EMAIL,
          password: PASSWORD
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        console.error("AccountPe Auth Failed:", data);
        return null;
      }
      
      // Check different variations of where the token might be
      const token = data.token || data.data?.token || data.access_token;
      if (!token) console.error("AccountPe: No token found in response", data);
      
      return token;
    } catch (error) {
      console.error("AccountPe Auth Network Error:", error);
      return null;
    }
  },

  // 2. Initialize Payment
  initialize: async (data: { 
    name: string; 
    email: string; 
    amount: number; 
    ref: string; 
    mobile?: string;
  }) => {
    try {
      const token = await accountpe.getToken();
      if (!token) return { status: false, error: "Authentication failed" };

      // YAML Spec: country_code, name, email, transaction_id, amount, pass_digital_charge
      const payload = {
        country_code: "US", // Changed to US for Dollar payments (or try 'NG' if it fails)
        name: data.name,
        email: data.email,
        mobile: data.mobile || "0000000000",
        amount: data.amount, 
        transaction_id: data.ref,
        description: "Service Payment",
        pass_digital_charge: false // Required by YAML
      };

      console.log("AccountPe: Sending Payload:", JSON.stringify(payload));

      const response = await fetch(`${BASE_URL}/create_payment_links`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("AccountPe Response:", result);
      
      // Check for success (YAML says 200 OK)
      if (response.ok && result.status === 200) {
        // Look for the link in likely places
        const link = result.data?.payment_link || result.data?.link || result.data?.url;
        if (link) return { status: true, paymentUrl: link };
      }

      return { status: false, error: result.message || "Unknown Gateway Error" };

    } catch (error) {
      console.error("AccountPe Init Exception:", error);
      return { status: false, error: "Network Error" };
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
      console.log("Verify Response:", result);
      
      if (result.status === 200 || result.message?.toLowerCase().includes('success')) {
        return { status: true };
      }
      return { status: false };
    } catch (error) {
      console.error("Verify Error:", error);
      return { status: false };
    }
  }
};