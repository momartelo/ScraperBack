import * as cheerio from "cheerio";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const urls = {
  imepho: "https://imepho.com.ar/producto/cemento-portland-x-50-kg",
  rutenia:
    "https://ruteniamateriales.com/producto/avellaneda-cemento-bolsa-50-kg/",
  marchal: "https://www.marchal.com.ar/producto/cemento-50-kg-avellaneda/",
  vega: "https://www.tienda.victorvega.com.ar/83-cemento-avellaneda-50kg.html",
  easy: "https://www.easy.com.ar/e152-cemento-loma-negra/p",
};
const cementos = [];
const __filename = fileURLToPath(import.meta.url);
console.log("Filename", __filename);
const __dirname = path.dirname(__filename);
console.log("Dirname", __dirname);

const scrapePages = async (urls) => {
  console.log("Estoy dentro de la función");

  try {
    for (const [key, url] of Object.entries(urls)) {
      console.log(`Accediendo a ${key}: ${url}`);
      try {
        const response = await axios.get(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
          },
        });

        if (response.status !== 200) {
          console.error(`Error al acceder a ${key}: ${response.status}`);
          continue;
        }
        const html = response.data;
        const $ = cheerio.load(html);

        // Lógica de scraping para cada URL
        if (key === "easy") {
          const items = $(".vtex-flex-layout-0-x-flexCol--product-right-col");
          items.each((index, element) => {
            const empresa = key;
            const nombre = $(element)
              .find(".vtex-store-components-3-x-productNameContainer")
              .text()
              .trim();
            const precio = $(element)
              .find(".arcencohogareasy-store-theme-QwYvctDzai0F1a2u12dlU")
              .text()
              .trim();
            const marca = $(element)
              .find(".vtex-store-components-3-x-productBrandName")
              .text()
              .trim();
            cementos.push({ empresa, nombre, precio, marca });
          });
        } else if (key === "vega") {
          const items = $("#inner-wrapper");
          console.log(items);
          items.each((index, element) => {
            const empresa = key;

            // Ajustar la selección para el nombre del producto
            const nombre = $(element).find("h1 .page-title span").text().trim(); // Se eliminó el punto antes de "page-title"

            // Ajustar la selección para el precio actual
            const precio = $(element)
              .find(".current-price-value")
              .attr("content")
              .trim(); // Obtener el valor del atributo "content"

            // Si necesitas el nombre de la marca, verifica que el selector sea correcto
            const marca = $(element)
              .find(".product-manufacturer img")
              .attr("alt")
              .trim(); // Obtiene el atributo "alt" de la imagen de la marca

            cementos.push({ empresa, nombre, precio, marca });
          });
        } else if (key === "marchal") {
          const items = $(".elementor-element-7c1386df");
          items.each((index, element) => {
            const empresa = key;
            const nombre = $(element)
              .find(".elementor-widget-container h1")
              .text()
              .trim();
            const precio = $(element)
              .find(".woocommerce-Price-amount.amount bdi")
              .first()
              .text()
              .trim();
            const marca = $(element)
              .find(".elementor-widget-container h1")
              .text()
              .trim();
            cementos.push({ empresa, nombre, precio, marca });
          });
        } else if (key === "rutenia") {
          const items = $(".product-info");
          items.each((index, element) => {
            const empresa = key;
            const nombre = $(element).find(".tagged_as a").text().trim();
            const precio = $(element).find(".precioEfectivo80").text().trim();
            const marca = $(element).find(".tagged_as a").text().trim();
            cementos.push({ empresa, nombre, precio, marca });
          });
        } else if (key === "imepho") {
          const items = $(".col-texto");
          items.each((index, element) => {
            const empresa = key;
            const nombre = $(element).find(".text-uppercase").text().trim();
            const precio = $(element).find(".precio").text().trim();
            const marca = $(element).find(".texto h4").text().trim();
            cementos.push({ empresa, nombre, precio, marca });
          });
        } else {
          console.log("No hay Coincidencia con una Key existente");
        }
      } catch (error) {
        console.error(`Error al obtener datos de ${key}:`, error.message);
      }
    }

    // Guardar datos en archivo
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${year}${month}${day}`;
    const fileName = `precioCemento${formattedDate}.json`;
    const jsonDirectory = path.join(__dirname, "src/public/json");
    console.log("jsonDirectory", jsonDirectory);

    if (!fs.existsSync(jsonDirectory)) {
      fs.mkdirSync(jsonDirectory, { recursive: true });
    }

    fs.writeFileSync(
      path.join(jsonDirectory, fileName),
      JSON.stringify(cementos, null, 2)
    );
    console.log(`Datos guardados en ${path.join(jsonDirectory, fileName)}`);
  } catch (error) {
    console.error(`Error al acceder a la información:`, error);
    return false;
  }
};

(async () => {
  try {
    console.log("Iniciando el scraping...");
    await scrapePages(urls);
  } catch (error) {
    console.error("Error al invocar la función:", error);
  }
})();
