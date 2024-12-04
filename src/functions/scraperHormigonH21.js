import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const urls = {
  itar: "https://itar.com.ar/producto/m3-hormigon-elab-h21-as10/",
  perfil: "https://hormigonline.com.ar/producto/hormigon-tipo-h21-2/",
  suministro_de_obras:
    "https://suministrodeobras.com.ar/producto/hormigon-elaborado-m3-h21-2/",
  promat: "https://promatacopio.com/producto/hormigon-elaborado-h21-x-m%c2%b3/",
};

const hormigones = [];
const __filename = fileURLToPath(import.meta.url);
console.log(__filename);
const __dirname = path.dirname(__filename);
console.log(__dirname);

const obtenerDatosItar = async (page) => {
  const items = await page.$$eval(".product-summary", (elements) =>
    elements.map((element) => {
      const nombre =
        element.querySelector("h1")?.innerText.trim() || "Nombre no disponible"; // Valor por defecto

      const precio =
        element
          .querySelector(".woocommerce-Price-amount.amount bdi")
          ?.innerText.trim() || "Precio no disponible"; // Valor por defecto

      const proveedor = "Itar";

      return { nombre, precio, proveedor };
    })
  );

  return items;
};

const obtenerDatosPerfil = async (page) => {
  const items = await page.$$eval(".summary.entry-summary", (elements) =>
    elements.map((element) => {
      const nombre =
        element.querySelector(".product_title.entry-title")?.innerText.trim() ||
        "Nombre no disponible"; // Valor por defecto

      const precio =
        element
          .querySelector(".woocommerce-Price-amount.amount bdi")
          ?.innerText.trim() || "Precio no disponible"; // Valor por defecto

      const proveedor = "Perfil";

      return { nombre, precio, proveedor };
    })
  );

  return items;
};

const obtenerDatosSuministro = async (page) => {
  const items = await page.$$eval(".summary.entry-summary", (elements) =>
    elements.map((element) => {
      const nombre =
        element.querySelector(".product_title.entry-title")?.innerText.trim() ||
        "Nombre no disponible"; // Valor por defecto

      const precio =
        element
          .querySelector(".woocommerce-Price-amount.amount bdi")
          ?.innerText.trim() || "Precio no disponible"; // Valor por defecto

      const proveedor = "Suministro de Obras";

      return { nombre, precio, proveedor };
    })
  );
  return items;
};

const obtenerDatosPromat = async (page) => {
  const items = await page.$$eval(".summary.entry-summary", (elements) =>
    elements.map((element) => {
      const nombre =
        element.querySelector(".product_title.entry-title")?.innerText.trim() ||
        "Nombre no disponible"; // Valor por defecto

      const precio =
        element
          .querySelector(".woocommerce-Price-amount.amount bdi")
          ?.innerText.trim() || "Precio no disponible"; // Valor por defecto

      const proveedor = "Promat";

      return { nombre, precio, proveedor };
    })
  );

  return items;
};

export const scrapeHormigon = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  try {
    for (const [key, url] of Object.entries(urls)) {
      console.log(`Accediendo a ${key}: ${url}`);
      try {
        await page.goto(url, { waitUntil: "networkidle2" });
        let datos;
        switch (key) {
          case "itar":
            datos = await obtenerDatosItar(page);
            break;
          case "perfil":
            datos = await obtenerDatosPerfil(page);
            break;
          case "suministro_de_obras":
            datos = await obtenerDatosSuministro(page);
            break;
          case "promat":
            datos = await obtenerDatosPromat(page);
            break;
          default:
            console.log("No hay coincidencia con una key existente");
            continue;
        }

        if (Array.isArray(datos)) {
          datos.forEach((item) => hormigones.push({ proveedor: key, ...item }));
        } else if (datos) {
          hormigones.push({ proveedor: key, ...datos });
        }
      } catch (error) {
        console.error(`Error al obtener datos de ${key}:`, error.message);
      }
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${year}${month}${day}`;
    const fileName = `precioHormigones${formattedDate}.json`;
    const jsonDirectory = path.join(__dirname, "../public/json");

    if (!fs.existsSync(jsonDirectory)) {
      fs.mkdirSync(jsonDirectory, { recursive: true });
    }

    fs.writeFileSync(
      path.join(jsonDirectory, fileName),
      JSON.stringify(hormigones, null, 2)
    );
    console.log(`Datos guardados en ${path.join(jsonDirectory, fileName)}`);
    return {
      message: `Datos guardados en ${path.join(jsonDirectory, fileName)}`,
      fileName: fileName,
      productos: hormigones,
    };
  } catch (error) {
    console.error(`Error al acceder a la información:`, error);
    return false;
  } finally {
    await browser.close();
  }
};
