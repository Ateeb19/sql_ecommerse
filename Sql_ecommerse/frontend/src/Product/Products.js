import React, { useEffect, useState } from "react";
import Loader from "../Loader/Loader";
import "./Products.css";
import { FaForward, FaBackward } from "react-icons/fa";
import Slider from '@mui/material/Slider';
import { useNavigate } from "react-router-dom";
import { Link, Element, animateScroll as scroll } from 'react-scroll';
import axios from "axios";

const Products = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);


    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    // const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(100000);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchcategories();
        fetchProducts();
    }, [selectedCategory, maxPrice, searchTerm, currentPage]);

    const fetchcategories = async () => {
        try{
            const response = await axios.get('http://localhost:4000/product/category');
            setCategories(['All Categories', ...response.data.category]);
            setLoading(false);
        }catch (error) {
            console.log('error-:',error);
            setLoading(true);
        }
    };

    const fetchProducts = async () => {
        try{
            const categoryQuery = selectedCategory === 'All Categories' ? '' : selectedCategory;
            const response =  await axios.get('http://localhost:4000/product/display',{
            params:{
                category: categoryQuery,
                maxPrice,
                search: searchTerm,
                page: currentPage,
            },
        });
        if(!response.data.status){
            setLoading(true);
        }else{
            setProducts(response.data.products);
            setTotalPages(response.data.totalPages);
            setLoading(false);
        }

        } catch(error){
            console.log('error fetching products', error);
            setLoading(true);
        }
    };


    const valuetext =(value) => {
            return value;
          }
    const marks = [
            {
              value: 0,
              label: '₹0',
            },
            {
              value: 6000,
              label: '₹6K',
            },
            {
              value: 14000,
              label: '₹14K',
            },
            {
              value: 26000,
              label: '₹26K',
            },
            {
              value: 42000,
              label: '₹42K',
            },
            {
              value: 62000,
              label: '₹62K',
            },
            {
              value: 80000,
              label: '₹80K',
            },
          ];

        const id = (id) => {
            navigate('/product_detail')
            localStorage.setItem('P_id', id);
        }

        const scrollToTop = () => {
            window.scrollTo({
              top: 0,
              behavior: 'smooth' // for smooth scrolling
            });
          };
        const handleBackwardPage = () => {
            if (currentPage > 1) {
              setCurrentPage(prevPage => prevPage - 1);
              scrollToTop();
            }
        };
        const handleForwordPage = () => {
              setCurrentPage(prevPage => prevPage + 1);
              scrollToTop();
        };
return(
    <div>

                {loading ? (
                <div className="loading-div-product">
                    <Loader/>
                    <h1>Featching Data</h1>
                </div>
            ): (
                <div className="container-fluid">
                    <div className="row all-data">
                        <div className="col-4 side-div">
                            <div className="product-outer-div">
                                <div className="search-bar">
                                    <input type="text" name="serch" placeholder="Search Product......" onChange={(e) => setSearchTerm(e.target.value)}/>
                                </div>
                                <div className="filter-price">
                                    <h4>Filter By Price</h4>
                                    <div className="price-filter">
                                        <Slider
                                            className="slider"
                                            aria-label="price_filter"
                                            defaultValue={10000}
                                            getAriaValueText={valuetext}
                                            valueLabelDisplay="auto"
                                            shiftStep={2000}
                                            step={2000}
                                            marks={marks}
                                            min={0}
                                            max={80000}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="categorie-filter">
                                    <h4>Categories</h4>
                                    {loading ? (
                                        <Loader/>
                                    ) : (
                                    <ul >
                                        {categories.map((category, index) => (
                                            <li key={index} value={category} onClick={() => setSelectedCategory(category)}>
                                                {category}
                                            </li>
                                        ))}
                                    </ul>
                                    )}
                                    
                                </div>
                            </div>
                        </div>
                        <div className="col-8 border-start border-dark border-2" name='top'>
                            <div className="products-background">
                                <div className="heading mb-5">
                                    <h1>Products</h1>
                                </div>
                                
                                <div>
                                {loading ? (
                                    <Loader/>
                                    ) : (
                                    <div id="products-div" className="Product_background">
                                        {products.map((product) => (
                                        <div key={product.id} onClick={() => id(product.id)} className="product">
                                            <div className="product_img"><img src={product.image1} alt={product.name} width={'100%'} /></div>
                                                <h6 className="ms-3">{product.category}</h6>
                                                <h3 className="ms-3">{product.name}</h3>
                                                <h5 className= 'ms-3'>₹{product.price}</h5>
                                                <h5 className= {`ms-3 quantity ${product.quantity > 0 ? 'instock' : 'outstock'}`}>{product.quantity > 0 ? 'Instock' : 'Out of Stock'}</h5>
                                        </div>
                                        ))}
                                    </div>
                                    )}
                                </div>

                                <div className="pagination mt-5">
                                    <Link to='top' smooth={true} duration={500}>
                                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                                        <FaBackward />
                                    </button>
                                    </Link>
                                    <span>{currentPage} / {totalPages}</span>
                                    <Link to='top' smooth={true} duration={500}>
                                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                                        <FaForward/>
                                    </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
    </div>
)
}
export default Products;