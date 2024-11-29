async function getCurrentUser() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token found in localStorage");
    }

    const response = await fetch("/api/v1/users/getCurrentUser", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch current user: ${errorText}`);
    }

    const currentUser = await response.json();
    if (!currentUser) {
      throw new Error("Current user data is not available");
    }

    // console.log("Current User:", currentUser); // Debugging statement
    return currentUser;
  } catch (error) {
    console.error("Error fetching current user:", error.message);
    return null; // Return null to indicate an error occurred
  }
}
