const multer = require('multer');
const db = require('../Db_Connection');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');
require('dotenv').config({path: './.env'});

//display products
const Dispaly_product = (req, res) => {
    const {category, maxPrice, search, page = 1, limit = 12 } = req.query;
    
    db.query('SELECT * FROM product', (err, result) => {
        if (err) {
            res.json({ message: "error in database", status: false });
        } else {

            let filteredProducts = result;

            if(category){
                filteredProducts = filteredProducts.filter(p=> p.category === category);
            }

            if(maxPrice){
                filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
            }
            
            if(search){
                filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
            }

            const totalProducts = filteredProducts.length;
            const totalPages = Math.ceil(totalProducts / limit);
            const offset = (page - 1) * limit;

            filteredProducts = filteredProducts.slice(offset, offset + limit);

            res.json({products: filteredProducts, totalPages, status: true});
        }
    })
}
// display categories 
const Categories = (req,res)=> {

    db.query('SELECT DISTINCT category FROM product', (err,result) => {
        if(err){
            res.json({message: 'error in database'});
        }else{
            const category = result.map(row => row.category);
            res.json({category });
        }
    })
}

//display home products
const HomeProducts = (req, res) => {
    db.query('SELECT * FROM product WHERE id IN ( SELECT MIN(id) FROM product GROUP BY category )', (err, result) => {
        if(err){
            res.json({message:'error in database'})
        }else{
            res.json({message: result, status: true});
        }
    })
}
//display particular product
const Display_particulatr_product = (req, res) => {
    const p_id = req.params.p_id;
    db.query('SELECT * FROM product WHERE id = ? ', [p_id], (err, result) => {
        if (err) {
            res.json({ message: "error in database", status: false});
        } else {
            res.json({message: result[0], status: true});
        }
    })
}


// Create review
const Review = (req, res) => {
    const p_id = req.params.p_id;
    const comment = req.body.comment;
    const rating = req.body.rating;
    const user_role = req.user.role;
    const user_id = req.user.userid;
    if (user_role === 'role' || 'admin') {
        db.query('SELECT * FROM review WHERE product_id = ? AND user_id = ?', [p_id, user_id], (err, result) => {
            if (err) {
                res.json({ message: 'error in database', err });
            } else {
                if (result[0]) {
                    res.json({ message: 'review already submied' })
                } else {
                    db.query('INSERT INTO review SET ?', { product_id: p_id, user_id: user_id, rating: rating, comment: comment }, (err, result) => {
                        if (err) {
                            res.json({ message: 'error in database' });
                        } else {
                            res.json({ message: "review submited" });
                        }
                    })
                }
            }
        })
    } else {
        res.json({ message: "login first" });
    }
}
//update review
const Update_review = (req, res) => {
    const p_id = req.params.p_id;
    const comment = req.body.comment;
    const rating = req.body.rating;
    const user_id = req.user.userid;
    const user_role = req.user.role;
    if (user_role === 'role' || 'admin') {
        db.query('UPDATE review SET comment = ?, rating = ? WHERE product_id = ? AND user_id = ?', [comment, rating, p_id, user_id], (err, result) => {
            if (err) {
                res.json({ message: "erorr in database", err });
            } else {
                res.json({ message: "review updated" });
            }
        })
    } else {
        res.json({ message: "login first" })
    }
}

// Display review
const Display_review = async (req, res) => {
    const p_id = req.params.p_id;

    try {
        const result = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM review WHERE product_id = ?', [p_id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        const rating = [];
        const userIdInfoPromises = [];

        result.forEach(element => {
            rating.push(element.rating);
            const userPromise = new Promise((resolve, reject) => {
                db.query('SELECT id, name, profile, role FROM users WHERE id = ?', [element.user_id], (err, userinfo) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(userinfo);
                    }
                });
            });

            userIdInfoPromises.push(userPromise);
        });

        const userIdInfo = await Promise.all(userIdInfoPromises).then(results => {
            return results.flat(); // Flatten the array of arrays
        });

        const totalSum = rating.reduce((acc, curr) => acc + curr, 0);
        const avg = totalSum / rating.length;

        res.json({ message: result, rating: avg, userInfo: userIdInfo });

    } catch (err) {
        res.json({ message: 'error in database', err });
    }
}

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

//function to delete all the images in the product_img folder 
const directoryPath = './Product_img';
const deleteAllFilse = (directoryPath) => {
    fs.readdir(directoryPath, (err, files) => {
        if(err){
            console.log(`could not list the directory ${err}`);
            return;
        }
        files.forEach((file) => {
            const filePath = path.join(directoryPath, file);
            fs.stat(filePath, (err, stats) => {
                if(err){
                    console.log(`could not stat file ${err}`);
                    return;
                }
                if (stats.isFile()) {
                    fs.unlink(filePath, (err) => {
                      if (err) {
                        console.error(`Could not delete file: ${err}`);
                        return;
                      }
                    });
                  }
            })
        })
    })
}

//multer storage
const uploadDir = path.join(__dirname, '../Product_img');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
})
const upload = multer({ storage: storage }).array('images');

//create product
const Create_product = (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.json({ message: 'erro uploading images' });
            console.log('error in file uploading\n', err);
        } else {
            if (req.user.role === 'admin') {
                const value = JSON.parse(req.body.value);
                const files = req.files;
                let uploadPromises = [];
                const urlPath = [];
                files.forEach(file => {
                    const filePath = file.path;
                    uploadPromises.push(
                        cloudinary.uploader.upload(filePath, { folder: 'sql_product' })
                    );
                });

                Promise.all(uploadPromises)
                    .then(results => {
                        results.forEach(result => {
                            urlPath.push(result.url);
                        });
                        if(urlPath.length === 1){
                            for(let i=1; i<10; i++){
                                urlPath[i] = ' ';
                            }
                        }
                        if(urlPath.length === 2){
                            for(let i=2; i<10; i++){
                                urlPath[i] = ' ';
                            }
                        }
                        if(urlPath.length === 3){
                            for(let i=3; i<10; i++){
                                urlPath[i] = ' ';
                            }
                        }
                        if(urlPath.length === 4){
                            for(let i=4; i<10; i++){
                                urlPath[i] = ' ';
                            }
                        }
                        if(urlPath.length === 5){
                            for(let i=5; i<10; i++){
                                urlPath[i] = ' ';
                            }
                        }
                        if(urlPath.length === 6){
                            for(let i=6; i<10; i++){
                                urlPath[i] = ' ';
                            }
                        }
                        if(urlPath.length === 7){
                            for(let i=7; i<10; i++){
                                urlPath[i] = ' ';
                            }
                        }
                        if(urlPath.length === 8){
                            for(let i=8; i<10; i++){
                                urlPath[i] = ' ';
                            }
                        }
                        if(urlPath.length === 9){
                            for(let i=9; i<10; i++){
                                urlPath[i] = ' ';
                            }
                        }
                        db.query('INSERT INTO product SET ?', { name: value.name, category: value.category, quantity: value.quantity, price: value.price, description: value.description, image1: urlPath[0], image2: urlPath[1], image3: urlPath[2], image4: urlPath[3], image5: urlPath[4], image6: urlPath[5], image7: urlPath[6], image8: urlPath[7], image9: urlPath[8], image10: urlPath[9] }, (err, result) => {
                            if (err) {
                                res.json({ message: "error in database",status: false,err});
                                console.log(err);
                            } else {
                                res.json({
                                    message: "product entered",
                                    arrayOfFilePaths: urlPath,
                                    files: files.map(file => ({
                                        originalName: file.originalname,
                                        path: file.path
                                    })),
                                });
                            }
                        })
                    }).catch(err => { res.json({ message: 'error uplogin images |-| Check the network',status:false }) });
            } else {
                res.json({ message: "you are not admin", status: true });
            }
        }
        deleteAllFilse(directoryPath);
    });
}

//update product
const Update_product = (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.json({ message: 'erro uploading images' });
            console.log('error in file uploading\n', err);
        } else {
            if (req.user.role === 'admin') {
                const id = req.params.id;
                const value = JSON.parse(req.body.value);
                const files = req.files;
                let uploadPromises = [];
                const urlPath = [];
                files.forEach(file => {
                    const filePath = file.path;
                    uploadPromises.push(
                        cloudinary.uploader.upload(filePath, { folder: 'sql_product' })
                    );
                });

                Promise.all(uploadPromises)
                    .then(results => {
                        results.forEach(result => {
                            urlPath.push(result.url);
                        });
                        if(urlPath.length === 1){
                            for(let i=1; i<10; i++){
                                urlPath[i] = ' ';
                            }
                        }
                        if(urlPath.length === 2){
                            for(let i=2; i<10; i++){
                                urlPath[i] = ' ';
                            }
                        }
                        if(urlPath.length === 3){
                            for(let i=3; i<10; i++){
                                urlPath[i] = ' ';
                            }
                        }
                        if(urlPath.length === 4){
                            for(let i=4; i<10; i++){
                                urlPath[i] = ' ';
                            }
                        }
                        if(urlPath.length === 5){
                            for(let i=5; i<10; i++){
                                urlPath[i] = ' ';
                            }
                        }
                        if(urlPath.length === 6){
                            for(let i=6; i<10; i++){
                                urlPath[i] = ' ';
                            }
                        }
                        if(urlPath.length === 7){
                            for(let i=7; i<10; i++){
                                urlPath[i] = ' ';
                            }
                        }
                        if(urlPath.length === 8){
                            for(let i=8; i<10; i++){
                                urlPath[i] = ' ';
                            }
                        }
                        if(urlPath.length === 9){
                            for(let i=9; i<10; i++){
                                urlPath[i] = ' ';
                            }
                        }
                        db.query('UPDATE product SET ? WHERE id = ?', [{ name: value.name, category: value.category, quantity: value.quantity, price: value.price, image1: urlPath[0], image2: urlPath[1], image3: urlPath[2], image4: urlPath[3], image5: urlPath[4], image6: urlPath[5], image7: urlPath[6], image8: value[7], image9: value[8], image10: value[9] }, id], (err, result) => {
                            if (err) {
                                res.json({ message: "error in database",err});
                                console.log(err);
                            } else {
                                res.json({
                                    message: "product updated",
                                    arrayOfFilePaths: urlPath,
                                    files: files.map(file => ({
                                        originalName: file.originalname,
                                        path: file.path
                                    })),
                                });
                            }
                        })
                    }).catch(err => { res.json({ message: 'error uplogin images |-| Check the network' }) });
            } else {
                res.json({ message: "you are not admin" });
            }
        }
        deleteAllFilse(directoryPath);
    });
}

//delete product
const Delete_product = (req, res) => {
    const id = req.params.id;
    if (req.user.role === 'admin') {
        db.query("DELETE FROM product WHERE id = ?", id, (err, result) => {
            if (err) {
                res.json({ message: "error in database" });
            } else {
                res.json({ message: "product deleted success" });
            }
        })
    } else {
        res.json({ message: "your are not admin" })
    }
}
module.exports = { Dispaly_product, Categories, HomeProducts, Display_particulatr_product, Review, Update_review, Display_review, Create_product, Update_product, Delete_product };