import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { fileURLToPath } from "url";
import path from "path";
import { config } from "./src/settings/config.js";
import { scraperRouter } from "./src/routes/scraper.routes.js";
import { graphicsRouter } from "./src/routes/graphics.routes.js";
import { dataRouter } from "./src/routes/data.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(morgan("dev"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta pública para servir archivos estáticos
const publicPath = path.join(__dirname, "src", "public");
app.use(express.static(publicPath));
console.log("Directorio público:", publicPath);

app.use("/api/scraper", scraperRouter); // Router para el scraping
app.use("/api/graphics", graphicsRouter);
app.use("/api/data", dataRouter);

app.listen(config.port, () => {
  console.log("Server is running on port: http://localhost:" + config.port);
  console.log(
    "Zona horaria actual:",
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
});
