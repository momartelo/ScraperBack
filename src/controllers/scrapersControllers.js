import fs from "fs";
import path from "path";
import { scrapeCemento } from "../functions/scraperCementoFull.js";
import { scrapeAllPages } from "../functions/scraperECON.js";
import { scrapeHormigon } from "../functions/scraperHormigonH21.js";
import { scrapeData } from "../functions/scraperMLSearch.js";
import { getPriceSteel } from "../functions/scrapeAcero.js";

const __dirname = path.resolve(); // Obtener el directorio actual

// Función para obtener la fecha formateada (año, mes, día)
const getFormattedDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

export const ctrlScrapingECON = async (req, res) => {
  console.log("Hola desde el controlador");
  const { category } = req.params; // Obtener la categoría del parámetro
  // const today = new Date();
  // const year = today.getFullYear();
  // const month = String(today.getMonth() + 1).padStart(2, "0");
  // const day = String(today.getDate()).padStart(2, "0");
  // const formattedDate = `${year}${month}${day}`;
  const formattedDate = getFormattedDate();
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

export const ctrlScrapingMLSearch = async (req, res) => {
  const { word } = req.params;
  const formattedDate = getFormattedDate();
  const fileName = `productosSearchML_${word}_${formattedDate}.json`;
  const filePath = path.join(__dirname, "src", "public", "json", fileName);

  console.log("Verificando si el archivo existe en la ruta:", filePath);

  try {
    if (fs.existsSync(filePath)) {
      console.log("Archivo encontrado:", filePath);

      const data = fs.readFileSync(filePath);
      const productos = JSON.parse(data);

      return res.json({
        message: "Datos leidos desde el archivo",
        fileName,
        productos,
      });
    } else {
      console.log("Archivo no encontrado, realizando scraping...");

      const result = await scrapeData(word);

      return res.json({
        message: result.message,
        fileName: result.fileName,
        productos: result.productos,
      });
    }
  } catch (error) {
    console.error("Error en el scraping:", error);
    res.status(500).json({ message: "Error al realizar el scraping" });
  }
};

export const ctrlScrapingCemento = async (req, res) => {
  const formattedDate = getFormattedDate();
  const fileName = `precioCemento${formattedDate}.json`;
  const filePath = path.join(__dirname, "src", "public", "json", fileName);

  console.log("Verificando si el archivo existe en la ruta:", filePath);

  try {
    if (fs.existsSync(filePath)) {
      console.log("Archivo encontrado:", filePath);

      const data = fs.readFileSync(filePath);
      const productos = JSON.parse(data);

      return res.json({
        message: "Datos leidos del archivo",
        fileName,
        productos,
      });
    } else {
      console.log("Archivo no encontrado, realizanzo scraping...");
      const result = await scrapeCemento();

      return res.json({
        message: result.message,
        fileName: result.fileName,
        productos: result.productos,
      });
    }
  } catch (error) {
    console.error("Error en el scraping:", error);
    res.status(500).json({ message: "Error al realizar el scraping" });
  }
};

export const ctrlScrapingHormigon = async (req, res) => {
  const formattedDate = getFormattedDate();
  const fileName = `precioHormigones${formattedDate}.json`;
  const filePath = path.join(__dirname, "src", "public", "json", fileName);

  console.log("Verificando si el archivo existe en la ruta:", filePath);

  try {
    if (fs.existsSync(filePath)) {
      console.log("Archivo encontrado:", filePath);

      const data = fs.readFileSync(filePath);

      const productos = JSON.parse(data);
      console.log(productos);

      return res.json({
        message: "Datos leidos del archivo",
        fileName,
        productos,
      });
    } else {
      console.log("Archivo no encontrado, realizando scraping....");
      const result = await scrapeHormigon();

      return res.json({
        message: result.message,
        fileName: result.fileName,
        productos: result.productos,
      });
    }
  } catch (error) {
    console.error("Error en el scraping:", error);
    res.status(500).json({ message: "Error al realizar el scraping" });
  }
};

export const ctrlScrapingAcero = async (req, res) => {
  const { diameter } = req.params;

  const formattedDate = getFormattedDate();

  const fileName = `precioAcero_${diameter}mm_${formattedDate}.json`;
  // const filePath = path.join(__dirname, "src", "public", "json", fileName);
  const filePath = path.join(__dirname, "src", "public", "json", fileName);
  console.log("Estoy intentandolo", filePath);

  console.log("Verificando si el archivo existe en la ruta:", filePath);

  try {
    if (fs.existsSync(filePath)) {
      console.log("Archivo encontrado:", filePath);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(fileContent);
      return res.json({
        message: "Archivo encontrado",
        fileName,
        productos: data,
      });
    } else {
      console.log("Archivo no encontrado, generando nuevo datos...");

      const result = await getPriceSteel(diameter);

      return res.json({
        message: result.message,
        fileName: result.fileName,
        productos: result.productos,
      });
    }
  } catch (error) {
    console.error("Error al acceder al archivo o generar el scraping:", error);
    return res
      .status(500)
      .json({ message: "Error en el proceso", error: error.message });
  }
};
