import fs from "fs";
import path from "path";
import { scrapeAllPages } from "../functions/scraperECON.js";

const __dirname = path.resolve(); // Obtener el directorio actual

export const ctrlScrapingECON = async (req, res) => {
  const { category } = req.params; // Obtener la categoría del parámetro
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${year}${month}${day}`; // Asegurándonos de que sea la fecha local

  const fileName = `productosECON_${category}_${formattedDate}.json`;
  const filePath = path.join(__dirname, "src", "public", "json", fileName);

  console.log("Verificando si el archivo existe en la ruta:", filePath);

  try {
    // Verificar si el archivo ya existe
    if (fs.existsSync(filePath)) {
      console.log("Archivo encontrado:", filePath);

      // Leer el archivo y devolver los datos
      const data = fs.readFileSync(filePath);
      const productos = JSON.parse(data);

      return res.json({
        message: "Datos leídos desde el archivo",
        fileName,
        productos,
      });
    } else {
      console.log("Archivo no encontrado, realizando scraping...");

      // Realizar el scraping si el archivo no existe
      const result = await scrapeAllPages(category);

      return res.json({
        message: result.message,
        fileName: result.fileName,
        productos: result.productos,
      });
    }
  } catch (error) {
    console.error("Error en el scraping:", error);
    res.status(500).json({ message: "Error al realizar el scraping." });
  }
};

// import { scrapeAllPages } from "../functions/scraper.js";

// export const ctrlScraping = async (req, res) => {
//   try {
//     const result = await scrapeAllPages(); // Llama a la función de scraping
//     res.json(result); // Envía la respuesta al cliente
//   } catch (error) {
//     console.error("Error en el scraping:", error);
//     res.status(500).json({ message: "Error al realizar el scraping." });
//   }
// };
