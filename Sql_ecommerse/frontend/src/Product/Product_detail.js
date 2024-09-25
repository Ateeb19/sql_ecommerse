import axios from "axios";
import React, { useEffect, useState } from "react";
import Rating from '@mui/material/Rating';
import './Product_detail.css';
import Slider from "react-slick";
import ImageGallery from "react-image-gallery";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";


const Product_detail = () => {
    const navigate = useNavigate();
    const [product, setProduct] = useState([]);
    const [review, setReview] = useState([]);
    const [userinfo, setUserinfo] = useState([]);
    const [rating, setRating] = useState(0);
    const [cartQnt, setCartQnt] = useState(0);
    const [value, setValue] = useState({
        rating: '0',
        comment: '',
    })
    const token = localStorage.getItem('token');
    const P_id = localStorage.getItem('P_id');
    let check = false;
    const review_name = localStorage.getItem('username');
    if (review_name.length <= 0) {
        check = true;
    }
    useEffect(() => {
        Product_Detail();
        Review_Detail();
    }, []);


    const Product_Detail = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/product/display/${P_id}`);
            setProduct(response.data.message);
        } catch (err) {
            console.log('error catching data', err);
        }
    }


    const Review_Detail = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/product/review_display/${P_id}`);
            setReview(response.data.message);
            setRating(response.data.rating);
            setUserinfo(response.data.userInfo);
        } catch (err) {
            console.log('error catching data', err);
        }
    }


    const mergedArray = review.map(review => {
        const user = userinfo.find(user => user.id === review.user_id);
        return user ? { ...review, ...user } : review;
    });

    const Pimage = [];
    for (let i = 1; i <= 10; i++) {
        const imageUrl = product[`image${i}`];
        if (imageUrl && imageUrl.length > 2) {
            Pimage.push(imageUrl);
        }
    }

    const image = Pimage.map(url => ({
        original: url,
        thumbnail: url,
    }));

    const Decrease = () => {
        setCartQnt(cartQnt - 1);
    }
    const Increase = () => {
        setCartQnt(cartQnt + 1);
    }

    const Add_to_Cart = async (Qnt) => {
        try{
            const response = await axios.post('http://localhost:4000/orders/addcart',{
                    product_id: product.id,
                    quantity: Qnt
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

    const settings = {
        dots: true,
        speed: 1000,
        slidesToShow: 2,
        slidesToScroll: 1,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 2000,
    };

    //Review submit
    const handle_review_comment = (e) =>{
        setValue((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
    let reviewmessage = [];
    const submitReview = async (e) => {
        e.preventDefault();
        if(value.rating === '0'){
            alert('Rating stars not be empety');
            return
        }
        const reviewData = {
            rating: value.rating,
            comment: value.comment,
        };
        try {
            const response = await axios.post(`http://localhost:4000/product/review/${product.id}`, reviewData, {
                headers: {
                    Authorization: token,
                    'Content-Type': 'application/json',
                }   
            });
            // console.log('review response', response.data.message);
            alert(response.data.message);
            if(response.data.status === false){
                navigate('/profile');
            }
            // window.location.reload();
            reviewmessage = response.data;
        } catch (error) {
            console.log('Error uploading review:', reviewmessage.message, error);
        }
        console.log(reviewmessage);
        
        
    }
    return (
        <div>
            <div className="container-xxl p-0">
                <div className="row mt-5 product-detail ">
                    <div className="col-6 p-2 border-4 border-end border-secondry">
                        <div className="image-box">
                            <ImageGallery
                                thumbnailPosition='bottom'
                                items={image} />
                        </div>
                    </div>

                    <div className="col-6 mt-5 ps-5 pt-2  product_discription">
                        <h4 className="mb-2">{product.category}</h4>
                        <h1 className="mb-4"><span>{product.name}</span></h1>
                        <Rating name="half-rating-read" className="mb-3" value={rating} precision={0.5} readOnly /><br></br>
                        <h4>{product.price}-₹</h4>
                        <p>{product.description}</p>
                        <h5 className={`quantity ${product.quantity > 0 ? 'instock' : 'outstock'} mb-2`}>{product.quantity > 0 ? 'Instock' : 'Out of Stock'}</h5>
                        <h6 className="mb-4">Qty.-: {product.quantity}</h6>
                        <div className="add_cart">
                            <button className="btn cartBtn" onClick={Decrease} disabled={cartQnt < 1} >-</button>
                            <span className="cartSpan" >{cartQnt}</span>
                            <button className="btn cartBtn" onClick={Increase} disabled={cartQnt == product.quantity || product.quantity == 0}>+</button>
                            <button className="btn cartBtn" onClick={() => Add_to_Cart(cartQnt)} disabled={cartQnt < 1}>Add to Cart</button>
                        </div>
                    </div>
                </div>

                <div className="row mt-5">
                    <div className="review_heading">
                        <h1>Reviews</h1>
                    </div>
                    <div className="col-12 mt-2 review_outter_look">
                        <div className="review_box">
                            <div className="submit_review_outter">
                                <div className="submit_review_img_name">

                                    <div className="submit_review_name mt-2">
                                        <h3>{check ? (
                                            "User Name"
                                        ) : (
                                            review_name
                                        )}
                                        </h3>
                                    </div>
                                </div>

                                <div className="submit_review_comment_cover mt-2">
                                    <form onSubmit={submitReview}>
                                    <div className="submit_review_rating">
                                        <Rating name="rating" className="mb-3" precision={0.5} onChange={handle_review_comment} />
                                    </div>

                                    <div className="submit_review_comment">
                                        <textarea name="comment" rows="7" cols="30" maxLength="200" onChange={handle_review_comment}></textarea>
                                    </div>

                                    <div className="submit_review_button">
                                        <button className="btn" type="submit" disabled={check}>Submit</button>
                                    </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="review_inner_look">
                            <Slider {...settings}>
                                {mergedArray.map((review, index) => (
                                    <div className="review_box" key={index}>
                                        <div className="review_outter">
                                            <div className="review_img_name">
                                                <div className="review_image">
                                                    <img src={review.profile} alt={review.name} />
                                                </div>
                                                <div className="review_name mt-2">
                                                    <h3>{review.name}</h3>
                                                </div>
                                            </div>

                                            <div className="review_comment_cover mt-2">
                                                <div className="review_rating">
                                                    <Rating name="half-rating-read" className="mb-3" value={review.rating} precision={0.5} readOnly />
                                                </div>

                                                <div className="review_comment">
                                                    <p>{review.comment}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Product_detail;