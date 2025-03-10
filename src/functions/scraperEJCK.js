import puppeteer from "puppeteer";
import fs from "fs"; // Importar file system para guardar el JSON

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // URL base de la tienda
  const baseUrl = "https://electronicajck.com/shop";
  let productos = [];
  let hasNextPage = true; // Variable para controlar la paginación

  // Comienza en la página 1
  let currentPage = 1;

  while (hasNextPage) {
    const url = currentPage === 1 ? baseUrl : `${baseUrl}/page/${currentPage}`;
    console.log(`Extrayendo productos de la página: ${url}`);

    // Navegar a la página actual
    await page.goto(url, { waitUntil: "networkidle2" });

    // Extraer los productos de la página actual
    const nuevosProductos = await page.evaluate(() => {
      const filas = document.querySelectorAll("td.oe_product");
      let datos = [];

      filas.forEach((fila) => {
        // Título del producto
        const tituloElement = fila.querySelector(
          "h6.o_wsale_products_item_title a"
        );
        // Precio original
        const precioElement = fila.querySelector(".oe_currency_value");
        // Disponibilidad
        const disponibilidadElement = fila.querySelector(
          'p span[style="color: green;"]'
        );

        // Texto de las cuotas (ej: "6 Cuotas Simples de:")
        const textoCuotasElement = fila.querySelector(
          'div.product_price span[style*="color: blue"]'
        );

        // Precio en cuotas
        const precioCuotasElement = fila.querySelector(
          'div.product_price span[style*="color: blue"] + span .oe_currency_value'
        );

        // Precio especial (descuento)
        const precioEspecialElement = fila.querySelector(
          'div.product_price span:not([style*="color: blue"]) + span .oe_currency_value'
        );

        // Obtener los valores
        const titulo = tituloElement ? tituloElement.textContent.trim() : null;
        const precio = precioElement ? precioElement.textContent.trim() : null;
        const disponibilidad = disponibilidadElement
          ? disponibilidadElement.textContent.trim()
          : "No disponible";
        const textoCuotas = textoCuotasElement
          ? textoCuotasElement.textContent.trim()
          : "No disponible";
        const precioCuotas = precioCuotasElement
          ? precioCuotasElement.textContent.trim()
          : "No disponible";
        const precioEspecial = precioEspecialElement
          ? precioEspecialElement.textContent.trim()
          : "No disponible";

        if (titulo && precio) {
          datos.push({
            titulo,
            precio,
            disponibles: disponibilidad,
            textoCuotas,
            precioCuotas,
            precioEspecial,
          });
        }
      });

      return datos;
    });

    // Agregar los productos extraídos a la lista total
    productos = productos.concat(nuevosProductos);

    // Verificar si hay un enlace a la siguiente página
    const nextPageButton = await page.$(
      "ul.pagination li.page-item:not(.disabled) a.page-link span.fa-chevron-right"
    );
    console.log("NextPage", nextPageButton ? "Encontrado" : "No encontrado"); // Log para ver si encontramos el botón de siguiente página

    if (nextPageButton) {
      // Si el siguiente botón está habilitado, avanzamos a la siguiente página
      currentPage++; // Avanzamos a la siguiente página
      await nextPageButton.click(); // Hacemos clic en el botón de siguiente página
      await page.waitForNavigation({ waitUntil: "networkidle2" }); // Esperamos que cargue la nueva página
    } else {
      // Si el siguiente botón está deshabilitado, significa que hemos llegado a la última página
      hasNextPage = false; // No hay más páginas
    }

    // Pausa antes de proceder con la siguiente página
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Pausa de 2 segundos
  }

  console.log("Productos extraídos:", productos.length);

  // Guardar los productos en un archivo JSON
  const today = new Date();
  const formattedDate = today.toISOString().slice(0, 10).replace(/-/g, "");
  const fileName = `productosEJCK${formattedDate}.json`;

  fs.writeFileSync(fileName, JSON.stringify(productos, null, 2));
  console.log(`Datos guardados en ${fileName}`);

  await browser.close();
})();
