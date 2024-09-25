import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import "./Profile.css";
import Loading from'../Loader/Loader';
import {jwtDecode}  from 'jwt-decode';

axios.defaults.withCredentials = true;

const Profile = () => {
    const [loading, setLoading] = useState(false);
    const [toggleProfilepic, setToggleProfilepic] = useState(false);
    const [toggleProfileName, setToggleProfileName] = useState(false);
    const [toggleProfilePassword, setToggleProfilePassword] = useState(false);
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const token = localStorage.getItem('token');
    const dispatch = useDispatch();
    let status = [];
    useEffect(() => {
        const fetchData = async () => {
            if(token === '0'){
                navigate('/login');
                console.log('login first');
            }else{
                try {
                    const response = await axios.get('http://localhost:4000/user/profile_view', {
                        headers: {
                            Authorization: token
                        }
                    });
                    const decodedToken = jwtDecode (token);
                    const expireOrNot = decodedToken.exp > Date.now() / 1000;
                    if(expireOrNot){
                        dispatch({
                            type: 'userRole',
                            payload: response.data.role,
                        })
                    }else{
                        dispatch({
                            type: 'userRole',
                            payload: 'user',
                        })
                    }
                    localStorage.setItem('username',response.data.name);
                    setData(response.data);
                    status = response.data;
                    if(status.status === false){
                        const result = window.confirm('Token Expire \n Login Again');
                        if(result){
                            dispatch({
                                type: 'userRole',
                                payload: 'user',
                            })
                            navigate('/login');
                            localStorage.setItem('token', '0')
                        }else{
                            window.location.reload();
                            localStorage.setItem('token', '0')
                        }
                    }
                    console.log(status.status);
                } catch (error) {
                    console.error('Error fetching data:', error);
                        const result = window.confirm('Token Expire \n Login Again');
                        if(result){
                            dispatch({
                                type: 'userRole',
                                payload: 'user',
                            })
                            navigate('/login');
                            localStorage.setItem('token', '0')
                        }else{
                            window.location.reload();
                            localStorage.setItem('token', '0')
                        }
                }
            }
            console.log(data);
        };
        fetchData();
    }, [token, navigate, dispatch]);
    const logout = ()=>{
        localStorage.setItem('token','0');
        localStorage.setItem('role','user');
        localStorage.setItem('username','');

        window.location.reload();
    }
//profile Pic
    const [image, setImage] = useState(null);
    const Profilepic = ()=> {
        setToggleProfilepic(!toggleProfilepic);
    };
    const onchangeimg = (e) => {
        setImage(e.target.files[0]);
    }
    const changeProfilepic = async(e)=> {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append('image', image);
        try{
            const response = await axios.post('http://localhost:4000/user/update_profile', formData, {
                headers: {
                    Authorization: token,
                    'Content-Type': 'multipart/form-data'
                }
            })
        console.log('File uploaded successfully:', response.data);
        }catch(err){
            console.log(err);
            setLoading(false);
        }finally{
            setLoading(false);
            window.location.reload();
        }        
    }
//profile Name
    const [name, setName] = useState(null);
    const profileName = () => {
    setToggleProfileName(!toggleProfileName);
    }
    const onchangename = (e) => {
        setName((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
    const changeProfilename = async(e) => {
        setLoading(true);
        e.preventDefault();
        let response = '';
        try{
                response = await axios.post('http://localhost:4000/user/update_name',name, {
                headers:{
                    Authorization: token,
                }
            })
        }catch(err){
            console.log("error updating name", err);
        }finally{
            setLoading(false);
            window.location.reload();
            console.log('User Name updated', response.data);
        }
   }
   //profile password
   const [value, setValue] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
    });
    const profilePassword = () => {
        setToggleProfilePassword(!toggleProfilePassword);
    }
    const onchangepassword = (e) => {
        setValue((prev) => ({...prev, [e.target.name]: e.target.value}))
    }
    const changeProfilepassword = async(e) => {
        e.preventDefault();
        let response = '';
        try{
            response = await axios.post('http://localhost:4000/user/update_password',value,{
                headers:{
                    Authorization: token,
                }
            })
            if(!response.data.status){
                alert(response.data.message);
                return;
            }
        }catch(err){
            console.log(err);
        }finally{
            alert(response.data.message);
            console.log(response.data);
            if(response.data.status === true){
                window.location.reload();
            }
        }
    }

    return (
        <div>
            {data ?( 
            <div className='container-fluid background'>
                <div className='inner-background'>
                    <div className='row'>
                        <div className='col-6'>
                            <div className='profile-outerdiv'>
                            <div className='profile-pic'>
                                <img src={data.profile} alt='Profile Pic'/>
                            </div>
                            </div>
                            <div className='profile-div'>
                                <button  className="btn" onClick={Profilepic}>Change profile pic</button>
                            </div>
                            <div className='profile-div'>
                                <h3>Role-: {data.role}</h3>
                            </div>
                            <div className='profile-div'>
                                <button  className="btn" onClick={profilePassword}>Update Password</button>
                            </div>
                        </div>
                        <div className='col-6'>
                            <div className='profile-outerdiv'>
                                <h1>{data.name}</h1>
                            </div>
                            <div className='profile-div'>
                                <button  className="btn" onClick={profileName}>Change Name</button>
                            </div>
                            <div className='profile-div'>
                                <h2>Email-: {data.email}</h2>
                            </div>
                            <div className='profile-div'>
                                <button  className="btn" onClick={logout}>Logout</button>
                            </div>
                        </div>
                    </div>
                    <div className='orders'>
                        <button className="btn" ><Link to='/orders'>My Orders</Link></button>  
                    </div>

                    {toggleProfilepic && (
                    <div className='box'>
                        {loading ? (
                            <Loading/>
                        ):(
                            <div className='inner-box'>
                            <form onSubmit={changeProfilepic}>
                                <input
                                    type="file"
                                    name="image"
                                    onChange={onchangeimg}
                                />
                                <button className="btn" >Submit</button>
                            </form>
                            </div>
                        )}
                    </div>
                    )}
                    {toggleProfileName && (
                    <div className='box'>
                        {loading ? (
                            <Loading/>
                        ):(
                            <div className='inner-box'>
                            <form onSubmit={changeProfilename}>
                                <h3>Name:-</h3>
                                <input
                                    type="text"
                                    name="name"
                                    onChange={onchangename}
                                />
                                <button className="btn" >Submit</button>
                            </form>
                            </div>
                        )}
                    </div>
                    )}
                    {toggleProfilePassword && (
                    <div className='box'>
                        {loading ? (
                            <Loading/>
                        ):(
                            <div className='inner-box'>
                            <form onSubmit={changeProfilepassword}>
                                <h4>Old Password:-</h4>
                                <input
                                    type="password"
                                    name="oldPassword"
                                    onChange={onchangepassword}
                                />
                                <h4>New Password</h4>
                                <input
                                    type="password"
                                    name="newPassword"
                                    onChange={onchangepassword}
                                />
                                <h4>Confirm Password</h4>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    onChange={onchangepassword}
                                />
                                <button className="btn" >Submit</button>
                            </form>
                            </div>
                        )}
                    </div>
                    )}
                </div>
            </div>
            ):(
                <Loading/>
            )}  
        </div>
    );
};

export default Profile;
