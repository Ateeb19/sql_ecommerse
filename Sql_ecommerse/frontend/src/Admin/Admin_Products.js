import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Loading from '../Loader/Loader'

const Productimg = () => {
    const [loading, setLoading] = useState(false);
    const navigat = useNavigate();
    const role = localStorage.getItem('role');
    useEffect(() => {
        if(role === 'user'){
            navigat('/');
            axios.defaults.withCredentials = false;
        }
    },[role])
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [value, setValue] = useState({
        name: '',
        category: '',
        price: '',
        quantity: '',
        description: '',
    });
    const token = localStorage.getItem('token');
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
            {loading ?(
                <Loading/>
            ) : (
                <form onSubmit={handleSumbit}>
                Product Name-:<input type='text' name='name' onChange={handleChange} required /><br />
                Product Catagory-:<input type='text' name='category' onChange={handleChange} required /><br />
                Product Price-:<input type='number' name='price' onChange={handleChange} required /><br />
                Product Quantity-:<input type='number' name='quantity' onChange={handleChange} required /><br />
                Product Description-:<input type='text' name='description' onChange={handleChange} required /><br />
                <input type="file" multiple onChange={handleFileChange} required />
                <button type="submit">Upload</button>
                </form>
            )}

        </div>
    )
}

export default Productimg;

