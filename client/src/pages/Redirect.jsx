import { useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/vars";

export function Redirect() {
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (!token) {
            console.error("Token not found in URL");
            window.location.href = "http://localhost:5173/signup";
            return;
        }

        localStorage.setItem("token", token);
        console.log("Token:", token);

        async function checkUserExists() {
            try {
                const res = await axios.get(`${BASE_URL}/api/v1/user/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.data.user) {
                    window.location.href = "http://localhost:5173/dashboard";
                } else {
                    window.location.href = "http://localhost:5173/signup";
                }
            } catch (error) {
                console.error("Error verifying user:", error);
                window.location.href = "http://localhost:5173/signup";
            }
        }

        checkUserExists();
    }, []);

    return (
        <div className="flex justify-center items-center h-screen">
            <h1 className="text-2xl font-bold">Redirecting...</h1>
        </div>
    );
}
