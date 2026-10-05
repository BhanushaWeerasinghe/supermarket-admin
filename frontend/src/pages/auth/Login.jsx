import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";


const Login = () => {

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const navigate = useNavigate();


    const handleLogin = async (e) => {

        e.preventDefault();

        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            navigate("/");

        } catch (error) {

            alert(error.message);

        }

    };


    return (

        <div className="min-h-screen flex items-center justify-center bg-slate-100">


            <form
                onSubmit={handleLogin}
                className="bg-white p-8 rounded-xl shadow-lg w-96"
            >


                <h1 className="text-3xl font-bold mb-6 text-center">
                    Admin Login
                </h1>


                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border p-3 rounded mb-4"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                />


                <input
                    type="password"
                    placeholder="Password"
                    className="w-full border p-3 rounded mb-4"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                />


                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
                >
                    Login
                </button>


            </form>


        </div>

    );

};


export default Login;