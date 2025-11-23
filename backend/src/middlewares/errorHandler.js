export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: "Invalid token" });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: "Token expired" });
  }
  
  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(400).json({ error: "Duplicate field value" });
  }
  
  if (err.code === 'P2025') {
    return res.status(404).json({ error: "Record not found" });
  }
  
  res.status(500).json({ error: err.message });
};