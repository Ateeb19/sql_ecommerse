import React, { useEffect, useRef, useState } from "react";
import './Home.css';
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";
import { Link, Element, animateScroll as scroll } from 'react-scroll';
import Loader from "./Loader/Loader";


const Home = () => {
    const productRef = useRef(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:4000/product/home_display');
                setProduct(response.data.message);
                if(!response.data.status){
                    return;
                }
                setLoading(false)
            } catch (err) {
                console.log('error catching data', err);
                setLoading(true);
            }
        }
        fetchData();
    }, []);
    const settings = {
        dots: true,
        speed: 1000,
        slidesToShow: 4,
        slidesToScroll: 2,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 2000,
    };
    const id = (id) => {
        navigate('/product_detail')
        localStorage.setItem('P_id', id);
    }
    const productbtn = () => {
        navigate('/products');
    }
    return (
        <div className="body">
            <div className="home-background">
                <div className="home-text">
                    <h1>Quick</h1>
                    <h3>Cart Store</h3>
                    <button className="shope-btn"><Link to="product" smooth={true} duration={1000}>SHOP NOW</Link></button>
                </div>
            </div>
            <div className="background-img" ref={productRef}>
                <div className="products_div" id="product">
                    <div className={loading ? 'product_innerDiv loading-div' : 'product_innerDiv'}>
                        {loading ? (
                            <div>
                                <h1 className="loading-div">PRODUCTS</h1>
                                <Loader/>
                            </div>
                        ) : (
                            <Slider {...settings}>
                                {product.map((item) => (
                                    <div key={item.id} onClick={() => id(item.id)} className="product-body">
                                        <div className="img-body">
                                            <img src={item.image1} alt='Product' />
                                        </div>
                                        <div>
                                            <h2>{item.name}</h2>
                                            <h5>Category-: {item.category}</h5>
                                            <div className="price-qnt">
                                                <button className="price-btn"><h6>₹ {item.price}</h6></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </Slider>
                        )}
                    </div>
                </div>
                <button className="P_Button" onClick={productbtn}>ALL PRODUCTS</button>
            </div>
        </div>
    )
}

export default Home;