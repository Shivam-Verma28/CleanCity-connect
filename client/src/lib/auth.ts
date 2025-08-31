import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const token = localStorage.getItem("adminToken");
  
  const { data, isLoading } = useQuery({
    queryKey: ["/api/admin/me"],
    enabled: !!token,
    retry: false,
    queryFn: async () => {
      const response = await fetch("/api/admin/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Unauthorized");
      }
      
      return response.json();
    },
  });

  return {
    isAuthenticated: !!data && !!token,
    isLoading: !!token && isLoading,
  };
}
