import React, { useEffect, useState } from "react";
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Confirm_order.css";



const Confirm_order = () => {
  const logo = `${process.env.PUBLIC_URL}/logo192.png`;
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [orderdetail, setOrderdetail] = useState([]);
  const [combination, setCombination] = useState([]);
  const [Qrbtn, setQrbtn] = useState(false);
  const [productDetails, setProductDetails] = useState([]);
  const [check, setCheck] = useState(false);
  const [cashcheck, setCashcheck] = useState(false);
  const [COD, setCOD] = useState(true);
  const [paymentType, setPaymentType] = useState('net_banking');
    const [address, setAddress] = useState('');
    const steps = ['Address', 'Check Order Detail', 'Payment'];
    const [activeStep, setActiveStep] = React.useState(0);
    const [skipped, setSkipped] = React.useState(new Set());
  
    const isStepOptional = (step) => {
      return step === 1;
    };
  
    const isStepSkipped = (step) => {
      return skipped.has(step);
    };

    useEffect(() => {

      const product = async() => {
        if (orderdetail.length > 0) {
          try {
            const responses = await Promise.all(
              orderdetail.map(e =>
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

    }, [orderdetail]);

    const handleNext = async () => {


      if(activeStep === 0){

        if(address.length === 0){
          alert('fill the address');
          return
        }
        const cartlength = localStorage.getItem('cartlength');
        const cart_id = [];
        for(let i = 0 ; i <cartlength; i++){
          let cartid = localStorage.getItem(`cart${i}`)
          cart_id.push(cartid);
        }
        cart_id.forEach( async(e) => {
          try{
            const response = await axios.post(`http://localhost:4000/orders/update_order_address/${e}`,
            {
              address: address,
            },{
              headers: {
                Authorization: token,
              }
            })
          }catch(err){
            console.log('error', err);
            setActiveStep((prevActiveStep) => prevActiveStep = 0);
            return;
          }
        })
        setActiveStep((prevActiveStep) => prevActiveStep + 1);

        try{
          const response = await axios.get('http://localhost:4000/orders/not_confirm_order',{
            headers:{
              Authorization: token,
            }
          })
          setOrderdetail(response.data.message);
        }catch(err){
          console.log('order err',err);
          setActiveStep((prevActiveStep) => prevActiveStep - 1);
        }

      }else if(activeStep === 1){
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setCheck(true)
      }else{

        setCheck(true);
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        navigate('/orders');

        if(COD){
          const data = {
            orderids: orderids,
        };
          const result = await axios.post('http://localhost:4000/orders/cod',data,
            {
              headers:{
                Authorization: token,
              }
            });
          alert(result.data.message);
        }

      }
    };

    const handleBack = () => {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };
    const combinationData = () => {
      if (orderdetail.length > 0 && productDetails.length > 0) {
        const combinedData = orderdetail.map(order => {
          const product = productDetails.find(product => product.id === parseInt(order.product_id));
    
          if (product) {
            return {
              ...product,
              order_id: order.id,
              order_quantity: order.quantity,
              order_user_id: order.user_id,
              order_address: order.address,
              order_total_amount: order.total_amount,
            };
          }
    
          // Optionally, return only order details if product is not found
          return {
            order_id: order.id,
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
    const handlepayment = (e) => {
      setPaymentType(e.target.value);
      if(paymentType === 'cash_on_delevery'){
        setCheck(true);
        setQrbtn(false);
      }
      if(paymentType === 'net_banking'){
        setCheck(false);
        setQrbtn(true);
      }
    }
  useEffect( ()=>{
    combinationData()
  },[orderdetail, productDetails])

  let totalAmount = 0;
  combination.forEach(e =>{
    const amount = parseInt(e.order_total_amount);
    totalAmount = amount+totalAmount;
  })
    const handleReset = () => {
      // navigate('/orders')
    };
    const delevery_charge = 200;
    const fianlAmount = totalAmount+delevery_charge;


    const loadScript = (src)=> {
          return new Promise((resolve) => {
              const script = document.createElement("script");
              script.src = src;
              script.onload = () => {
                  resolve(true);
              };
              script.onerror = () => {
                  resolve(false);
              };
              document.body.appendChild(script);
          });
      }

      let orderids = []
      combination.forEach((e) => {
        orderids.push(e.order_id);
      })
  const displayRazorpay = async() => {
    setCOD(false);
      const res = await loadScript(
          "https://checkout.razorpay.com/v1/checkout.js"
      );

      if (!res) {
          alert("Razorpay SDK failed to load. Are you online?");
          return;
      }

      const result = await axios.post("http://localhost:4000/orders/razor_pay",{
        amount: fianlAmount,
      })

      if (!result) {
          alert("Server error. Are you online?");
          return;
      }

      const { amount, id: order_id, currency } = result.data;


      const options = {
          key: "rzp_test_NShOhfxsjsQDhO", // Enter the Key ID generated from the Dashboard
          amount: amount.toString(),
          currency: currency,
          name: "Quick Shop.",
          description: "Online transaction",
          image: { logo },
          order_id: order_id,
          handler: async function (response) {
              const data = {
                  orderCreationId: order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                  orderids: orderids,
              };

              const result = await axios.post("http://localhost:4000/orders/razor_pay_success", data,{
                headers: {
                  Authorization: token,
                }
              });

              alert(result.data.message);
              console.log(result.data);
              if(result.data.message === 'success'){
                setCheck(false);
                setCashcheck(true);
              }
          },
          notes: {
              address: address,
          },
          theme: {
              color: "#61dafb",
          },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
  }

   

    return(
        <div className="container-sm order_page mt-5">
            <Box sx={{ width: '100%' }}>
            <Stepper activeStep={activeStep}>
                {steps.map((label, index) => {
                const stepProps = {};
                const labelProps = {};
                if (isStepOptional(index)) {
                    labelProps.optional = (
                    <Typography variant="caption"></Typography>
                    );
                }
                if (isStepSkipped(index)) {
                    stepProps.completed = false;
                }
                return (
                    <Step key={label} {...stepProps}>
                    <StepLabel {...labelProps}>{label}</StepLabel>
                    </Step>
                );
                })}
            </Stepper>
            {activeStep === steps.length ? (
                <React.Fragment>
                <Typography sx={{ mt: 2, mb: 1 }}>
                    Order successfully made!
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                    <Box sx={{ flex: '1 1 auto' }} />
                    <button className="btn" onClick={handleReset}>Check Orders</button>
                </Box>
                </React.Fragment>
            ) : (
                <React.Fragment>
                {activeStep === 0 ?(

                  <div className="order_address mt-4 mb-4">
                    <h2> Address</h2>
                    <input type='text' className="form-control mt-2 mb-3" cols='10' rows='4' name="address" maxLength={255} onChange={(e) => setAddress(e.target.value)} required></input>
                  </div>
                
              ): activeStep === 1 ?(

                  <div className="order_details mt-4 mb-4">
                    <h2> Check Order Details</h2>
                    {combination?(
                      <div>
                        <div className="order_table_div mt-5">
                          <table className="order_cart_table table table-hover">
                            <thead>
                                <tr className="cart_thead_tr">
                                    <th colSpan="2" className="cart_thead_product">Products</th>
                                    <th className="cart_thead_category">Category</th>
                                    <th className="cart_thead_quantity">Quantity</th>
                                    <th className="cart_thead_delete_button">Address</th>
                                    <th className="cart_thead_total">Total</th>
                                </tr>
                            </thead>

                            <tbody>
                              {combination.map((e, index) =>(
                                <tr key={index}>
                                  <td><img src={e.image1} width = {'70px'} height={'80px'} alt="image"/></td>
                                  <td><div className="table-td">{e.name}</div></td>
                                  <td><div className="table-td">{e.category}</div></td>
                                  <td><div className="table-td">{e.order_quantity}</div></td>
                                  <td><div className="table-td">{e.order_address}</div></td>
                                  <td><div className="table-td">{e.order_total_amount}</div></td>
                                </tr>
                              ))}
                            </tbody>

                            <tbody className="order_cart_tfoot_tr">
                              <tr>
                                  <td colSpan='5'>SubTotal</td>
                                  <td className="order_td">{totalAmount}</td>
                              </tr>
                            </tbody>
                            <tbody className="order_cart_tfoot_tr">
                              <tr>
                                  <td colSpan='5'>Delevery Charges</td>
                                  <td className="order_td">+{delevery_charge}</td>
                              </tr>
                            </tbody>
                            <tfoot className="order_cart_tfoot_tr">
                              <tr>
                                  <td colSpan='5'>Total =</td>
                                  <td className="order_td"><b>{totalAmount+delevery_charge}</b></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    ):(
                      <div>
                        <h1>Sorry! Your data cannot load</h1>
                      </div>
                    )}
                  </div>
                  
                ): (

                  <div className="order_payment mt-4 mb-4">
                  <div className="order_payment_innerdiv">
                  <h2> Payment</h2>
                  <div className="payment_type">
                    <div className="payment_type_inner">
                      <div className="payment_radio mt-4">
                        <input type="radio" className="form-check-input me-3" name="payment_type" checked={paymentType === 'cash_on_delevery'} value='cash_on_delevery' disabled={cashcheck} onChange={handlepayment}/> <span> <b>Cash On Delevery</b></span>
                      </div>
                      <div className="payment_radio mt-4">
                        <input type="radio" className="form-check-input me-3" name="payment_type" checked={paymentType === 'net_banking'} value='net_banking' onChange={handlepayment}/> <span> <b>Net Banking</b></span>
                      </div>
                    </div>
                    <button onClick={displayRazorpay} disabled={Qrbtn} className="btn mt-4">create QR code</button>
                  </div>
                  </div>
                </div>
              
              )}
                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                    <button
                    className="btn"
                    color="inherit"
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                    >
                    Back
                    </button>
                    <Box sx={{ flex: '1 1 auto' }} />

                    <button className='btn' disabled={check} onClick={handleNext}>
                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                    </button>

                    
                </Box>
                </React.Fragment>
            )}
            </Box>
        </div>
    )
}

export default Confirm_order;