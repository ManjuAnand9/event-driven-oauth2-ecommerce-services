import { useEffect, useState } from "react";
import { login } from "../services/authservice";
import { createCustomer } from "../services/customerapi";
import { FcGoogle } from "react-icons/fc";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn
} from "react-icons/fa";


const API_GATEWAY =
  import.meta.env.VITE_API_GATEWAY ||
  "http://localhost:8081";








function base64UrlEncode(bytes) {
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function generateCodeVerifier() {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);

  return base64UrlEncode(randomBytes);
}

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);

  const digest = await crypto.subtle.digest(
    "SHA-256",
    data
  );

  return base64UrlEncode(
    new Uint8Array(digest)
  );
}

export default function LoginModal({
  open,
  onClose,
  onLoginSuccess,
  onSocialLogin,
  message
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState(false);

  const [mode, setMode] =
    useState("signin");

  const [signupUsername, setSignupUsername] =
    useState("");

  const [signupEmail, setSignupEmail] =
    useState("");

  const [signupPassword, setSignupPassword] =
    useState("");

  const [customerName, setCustomerName] =
    useState("");

  const [shippingAddress, setShippingAddress] =
    useState("");

  const [signupSuccess, setSignupSuccess] =
    useState(false);

  const [signupError, setSignupError] =
    useState("");

  useEffect(() => {

    if (open) {

      setError("");
      setSuccess(false);
      setLoading(false);
      setUsername("");
      setPassword("");

    }

  }, [open]);

  if (!open) return null;




  async function handleSocialLogin(provider) {

    const codeVerifier =
      generateCodeVerifier();

    const codeChallenge =
      await generateCodeChallenge(
        codeVerifier
      );

    sessionStorage.setItem(
      "pkce_code_verifier",
      codeVerifier
    );

    const authUrl =
      `${API_GATEWAY}/auth/social-login/${provider}`
      + `?codeChallenge=${encodeURIComponent(codeChallenge)}`;

    window.location.href = authUrl;
  }

  async function handleSignup(event) {
    event.preventDefault();
    setSignupError("");
    setSignupSuccess(false);
    setLoading(true);


    const request = {
      username: signupUsername,
      email: signupEmail,
      enabled: true,

      credentials: [
        {
          type: "password",
          value: signupPassword,
          temporary: false
        }
      ],

      customerName: customerName,
      shippingAddress: shippingAddress
    };
    console.log(
      "UI SIGNUP REQUEST:",
      JSON.stringify(request, null, 2)
    );

    console.log("CREATE CUSTOMER REQUEST:", request);

    try {
      const response = await createCustomer(request);

      console.log(
        "CUSTOMER CREATED:",
        response
      );

      // show success
      setSignupSuccess(true);

    } catch (error) {

      console.error(
        "SIGNUP ERROR:",
        error
      );

      setSignupError(
        error.message ||
        "Account creation failed"
      );

    }

    finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {

    event.preventDefault();

    setError("");
    setSuccess(false);
    setLoading(true);

    try {

      const data =
        await login(
          username.trim(),
          password
        );

      setSuccess(true);

      setTimeout(() => {

        onLoginSuccess(
          data.access_token
        );

        setUsername("");
        setPassword("");
        setSuccess(false);

        onClose();

      }, 1500);

    } catch (err) {

      console.error(
        "LOGIN ERROR:",
        err
      );

      setError(
        err.message ||
        "Login failed"
      );

    } finally {

      setLoading(false);

    }

  } return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="modal-card login-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        {/* LOGO */}

        <div className="login-logo">
          NOVA<span>CART</span>
        </div>


        {/* TABS */}

        {!success && !signupSuccess && (
          <div className="auth-tabs">

            <button
              type="button"
              className={
                mode === "signin"
                  ? "auth-tab active"
                  : "auth-tab"
              }
              onClick={() => {
                setMode("signin");
                setError("");
                setSignupError("");
              }}
            >
              Sign In
            </button>



            <button
              type="button"
              className={
                mode === "signup"
                  ? "auth-tab active"
                  : "auth-tab"
              }
              onClick={() => {
                setMode("signup");
                setError("");
                setSignupError("");
              }}
            >
              Sign Up
            </button>

          </div>
        )}

        {/* SESSION/AUTH MESSAGE */}

        {message && (
          <div className="login-info">
            {message}
          </div>
        )}


        {/* LOGIN SUCCESS */}

        {success && (
          <div className="login-success">
            ✓ Logged in successfully
          </div>
        )}


        {/* SIGNUP SUCCESS */}

        {signupSuccess && (
          <>
            <div className="login-success">
              ✓ Account created successfully
            </div>

            <button
              type="button"
              className="login-submit"
              onClick={() => {

                setSignupSuccess(false);

                // Pre-fill login form
                setUsername(signupUsername);
                setPassword(signupPassword);

                setMode("signin");

              }}
            >
              Sign In
            </button>
          </>
        )}


        {/* SIGN IN */}

        {mode === "signin" &&
          !success &&
          !signupSuccess && (

            <>
              <h2 id="login-title">
                Sign in
              </h2>

              <p className="modal-description">
                Sign in without leaving NovaCart.
              </p>







              <form onSubmit={handleSubmit}>

                <label htmlFor="login-username">
                  Email or username
                </label>

                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(event) =>
                    setUsername(
                      event.target.value
                    )
                  }
                  placeholder="Enter username"
                  autoComplete="username"
                  required
                />


                <label htmlFor="login-password">
                  Password
                </label>

                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                />


                {error && (
                  <div className="login-error">
                    {error}
                  </div>
                )}


                <button
                  className="login-submit"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Signing in..."
                    : "Sign in"}
                </button>



                {/* ADD SOCIAL LOGIN HERE */}

                <div className="social-login-section">
                  <p className="social-login-note">
                    Currently, only Google Sign-In is available. Facebook, Instagram, and LinkedIn login are coming soon.
                  </p>

                  {/* Your Google, Facebook, Instagram and LinkedIn buttons */}
                </div>
                <div className="social-login-section">

                  <div className="social-login-title">
                    or sign in with
                  </div>

                  <div className="social-login-icons">

                    <button
                      type="button"
                      className="social-brand-button google"
                      onClick={() => handleSocialLogin("google")}
                    >

                      <FcGoogle />
                    </button>

                    <button
                      type="button"
                      className="social-brand-button facebook"
                    >
                      <FaFacebookF />
                    </button>

                    <button
                      type="button"
                      className="social-brand-button instagram"
                    >
                      <FaInstagram />
                    </button>

                    <button
                      type="button"
                      className="social-brand-button linkedin"
                    >
                      <FaLinkedinIn />
                    </button>

                  </div>

                </div>

              </form>


            </>
          )}


        {/* SIGN UP */}

        {mode === "signup" &&
          !signupSuccess &&
          !success && (

            <>
              <h2 id="login-title">
                Create account
              </h2>

              <p className="modal-description">
                Create your NovaCart account.
              </p>


              <form onSubmit={handleSignup}>

                <label>
                  Username
                </label>

                <input
                  type="text"
                  value={signupUsername}
                  onChange={(event) =>
                    setSignupUsername(
                      event.target.value
                    )
                  }
                  placeholder="Choose a username"
                  required
                />


                <label>
                  Email
                </label>

                <input
                  type="email"
                  value={signupEmail}
                  onChange={(event) =>
                    setSignupEmail(
                      event.target.value
                    )
                  }
                  placeholder="Enter email"
                  required
                />


                <label>
                  Password
                </label>

                <input
                  type="password"
                  value={signupPassword}
                  onChange={(event) =>
                    setSignupPassword(
                      event.target.value
                    )
                  }
                  placeholder="Create password"
                  required
                />


                <label>
                  Customer Name
                </label>

                <input
                  type="text"
                  value={customerName}
                  onChange={(event) =>
                    setCustomerName(
                      event.target.value
                    )
                  }
                  placeholder="Enter your full name"
                  required
                />


                <label>
                  Shipping Address
                </label>

                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(event) =>
                    setShippingAddress(
                      event.target.value
                    )
                  }
                  placeholder="Enter shipping address"
                  required
                />


                {signupError && (
                  <div className="login-error">
                    {signupError}
                  </div>
                )}


                <button
                  className="login-submit"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Creating account..."
                    : "Create Account"}
                </button>

              </form>
            </>
          )}


        {/* CANCEL */}

        {!success && !signupSuccess && (
          <button
            className="login-cancel"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
        )}

      </div>
    </div >
  );
}