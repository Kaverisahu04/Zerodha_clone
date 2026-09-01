import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {

    const navigate = useNavigate();

    const [inputValue, setInputValue] = useState({
        email: "",
        password: "",
    });


    const handleOnChange = (e) => {
        const { name, value } = e.target;

        setInputValue({
            ...inputValue,
            [name]: value,
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const response = await fetch("http://localhost:3002/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(inputValue),
            });


            const data = await response.json();

            console.log(data.user);


            if(data.success){
                alert("Login Successful");

                // yaha dashboard route dalna
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                window.location.href = `http://localhost:3001/?token=${data.token}`;
                // window.location.href=`http://localhost:3001?username=${encodeURIComponent(data.user.username)}&email=${encodeURIComponent(data.user.email)}`;;
                // window.location.href = "http://localhost:3001";
            }
            else{
                alert(data.message);
            }


        } catch(error){

            console.log(error);
            alert("Something went wrong");

        }

    };


    return (

        <div className="login-container">

            <div className="login-box">

                <h2>Login Account</h2>


                <form onSubmit={handleSubmit}>


                    <div className="login-field">

                        <label>Email</label>

                        <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={inputValue.email}
                        onChange={handleOnChange}
                        required
                        />

                    </div>



                    <div className="login-field">

                        <label>Password</label>

                        <input
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={inputValue.password}
                        onChange={handleOnChange}
                        required
                        />

                    </div>



                    <button type="submit">
                        Login
                    </button>



                    <p>
                    Don't have an account?
                    <Link to="/signup"> Signup</Link>
                    </p>



                </form>


            </div>


        </div>

    );

}

export default Login;