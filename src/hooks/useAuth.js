import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { login, me , logout} from "../api/auth";

// هوك تسجيل الدخول
// ✅ نسخة محسنة من هوك تسجيل الدخول
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials) => login(credentials),
    onSuccess: async (loginResponse) => {
      try {
        // 🔹 نخزنو الـ token من الـ response مباشرة
        const token = loginResponse?.token;
        if (token) {
          localStorage.setItem('auth_token', token);
        }
        
        // نستنو شوية باش الـ cookie يتسجل (إن كان موجود)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // كنجيبو الداتا الجديدة
        const userData = await me();
        
        // 🔹 كنسجلوها مباشرة فكاش "me"
        queryClient.setQueryData(["me"], userData);
        
        // 🔹 ونأكدو أنها "valid" باشuseQuery ميعاودش طلب آخر فالبلاصة
        queryClient.invalidateQueries({ queryKey: ["me"] });
        
        console.log("✅ User cached successfully");
      } catch (error) {
        console.error("❌ Error loading user into cache:", error);
        // نمسحو الـ token في حالة الخطأ
        localStorage.removeItem('auth_token');
      }
    },
  });
};

// ✅ هوك جلب المستخدم الحالي - useQuery مش useMutation
export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => me(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    // enabled: false 👈 حيد هاد السطر
  });
};


export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      // نمسحو الـ token من localStorage
      localStorage.removeItem('auth_token');
      queryClient.removeQueries({ queryKey: ["me"] });
    },
  });
}