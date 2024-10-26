import React, { useState } from "react";
import { Link } from "react-router-dom";
import './NavBar.css';
import { FaUserCircle } from "react-icons/fa";
import { HiShoppingBag } from "react-icons/hi2";
import { MdAdminPanelSettings } from "react-icons/md";


const NavBar = () => {
    let role = false;
    const user_role = localStorage.getItem('role');
    if(user_role === 'admin'){
        role = true;
    }
    return(
        <div className="container-fluid back">
            <div className="container-xxl">
            <div className="row ms-1 me-1 pt-2 pb-2">
                <div className="col-5">
                    <div className="logo">
                        <img src="/logo__.jpg" alt="Company Logo"/>
                    </div>
                </div>

                <div className="col-5 mt-2">
                    <ul className="nav justify-content-end">
                        <li className="nav-item">
                            <Link className="nav-link navbar" to='/'>HOME</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link navbar" to="products">PRODUCTS</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link navbar" to="about">ABOUT</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link navbar" to='contact'>CONTACT</Link>
                        </li>
                    </ul>
                </div>

                <div className="col-2">
                <ul className="nav justify-content-center">
                        <li className="nav-item">
                            <Link className="nav-link icon" to='/cart'><HiShoppingBag/></Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link icon" to="profile"><FaUserCircle/></Link>
                        </li>
                        {role &&(   
                            <li className="nav-item">
                                    <Link className="nav-link icon" to="admin_panel"><MdAdminPanelSettings/></Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
            </div>
        </div>
    )
}

export default NavBar;