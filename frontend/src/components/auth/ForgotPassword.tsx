import React, { useEffect, useState } from "react";
import supabase;

const ForgotPassword = () => {
  const [email, setEmail] = useState(" ");
  const [reset, setReset] = useState(false);

  useEffect(() => {
    async function sendReset() {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://localhost:3000/reset-password",
      });
      if (error) {
        console.error("Reset error:", error.message);
      } else {
        console.log("Reset email sent!");
      }
    }
    if (email) {
      sendReset();
    }
  }, [reset]);
  return (
    <div>
      <h1>Forgot password</h1>
      <h3>You'll recieve a link to reset your password</h3>
      <input
        type="text"
        value="email"
        onChange={(e) => {
          setEmail(e.target.value);
        }}
        required
        placeholder="mail@gmail.com"
      ></input>
      <button onClick={() => setReset(true)}>Send</button>
    </div>
  );
};

export default ForgotPassword;
