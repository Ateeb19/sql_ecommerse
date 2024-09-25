const express = require('express');
const Router = express.Router();
const AuthenticateToken = require('../Middleware/Authenticate.js');
const {Create_product, Update_product, Delete_product, Dispaly_product, Review, Update_review, Display_particulatr_product, Display_review, Categories, HomeProducts} = require('../Controller/Product_Controller.js');

Router.route('/display').get(Dispaly_product);
Router.route('/category').get(Categories);
Router.route('/home_display').get(HomeProducts);
Router.route('/display/:p_id').get(Display_particulatr_product);
Router.route('/review_display/:p_id').get(Display_review);
Router.route('/review/:p_id').post(AuthenticateToken, Review);
Router.route('/review/update/:p_id').put(AuthenticateToken, Update_review);
//admin routes
Router.route('/admin/create').post(AuthenticateToken, Create_product);
Router.route('/admin/update/:id').put(AuthenticateToken, Update_product);
Router.route('/admin/delete/:id').delete(AuthenticateToken, Delete_product);

module.exports = Router;