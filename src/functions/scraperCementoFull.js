import puppeteer from "puppeteer";
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
const __dirname = path.dirname(__filename);

const obtenerDatosVega = async (page) => {
  try {
    await page.waitForSelector("h1.page-title span", { timeout: 5000 });
    const nombre = await page.$eval("h1.page-title span", (el) =>
      el.innerText.trim()
    );
    const precio = await page.$eval(".current-price-value", (el) =>
      el.getAttribute("content").trim()
    );
    let marca;
    try {
      marca = await page.$eval(".product-manufacturer img", (el) =>
        el.getAttribute("alt").trim()
      );
    } catch (error) {
      console.warn("Marca no encontrada, se omitirá.");
      marca = "Desconocida"; // Valor por defecto si no se encuentra la marca
    }
    return { nombre, precio, marca };
  } catch (error) {
    console.error(`Error al obtener datos de Vega:`, error.message);
    return null;
  }
};

const obtenerDatosEasy = async (page) => {
  const items = await page.$$eval(
    ".vtex-flex-layout-0-x-flexCol--product-right-col",
    (elements) =>
      elements.map((element) => {
        const nombre = element
          .querySelector(".vtex-store-components-3-x-productNameContainer")
          ?.innerText.trim();
        const precio = element
          .querySelector(".arcencohogareasy-store-theme-QwYvctDzai0F1a2u12dlU")
          ?.innerText.trim();
        const marca = element
          .querySelector(".vtex-store-components-3-x-productBrandName")
          ?.innerText.trim();
        return { nombre, precio, marca };
      })
  );
  return items;
};

const obtenerDatosMarchal = async (page) => {
  const items = await page.$$eval(".elementor-element-7c1386df", (elements) =>
    elements.map((element) => {
      const nombre = element
        .querySelector(".elementor-widget-container h1")
        ?.innerText.trim();
      const precio = element
        .querySelector(".woocommerce-Price-amount.amount bdi")
        ?.innerText.trim();
      const marca = nombre; // Supongo que es el mismo nombre
      return { nombre, precio, marca };
    })
  );
  return items;
};

const obtenerDatosRutenia = async (page) => {
  const items = await page.$$eval(".product-info", (elements) =>
    elements.map((element) => {
      const nombre = element.querySelector(".tagged_as a")?.innerText.trim();
      const precio = element
        .querySelector(".precioEfectivo80")
        ?.innerText.trim();
      const marca = nombre; // Supongo que es el mismo nombre
      return { nombre, precio, marca };
    })
  );
  return items;
};

const obtenerDatosImepho = async (page) => {
  const items = await page.$$eval(".col-texto", (elements) =>
    elements.map((element) => {
      const nombre = element.querySelector(".text-uppercase")?.innerText.trim();
      const precio = element.querySelector(".precio")?.innerText.trim();
      const marca = element.querySelector(".texto h4")?.innerText.trim();
      return { nombre, precio, marca };
    })
  );
  return items;
};

export const scrapeCemento = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  try {
    for (const [key, url] of Object.entries(urls)) {
      console.log(`Accediendo a ${key}: ${url}`);
      try {
        await page.goto(url, { waitUntil: "networkidle2" });
        let datos;
        switch (key) {
          case "easy":
            datos = await obtenerDatosEasy(page);
            break;
          case "vega":
            datos = await obtenerDatosVega(page);
            break;
          case "marchal":
            datos = await obtenerDatosMarchal(page);
            break;
          case "rutenia":
            datos = await obtenerDatosRutenia(page);
            break;
          case "imepho":
            datos = await obtenerDatosImepho(page);
            break;
          default:
            console.log("No hay coincidencia con una key existente");
            continue; // Salta a la siguiente iteración
        }

        if (Array.isArray(datos)) {
          datos.forEach((item) => cementos.push({ empresa: key, ...item }));
        } else if (datos) {
          cementos.push({ empresa: key, ...datos });
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
    const jsonDirectory = path.join(__dirname, "../public/json");

    if (!fs.existsSync(jsonDirectory)) {
      fs.mkdirSync(jsonDirectory, { recursive: true });
    }

    fs.writeFileSync(
      path.join(jsonDirectory, fileName),
      JSON.stringify(cementos, null, 2)
    );
    console.log(`Datos guardados en ${path.join(jsonDirectory, fileName)}`);
    return {
      message: `Los Datos fueron guardados en ${path.join(jsonDirectory, fileName)}`,
      fileName: fileName,
      productos: cementos,
    };
  } catch (error) {
    console.error(`Error al acceder a la información:`, error);
    return false;
  } finally {
    await browser.close();
  }
};

// (async () => {
//   try {
//     console.log("Iniciando el scraping...");
//     await scrapePages(urls);
//   } catch (error) {
//     console.error("Error al invocar la función:", error);
//   }
// })();
