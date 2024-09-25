const express = require('express');
const Routers = express.Router();
const {Regester, Login, Display_user, 
        Update_user, Update_name, Update_password, 
        Delete_user, froget_password, reset_password, 
        Update_profile, Profile_view
        } = require('../Controller/user_Controller.js');
const AuthenticateToken = require('../Middleware/Authenticate.js');

Routers.route('/regester').post(Regester);
Routers.route('/login').post(Login);
Routers.route('/profile_view').get(AuthenticateToken, Profile_view);
Routers.route('/update_name').post(AuthenticateToken, Update_name);
Routers.route('/update_password').post(AuthenticateToken, Update_password);
Routers.route('/update_profile').post(AuthenticateToken, Update_profile);
Routers.route('/forget_password').post(froget_password);
Routers.route('/reset_password/:token').post(reset_password);
//admin routes
Routers.route('/admin/display').get(AuthenticateToken, Display_user);
Routers.route('/admin/update/:id').post(AuthenticateToken, Update_user);
Routers.route('/admin/delete/:id').delete(AuthenticateToken, Delete_user);

module.exports = Routers;