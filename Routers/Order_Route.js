const express = require('express');
const Routers = express.Router();
const AuthenticateToken = require('../Middleware/Authenticate.js');
const {Create_order, All_order, Order_Status, Add_cart, Show_cart, Delete_cart_item, Update_cart, Show_Order, Upadte_order, Delete_order, Show_not_confirm_order, Upadte_order_address} = require('../Controller/Order_Controller.js');
const { Razorpay_api, Success, COD } = require('../Controller/Razorpay.js');

Routers.route('/addcart').post(AuthenticateToken, Add_cart);
Routers.route('/showcart').get(AuthenticateToken, Show_cart);
Routers.route('/delete_cart_item').post(AuthenticateToken, Delete_cart_item);
Routers.route('/update_cart').post(AuthenticateToken, Update_cart);
Routers.route('/create_order').post(AuthenticateToken, Create_order);
Routers.route('/update_order').post(AuthenticateToken, Upadte_order);
Routers.route('/update_order_address/:P_id').post(AuthenticateToken, Upadte_order_address);
Routers.route('/delete_order').get(AuthenticateToken, Delete_order);
Routers.route('/not_confirm_order').get(AuthenticateToken, Show_not_confirm_order);
Routers.route('/orders').get(AuthenticateToken, Show_Order);

//paymet
Routers.route('/cod').post(AuthenticateToken,COD);
Routers.route('/razor_pay').post(Razorpay_api);
Routers.route('/razor_pay_success').post(AuthenticateToken,Success);
//Admin
Routers.route('/admin/all_order').get(AuthenticateToken, All_order);
Routers.route('/admin/update_status').post(AuthenticateToken, Order_Status);

module.exports = Routers;
