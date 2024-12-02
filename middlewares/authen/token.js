
const jwt = require('jsonwebtoken');
const { Model } = require('sequelize');
const {User} = require('../../models');
const { error } = require('winston');
const authMiddleware = (req, res, next) => {
    const token = req.cookies.accessToken; 
    if (!token) {
        return res.status(401).json({
            message: 'Access token is missing. Please login.',
        });
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, user) {
        if (err) {
            return res.status(401).json({ message: 'User is not authenticated' });
        }
        if (user.isAdmin) {
            next();
        } else {
            return res.status(403).json({
                message: 'User is not authorized',
            });
        }
    });
};

async function authenticationMiddleware  (req, res, next) {
    const token = req.cookies.accessToken; // Lấy token từ cookie
    const refreshToken = req.cookies.refreshToken;
    if (token)
    {
        jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token không hợp lệ.' });
        req.user = user;
        next();
        }); 
    }else{
        if(refreshToken == null){
        return res.status(401).json({message: 'Phiên đăng nhập hết hạn.'});
        }
        else{
        try{
        const refeshTokendecode = jwt.verify(refreshToken,process.env.REFRESH_TOKEN);
    
        const newAccessToken = await RefreshToken(refeshTokendecode.userId)
        console.log("token moi trong cookie",newAccessToken)
    
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 phút
        });
        console.log("Da refresh token")
        req.user = jwt.verify(newAccessToken, process.env.ACCESS_TOKEN);
        next();
        } catch (refreshError){
        return res.status(401).json({message: 'Phiên đăng nhập không hợp lệ, hãy đăng nhập lại'})
        }}
    }
};

async function RefreshToken(userID){
    const user = await User.findOne({where: {id: userID}});
    console.log("Refresh USer", user)
    if(!user)
    {
        throw new error("User is Invalid")
    }
    const newAccessToken = jwt.sign(
        {userId: user.id, type: user.type},
        process.env.ACCESS_TOKEN,
        {expiresIn: '15m'}
    )
    console.log("Token moi", newAccessToken);
    return newAccessToken;
}
module.exports = { authMiddleware, authenticationMiddleware };