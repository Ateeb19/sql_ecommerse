import React from "react";
import { useNavigate } from "react-router-dom";

const Admin_panel = () => {

    const user_role = localStorage.getItem('role');
    const navigate = useNavigate();
    if(user_role !== 'admin'){
        navigate('/profile');
        alert('Only admin can access');
    }
    return(
        <div>
            Admin_panel
        </div>
    )
}

export default Admin_panel;