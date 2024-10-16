import * as cheerio from "cheerio";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const baseUrls = {
  hogarMueblesJardin:
    "https://hidraulicasantamariasa336408843.mercadoshops.com.ar/listado/hogar-muebles-jardin/_Desde_",
  construccion:
    "https://hidraulicasantamariasa336408843.mercadoshops.com.ar/listado/construccion/_Desde_",
  herramientas:
    "https://hidraulicasantamariasa336408843.mercadoshops.com.ar/listado/herramientas/_Desde_",
  agro: "https://hidraulicasantamariasa336408843.mercadoshops.com.ar/listado/agro/_Desde_",
  otrasCategorias:
    "https://hidraulicasantamariasa336408843.mercadoshops.com.ar/listado/otras-categorias/_Desde_",
};

const itemsPerPage = 49; // Ajusta según sea necesario
const allItems = [];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const scrapeData = async () => {
  for (const [title, baseUrl] of Object.entries(baseUrls)) {
    let currentPage = 0;
    let morePages = true;

    while (morePages) {
      const url = `${baseUrl}${currentPage * itemsPerPage}_NoIndex_True`;

      try {
        const response = await axios.get(url);
        const data = response.data;
        const $ = cheerio.load(data);

        const items = $("li.ui-search-layout__item");

        if (items.length === 0) {
          morePages = false; // Detener si no hay más elementos
        } else {
          items.each((index, element) => {
            const itemTitle = $(element)
              .find("h2.poly-component__title a")
              .text()
              .trim();
            const price = $(element)
              .find("span.andes-money-amount__fraction")
              .text()
              .trim();
            allItems.push({ title, itemTitle, price }); // Agregando el título de la sección
          });

          console.log(
            `Datos de la página ${currentPage + 1} de ${title} extraídos.`
          );
          currentPage++;
        }
      } catch (error) {
        console.error(
          `Error al scrapear la página ${currentPage + 1} de ${title}:`,
          error
        );
        morePages = false; // Detener en caso de error
      }
    }
  }

  // Formatear la fecha actual
  const today = new Date();
  const formattedDate = today.toISOString().slice(0, 10).replace(/-/g, ""); // Formato YYYYMMDD
  const fileName = `productosHidraulica${formattedDate}.json`; // Nombre del archivo

  fs.writeFileSync(fileName, JSON.stringify(allItems, null, 2));
  console.log(`Datos guardados en ${fileName}`);
};

scrapeData();

// import * as cheerio from "cheerio";
// import axios from "axios";
// import fs from "fs";

// const baseUrls = {
//   hogarMueblesJardin:
//     "https://hidraulicasantamariasa336408843.mercadoshops.com.ar/listado/hogar-muebles-jardin/_Desde_",
//   construccion:
//     "https://hidraulicasantamariasa336408843.mercadoshops.com.ar/listado/construccion/_Desde_",
//   herramientas:
//     "https://hidraulicasantamariasa336408843.mercadoshops.com.ar/listado/herramientas/_Desde_",
//   agro: "https://hidraulicasantamariasa336408843.mercadoshops.com.ar/listado/agro/_Desde_",
//   otrasCategorias:
//     "https://hidraulicasantamariasa336408843.mercadoshops.com.ar/listado/otras-categorias/_Desde_",

//   // Agrega más secciones aquí si es necesario
// };

// const itemsPerPage = 49; // Ajusta según sea necesario
// const allItems = [];

// const scrapeData = async () => {
//   for (const [title, baseUrl] of Object.entries(baseUrls)) {
//     let currentPage = 0;
//     let morePages = true;

//     while (morePages) {
//       const url = `${baseUrl}${currentPage * itemsPerPage}_NoIndex_True`;

//       try {
//         const response = await axios.get(url);
//         const data = response.data;
//         const $ = cheerio.load(data);

//         const items = $("li.ui-search-layout__item");

//         if (items.length === 0) {
//           morePages = false; // Detener si no hay más elementos
//         } else {
//           items.each((index, element) => {
//             const itemTitle = $(element)
//               .find("h2.poly-component__title a")
//               .text()
//               .trim();
//             const price = $(element)
//               .find("span.andes-money-amount__fraction")
//               .text()
//               .trim();
//             allItems.push({ title, itemTitle, price }); // Agregando el título de la sección
//           });

//           console.log(
//             `Datos de la página ${currentPage + 1} de ${title} extraídos.`
//           );
//           currentPage++;
//         }
//       } catch (error) {
//         console.error(
//           `Error al scrapear la página ${currentPage + 1} de ${title}:`,
//           error
//         );
//         morePages = false; // Detener en caso de error
//       }
//     }
//   }

//   // Formatear la fecha actual
//   const today = new Date();
//   const formattedDate = today.toISOString().slice(0, 10).replace(/-/g, ""); // Formato YYYYMMDD
//   const fileName = `productosHidraulica${formattedDate}.json`; // Nombre del archivo

//   fs.writeFileSync(fileName, JSON.stringify(allItems, null, 2));
//   console.log(`Datos guardados en ${fileName}`);
// };

// scrapeData();
