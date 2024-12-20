import fs from "fs";
import path from "path";

// Esto es para obtener la ruta base de tu proyecto
const __dirname = path.resolve();

export const ctrlGraphics = async (req, res) => {
  console.log("Desde el controlador");

  const directoryPath = path.join(__dirname, "/src/public/json");
  const filePrefix = req.params.category;

  try {
    const files = await fs.promises.readdir(directoryPath);
    const jsonFiles = files.filter(
      (file) => file.startsWith(filePrefix) && file.endsWith(".json")
    );

    if (jsonFiles.length === 0) {
      return res.status(404).json({
        message: `No se encontraron archivos que comiencen con ${filePrefix} en el directorio especificado.`,
      });
    }

    const products = {};

    for (const file of jsonFiles) {
      try {
        const dateMatch = file.match(/(\d{8})\.json$/);
        if (!dateMatch) {
          console.warn(`No se pudo extraer la fecha del archivo ${file}`);
          continue;
        }

        const fileDate = dateMatch[1];
        const filePath = path.join(directoryPath, file);
        const fileContent = JSON.parse(
          await fs.promises.readFile(filePath, "utf8")
        );

        fileContent.forEach((item) => {
          const productKey = item.nombre.toLowerCase();
          if (!products[productKey]) {
            products[productKey] = [];
          }
          products[productKey].push({
            fecha: fileDate,
            proveedor: item.empresa || item.proveedor,
            nombre: item.nombre,
            precio: item.precio,
          });
        });
      } catch (error) {
        console.error(`Error al leer el archivo ${file}:`, error.message);
        return res.status(500).json({
          error: `Error al procesar el archivo ${file}`,
        });
      }
    }

    // Ordenar los productos por fecha
    Object.keys(products).forEach((key) => {
      products[key].sort((a, b) => {
        const fechaA = new Date(
          a.fecha.substring(0, 4), // Año
          a.fecha.substring(4, 6) - 1, // Mes (0-indexado)
          a.fecha.substring(6, 8) // Día
        );
        const fechaB = new Date(
          b.fecha.substring(0, 4),
          b.fecha.substring(4, 6) - 1,
          b.fecha.substring(6, 8)
        );
        return fechaA - fechaB; // Orden ascendente
      });
    });

    res.status(200).json(products);
  } catch (err) {
    return res.status(500).json({
      error: "Error al acceder al directorio",
      details: err.message,
    });
  }
};
