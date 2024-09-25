const db = require("../Db_Connection");
const bcrypt = require('bcryptjs');
// require('dotenv').config({ path: './.env' });
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config({path: './.env'});

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
//function for uploding image
async function uploadImage(imagePath) {
    try {
        const result = await cloudinary.uploader.upload(imagePath, {
            folder: 'sql_profile',
            width: 250,
            crop: 'scale',
        });
        return result;
    } catch (error) {
        return error;
    }
}

//multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './User_Profile');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})
const upload = multer({ storage: storage }).single('image');

//function to delete all the images in the product_img folder 
const directoryPath = './User_profile';
const deleteAllFilse = (directoryPath) => {
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.log(`could not list the directory ${err}`);
            return;
        }
        files.forEach((file) => {
            const filePath = path.join(directoryPath, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
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
//Uesr Regester
const Regester = (req, res) => {
    upload(req, res, async (err) => {
        const { name, email, password, confirmpassword } = JSON.parse(req.body.value);
        if (err) {
            res.json({ message: "error uploding image" });
        } else {
            db.query("SELECT email FROM users WHERE email = ?", [email], async (err, result) => {
                if (err) {
                    res.json({ message: "error in databasae", err });
                } else {
                    if (result.length > 0) {
                        res.json({ message: "email is in use", status:false});
                    } else {
                        if (password !== confirmpassword) {
                            res.json({ message: "password not match", status:false });
                        } else
                            if (password.length < 8) {
                                res.json({ message: "password must be of 8 characters", status:false });
                            } else {
                                const uploaded = await uploadImage(req.file.path);
                                if (uploaded.error) {
                                    res.json({ message: "error uploding image", status:false });
                                } else {
                                    const hash = await bcrypt.hash(password, 8);
                                    db.query('INSERT INTO users SET ?', { name: name, email: email, profile: uploaded.url, password: hash, role: "user" }, (err, result) => {
                                        if (err) {
                                            res.json({ message: "error inserting data", err })
                                        } else {
                                            const token = jwt.sign({ username: name, useremail: email, role: 'user', profile: uploaded.url}, process.env.JWT_SECRET, {
                                                expiresIn: "1day",
                                            });
                                            res.json({ message: "user regester success", status: true,token: token });
                                        }
                                    })
                                }
                            }
                    }
                }
            });
            deleteAllFilse(directoryPath);
        }
    });
}
//User Login
const Login = (req, res) => {
    const value = [
        req.body.email,
        req.body.password,
    ]
    db.query('SELECT * FROM users WHERE email = ?', [value[0]], async (err, result) => {
        if (err) {
            res.json({ message: "error in database" });
        } else {
            if (result.length > 0) {
                const hash = await bcrypt.compare(value[1], result[0].password);
                if (hash) {
                    const token = jwt.sign({ username: result[0].name, useremail: result[0].email, userid: result[0].id, role: result[0].role, profile: result[0].profile }, process.env.JWT_SECRET, {
                        expiresIn: "4day",
                    });
                    req.session.role = result[0].role;
                    req.session.email = result[0].email;
                    res.json({ message: "user login success", status: true, role: req.session.role, token });
                }
                else {
                    res.json({ message: "email or password is wrong", status: false });
                }
            } else
                if (result.length === 0) {
                    res.json({ message: "email or password is wrong", status: false })
                }
        }
    })
};

//profile view
const Profile_view = (req, res) => {
    if (req.user.useremail) {
        db.query('SELECT * FROM users WHERE email = ?', req.user.useremail, (err, result) => {
            if(err){
                res.json({message: 'error in database'});
            }else{
                res.json({ name: result[0].name, email: result[0].email, profile: result[0].profile, role: result[0].role, id: result[0].id });
            }
        })
    } else {
        res.json({ message: "login first" });
    }
}

//Update
const Update_name = (req, res) => {
    if (req.user.useremail) {
        const email = req.user.useremail;
        const value = [
            req.body.name,
        ];
        db.query('UPDATE users SET ? WHERE email = ?', [{ name: value[0], email: email }, email], (err, result) => {
            if (err) {
                res.json({ message: "error in database" });
            } else {
                res.json({ message: "name and email updated success" });
                req.session.destroy();
            }
        })
    } else {
        res.json({ message: "login first" });
    }
}

//update password
const Update_password = (req, res) => {
    const value = [
        req.body.oldPassword,
        req.body.newPassword,
        req.body.confirmPassword
    ];
    db.query('SELECT * FROM users WHERE id = ?', req.user.userid, async (err, result) => {
        if (err) {
            res.json({ message: "error in database" })
            console.log(err);
        } else {
            const hashcompare = await bcrypt.compare(value[0], result[0].password);
            if (value[1] !== value[2]) {
                res.json({ message: "new and confirm password not match", status: false });
                console.log('password not math')
            }else
            if (value[1].length < 8) {
                res.json({ message: "password must have 8 charactes long", status: false });
            }else
            if(value[0] === value[1] && value[2]){
                res.json({message: "old password and new password must be different", status: false});
            }else
            if (!hashcompare) {
                res.json({message: 'old password not match', status: false});
            } else {
                const hash = await bcrypt.hash(value[1], 8);
                db.query('UPDATE users SET password = ? WHERE id = ?', [hash, req.user.userid], (err, result) => {
                    if (err) {
                        res.json({ message: "error in database" });
                    } else {
                        res.json({ message: "password updated success", status: true });
                    }
                })
            }
        }
    })
}
//update profile
const Update_profile = (req, res) => {

    upload(req, res, async (err) => {
        if (err) {
            res.json({ message: "error uploding image" });
        } else {
            const uploaded = await uploadImage(req.file.path);
            if (uploaded.error) {
                res.json({ message: "error uploding image |-| Check your network" });
            } else {
                db.query('UPDATE users SET profile = ? WHERE email = ?', [uploaded.url, req.user.useremail], (err, result) => {
                    if (err) {
                        res.json({ message: "error in database" });
                    } else {
                        res.json({ message: "profile updated" });
                    }
                })
            }
            deleteAllFilse(directoryPath);
        }
    })
}
//mail 
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'isabell17@ethereal.email',
        pass: 'uCHJAh5M6Nq8XcXpyc'
    }
});
//forget password
const froget_password = (req, res) => {

    const email = req.body.email;
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: '2h'
    });
    db.query('INSERT INTO rest_token (email, token) VALUES (?, ?)', [email, token], async (err, result) => {
        if (err) {
            res.json({ message: "error in database", err });
        } else {
            const mailoption = {
                from: '"Ateeb" <ateebhaque1912@gmail.com>', // sender address
                to: `${email}`, // list of receivers
                subject: "forget password", // Subject line
                html: `Click on the following link to reset your password: <br/> <a>http://localhost:4000/user/reset_password/${token}</a>`, // plain text body
            };
            transporter.sendMail(mailoption, (err, info) => {
                if (err) {
                    res.json({ massage: "error sending mail" });
                    // console.log(err);   
                } else {
                    res.json({ message: "token generated success and mail sent", email: email, token: token, infoid: info.messageId });
                }
            })
        }
    })
}

//reset password
const reset_password = (req, res) => {
    const token = req.params.token;
    const value = [
        req.body.password,
        req.body.confirmpassword,
    ]

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            res.json({ message: "invalid or expire token" });
        } else {
            const email = decoded.email;
            if (value[0].length < 8) {
                res.json({ message: "password shoud be of 8 charachers" });
            } else
                if (value[0] !== value[1]) {
                    res.json({ message: "confirmpassword not match" });
                } else {
                    const hash = await bcrypt.hash(value[0], 8);
                    db.query('UPDATE users SET password = ? WHERE email = ?', [hash, email], (err, result) => {
                        if (err) {
                            res.json({ message: "error in database" });
                        } else {
                            res.json({ message: "password reset success" });
                            db.query('DELETE FROM `rest_token` WHERE email = ?', [email]);
                        }
                    })
                }
        }
    })
}
//Admin Routes
//Display user
const Display_user = (req, res) => {
    if (req.user.role === 'admin') {
        db.query("SELECT id, name, email, role FROM users", (err, result) => {
            if (err) {
                res.json({ message: "error in database", err });
            } else {
                res.json(result);
            }
        })
    } else {
        res.json({ message: "you are not admin" });
    }
};

//update user
const Update_user = (req, res) => {
    if (req.user.role === 'admin') {
        const id = req.params.id;
        const role = req.body.role;
        db.query("UPDATE users SET role = ? WHERE id = ? ", [role, id], (err, result) => {
            if (err) {
                res.json({ message: "error in database" })
            } else {
                res.json({ message: "user role updated success" });
            }
        })
    } else {
        res.json({ message: 'not admin' });
    }
}

//Delete user
const Delete_user = (req, res) => {
    if (req.user.role === 'admin') {
        const id = req.params.id;
        db.query("DELETE FROM users WHERE id = ?", id, (err, result) => {
            if (err) {
                res.json({ message: "error in database" });
            } else {
                res.json({ message: "user deletes success" });
            }
        })
    } else {
        res.json({ message: 'not admin' });
    }
}
module.exports = { Regester, Login, Profile_view, Update_name, Update_password, Update_profile, froget_password, reset_password, Display_user, Update_user, Delete_user };