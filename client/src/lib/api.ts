
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Auth
export const sendOtp = async (email: string, type: "login" | "signup") => {
  const response = await fetch(`${API_URL}/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, type }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to send OTP");
  }

  return response.json();
};

export const verifyOtp = async (
  email: string,
  otp: string,
  type: "login" | "signup",
  name?: string
) => {
  const response = await fetch(`${API_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, type, name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to verify OTP");
  }

  return response.json();
};
