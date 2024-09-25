const db = require('../Db_Connection');

//Add cart
const Add_cart = (req, res) => {
    if(req.user.role === 'user' || 'admin'){
        const user_id = req.user.userid;
        const product_id = req.body.product_id;
        const quantity = req.body.quantity;
        db.query('SELECT * FROM cart WHERE cart_items_id = ? AND user_id = ?', [product_id, user_id], (err, result)=>{
            if(err){
                res.json({message: 'error in database', status:false});
            }else{
                if(result.length <= 0){
                    db.query('INSERT INTO cart SET ?' ,{user_id: user_id, cart_items_id: product_id, quantity: quantity}, (err, result) => {
                        if(err){
                            res.json({message: "error in database", status: false});
                        }else{
                            res.json({message: 'product add success', status: true});
                        }
                    });
                }else {
                    db.query("UPDATE cart SET quantity = ? WHERE cart_items_id = ? AND user_id = ?", [ quantity, product_id, user_id], (err, result) => {
                        if(err){
                            res.json({message: "error in database", status: false});
                        }else{
                            res.json({message: 'product add success', status: true});
                        }
                    })
                } 
        }
        })
    }else{
        res.json({message: 'login to add cart', status: false});
    }
}

//Delete cart item
const Delete_cart_item = (req, res) => {
    if(req.user.role === 'user' || 'admin'){
        const cart_id = req.body.cart_id;
        const user_id = req.user.userid;
        db.query('DELETE from cart WHERE id = ?', cart_id, (err, result) => {
            if(err){
                res.json({message: "error in database", status: false});
            }else{
                res.json({message: "cart item deleted", status: true});
            }
        })
    }else{
        res.json({message: 'login to delete the item', status: false});
    }
}


//show cart
const Show_cart = (req, res) => {
    if(req.user.role === 'user' || 'admin'){
        const user_id = req.user.userid;

        db.query('SELECT * FROM cart WHERE user_id = ?', user_id, (err, result)=> {
            if(err){
                res.json({message: "error in database", status: false});
            }else{
                res.json({message: result, status: true})
            }
        })
    }
}

//update cart
const Update_cart = (req, res) => {
    if(req.user.role === 'user' || 'admin'){
        const cart_id = req.cart_id.body;
        const quantity = req.quantity.body;

        db.query('UPDATE cart SET quantity = ? WHERE id = ?', [quantity, cart_id], (err, result) => {
            if(err){
                res.json({message: 'error in database', status: false});
            }else{
                res.json({message: 'updated', status: true});
            }
        })
    }
}

//Create Order
const Create_order = (req, res) => {
    if(req.user.role === 'user' || 'admin'){
        const P_id = req.body.P_id;
        const quantity = req.body.quantity;
        const U_id = req.user.userid;
        const address = req.body.address;
        const amount = req.body.amount;
        const amount_type = req.body.amount_type;
        // res.json({message: P_id, quantity, U_id, address, amount, amount_type})
        db.query('SELECT * FROM orders WHERE user_id = ? AND product_id = ? AND confirm = ?', [U_id, P_id, 'no'], (err, result)=> {
            if(err){
                res.json({message: 'error in database', status: false});
            }else{
                if(result.length !== 0){
                    db.query('UPDATE orders SET ? WHERE user_id = ? AND product_id = ? AND confirm = ? ', [{product_id: P_id, quantity: quantity, user_id: U_id, address: address, total_amount: amount, amount_type: amount_type, confirm: 'no'}, U_id, P_id, 'no'], (err, result) => {
                        if(err){
                            res.json({message: "error in database", status: false});
                            console.log(err);
                        }else{
                            res.json({message: "order created updated", status: true});
                        }
                    })
                    // res.json({message: 'product enterd', status: true})
                }else{
                    db.query('INSERT INTO orders SET ?', {product_id: P_id, quantity: quantity, user_id: U_id, address: address, total_amount: amount, amount_type: amount_type, status: 'pending', confirm: 'no'}, (err, result) => {
                        if(err){
                            res.json({message: "error in database", status: false});
                        }else{
                            res.json({message: "order created", status: true});
                        }
                    })
                }
            }
        })
    }else{
        res.json({message:"login first or token expire", status: false});
    }
}


//delete order
const Delete_order = (req, res) => {
    if(req.user.role === 'user' || 'admin'){
        const u_id = req.user.userid;
        // const p_id = req.body.p_id;
        db.query('DELETE FROM orders WHERE user_id = ? AND confirm = ?', [u_id, 'no'], (err, result)=> {
            if(err){
                res.json({message: "error in database", status: false});
                console.log(err);
            }else{
                res.json({message: 'order deleted', status: true});
            }
        })
    }else{
        res.jsno({message: 'login first or token expire', status: false});
    }
}

//Update order
const Upadte_order_address = (req, res) => {
    if(req.user.role === 'user' || 'admin'){
        const P_id = req.params.P_id;
        const U_id = req.user.userid;
        const address = req.body.address;
        db.query('UPDATE orders SET ? WHERE user_id = ? AND product_id = ?', [{address: address}, U_id, P_id], (err, result) => {
            if(err){
                res.json({message: "error in database", status: false});
            }else{
                res.json({message: "order address updated", status: true});
            }
        })
    }else{
        res.json({message:"login first or token expire", status: false});
    }
}

//Update order
const Upadte_order = (req, res) => {
    if(req.user.role === 'user' || 'admin'){
        const P_id = req.body.P_id;
        const quantity = req.body.quantity;
        const U_id = req.user.userid;
        const address = req.body.address;
        const amount = req.body.amount;
        const amount_type = req.body.amount_type;

        db.query('UPDATE orders SET ? WHERE user_id = ? AND product_id = ? ', [{product_id: P_id, quantity: quantity, user_id: U_id, address: address, total_amount: amount, amount_type: amount_type, confirm: 'yes'}, {U_id, P_id}], (err, result) => {
            if(err){
                res.json({message: "error in database", status: false});
            }else{
                res.json({message: "order created", status: true});
            }
        })
    }else{
        res.json({message:"login first or token expire", status: false});
    }
}

//show not confirm order
const Show_not_confirm_order = (req, res) => {
    if(req.user.role === 'user' || 'admin'){
        db.query('SELECT * FROM orders WHERE user_id = ? AND confirm = "no"', [req.user.userid], (err, result) => {
            if(err){console.log(err);
                res.json({message: 'error in databasae'});
            }else{
                res.json({message: result});
            }
        })
    }else{
        res.json({message:"login first or token expire"});
    }
}

//show order
const Show_Order = (req, res) => {
    if(req.user.role === 'user' || 'admin'){
        db.query('SELECT * FROM orders WHERE user_id = ? AND confirm = ?', [req.user.userid, 'yes'], (err, result) => {
            if(err){
                res.json({message: "error in database"});
            }else{
                res.json({message: result});
            }
        })
    }else{
        res.json({message:"login first or token expire"});
    }
}

//Adimin

//Show all orders
const All_order = (req, res) => {
    if(req.user.role === 'admin'){
        db.query('SELECT * FROM orders', (err, result)=> {
            if(err){
                res.json({message: 'error in database'});
            }else{
                res.json({message: result});
            }
        })
    }else{
        res.json({message: "Admin route Only admin can access this route"})
    }
}
//update order status
const Order_Status = (req, res) => {
    if(req.user.role === 'admin'){
        const Order_id = req.params.Order_id;
        const status = req.body.status;
        db.query('UPDATE orders SET ? WHERE id = ?', [{status: status}, Order_id], (err, result)=> {
            if(err){
                res.json({message: 'error in database'});
            }else{
                res.json({message: 'order status updated success'});
                if(status === 'Shipped'){
                    sales(Order_id);
                }
            }
        })
    }else{
        res.json({message: "Admin route Only admin can access this route"})
    }
}

//sales
const sales =(O_id) => {
    db.query('SELECT * FROM orders WHERE id = ?',[O_id], (err, result) => {
        if(err){
            console.log('error in database');
        }else{
            db.query('INSERT INTO salse SET ?', {order_id: result[0], amount: result[4]}, (err, result)=> {
                if(err){
                    console.log('error in database');
                }
            })
        }
    })
}

module.exports = {Add_cart, Show_cart, Delete_cart_item, Update_cart, Create_order, Delete_order, Show_not_confirm_order, Show_Order,Upadte_order_address, Upadte_order, All_order, Order_Status};