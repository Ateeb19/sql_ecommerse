import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from "./Header/NavBar.js";
import Login_Signup from './User/Login_Signup/Login_Signup.js';
import Profile from './User/Profile.js';
import Products from './Product/Products.js';
import Admin_Products from "./Admin/Admin_Products.js";
import Home from "./Home.js";
import Product_detail from './Product/Product_detail.js'
import Cart from "./Cart/Cart.js";
import Confirm_order from "./Order/Confirm_order.js";
import Orders from "./Order/Orders.js";
import Admin_panel from "./Admin/Admin_panel.js";

const App = () => {
  return (
    <div className="">
      <BrowserRouter>
      <NavBar/>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<Login_Signup/>} />
          <Route path="/profile" element={<Profile/>} />
          <Route path="/products" element={<Products/>}/>
          <Route path="/product_detail" element={<Product_detail/>}/>
          <Route path="/cart" element={<Cart/>}/>
          <Route path="/confirm_orders" element={<Confirm_order/>}/>
          <Route path="/orders" element={<Orders/>}/>
          <Route path="/admin_panel" element={<Admin_panel/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
