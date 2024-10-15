import { connect } from "mongoose";

export const startConnection = async ({ uri, database }) => {
  try {
    const db = await connect(uri, {
      dbName: database,
    });
    console.log(`Connected to ${db.connection.name} database`);
  } catch (error) {
    switch (error.code) {
      case "ECONNREFUSED":
        console.log(
          "Error de conexion: el servidor MongoDB no esta disponible"
        );
        break;
      case "EHOSTUNREACH":
        console.log(
          "Error de conexion: el host de la base de datos no es accesible"
        );
        break;
      default:
        console.log("Error desconocido:", error.name);
    }
  }
};
