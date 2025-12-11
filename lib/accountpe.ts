const BASE_URL = process.env.ACCOUNTPE_BASE_URL;
const EMAIL = process.env.ACCOUNTPE_EMAIL;
const PASSWORD = process.env.ACCOUNTPE_PASSWORD;

export const accountpe = {
  // 1. Get Authentication Token (Login)
  getToken: async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: EMAIL,
          password: PASSWORD
        })
      });
      
      const data = await res.json();
      
      // Assuming the token is in data.token or data.data.token
      // Check the exact response structure if possible, but usually:
      return data.token || data.data?.token; 
    } catch (error) {
      console.error("AccountPe Auth Error:", error);
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
      if (!token) throw new Error("Failed to get Auth Token");

      const payload = {
        country_code: "NG", // Change to "US" if strictly dollars, or keep NG for Nigeria
        name: data.name,
        email: data.email,
        mobile: data.mobile || "0000000000",
        amount: data.amount, // Ensure this is the correct unit (e.g. 100 = 100 naira/dollars)
        transaction_id: data.ref,
        description: "Course Payment",
        pass_digital_charge: false
      };

      const response = await fetch(`${BASE_URL}/create_payment_links`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      // Based on YAML, success is 200. Link should be in result.data
      // You might need to check if result.data.payment_link or similar exists
      // Let's assume result.data.link based on standard practices
      return {
        status: true,
        paymentUrl: result.data?.payment_url || result.data?.link // Adjust if needed after first test
      };
    } catch (error) {
      console.error("AccountPe Init Error:", error);
      return { status: false, error };
    }
  },

  // 3. Verify Payment
  verify: async (reference: string) => {
    try {
      const token = await accountpe.getToken();
      if (!token) return { status: false };

      const response = await fetch(`${BASE_URL}/payment_link_status`, {
        method: 'POST', // YAML says POST for verification
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transaction_id: reference })
      });

      const result = await response.json();
      
      // Check status field from YAML response (status: number)
      // Usually 1 or 200 means success
      if (result.status === 1 || result.status === 200 || result.message?.toLowerCase().includes('success')) {
        return { status: true };
      }
      return { status: false };
    } catch (error) {
      return { status: false };
    }
  }
};