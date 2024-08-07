import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Alert from "@mui/material/Alert";
import { FaGoogle } from "react-icons/fa";
import { auth, googleProvider } from "../firebase.config";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

const Login = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");

  const { email, password } = inputValue;

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({ ...inputValue, [name]: value });
  };

  // Email and password sign in
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (!userCredential.user.emailVerified) {
        setErrorMessage("Please verify your email before logging in.");
        return;
      }

      const token = await userCredential.user.getIdToken();
      console.log(token);

      const { data } = await axios.post(
        "http://localhost:4000/login",
        { token, password },
        { withCredentials: true }
      );

      const { success, message, token: jwtToken } = data;
      if (success) {
        localStorage.setItem("token", jwtToken); // Store the JWT token in local storage
        setTimeout(() => navigate("/"), 100);
      } else {
        setErrorMessage(message);
      }
    } catch (error) {
      console.log(error);
      setErrorMessage("Couldn't login");
    }

    setInputValue({ email: "", password: "" });
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const { user } = result;
      console.log("User signed in:", user.email);

      const token = await user.getIdToken();
      console.log(token);

      const { data } = await axios.post(
        "http://localhost:4000/google-signin",
        { token },
        { withCredentials: true }
      );

      const { success, message, token: jwtToken } = data;
      if (success) {
        localStorage.setItem("token", jwtToken);
        localStorage.setItem("userId", data.result._id);
        console.log(message);
        console.log(jwtToken);
        navigate("/");
        console.log("After navigation");
      } else {
        setErrorMessage(message);
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setErrorMessage("Couldn't sign in with Google");
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-left">Login</CardTitle>
          <CardDescription className="text-left">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <form onSubmit={handleSubmit} className="grid gap-2">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-left">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  name="email"
                  onChange={handleOnChange}
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link to="#" className="ml-auto inline-block text-sm underline">
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  value={password}
                  onChange={handleOnChange}
                  type="password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
            <Button variant="outline" className="w-full flex justify-center gap-2" onClick={handleGoogleSignIn}>
              <FaGoogle />
              Login with Google
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link to={"/signup"} className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;