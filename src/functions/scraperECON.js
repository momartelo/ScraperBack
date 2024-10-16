import * as cheerio from "cheerio";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const urls = {
  aceros: "https://econ.ar/productos/aceros/",
  aceros_Inoxidables: "https://econ.ar/productos/aceros-inoxidables/",
  aislaciones: "https://econ.ar/productos/aislaciones",
  amoblamientos: "https://econ.ar/productos/amoblamiento",
  carpinterias: "https://econ.ar/productos/carpinterias/",
  construccion_en_seco: "https://econ.ar/productos/construccion-en-seco/",
  construcciones_especiales:
    "https://econ.ar/productos/construcciones-especiales/",
  electricidad: "https://econ.ar/productos/electricidad-e-iluminacion/",
  electro: "https://econ.ar/productos/Electro/",
  ferreteria: "https://econ.ar/productos/ferreteria/",
  fibra_de_vidrio: "https://econ.ar/productos/fibra-de-vidrio",
  jardineria: "https://econ.ar/productos/jardineria-y-camping/",
  maderas: "https://econ.ar/productos/maderas/",
  marmoles_granitos: "https://econ.ar/productos/marmoles-y-granitos",
  obra_gruesa: "https://econ.ar/productos/obra-gruesa/",
  pinturas: "https://econ.ar/productos/pinturas/",
  pisos_y_revestimientos: "https://econ.ar/productos/pisos-y-revestimientos/",
  refrigeracion: "https://econ.ar/productos/refrigeracion/",
  sanitarios_y_griferias: "https://econ.ar/productos/sanitarios-y-griferias/",
  techos: "https://econ.ar/productos/techos",
  vidrios: "https://econ.ar/productos/vidrios/",
  yeseria: "https://econ.ar/productos/yeseria/",
  zingueria: "https://econ.ar/productos/zingueria/",
};

const productos = [];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para crear un retraso
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function scrapePage(url) {
  try {
    // Espera un tiempo antes de hacer la solicitud
    await delay(2000); // Espera 2 segundos (2000 ms)

    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const items = $(".col-lg-3 .item");
    if (items.length === 0) {
      return false;
    }

    items.each((index, element) => {
      const nombre = $(element).find("h1 a").text().trim();
      const precio = $(element).find(".price b").text().trim();

      productos.push({ nombre, precio });
    });

    return true;
  } catch (error) {
    console.error(`Error al acceder a la URL ${url}:`, error);
    return false;
  }
}

export async function scrapeAllPages(category) {
  const baseUrl = urls[category]; // Obtener la URL base de la categoría
  if (!baseUrl) {
    throw new Error("Categoría no válida.");
  }

  let page = 1;
  let hasMoreProducts = true;

  while (hasMoreProducts) {
    const url = `${baseUrl}${page}/az`; // Construir la URL
    hasMoreProducts = await scrapePage(url);
    page++;
  }

  const today = new Date(); // Obtener la fecha y hora locales
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Los meses en JavaScript son base 0
  const day = String(today.getDate()).padStart(2, "0");

  const formattedDate = `${year}${month}${day}`; // Formato YYYYMMDD
  const fileName = `productosECON_${category}_${formattedDate}.json`;

  // Define la ruta para guardar el archivo JSON
  const jsonDirectory = path.join(__dirname, "../public/json");

  // Asegúrate de que el directorio exista
  if (!fs.existsSync(jsonDirectory)) {
    fs.mkdirSync(jsonDirectory, { recursive: true });
  }

  fs.writeFileSync(
    path.join(jsonDirectory, fileName),
    JSON.stringify(productos, null, 2)
  );
  console.log(`Datos guardados en ${path.join(jsonDirectory, fileName)}`);
  return {
    message: `Datos guardados en ${path.join(jsonDirectory, fileName)}`,
    fileName: fileName,
    productos,
  };
}

// import * as cheerio from "cheerio";
// import axios from "axios";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const baseUrl = "https://www.econ.ar/productos/zingueria/";

// const productos = [];

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Función para crear un retraso
// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// async function scrapePage(page) {
//   const url = `${baseUrl}${page}/az`;

//   try {
//     // Espera un tiempo antes de hacer la solicitud
//     await delay(2000); // Espera 2 segundos (2000 ms)

//     const response = await axios.get(url);
//     const html = response.data;
//     const $ = cheerio.load(html);

//     const items = $(".col-lg-3 .item");
//     if (items.length === 0) {
//       return false;
//     }

//     items.each((index, element) => {
//       const nombre = $(element).find("h1 a").text().trim();
//       const precio = $(element).find(".price b").text().trim();

//       productos.push({ nombre, precio });
//     });

//     return true;
//   } catch (error) {
//     console.error(`Error al acceder a la página ${page}:`, error);
//     return false;
//   }
// }

// export async function scrapeAllPages() {
//   let page = 1;
//   let hasMoreProducts = true;

//   while (hasMoreProducts) {
//     hasMoreProducts = await scrapePage(page);
//     page++;
//   }

//   const today = new Date(); // Obtenemos la fecha y hora locales
//   const year = today.getFullYear();
//   const month = String(today.getMonth() + 1).padStart(2, "0"); // Los meses en JavaScript son base 0
//   const day = String(today.getDate()).padStart(2, "0");

//   const formattedDate = `${year}${month}${day}`; // Formato YYYYMMDD
//   const fileName = `productosECON_${formattedDate}.json`;

//   // Define la ruta para guardar el archivo JSON
//   const jsonDirectory = path.join(__dirname, "../public/json");

//   // Asegúrate de que el directorio exista
//   if (!fs.existsSync(jsonDirectory)) {
//     fs.mkdirSync(jsonDirectory, { recursive: true });
//   }

//   fs.writeFileSync(
//     path.join(jsonDirectory, fileName),
//     JSON.stringify(productos, null, 2)
//   );
//   console.log(`Datos guardados en ${path.join(jsonDirectory, fileName)}`);
//   return {
//     message: `Datos guardados en ${path.join(jsonDirectory, fileName)}`,
//     fileName: fileName,
//     productos,
//   };
// }
