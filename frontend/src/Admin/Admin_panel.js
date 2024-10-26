import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { unstable_useViewTransitionState, useNavigate } from 'react-router-dom';
import Loading from '../Loader/Loader'
import "./Admin_panel.css";
import { RxDashboard } from "react-icons/rx";
import { TbBrandProducthunt, TbLayoutGridAdd } from "react-icons/tb";
import { FaUsers } from "react-icons/fa6";
import { BsBoxSeamFill } from "react-icons/bs";
import { MdPayment } from "react-icons/md";


const Admin_panel = () => {

    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    useEffect(() => {
        if (role === 'user') {
            navigate('/');
            alert('Only admin can access');
            axios.defaults.withCredentials = false;
        }
    }, [role])
    const [item_value, setItem_value] = useState('dashbord');


    //orders
    const [isOpen, setIsOpen] = useState(false);
    const [isStatus, setIsStatus] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderStatusUpdated, setOrderStatusUpdated] = useState(null);


    const [orders, setOrders] = useState([]);
    const ordersdetails = async () => {
        try {
            const response = await axios.get('http://localhost:4000/orders/admin/all_order', {
                headers: {
                    Authorization: token,
                }
            })
            // console.log(response.data.message);
            if (response.data.message === 'token expire or invalid token') {
                navigate('/profile');
                alert('token expire ! LOGIN');
            }
            setOrders(response.data.message);
            setOrderLoading(false);
        } catch (err) {
            console.log("error featching orders", err);
            setOrderLoading(true);
        }
    }
    const openDialog = (orderid) => {
        setIsOpen(true);
        setSelectedOrderId(orderid);
    }
    const closeDialog = () => {
        setIsOpen(false);
        setIsStatus(false);
        ordersdetails();
        setSelectedOrderId(null);
    }

    const changeStatus = async () => {
        console.log(selectedOrderId, 'order id');
        const data = { Order_id: selectedOrderId }
        try{
            const response = await axios.post('http://localhost:4000/orders/admin/update_status', data,{
                headers: {
                    Authorization: token,
                    'Content-Type': 'application/json'
                }
            })
                setIsStatus(true);
                setOrderStatusUpdated(response.data.message);
            console.log(response.data.message);
        }catch(err){
            console.log(err,'error in chaging status');
        }
        setIsOpen(false);
    }
    useEffect(() => {
        ordersdetails();
    }, []);

    //add products
    const [loading, setLoading] = useState(false);

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [value, setValue] = useState({
        name: '',
        category: '',
        price: '',
        quantity: '',
        description: '',
    });
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 10) {
            alert('You can only add 10 images in the field and the rest of the images will not being able to uploade');
            setSelectedFiles([null]);
            return;
        } else
            setSelectedFiles(files);
    };

    const handleChange = (e) => {
        setValue((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    axios.defaults.withCredentials = true;

    const handleSumbit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (selectedFiles[0] === null) {
            alert('Select only 10 images or less than 10 images');
            return;
        }
        const formData = new FormData();
        formData.append('value', JSON.stringify(value));
        selectedFiles.forEach((file, index) => {
            formData.append('images', file);
        });
        try {
            const response = await axios.post('http://localhost:4000/product/admin/create', formData, {
                headers: {
                    Authorization: token,
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('Upload response:', response.data);
            alert(response.data.message);
            window.location.reload();
        } catch (error) {
            console.error('Error uploading images:', error);
        }
    }
    return (
        <div>
            <div className="row outter-div">
                <div className="col-2 side-bar">
                    <h2 className="mt-4 mb-4">Quick Shop</h2>
                    <div className="row">
                        <div className="col-5 dashbord-icon">
                            <div className="list-item" onClick={(e) => { setItem_value('dashbord') }}><div className="icons"><RxDashboard /></div> <h4>Dashbord</h4></div>
                            <div className="list-item" onClick={(e) => { setItem_value('products') }}><div className="icons"><TbBrandProducthunt /></div> <h4>Products</h4></div>
                            <div className="list-item" onClick={(e) => { setItem_value('users') }}><div className="icons"><FaUsers /></div> <h4>Users</h4></div>
                            <div className="list-item" onClick={(e) => { setItem_value('payments') }}><div className="icons"><MdPayment /></div> <h4>payments</h4></div>
                            <div className="list-item" onClick={(e) => { setItem_value('orders') }}><div className="icons"><BsBoxSeamFill /></div> <h4>Orders</h4></div>
                            <div className="list-item" onClick={(e) => { setItem_value('add_product') }}><div className="icons"><TbLayoutGridAdd /></div> <h4>Add Product</h4></div>
                        </div>
                    </div>
                </div>
                <div className="col-10 p-0">

                    {item_value === 'dashbord' ? (
                        <div>
                            <h1>dashbord</h1>
                        </div>
                    ) : item_value === 'products' ? (
                        <div>
                            <h1>products</h1>
                        </div>
                    ) : item_value === 'users' ? (
                        <div>
                            <h1>users</h1>
                        </div>
                    ) : item_value === 'payments' ? (
                        <div>
                            <h1>payments</h1>
                        </div>
                    ) : item_value === 'orders' ? (
                        <div>
                            <h1 className='ms-2'>Orders</h1>
                            {orderLoading ? (
                                <Loading />
                            ) : (
                                <table className='table order_table table-hover'>
                                    <thead className='cart_thead_tr table_thead'>
                                        <tr>
                                            <td>Order id</td>
                                            <td>User id</td>
                                            <td>Order date</td>
                                            <td>Product id</td>
                                            <td>Quantity</td>
                                            <td>Amount type</td>
                                            <td>Payment id</td>
                                            <td>Status</td>
                                            <td>Address</td>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {orders.map((item, index) => (
                                            <tr key={index} className='table_tbody'>
                                                <td>{item.order_id}</td>
                                                <td>{item.user_id}</td>
                                                <td>{item.order_date}</td>
                                                <td>{item.product_id}</td>
                                                <td>{item.quantity}</td>
                                                <td>{item.amount_type}</td>
                                                <td>{item.payment_id}</td>
                                                <td className={item.status === 'pending' ? 'pending' : 'confirm'} onClick={() => item.status === 'pending' && openDialog(item.order_id)}>{item.status}
                                                </td>
                                                <td>{item.address}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                            )}
                            {isOpen && (
                                <div className="order-overlay" onClick={closeDialog}>
                                    <div
                                        className="order-dialog"
                                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                                    >
                                        <h2>Status</h2>
                                        <h4>Set the status Confirm</h4><br></br>
                                        <button onClick={changeStatus} className='btn order-status-btn'>Ok</button>

                                        <button onClick={closeDialog} className='btn order-status-btn'>Close</button>
                                    </div>
                                </div>
                            )}
                            {isStatus && (
                                <div className="order-overlay" onClick={closeDialog}>
                                    <div
                                        className="order-dialog"
                                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                                    >
                                        <h2>Status</h2>
                                        <h4>{orderStatusUpdated}</h4><br></br>
                                        <button onClick={closeDialog} className='btn order-status-btn'>Close</button>
                                    </div>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div>
                            {loading ? (
                                <Loading />
                            ) : (
                                <div className='form-productSubmit-outter'>
                                <h1 className='ms-2'>Add Product</h1>
                                <form onSubmit={handleSumbit} className='form-productSubmit-outter'>
                                    <div className='form-productSubmit'>
                                        <div className='productSubmit-div-label'>
                                            <label className='lable-productSubmit'>Product Name-:</label>
                                            <label className='lable-productSubmit'>Product Catagory-:</label>
                                            <label className='lable-productSubmit'>Product Price-:</label>
                                            <label className='lable-productSubmit'>Product Quantity-:</label>
                                            <label className='lable-productSubmit'>Product Images-:</label>
                                            <label className='lable-productSubmit'>Product Description-:</label>
                                        </div>
                                        <div className='productSubmit-div-input-outter'>
                                            <div className='productSubmit-div-input'>
                                                <input type='text' name='name' onChange={handleChange} required />
                                                <input type='text' name='category' onChange={handleChange} required />
                                                <input type='number' name='price' onChange={handleChange} required />
                                                <input type='number' name='quantity' onChange={handleChange} required />
                                                <input type="file" multiple onChange={handleFileChange} required />
                                                <textarea name='description' onChange={handleChange} cols={45} rows={2} maxLength={500} placeholder='Max 500 Characters' required />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                                    <div className='product-submit-btn-div'>
                                        <button className="btn productsubmit-btn" type="submit">Upload</button>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Admin_panel;