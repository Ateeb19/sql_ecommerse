require('dotenv').config({path: './.env'});
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require('crypto');
const db = require('../Db_Connection');
const { default: axios } = require('axios');

const generatedIds = new Set();
let orderId;

const Razorpay_api = async(req, res) => {
    const amount = req.body.amount;
    try {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        const options = {
            amount: amount*100, // amount in smallest currency unit
            currency: "INR",
            receipt: "receipt_order_74394",
        };

        const order = await instance.orders.create(options);

        if (!order) return res.status(500).send("Some error occured");

        res.json(order);
    } catch (error) {
        res.status(500).send(error);
    }
}

const Success = async(req, res) => {
    try {
        // getting the details back from our font-end
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
            orderids,
        } = req.body;

        // Creating our own digest
        // The format should be like this:
        // digest = hmac_sha256(orderCreationId + "|" + razorpayPaymentId, secret);
        const shasum = crypto.createHmac("sha256", "bigR9DKD8nQEgT86P9cYQU16");

        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);

        const digest = shasum.digest("hex");

        // comaparing our digest with the actual signature
        if (digest !== razorpaySignature)
            return res.status(400).json({ msg: "Transaction not legit!" });

        // THE PAYMENT IS LEGIT & VERIFIED
        // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT

        async function getActualDate() {
            try {
              const response = await axios.get('http://worldtimeapi.org/api/timezone/Etc/UTC');
              
              const currentDateTime = response.data.datetime;
              const date = currentDateTime.split('T')[0]; // Extract the date part in YYYY-MM-DD format
              
              return date;
            } catch (error) {
              console.error('Error fetching the date:', error);
            }
          }
        
          let order_da = await getActualDate();

          let completedQueries = 0;
          let errors = [];

          orderids.forEach((element, index) => {
            db.query(
                'UPDATE orders SET ? WHERE user_id = ? AND id = ?',
                [{ order_date: order_da, order_id: razorpayOrderId, payment_id: razorpayPaymentId, amount_type: 'netbanking', confirm: 'yes' }, req.user.userid, element],
                (err, result) => {
                    completedQueries++;
                    if (err) {
                        errors.push({
                            orderId: element,
                            error: err
                        });
                    }
        
                    // Check if all queries are completed
                    if (completedQueries === orderids.length) {
                        if (errors.length > 0) {
                            res.json({
                                message: 'Payment success, but there were errors in some database operations',
                                errors,
                                oerderId: razorpayOrderId,
                                paymentId: razorpayPaymentId
                            });
                        } else {
                            res.json({
                                message: 'success',
                                oerderId: razorpayOrderId,
                                paymentId: razorpayPaymentId
                            });
                        }
                    }
                }
            );
        });


        //   orderids.forEach(element => {
        //     db.query('UPDATE orders SET ? WHERE user_id = ? AND id = ?', [{order_date: order_da, order_id: razorpayOrderId, payment_id: razorpayPaymentId, amount_type: 'netbanking', confirm: 'yes'}, req.user.userid, element], (err, result) => {
        //     if(err){
        //         res.json({message:'payment success', result: 'But error in database', oerderId: razorpayOrderId, paymentId: razorpayPaymentId});
        //     }else{
        //         res.json({message: 'success', oerderId: razorpayOrderId, paymentId: razorpayPaymentId})
        //     }
        // })
        //   });


        // res.json({
        //     msg: "success",
        //     orderId: razorpayOrderId,
        //     paymentId: razorpayPaymentId,
        // });
    } catch (error) {
        res.status(500).send(error);
    }
}

const COD = async(req, res) => {
    const {
        orderids,
    } = req.body;
    async function getActualDate() {
        try {
          const response = await axios.get('http://worldtimeapi.org/api/timezone/Etc/UTC');
          
          const currentDateTime = response.data.datetime;
          const date = currentDateTime.split('T')[0]; // Extract the date part in YYYY-MM-DD format
          
          return date;
        } catch (error) {
          console.error('Error fetching the date:', error);
        }
      }
      let order_da = await getActualDate();

      do {
        // Generate random ID
        const prefix = 'order_';
        const randomId = crypto.randomBytes(8).toString('base64').replace(/\W/g, '').slice(0, 12);
        orderId = prefix + randomId;
      } while (generatedIds.has(orderId)); // Ensure the ID is unique
    
      // Add the new ID to the Set to keep track
      generatedIds.add(orderId);

      console.log(orderId);
      let completedQueries = 0;
      let errors = [];

      orderids.forEach((element, index) => {
        db.query(
            'UPDATE orders SET ? WHERE user_id = ? AND id = ?',
            [{ order_date: order_da, order_id: orderId, amount_type: 'cod', confirm: 'yes' }, req.user.userid, element],
            (err, result) => {
                completedQueries++;
                if (err) {
                    errors.push({
                        orderId: element,
                        error: err
                    });
                }
    
                // Check if all queries are completed
                if (completedQueries === orderids.length) {
                    if (errors.length > 0) {
                        res.json({
                            message: 'success',
                            message_N: 'Payment success, but there were errors in some database operations',
                            errors
                        });
                    } else {
                        res.json({
                            message: 'success'
                        });
                    }
                }
            }
        );
    });


}
module.exports = {Razorpay_api, Success, COD};
