import puppeteer from "puppeteer";
import fs from "fs"; // Importar file system para guardar el JSON

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Navega a la página de productos
  await page.goto("https://electronicajck.com/shop?order=create_date+desc", {
    waitUntil: "networkidle2",
  });

  let previousHeight;
  let productos = [];

  // Bucle para simular el scroll infinito
  while (true) {
    // Extrae los productos visibles en la pantalla actual
    const nuevosProductos = await page.evaluate(() => {
      const filas = document.querySelectorAll("tr .oe_product"); // Selecciona las filas que contienen productos
      let datos = [];

      filas.forEach((fila) => {
        const titulo = fila
          .querySelector('h6[itemprop="name"]')
          ?.textContent.trim();
        const precio = fila
          .querySelector('span[itemprop="price"]')
          ?.textContent.trim();

        // Extraer el número de unidades disponibles
        const disponibles = fila.querySelector('div[itemprop="offers"] a span');
        const disponiblesCantidad = disponibles
          ? disponibles.textContent.trim()
          : "No disponible";

        // Extraer el precio de descuento efectivo
        // Extraer el precio de descuento efectivo
        const precioDescEfectivo = fila.querySelectorAll(".oe_currency_value");
        const precioEfectivoValor =
          precioDescEfectivo.length > 0
            ? precioDescEfectivo[3].textContent.trim()
            : "No disponible"; // Usar el segundo elemento para el efectivo

        if (titulo && precio) {
          datos.push({
            titulo,
            precio,
            disponibles: disponiblesCantidad,
            precioDescEfectivo: precioEfectivoValor,
          });
        }
      });

      return datos;
    });

    productos = productos.concat(nuevosProductos);

    // Desplaza la página hacia abajo
    previousHeight = await page.evaluate(() => document.body.scrollHeight);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Espera un poco para que se carguen nuevos productos
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Pausa de 2 segundos

    // Comprueba si la altura de la página ha cambiado
    const newHeight = await page.evaluate(() => document.body.scrollHeight);
    if (newHeight === previousHeight) {
      break; // Sale del bucle si no hay más productos por cargar
    }
  }

  console.log("Productos extraídos:", productos);

  // Guardar los productos en un archivo JSON
  const today = new Date();
  const formattedDate = today.toISOString().slice(0, 10).replace(/-/g, "");
  const fileName = `productosEJCK${formattedDate}.json`;

  fs.writeFileSync(fileName, JSON.stringify(productos, null, 2));
  console.log(`Datos guardados en ${fileName}`);

  await browser.close();
})();
