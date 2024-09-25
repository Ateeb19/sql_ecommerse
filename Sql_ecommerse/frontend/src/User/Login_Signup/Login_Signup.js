import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import './Login_Signup.css'

axios.defaults.withCredentials = true;

const Login_Signup = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    axios.defaults.withCredentials = true;

    const [type, setType] = useState("signIn");
    const handleOnClick = text => {
        if (text !== type) {
            setType(text);
            return;
        }
    };
    const mainClass = "containerSign " + (type === "signUp" ? "right-panel-active" : "");
    //Signin
    const [state, setState] = React.useState({
        email: "",
        password: ""
    });

    const handleChange = (evt) => {
        const value = evt.target.value;
        setState({
            ...state,
            [evt.target.name]: value
        });
    };

    const handleOnSubmit = async(e) => {
        e.preventDefault();
        let result = '';
        try{
            result = await axios.post('http://localhost:4000/user/login', state)
            if(!result.data.status){
                alert(result.data.message);
                return;
            }
                console.log(result.data.message);
                const token = result.data.token;
                dispatch({
                    type: 'setToken',
                    payload: token,
                })
            }catch(err){
                console.log(err);
            }finally{
                if(result.data.status === true){
                    navigate('/profile');
                }
                console.log(result.data)
            }
        for (const key in state) {
            setState({
                ...state,
                [key]: ""
            });
        }
    };
    //Signup
    const [image, setImage] = useState(null);

    const [value, setValue] = useState({
        name: '',
        email: '',
        password: '',
        confirmpassword: '',
    })
    const handleimage = (e) => {
        setImage(e.target.files[0])
    }
    const handleChange_up = (e) => {
        setValue(prev => ({ ...prev, [e.target.name]: e.target.value }));

    };

    const handleOnSubmit_up = async (evt) => {
        evt.preventDefault();
        const formData = new FormData();
        formData.append('value', JSON.stringify(value));
        formData.append('image', image);
        let response = '';
        try{
            response = await axios.post('http://localhost:4000/user/regester', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            if(!response.data.status){
                alert(response.data.message);
                return
            }
            console.log(response.data);
                const token = response.data.token;
                dispatch({
                    type: 'setToken',
                    payload: token,
                })
        }catch(err){
            console.log(err);
        }finally{
            navigate('/profile');
        }
    };
    return (
        <div>
            <div className="App01">
                <div className={mainClass} id="containerSign">

                    {/* signup */}
                    <div className="form-containerSign sign-up-containerSign">
                        <form onSubmit={handleOnSubmit_up}>
                            <h1>Create Account</h1>
                            <span className = "Span_">or use your email for registration</span>
                            <input
                                type="text"

                                onChange={handleChange_up}
                                placeholder="Name"
                                name="name"
                            />
                            <input
                                type="email"

                                onChange={handleChange_up}
                                placeholder="Email"
                                name="email"
                            />
                            <input
                                type="password"

                                onChange={handleChange_up}
                                placeholder="Password"
                                name="password"
                            />
                            <input
                                type="password"

                                onChange={handleChange_up}
                                placeholder="Confirm Password"
                                name="confirmpassword"
                            />
                            <input
                                type="file"

                                onChange={handleimage}
                                name="image"
                            />
                            <button className="btn">Sign Up</button>
                        </form>
                    </div>

                    {/* Signin */}
                    <div className="form-containerSign sign-in-containerSign">
                        <form onSubmit={handleOnSubmit}>
                            <h1>Sign in</h1>
                            <span className = "Span_">or use your account</span>
                            <input
                                type="email"
                                placeholder="Email"
                                name="email"
                                value={state.email}
                                onChange={handleChange}
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={state.password}
                                onChange={handleChange}
                            />
                            <a href="/profile">Forgot your password?</a>
                            <button className="btn">Sign In</button>
                        </form>
                    </div>
                    <div className="overlay-containerSign">
                        <div className="overlay">
                            <div className="overlay-panel overlay-left">
                                <h1>Welcome Back!</h1>
                                <p>
                                    To keep connected with us please login with your personal info
                                </p>
                                <button
                                    className="ghost btn"
                                    id="signIn"
                                    onClick={() => handleOnClick("signIn")}
                                >
                                    Sign In
                                </button>
                            </div>
                            <div className="overlay-panel overlay-right">
                                <h1>Hello, Friend!</h1>
                                <p>Enter your personal details and start journey with us</p>
                                <button
                                    className="ghost btn"
                                    id="signUp"
                                    onClick={() => handleOnClick("signUp")}
                                >
                                    Sign Up
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login_Signup;
