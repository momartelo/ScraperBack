import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para crear un retraso
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function priceRegulator(price) {
  const cleanPrice = price.replace(/[^\d.-]/g, "");
  const number = parseFloat(cleanPrice);
  const formattedPrice = number.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formattedPrice;
}

function cleanPrice(price) {
  return price.replace(/^\$\s*/g, "");
}

const getPriceSteelCaruso = async (diameter) => {
  const browser = await puppeteer.launch({ headless: false }); // Puedes cambiar 'false' a 'true' para ejecutarlo sin navegador visible
  const page = await browser.newPage();
  try {
    await page.goto(
      "https://mdp.hierroscaruso.com.ar/producto/hierro-de-construccion-aletado/"
    );

    // Esperar a que cargue el select para elegir el diámetro
    await page.waitForSelector("#pa_medida-milimetros");

    // Seleccionar el diámetro en el select
    await page.select("#pa_medida-milimetros", `${diameter}-mm`);

    // Esperar a que se actualice el precio
    await page.waitForSelector(
      ".woocommerce-variation-price .woocommerce-Price-amount"
    );

    // Extraer el precio
    const price = await page.$eval(
      ".woocommerce-variation-price .woocommerce-Price-amount",
      (el) => el.innerText
    );

    // Esperar a que cargue el título del producto
    await page.waitForSelector("h1.product-title.product_title.entry-title");

    // Extraer el nombre del producto
    const nombre = await page.$eval(
      "h1.product-title.product_title.entry-title",
      (el) => el.innerText
    );

    const proveedor = "Hierros Caruso";

    console.log(`El precio para el diámetro de ${diameter} mm es: ${price}`);
    console.log(`${nombre} y el proveedor ${proveedor}`);

    const result = {
      name: nombre,
      price: cleanPrice(price), // Asegúrate de tener una función 'cleanPrice' definida si es necesario
      supplier: proveedor,
      diameter: diameter,
    };

    return result;
  } catch (error) {
    console.error("Error al obtener datos del producto:", error);
  } finally {
    await browser.close();
  }
};

const getPriceSteelCentrosider = async (diameter) => {
  const browser = await puppeteer.launch({ headless: false }); // Cambia a 'true' para ejecutar sin ventana del navegador
  const page = await browser.newPage();

  try {
    // Navegar al producto en Centrosider
    await page.goto(
      `https://centrosider.com.ar/producto/hierro-de-construccion-aletado-o-${diameter}-mm/`
    );

    // Esperar a que cargue el precio
    await page.waitForSelector(
      ".price-wrapper .woocommerce-Price-amount.amount"
    );

    // Extraer el precio
    const price = await page.$eval(
      ".price-wrapper .woocommerce-Price-amount.amount",
      (el) => el.innerText
    );

    // Extraer el nombre del producto
    await page.waitForSelector("h1.product-title.product_title.entry-title");
    const nombre = await page.$eval(
      "h1.product-title.product_title.entry-title",
      (el) => el.innerText
    );

    const proveedor = "Centrosider";

    console.log(`El precio para el diámetro de ${diameter} mm es: ${price}`);
    console.log(`${nombre} y el proveedor ${proveedor}`);

    const result = {
      name: nombre,
      price: cleanPrice(price), // Asegúrate de definir 'cleanPrice' si es necesario
      supplier: proveedor,
      diameter: diameter,
    };

    return result;
  } catch (error) {
    console.error("Error al obtener datos del producto:", error);
  } finally {
    await browser.close();
  }
};

const getPriceSteelPlastigas = async (diameter) => {
  const browser = await puppeteer.launch({ headless: false }); // Cambia a 'true' si no necesitas la ventana del navegador
  const page = await browser.newPage();

  try {
    // Navegar a la página del producto
    await page.goto(
      `https://www.plastigas.com.ar/hierro-de-construccion-conformado-dn-42-x-12-mts-hieconf#variante=7646`
    );

    // Esperar a que la matriz de opciones esté cargada
    await page.waitForSelector(".amconf-matrix-row");

    // Obtener el nombre del material
    const materialName = await page.$eval(
      "h1.page-title .base",
      (el) => el.innerText
    );

    // Obtener todas las filas de opciones
    const rows = await page.$$(".amconf-matrix-row");
    let found = false;

    // Iterar sobre las filas y buscar el diámetro correspondiente
    for (let row of rows) {
      const diameterText = await row.$eval(
        ".amconf-matrix-attribute .swatch-option.text",
        (el) => el.innerText.trim()
      );

      console.log(`Diámetro encontrado: '${diameterText}'`);

      if (diameterText.toLowerCase() === `${diameter} mm`.toLowerCase()) {
        found = true;

        // Obtener el precio para el diámetro seleccionado
        const price = await row.$eval(
          ".amconf-matrix-price div > div:nth-of-type(1)",
          (el) => el.innerText.trim()
        );

        console.log(`Nombre del material: ${materialName}`);
        console.log(`Precio para el diámetro de ${diameter} mm`);
        console.log(`Precio actual: $${price}`);

        const proveedor = "Plastigas";

        const result = {
          name: materialName,
          price: cleanPrice(price), // Asegúrate de definir 'cleanPrice' si es necesario
          supplier: proveedor,
          diameter: diameter,
        };

        return result;
      }
    }

    if (!found) {
      console.log(`No se encontró el diámetro de ${diameter} mm`);
      return null;
    }
  } catch (error) {
    console.error("Error al obtener datos del producto:", error);
  } finally {
    await browser.close();
  }
};

const getPriceSteelVega = async (diameter) => {
  const browser = await puppeteer.launch({ headless: false }); // Cambia a 'true' si no necesitas la ventana del navegador
  const page = await browser.newPage();
  const urls = {
    6: "https://www.tienda.victorvega.com.ar/1057-hierro-del-6.html",
    8: "https://www.tienda.victorvega.com.ar/1056-hierro-del-8.html",
    10: "https://www.tienda.victorvega.com.ar/1058-hierro-del-10.html",
    12: "https://www.tienda.victorvega.com.ar/1059-hierro-del-12.html",
    16: "https://www.tienda.victorvega.com.ar/1060-hierro-del-16.html",
    20: "https://www.tienda.victorvega.com.ar/1061-hierro-del-20.html",
    25: "https://www.tienda.victorvega.com.ar/1062-hierro-del-25.html",
  };
  try {
    const diameterValue = parseInt(diameter, 10);
    console.log(`El diámetro recibido es: ${diameterValue}`); // Verificación

    if (urls[diameterValue]) {
      console.log(
        `Accediendo a la URL para diámetro ${diameterValue} mm: ${urls[diameterValue]}`
      );
      await page.goto(urls[diameterValue]);
      await page.waitForSelector(".product_header_container.clearfix");
      const nombre = await page.$eval(
        "h1.h1.page-title span",
        (el) => el.innerText
      );
      // Esperar a que el precio esté disponible
      await page.waitForSelector(".current-price");
      const price = await page.$eval(
        ".product-price.current-price-value",
        (el) => el.innerText
      );
      const proveedor = "Victor Vega";

      console.log(`El precio para el diámetro de ${diameter} mm es: ${price}`);
      console.log(`${nombre} y el proveedor ${proveedor}`);

      const result = {
        name: nombre,
        price: cleanPrice(price), // Asegúrate de definir 'cleanPrice' si es necesario
        supplier: proveedor,
        diameter: diameter,
      };

      return result;
    }
  } catch (error) {
    console.error("Error al obtener datos del producto:", error);
  } finally {
    await browser.close();
  }
};

const getPriceSteelRedAcindar = async (diameter) => {
  const browser = await puppeteer.launch({ headless: false }); // Cambia a 'true' para ejecutar sin ventana del navegador
  const page = await browser.newPage();
  const urls = {
    6: "https://www.redacindar.com.ar/MLA-852243739-acindar-varilla-hierro-para-construccion-6-mm-x-12mts-x-un-_JM#polycard_client=search-nordic-mshops&position=3&search_layout=grid&type=item&tracking_id=2d05139f-a0cc-4bb4-a672-affe3e60937d",
    8: "https://www.redacindar.com.ar/MLA-934828620-acindar-varilla-hierro-construccion-8-mm-x-12mts-_JM#polycard_client=search-nordic-mshops&position=1&search_layout=grid&type=item&tracking_id=5069b27a-2a28-4ec5-945e-6847a15545c0",
    10: "https://www.redacindar.com.ar/MLA-852247588-acindar-varilla-hierro-para-construccion-10-mm-x-12mts-x-un-_JM#polycard_client=search-nordic-mshops&position=2&search_layout=grid&type=item&tracking_id=e7053a24-76de-49ef-b779-e3bf40ac6e28",
    12: "https://www.redacindar.com.ar/MLA-852247175-acindar-varilla-hierro-para-construccion-12-mm-x-12mts-x-un-_JM#polycard_client=search-nordic-mshops&position=12&search_layout=grid&type=item&tracking_id=7a887858-5299-4c72-88c0-7ab0ceb7111a",
    16: "https://www.redacindar.com.ar/MLA-865106419-acindar-varilla-hierro-para-construccion-16-mm-x-12mts-x-un-_JM#polycard_client=search-nordic-mshops&position=14&search_layout=grid&type=item&tracking_id=8544e731-0137-42b2-9738-558c173a8be8",
    20: "https://www.redacindar.com.ar/MLA-854078325-acindar-varilla-de-hierro-construccion-20-mm-x-12-mts-largo-_JM#polycard_client=search-nordic-mshops&position=10&search_layout=grid&type=item&tracking_id=e7f8771b-14e3-4da7-8f48-5aa8820f2fb9",
  };
  try {
    const diameterValue = parseInt(diameter, 10);
    console.log(`El diámetro recibido es: ${diameterValue}`); // Verificación

    if (urls[diameterValue]) {
      console.log(
        `Accediendo a la URL para diámetro ${diameterValue} mm: ${urls[diameterValue]}`
      );
      await page.goto(urls[diameterValue]);
      await page.waitForSelector(".ui-pdp-header__title-container");
      const nombre = await page.$eval("h1.ui-pdp-title", (el) => el.innerText);

      await page.waitForSelector(".andes-money-amount__fraction");
      const price = await page.$eval(
        ".andes-money-amount__fraction",
        (el) => el.innerText
      );
      const proveedor = "Red Acindar";

      console.log(`El precio para el diámetro de ${diameter} mm es: ${price}`);
      console.log(`${nombre} y el proveedor ${proveedor}`);
      const result = {
        name: nombre,
        price: cleanPrice(price), // Asegúrate de definir 'cleanPrice' si es necesario
        supplier: proveedor,
        diameter: diameter,
      };
      return result;
    }
  } catch (error) {
    console.error("Error al obtener datos del producto:", error);
  } finally {
    await browser.close();
  }
};

const getPriceSteelEasy = async (diameter) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Configurar User-Agent para evitar que sea bloqueado por el sitio
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );

  const urls = {
    6: "https://www.easy.com.ar/hierro-redondo-adn-06mm-12mt---cap-gba/p",
    8: "https://www.easy.com.ar/hierro-redondo-adn-08mm-12mt---cap-gba/p",
    10: "https://www.easy.com.ar/hierro-redondo-adn-10mm-12mt---cap-gba/p",
    12: "https://www.easy.com.ar/hierro-redondo-adn-12mm-12mt---cap-gba/p",
  };

  try {
    const diameterValue = parseInt(diameter, 10);
    console.log(`El diámetro recibido es: ${diameterValue}`);

    if (urls[diameterValue]) {
      console.log(
        `Accediendo a la URL para diámetro ${diameterValue} mm: ${urls[diameterValue]}`
      );
      await page.goto(urls[diameterValue], {
        waitUntil: "domcontentloaded", // Puedes cambiar a "load" si prefieres que espere hasta la carga total
        timeout: 60000, // 1 minuto de espera
      });

      await page.waitForSelector(
        ".vtex-store-components-3-x-productNameContainer",
        {
          visible: true,
          timeout: 60000, // 1 minuto de espera para que el selector esté visible
        }
      );

      const nombre = await page.$eval(
        ".vtex-store-components-3-x-productNameContainer",
        (el) => el.innerText
      );
      const price = await page.$eval(
        ".arcencohogareasy-store-theme-QwYvctDzai0F1a2u12dlU",
        (el) => el.innerText
      );

      if (!nombre || !price) {
        console.error(
          "No se pudo encontrar el nombre o el precio del producto."
        );
        return;
      }

      const proveedor = "Easy";
      console.log(`El precio para el diámetro de ${diameter} mm es: ${price}`);
      console.log(`${nombre} y el proveedor ${proveedor}`);

      const result = {
        name: nombre,
        price: cleanPrice(price), // Asegúrate de definir la función 'cleanPrice'
        supplier: proveedor,
        diameter: diameter,
      };

      return result;
    } else {
      console.log(`No se encontró una URL para el diámetro de ${diameter} mm.`);
      return null;
    }
  } catch (error) {
    console.error("Error al obtener datos del producto:", error);
  } finally {
    await browser.close();
  }
};

const getPriceSteelItar = async (diameter) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Configurar User-Agent para evitar que sea bloqueado por el sitio
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );
  const urls = {
    6: "https://itar.com.ar/producto/o-6mm-acindar-2-664/",
    8: "https://itar.com.ar/producto/o-8mm-acindar-4-740/",
    10: "https://itar.com.ar/producto/o-10mm-acindar-7-704/",
    12: "https://itar.com.ar/producto/o-12mm-acindar-10-656/",
    16: "https://itar.com.ar/producto/o-16mm-acindar-18-960/",
    20: "https://itar.com.ar/producto/o-20mm-acindar-29-640/",
    25: "https://itar.com.ar/producto/o-25mm-acindar-46-200/",
  };
  try {
    const diameterValue = parseInt(diameter, 10);
    console.log(`El diámetro recibido es: ${diameterValue}`);

    if (urls[diameterValue]) {
      console.log(
        `Accediendo a la URL para diámetro ${diameterValue} mm: ${urls[diameterValue]}`
      );
      await page.goto(urls[diameterValue], {
        waitUntil: "domcontentloaded", // Puedes cambiar a "load" si prefieres que espere hasta la carga total
        timeout: 60000, // 1 minuto de espera
      });

      await page.waitForSelector(".product-summary", {
        visible: true,
        timeout: 60000, // 1 minuto de espera para que el selector esté visible
      });

      const nombre = await page.$eval("h1", (el) => el.innerText);
      const price = await page.$eval(
        ".price-wrapper .woocommerce-Price-amount.amount",
        (el) => el.innerText
      );

      if (!nombre || !price) {
        console.error(
          "No se pudo encontrar el nombre o el precio del producto."
        );
        return;
      }

      const proveedor = "Itar";
      console.log(`El precio para el diámetro de ${diameter} mm es: ${price}`);
      console.log(`${nombre} y el proveedor ${proveedor}`);

      const result = {
        name: nombre,
        price: cleanPrice(price), // Asegúrate de definir la función 'cleanPrice'
        supplier: proveedor,
        diameter: diameter,
      };

      return result;
    } else {
      console.log(`No se encontró una URL para el diámetro de ${diameter} mm.`);
      return null;
    }
  } catch (error) {
    console.error("Error al obtener datos del producto:", error);
  } finally {
    await browser.close();
  }
};

export const getPriceSteel = async (diameter) => {
  try {
    const carusoResult = await getPriceSteelCaruso(diameter);
    const centrosiderResult = await getPriceSteelCentrosider(diameter);
    const plastigasResult = await getPriceSteelPlastigas(diameter);
    const vegaResult = await getPriceSteelVega(diameter);
    const acindarResult = await getPriceSteelRedAcindar(diameter);
    const easyResult = await getPriceSteelEasy(diameter);
    const itarResult = await getPriceSteelItar(diameter);
    const allResults = [
      carusoResult,
      centrosiderResult,
      plastigasResult,
      vegaResult,
      acindarResult,
      easyResult,
      itarResult,
    ];
    const validResults = allResults.filter((result) => result !== null);
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${year}${month}${day}`;
    const fileName = `precioAcero_${diameter}mm_${formattedDate}.json`;
    const jsonDirectory = path.join(__dirname, "../public/json");

    if (!fs.existsSync(jsonDirectory)) {
      fs.mkdirSync(jsonDirectory, { recursive: true });
    }

    fs.writeFileSync(
      path.join(jsonDirectory, fileName),
      JSON.stringify(validResults, null, 2)
    );

    console.log(`Datos guardados en ${path.join(jsonDirectory, fileName)}`);
    console.log("Datos desde el scrape");
    console.log(validResults);
    return {
      message: `Datos guardados en ${path.join(jsonDirectory, fileName)}`,
      fileName: fileName,
      productos: validResults,
    };
  } catch (error) {
    console.error(`Error al acceder a la información:`, error);
    return false;
  }
};
