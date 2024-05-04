import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const PrivateRoute = ({ children }) => {
  const router = useRouter();
  const AuthUser = useSelector((state) => state.user);
  const isLoggedIn = getCookie("isLoggedIn");
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return null;
  }
  return children;
};

export default PrivateRoute;
