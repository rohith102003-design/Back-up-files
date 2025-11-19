import React from "react";
import "./login.css";

function Login(){
    return (
        <div className="login-container">
            <h2>Login To AI Assistant</h2>

            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />

            <button>LogIn</button>
        </div>
    );
    
}

export default Login;