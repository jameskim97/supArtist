import { User } from "@firebase/auth";
import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { auth } from "../firebase/firebase";

const AuthProvider = ({children}: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const subscribe = auth.onAuthStateChanged(fbUser => {
      console.log(`구독 실행`, fbUser);
      setUser(fbUser);
    });
    return subscribe;
  }, []);

  return <AuthContext.Provider value={user}>{children} </AuthContext.Provider>;
};

export default AuthProvider;