import axios from "axios";
import React, { useEffect, useState } from "react";
import './Order.css';

const Orders = () => {
    const token = localStorage.getItem('token');
    const [combination, setCombination] = useState([]);
    const [productDetails, setProductDetails] = useState([]);
    const [order_details, setOrder_details] = useState([]);
    const orders_detail = async() => {
        const response = await axios.get('http://localhost:4000/orders/orders',{
            headers:{
                Authorization: token,
            }
        })
        setOrder_details(response.data.message);
    }

    
    useEffect(() => {

        const product = async() => {
          if (order_details.length > 0) {
            try {
              const responses = await Promise.all(
                order_details.map(e =>
                  axios.get(`http://localhost:4000/product/display/${e.product_id}`, {
                    headers: {
                      Authorization: token,
                    },
                  })
                )
              );
          
              const featch_product = responses.map(response => response.data.message);
              setProductDetails(featch_product);
              
              // Now you can work with productDetails here.
            } catch (err) {
              console.log('Error fetching product details', err);
            }
          }
        }
        product();
  
      }, [order_details]);
    
    useEffect( () => {
        orders_detail();
    },[])
    useEffect( () => {
        combinationData();
    },[order_details, productDetails])
    const combinationData = () => {
        if (order_details.length > 0 && productDetails.length > 0) {
          const combinedData = order_details.map(order => {
            const product = productDetails.find(product => product.id === parseInt(order.product_id));
      
            if (product) {
              return {
                ...product,
                order_id: order.order_id,
                order_date: order.order_date,
                order_quantity: order.quantity,
                order_address: order.address,
                order_total_amount: order.total_amount,
                order_status: order.status,
                order_payment_id: order.payment_id,
                order_amount_type: order.amount_type
              };
            }
      
            // Optionally, return only order details if product is not found
            return {
              order_id: order.id,
              order_date: order.order_date,
              order_quantity: order.quantity,
              order_user_id: order.user_id,
              order_address: order.address,
              order_total_amount: order.total_amount,
              product: null, // Indicate no product found
            };
          });
          setCombination(combinedData);
        }
      };
      console.log(combination);
    return(
        <div className="container-xl">
            <h2>My Orders</h2>

            <div>
                        <div className="order_table_div mt-5">
                          <table className="order_table table table-hover">
                            <thead>
                                <tr className="cart_thead_tr table_thead">
                                    <th className="cart_thead_product">Order ID</th>
                                    <th className="cart_thead_product">Date</th>
                                    <th colSpan='2' className="cart_thead_category">Product</th>
                                    <th className="cart_thead_quantity">Quantity</th>
                                    <th className="cart_thead_delete_button">Address</th>
                                    <th  className="cart_thead_total">Status</th>
                                    <th className="cart_thead_total">Amount</th>
                                    <th className="cart_thead_total">Payment Type</th>
                                    <th className="cart_thead_total">Payment ID</th>
                                </tr>
                            </thead>

                            <tbody>
                              {combination.map((e, index) =>(
                                <tr key={index} className="table_tbody">
                                  <td><div className="table-td">{e.order_id}</div></td>
                                  <td><div className="table-td">{e.order_date}</div></td>
                                  <td><div className="table-td"><img src={e.image1} alt="Image" width="50px" height="50px" /></div></td>
                                  <td><div className="table-td">{e.name}</div></td>
                                  <td><div className="table-td">{e.order_quantity}</div></td>
                                  <td><div className="table-td">{e.order_address}</div></td>
                                  <td><div className={`table-td ${e.order_status === 'pending' ? 'pending' : 'confirm'}`}><b>{e.order_status}</b></div></td>
                                  <td><div className="table-td">{e.order_total_amount}</div></td>
                                  <td><div className="table-td">{e.order_amount_type}</div></td>
                                  <td><div className="table-td">{e.order_payment_id}</div></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
        </div>
    )
}

export default Orders;