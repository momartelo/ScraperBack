import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import prettier from "prettier";

(async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  // Iniciar el navegador
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navegar a la URL deseada
  await page.goto("https://listado.mercadolibre.com.ar/cemento#D[A:cemento]"); // Cambia esto a la URL real

  // Obtener el HTML completo de la página
  const fullHTML = await page.content();

  // Extraer información específica
  const data = await page.evaluate(() => {
    const title = document.title;
    const navLinks = Array.from(
      document.querySelectorAll(".TitlesHeader a")
    ).map((link) => ({
      text: link.innerText,
      href: link.href,
    }));
    const footerText = document.querySelector(".FuenteBottom")
      ? document.querySelector(".FuenteBottom").innerText
      : "";

    return {
      title,
      navLinks,
      footerText,
    };
  });

  const fileName = `Estructura.html`;
  const jsonDirectory = path.join(__dirname, "/src/public/json");
  const formattedHTML = await prettier.format(fullHTML, { parser: "html" });
  console.log("Este es el dirname");
  console.log(__dirname);
  console.log(jsonDirectory);

  fs.writeFileSync(path.join(jsonDirectory, fileName), formattedHTML);
  console.log(`Datos guardados en ${path.join(jsonDirectory, fileName)}`);

  console.log("HTML Completo:", fullHTML); // Puedes guardar esto en un archivo si lo deseas
  console.log("Título:", data.title);
  console.log("Enlaces de Navegación:", data.navLinks);
  console.log("Texto del Pie de Página:", data.footerText);

  // Cerrar el navegador
  await browser.close();
})();
