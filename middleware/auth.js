
 import jwt from "jsonwebtoken"

 
 const authMiddleware = (req, res , next) => {
    const authHeader =req.headers.authorization;

    if (!authHeader || ! authHeader.startsWith("Bearer")) {
        return res.status(401).json({ eror:"No token provided"});
    }

    const token =  authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, 'scam-alert');
      req.user = decoded;
      

      next();
    }catch (error) {
        return res.status(401).json({ error: "Invalid or expired token"});
    }
    };
 
export default authMiddleware;