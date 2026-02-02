
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

// Projects
export const fetchProjects = async (page = 1, limit = 10) => {
  const response = await fetch(`${API_URL}/projects?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
     throw new Error('Failed to fetch projects');
  }
  return response.json();
};

export const fetchProjectById = async (id: string) => {
  const response = await fetch(`${API_URL}/projects/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch project');
  }
  return response.json();
};

export const createProject = async (data: any) => {
  const isFormData = data instanceof FormData;
  const headers = getHeaders();
  if (isFormData) {
      delete (headers as any)['Content-Type'];
  }

  const response = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: headers,
    body: isFormData ? data : JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create project');
  }
  return response.json();
};

export const updateProject = async (id: string, data: any) => {
  const isFormData = data instanceof FormData;
  const headers = getHeaders();
  if (isFormData) {
      delete (headers as any)['Content-Type'];
  }

  const response = await fetch(`${API_URL}/projects/${id}`, {
    method: 'PATCH',
    headers: headers,
    body: isFormData ? data : JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update project');
  }
  return response.json();
};

export const deleteProject = async (id: string) => {
  const response = await fetch(`${API_URL}/projects/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

// ... deleteProject function ...
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete project');
  }
  return response.json();
};

// Interest System
export const expressInterestAPI = async (projectId: string, message: string) => {
    const headers = getHeaders();
    const response = await fetch(`${API_URL}/interests/${projectId}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit interest");
    }
    return response.json();
}

export const checkInterestStatusAPI = async (projectId: string) => {
    const headers = getHeaders();
    const response = await fetch(`${API_URL}/interests/status/${projectId}`, {
        method: "GET",
        headers
    });
    
// ... interest check ...
    if (!response.ok) return null;
    return response.json();
}

// User Profile System
export const getUserProfile = async (username: string) => {
    const headers = getHeaders();
    const response = await fetch(`${API_URL}/users/${username}`, {
        method: "GET", 
        headers
    });
    if (!response.ok) return null;
    return response.json();
}

export const getMyProfile = async () => {
    const headers = getHeaders();
    const response = await fetch(`${API_URL}/users/me`, {
        method: "GET",
        headers
    });
    if (!response.ok) {
         throw new Error("Failed to fetch profile");
    }
// ... getMyProfile ...
    return response.json();
}

export const updateProfileAPI = async (data: FormData) => {
    const headers = getHeaders();
    // Remove Content-Type header to let browser set boundary for FormData
    delete (headers as any)['Content-Type'];

    const response = await fetch(`${API_URL}/users/me`, {
        method: "PATCH",
        headers,
        body: data
    });

    if (!response.ok) {
        throw new Error("Failed to update profile");
    }
    return response.json();
}


export const getSubscriptionStatus = async () => {
    const headers = getHeaders();
    const response = await fetch(`${API_URL}/payment/status`, {
        method: "GET",
        headers
    });
    if (!response.ok) return null;
    return response.json();
}

export const getMyProjects = async () => {
    const headers = getHeaders();
    const response = await fetch(`${API_URL}/projects/my`, {
        method: "GET",
        headers
    });
    if (!response.ok) return [];
    return response.json();
}

// Admin API
export const getAdminStats = async () => {
    const headers = getHeaders();
    const response = await fetch(`${API_URL}/admin/stats`, {
        method: "GET",
        headers
    });
    if (!response.ok) throw new Error("Failed to fetch admin stats");
    return response.json();
};

export const getAllUsers = async (page = 1, limit = 10) => {
    const headers = getHeaders();
    const response = await fetch(`${API_URL}/admin/users?page=${page}&limit=${limit}`, {
        method: "GET",
        headers
    });
    if (!response.ok) throw new Error("Failed to fetch users");
    return response.json();
};

export const updateUserAsAdmin = async (id: string, data: { role?: string, plan?: string }) => {
    const headers = getHeaders();
    const response = await fetch(`${API_URL}/admin/users/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error("Failed to update user");
    return response.json();
};

export const deleteUserAsAdmin = async (id: string) => {
    const headers = getHeaders();
    const response = await fetch(`${API_URL}/admin/users/${id}`, {
        method: "DELETE",
        headers
    });
    if (!response.ok) throw new Error("Failed to delete user");
    return response.json();
};

export const getAllProjectsAsAdmin = async (page = 1, limit = 10) => {
    const headers = getHeaders();
    const response = await fetch(`${API_URL}/admin/projects?page=${page}&limit=${limit}`, {
        method: "GET",
        headers
    });
    if (!response.ok) throw new Error("Failed to fetch projects");
    return response.json();
};

export const deleteProjectAsAdmin = async (id: string) => {
    const headers = getHeaders();
    const response = await fetch(`${API_URL}/admin/projects/${id}`, {
        method: "DELETE",
        headers
    });
    if (!response.ok) throw new Error("Failed to delete project");
    return response.json();
};

// Feedback API
export const submitFeedback = async (data: { type: string, title: string, description: string, rating?: number }) => {
    const headers = getHeaders();
    const response = await fetch(`${API_URL}/feedback`, {
        method: "POST",
        headers,
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error("Failed to submit feedback");
    return response.json();
}

export const getAllFeedbacks = async (page = 1, limit = 50) => {
    const headers = getHeaders();
    const response = await fetch(`${API_URL}/feedback?page=${page}&limit=${limit}`, {
        method: "GET",
        headers
    });
    if (!response.ok) throw new Error("Failed to fetch feedbacks");
    return response.json();
}

export const updateFeedbackStatus = async (id: string, status: string) => {
    const headers = getHeaders();
    const response = await fetch(`${API_URL}/feedback/${id}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error("Failed to update status");
    return response.json();
}

export const deleteFeedback = async (id: string) => {
    const headers = getHeaders();
    const response = await fetch(`${API_URL}/feedback/${id}`, {
        method: "DELETE",
        headers
    });
    if (!response.ok) throw new Error("Failed to delete feedback");
    return response.json();
}

// Announcements API
export const getActiveAnnouncements = async () => {
    const response = await fetch(`${API_URL}/announcements/active`);
    if (!response.ok) return [];
    return response.json();
}

export const getAllAnnouncements = async () => {
    const headers = getHeaders();
    const response = await fetch(`${API_URL}/announcements`, {
        method: "GET",
        headers
    });
    if (!response.ok) throw new Error("Failed to fetch announcements");
    return response.json();
}

export const createAnnouncement = async (data: any) => {
    const headers = getHeaders();
    const response = await fetch(`${API_URL}/announcements`, {
        method: "POST",
        headers,
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error("Failed to create announcement");
    return response.json();
}

export const updateAnnouncement = async (id: string, data: any) => {
    const headers = getHeaders();
    const response = await fetch(`${API_URL}/announcements/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error("Failed to update announcement");
    return response.json();
}

export const deleteAnnouncement = async (id: string) => {
    const headers = getHeaders();
    const response = await fetch(`${API_URL}/announcements/${id}`, {
        method: "DELETE",
        headers
    });
    if (!response.ok) throw new Error("Failed to delete announcement");
    return response.json();
}
