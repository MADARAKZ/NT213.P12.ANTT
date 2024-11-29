import jwt from 'jsonwebtoken'

const authMiddleware = (req, res, next) => {
    const token = req.headers.token.split(' ')[1]
    if(!token){
        return res.status(404).json({
            message: 'Token is valid'
        })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, user){
        if(err){
            return res.status(404).json({message: 'user is not authenticate'})
        }
        if(user.isAdmin){
             next()
        }
        else{
            return res.status(404).json({
                message:'user is not authentication'
            })
        }
    })
}
export default authMiddleware