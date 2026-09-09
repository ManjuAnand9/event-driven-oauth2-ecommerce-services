import { useEffect } from "react";

import { saveTokens } from "../services/authservice";

export default function AuthCallback() {


    useEffect(() => {
        async function finishSocialLogin() {
            try {
                const params =
                    new URLSearchParams(window.location.search);

                const code =
                    params.get("code");

                const codeVerifier =
                    sessionStorage.getItem(
                        "pkce_code_verifier"
                    );

                if (!code || !codeVerifier) {
                    throw new Error(
                        "Missing authorization code or PKCE verifier"
                    );
                }

                const response = await fetch(
                    `http://localhost:8081/auth/social-callback`
                    + `?code=${encodeURIComponent(code)}`
                    + `&codeVerifier=${encodeURIComponent(codeVerifier)}`,
                    {
                        method: "POST"
                    }
                );

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(text);
                }

                const tokens =
                    await response.json();



                saveTokens(tokens);

                const syncResponse = await fetch(
                    "http://localhost:8081/CUSTOMER-SERVICE/customers/me/sync",
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${tokens.access_token}`
                        }
                    }
                );

                if (!syncResponse.ok) {
                    const text = await syncResponse.text();
                    throw new Error(
                        `Customer sync failed: ${syncResponse.status} ${text}`
                    );
                }

                const customer = await syncResponse.json();

                console.log(
                    "SOCIAL CUSTOMER SYNCED:",
                    customer
                );

                console.log({
                    hasAccessToken:
                        !!localStorage.getItem(
                            "novacart-access-token"
                        ),

                    hasRefreshToken:
                        !!localStorage.getItem(
                            "novacart-refresh-token"
                        )
                });

                sessionStorage.removeItem(
                    "pkce_code_verifier"
                );

                window.location.href = "/";



                // temporary for now
                // next we will store access_token
                // exactly the same way your normal login does


            } catch (error) {
                console.error(
                    "SOCIAL LOGIN CALLBACK FAILED:",
                    error
                );
            }
        }

        finishSocialLogin();
    }, []);

    return (
        <div style={{ padding: "40px" }}>
            Signing you in...
        </div>
    );
}