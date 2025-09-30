// Helper function for making API requests
export async function fetchApi(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  const response = await fetch(`/api/${endpoint}`, mergedOptions);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

// Auth API
export const authApi = {
  sendOtp: (phone: string) => fetchApi("auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ phone }),
  }),
  verifyOtp: (token: string, otp: string) => fetchApi("auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ token, otp }),
  }),
  register: (data: any) => fetchApi("auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  }),
};

// User API
export const userApi = {
  getProfile: () => fetchApi("users/profile"),
  updateProfile: (data: any) => fetchApi("users/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  }),
  changePassword: (data: any) => fetchApi("users/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  }),
};

// Request API
export const requestApi = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, String(value));
    });
    return fetchApi(`requests?${queryParams.toString()}`);
  },
  getById: (id: number) => fetchApi(`requests/${id}`),
  create: (data: any) => fetchApi("requests", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => fetchApi(`requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => fetchApi(`requests/${id}`, {
    method: "DELETE",
  }),
};

// Notification API
export const notificationApi = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, String(value));
    });
    return fetchApi(`notifications?${queryParams.toString()}`);
  },
  markAsRead: (id: number) => fetchApi(`notifications/${id}`, {
    method: "PATCH",
  }),
  markAllAsRead: () => fetchApi("notifications/mark-all-read", {
    method: "POST",
  }),
  delete: (id: number) => fetchApi(`notifications/${id}`, {
    method: "DELETE",
  }),
};

// Status API
export const statusApi = {
  getAll: () => fetchApi("statuses"),
  create: (data: any) => fetchApi("statuses", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => fetchApi(`statuses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }),
  delete: (id: number) => fetchApi(`statuses/${id}`, {
    method: "DELETE",
  }),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => fetchApi("dashboard/stats"),
  getRecentRequests: (limit = 5) => fetchApi(`dashboard/recent-requests?limit=${limit}`),
  getServiceStats: () => fetchApi("dashboard/service-stats"),
};



// Payment API
export const paymentApi = {
  createPayment: (data: any) => fetchApi("payments", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  verifyPayment: (data: any) => fetchApi("payments/verify", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  getPaymentHistory: () => fetchApi("payments/history"),
};