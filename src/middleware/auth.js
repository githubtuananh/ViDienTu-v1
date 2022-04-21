const jwt = require("jsonwebtoken");


exports.requireAuth = (req, res, next) => { 
    const token = req.cookies['auth-token'];
    if(!token) return res.status(400).json({code: 400, message: "Vui lòng đăng nhập để tiếp tục"});
    jwt.verify(token, process.env.TOKEN_SECERT, (err, decoded)=>{
        if (err) {
            if(err.name == "TokenExpiredError") return res.status(400).json({code: 400, error: err.message});

            if(err.name == "JsonWebTokenError") return res.status(400).json({code: 400, error: "Invaild Token"});
        }
        req.user = decoded;
        next();
    });
}