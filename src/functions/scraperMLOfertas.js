import * as cheerio from "cheerio";
import axios from "axios";
import fs from "fs";

const baseUrl = "https://www.mercadolibre.com.ar/ofertas?page=";
const allItems = [];
let currentPage = 1;

const scrapeData = async () => {
  while (true) {
    try {
      const response = await axios.get(`${baseUrl}${currentPage}`, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });
      const data = response.data;
      const $ = cheerio.load(data);

      const products = $("div.andes-card.poly-card--grid-card");
      if (products.length === 0) {
        console.log("No se encontraron más productos. Fin del scraping.");
        break;
      }

      products.each((index, element) => {
        const title = $(element).find("a.poly-component__title").text().trim();
        const Price = $(element)
          .find("span.andes-money-amount--cents-superscript")
          .text()
          .trim();
        const ListPrice = $(element)
          .find("s.andes-money-amount--previous .andes-money-amount__fraction")
          .text()
          .trim();
        const seller = $(element)
          .find("span.poly-component__seller")
          .text()
          .trim();
        const discount = $(element)
          .find("span.andes-money-amount__discount")
          .text()
          .trim();
        const shipping = $(element)
          .find("span.poly-shipping--same_day")
          .text()
          .trim();
        const installmentsText = $(element)
          .find("span.poly-price__installments")
          .text()
          .trim();
        const installmentPrice = $(element)
          .find("span.andes-money-amount--compact")
          .text()
          .trim();

        allItems.push({
          title,
          Price,
          ListPrice,
          discount,
          seller,
          shipping,
          installmentsText,
          installmentPrice,
        });
      });

      console.log(`Datos de la página ${currentPage} extraídos.`);
      currentPage++;

      // Agregar un retraso de 5 segundos
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (error) {
      console.error(`Error al scrapear la página ${currentPage}:`, error);
      break; // Detener si hay un error
    }
  }

  const today = new Date();
  const formattedDate = today.toISOString().slice(0, 10).replace(/-/g, "");
  const fileName = `productosMercadoLibre${formattedDate}.json`;

  fs.writeFileSync(fileName, JSON.stringify(allItems, null, 2));
  console.log(`Datos guardados en ${fileName}`);
};

scrapeData();

// const $ = cheerio.load(html);

// async function scrapePage(page) {
//   const url = `${baseUrl}?page=${page}`;

//   try {
//     const response = await axios.get(url);
//     const html = response.data;
//     const $ = cheerio.load(html);

//     const items = $(".col-lg-3 .item");
//     if (items.length === 0) {
//       return false;
//     }

//     $(".andes-card").each((index, element) => {
//       const nombre = $(element).find(".poly-component__title").text().trim();
//       const precio = $(element).find(".poly-price__current span").text().trim();

//       productos.push({ nombre, precio });
//     });

//     return true;
//   } catch (error) {
//     console.error(`Error al acceder a la página ${page}:`, error);
//     return false;
//   }
// }
