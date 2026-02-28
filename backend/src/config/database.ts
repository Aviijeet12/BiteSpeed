import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const dialect = (process.env.DB_DIALECT as "sqlite" | "postgres" | "mysql") || "sqlite";

let sequelize: Sequelize;

if (dialect === "sqlite") {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: process.env.DB_STORAGE || "./database.sqlite",
    logging: false,
  });
} else {
  sequelize = new Sequelize({
    dialect,
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME || "bitespeed",
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    logging: false,
  });
}

export default sequelize;
