import fs from "fs";
import path from "path";

// Esto es para obtener la ruta base de tu proyecto
const __dirname = path.resolve();

export const ctrlGraphics = async (req, res) => {
  console.log("Desde el controlador");

  // Directorio donde se encuentran los archivos JSON
  const directoryPath = path.join(__dirname, "/src/public/json");
  console.log(directoryPath); // Para verificar la ruta construida

  // Parámetro de la categoría que se pasa en la URL
  const filePrefix = req.params.category;
  console.log(filePrefix); // Para verificar el prefijo de archivo que estamos buscando

  try {
    // Leer los archivos en el directorio
    const files = await fs.promises.readdir(directoryPath);

    // Filtrar solo los archivos que comienzan con el prefijo dado y terminan en '.json'
    const jsonFiles = files.filter(
      (file) => file.startsWith(filePrefix) && file.endsWith(".json")
    );

    if (jsonFiles.length === 0) {
      // Si no se encuentran archivos que coincidan, devolver un error 404
      return res.status(404).json({
        message: `No se encontraron archivos que comiencen con ${filePrefix} en el directorio especificado.`,
      });
    }

    // Arreglo para almacenar todos los datos, separados por fecha
    const dataByDate = {};

    // Leer cada archivo JSON y agregar su contenido al objeto `dataByDate` según la fecha
    for (const file of jsonFiles) {
      try {
        // Extraemos la fecha del nombre del archivo (suponiendo formato YYYYMMDD)
        const dateMatch = file.match(/(\d{8})\.json$/); // Esto busca la fecha en formato YYYYMMDD
        if (!dateMatch) {
          console.warn(`No se pudo extraer la fecha del archivo ${file}`);
          continue;
        }

        const fileDate = dateMatch[1]; // La fecha extraída (YYYYMMDD)

        const filePath = path.join(directoryPath, file);
        const fileContent = JSON.parse(
          await fs.promises.readFile(filePath, "utf8")
        );

        // Si ya existe una entrada para esta fecha, agregamos los datos al array correspondiente
        if (!dataByDate[fileDate]) {
          dataByDate[fileDate] = [];
        }
        dataByDate[fileDate].push(...fileContent);
      } catch (error) {
        console.error(`Error al leer el archivo ${file}:`, error.message);
        return res.status(500).json({
          error: `Error al procesar el archivo ${file}`,
        });
      }
    }

    // Retornar los datos organizados por fecha
    res.status(200).json(dataByDate);
    console.log(dataByDate); // Para verificar la respuesta
  } catch (err) {
    // Manejar errores generales, como problemas para acceder al directorio
    return res.status(500).json({
      error: "Error al acceder al directorio",
      details: err.message,
    });
  }
};

// import fs from "fs";
// import path from "path";

// const __dirname = path.resolve();

// export const ctrlGraphics = async (req, res) => {
//   console.log("Desde el controlador");
//   const directoryPath = path.join(__dirname, "/src/public/json");
//   console.log(directoryPath);
//   const filePrefix = req.params.category;
//   console.log(filePrefix);

//   try {
//     const files = await fs.promises.readdir(directoryPath);
//     const jsonFiles = files.filter(
//       (file) => file.startsWith(filePrefix) && file.endsWith(".json")
//     );

//     if (jsonFiles.length === 0) {
//       return res.status(404).json({
//         message: `No se encontraron archivos que comiencen con ${filePrefix} en el directorio especificado.`,
//       });
//     }

//     const combinedData = [];
//     let errorOccured = false;

//     for (const file of jsonFiles) {
//       try {
//         const filePath = path.join(directoryPath, file);
//         const fileContent = JSON.parse(
//           await fs.promises.readFile(filePath, "utf8")
//         );
//         combinedData.push(fileContent);
//       } catch (error) {
//         console.error(`Error al leer el archivo ${file}:`, error.message);
//         errorOccured = true;
//       }
//     }

//     if (errorOccured) {
//       return res.status(500).json({
//         error:
//           "Uno o mas archivos no pudieron ser leidos o estan mal formateados",
//       });
//     }
//     res.status(200).json(combinedData);
//     console.log(combinedData);
//   } catch (err) {
//     return res.status(500).json({
//       error: "Error al acceder al directorio",
//       details: err.message,
//     });
//   }
// };
