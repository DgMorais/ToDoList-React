import { useState, useEffect } from "react";
import { auth } from "../services/firebaseConnection";
import { onAuthStateChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";

export default function Private({ children }) {
  const [loading, setLoading] = useState(true);
  const [signed, setSigned] = useState(false);
  
  useEffect(() => {
    async function checkLogin() {
      const unsub = onAuthStateChanged(auth, (user) => {
        if (user) {
          const userData = {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            photo: user.photoURL,
          };
          localStorage.setItem("@detailUser", JSON.stringify(userData));
          setSigned(true);
        } else {
          setSigned(false);
        }
        setLoading(false);
      });
    }

    checkLogin();
  }, []);

  if (loading) {
    return <h1>Carregando...</h1>;
  }

  if (!signed) {
    return <Navigate to="/" />;
  }

  return children;
}