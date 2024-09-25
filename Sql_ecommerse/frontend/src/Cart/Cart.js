import axios from "axios";
import React, { useEffect, useState } from "react";
import Loader from "../Loader/Loader";
import { Link, useNavigate } from "react-router-dom";
import './Cart.css';


const Cart = () => {
    const [cartitem, setCartitem] = useState([]);
    const [items_id, setItems_id] = useState([]);
    const [product_details, setProduct_details] = useState([]);
    const [combination, setCombination] = useState([]);
    const [cartinfo, setCartinfo] = useState(false);
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const cart_data = async() =>{
        const response = await axios.get('http://localhost:4000/orders/showcart', {
            headers: {
                Authorization: token
            }
        })
        if(response.data.message.length <= 0){
            setCartinfo(true);
        }
        setCartitem(response.data.message);

        if(response.data.status === true){
            const ids = response.data.message.map((items) => items.cart_items_id);
            setItems_id(ids);
        }else{
            navigate('/login');
            alert(`Token expire \nLogin First!`);
        }
    }
    const featch_cart_product = async(ids) => {
        try{
            const productreq = ids.map(id =>
                axios.get(`http://localhost:4000/product/display/${id}`)
            );

            const productres = await Promise.all(productreq);
            const product = productres.map(res=> res.data.message);
            setProduct_details(product);
        }catch(err){
            console.log('error featching data',err);
        }
    }

    const combiantion_cart_product = () => {
        if(cartitem.length > 0 && product_details.length > 0){
            const combinedData = cartitem.map(cart_item => {
                const product = product_details.find(product => product.id === parseInt(cart_item.cart_items_id));
                return {
                    ...product,
                    cart_id: cart_item.id,
                    user_id: cart_item.user_id,
                    cart_quantity: cart_item.quantity,
                    cart_item_id: cart_item.cart_items_id
                };
            });
            setCombination(combinedData);
        }
    };
    useEffect( () => {
        cart_data();
    }, []);

    useEffect( () => {
        if(items_id.length > 0){
            featch_cart_product(items_id);
        }
    }, [items_id]);

    useEffect( ()=> {
        combiantion_cart_product()
    }, [cartitem, product_details])
    // console.log('item id',items_id);
    // console.log('cart info',cartitem);
    // console.log('product info',product_details);
    // console.log('product info',combination);

   
    const qnt_decrement = (cart_item_id) => {
        setCombination(prevCombination =>
            prevCombination.map(item => {
                const quantity = parseInt(item.cart_quantity, 10); // Convert to integer
                return item.cart_id === cart_item_id && quantity > 1
                    ? { ...item, cart_quantity: quantity - 1} 
                    : item;
            })
        );
    };
    
    const qnt_increment = (cart_item_id) => {
        setCombination(prevCombination =>
            prevCombination.map(item => {
                const quantity = parseInt(item.cart_quantity, 10); // Convert to integer
                return item.cart_id === cart_item_id && quantity < item.quantity
                    ? { ...item, cart_quantity: quantity + 1 }
                    : item;
            })
        );
    };
    let subtotal = [];
    const handleTotal = (total) => {
        subtotal.push(total);
    }

    const handle_remove_cart = async (cart_id) => {
        try{
            const response = await axios.post(
                'http://localhost:4000/orders/delete_cart_item',{ cart_id }, 
                {
                    headers: {
                        Authorization: token,
                        'Content-Type': 'application/json'
                    }
                }
            );
        if(response.data.status === true){
            window.location.reload();
        }
        }catch(err){
            console.log('error featching data',err);
        }
    }

    const changeqnt_increment = async (cart_id, quantity, item_qnt, p_id) => {
        if(quantity !== item_qnt){
            quantity = quantity+1;
        }
        try{
            const response = await axios.post('http://localhost:4000/orders/addcart',{
                    product_id: p_id,
                    quantity: quantity
                },{
                headers: {
                    Authorization: token,
                    'Content-Type': 'application/json',
                }   
            });
            console.log(response.data);
        }catch(err){
            console.log(err);
        }
    }
    const changeqnt_decrement = async (cart_id, quantity, p_id) => {

        if(quantity !== 1){
            quantity = quantity-1;
        }
        try{
            const response = await axios.post('http://localhost:4000/orders/addcart',{
                    product_id: p_id,
                    quantity: quantity
                },{
                headers: {
                    Authorization: token,
                    'Content-Type': 'application/json',
                }   
            });
            console.log(response.data);
        }catch(err){
            console.log(err);
        }
    }

    const handle_order_now = async () => {

        try{
            const order_delete = await axios.get('http://localhost:4000/orders/delete_order',
                {
                headers: {
                    Authorization: token,
                }
            })
            console.log('delete',order_delete.data);

            
        }catch(err){
            console.log(err);
        }finally{
            combination.forEach(async (item) => {
                try{
                    const response = await axios.post('http://localhost:4000/orders/create_order',{
                        P_id : item.id ,
                        quantity : item.cart_quantity ,
                        address : '' ,
                        amount : parseInt(item.cart_quantity) * parseInt(item.price) ,
                        amount_type : '' ,
                    },{
                        headers: {
                            Authorization: token,
                            'Content-Type': 'application/json',
                        }
                    });
                    console.log('create',response.data);
                }catch(err){
                    console.log(err);
                }   
            });
            combination.forEach((item , i)=>{
                localStorage.setItem(`cart${i}`, item.id);
            })
            localStorage.setItem('cartlength',combination.length);
            navigate('/confirm_orders');
        }
        // console.log('Processing order for:', item);
    }
    return(
        <div>
        {cartinfo? (
            <div className="empty-cart mt-5">
                Cart is empity! <br/>
                <Link to='/products'>Click to Add some products</Link>
            </div>
        ):(         
            <div className="cart_outter_div mt-5">
                <h1>Shoping Cart</h1>
                <div className="table_div mt-5">
                    <table className="cart_table table table-hover">
                        <thead>
                            <tr className="cart_thead_tr">
                                <th colSpan="2" className="cart_thead_product">Products</th>
                                <th className="cart_thead_category">Category</th>
                                <th className="cart_thead_price">Price</th>
                                <th className="cart_thead_quantity">Quantity</th>
                                <th className="cart_thead_delete_button"></th>
                                <th className="cart_thead_total">Total</th>
                            </tr>
                        </thead>

                        <tbody>
                            {combination.map((item,index) => (
                                <tr key={index}>
                                    <td><img src={item.image1} width = {'70px'} height={'80px'} alt="image"/></td>
                                    <td><div className="table-td">{item.name}</div></td>
                                    <td><div className="table-td">{item.category}</div></td>
                                    <td><div className="table-td">{item.price}</div></td>
                                    <td><div className="table-td"><button className="btn cart_btn" onClick={() => {qnt_decrement(item.cart_id); changeqnt_decrement(item.cart_id, parseInt(item.cart_quantity), item.id);}}>-</button>{item.cart_quantity}<button className="btn cart_btn" onClick={() => {qnt_increment(item.cart_id); changeqnt_increment(item.cart_id, parseInt(item.cart_quantity), parseInt(item.quantity), item.id);}}>+</button></div></td>
                                    <td><div className="table-td"><button className="btn cart_remove_btn" onClick={() => {handle_remove_cart(item.cart_id)}}>Remove</button></div></td>
                                    <td><div className="table-td">{(() => {const total = (parseInt(item.cart_quantity) || 0) * (parseInt(item.price) || 0);
                                    handleTotal(total);
                                    return total;})()}</div></td>
                                </tr>
                            ))}

                        </tbody>
                        
                        <tfoot className="cart_tfoot_tr">
                            <tr>
                                <td colSpan='6'>SubTotal</td>
                                <td>{subtotal.reduce((acc, curr) => acc + curr, 0)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <button className="btn" onClick={() => {
                    // delete_order();
                    // combination.forEach(item => {
                        handle_order_now();
                    // });
                    }}>Order Now</button>
            </div>
            
        )}
        </div>
    )
};


export default Cart;