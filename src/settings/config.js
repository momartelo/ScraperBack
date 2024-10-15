import "dotenv/config";

export const config = {
  port: process.env.PORT || 3000,
  mongo:
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/materialesBBDD-app",
  jwt_secret: process.env.JWT_SECRET || "secret",
  database: process.env.DATABASE_NAME || "materialesBBDD-app",
  api_key: process.env.API_KEY,
};
