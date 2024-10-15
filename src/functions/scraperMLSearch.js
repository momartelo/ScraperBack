import * as cheerio from "cheerio";
import axios from "axios";
import fs from "fs";

const getProductsSearch = (word, start) => {
  return `https://listado.mercadolibre.com.ar/${word}_Desde_${start}_NoIndex_True`;
};

const allItems = [];
let currentPage = 1;

const scrapeData = async (word) => {
  let start = 1; // Controla el offset de las páginas

  while (true) {
    try {
      const url = getProductsSearch(word, start);
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });
      const data = response.data;
      const $ = cheerio.load(data);

      const products = $("li.ui-search-layout__item");
      if (products.length === 0) {
        console.log("No se encontraron más productos. Fin del scraping.");
        break;
      }

      products.each((index, element) => {
        const title = $(element)
          .find("h2.poly-component__title a")
          .text()
          .trim();
        const price = $(element)
          .find("div.poly-price__current span.andes-money-amount__fraction")
          .text()
          .trim();
        const RegularPrice = $(element)
          .find("s.andes-money-amount span.andes-money-amount__fraction")
          .text()
          .trim();
        const rating = $(element)
          .find("span.poly-reviews__rating")
          .text()
          .trim();
        const reviews = $(element)
          .find("span.poly-reviews__total")
          .text()
          .trim();
        const productUrl = $(element)
          .find("h2.poly-component__title a")
          .attr("href");

        // Extraer más campos si es necesario

        allItems.push({
          title,
          price,
          RegularPrice,
          rating,
          reviews,
          productUrl,
        });
      });

      console.log(`Datos de la página ${currentPage} extraídos.`);
      currentPage++;
      start += 50; // Aumenta el offset para la siguiente página

      // Agregar un retraso de 5 segundos
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("No se encontraron más páginas. Fin del scraping.");
        break; // Detener el scraping si se recibe un error 404
      } else {
        console.error(`Error al scrapear la página ${currentPage}:`, error);
        break; // Detener si hay cualquier otro error
      }
    }
  }

  const today = new Date();
  const formattedDate = today.toISOString().slice(0, 10).replace(/-/g, "");
  const fileName = `productosSearchML_${word}_${formattedDate}.json`;

  fs.writeFileSync(fileName, JSON.stringify(allItems, null, 2));
  console.log(`Datos guardados en ${fileName}`);
};

// Llama a la función de scraping con la palabra de búsqueda
scrapeData("descarne");
