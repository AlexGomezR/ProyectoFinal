import db from "../mysql.js";
import utils from "../../utils/utils.js";

const userQueries = {};

//Añadir nuevo usuario
userQueries.addUser = async (data, tabla) => {
  // Conectamos con la base de datos y añadimos el usuario.
  let conn = null;
  try {
    conn = await db.createConnection();
    // Creamos un objeto con los datos del usuario a guardar en la base de datos.
    // Encriptamos la password con md5 y usamos la libreria momentjs para registrar la fecha actual
    return await db.query(`INSERT INTO ${tabla} SET ?`, data, "insert", conn);
  } catch (e) {
    throw new Error(e);
  } finally {
    conn && (await conn.end());
  }
};
//Query para buscar usuario por dato
userQueries.getUserByData = async (tabla, dato, columna) => {
  //Conectamos con la base de datos y buscamos si existe el usuario por el email
  let conn = null;
  try {
    conn = await db.createConnection();
    return await db.query(
      `SELECT * FROM ${tabla} where ${columna} = ?`,
      dato,
      "select",
      conn
    );
  } catch (e) {
    throw new Error(e);
  } finally {
    conn && (await conn.end());
  }
};
// Modificar un usuario por su id
userQueries.updateUser = async (tabla, id, userData) => {
  // Conectamos con la base de datos
  let conn = null;
  try {
    conn = await db.createConnection();
    // Actualizamos el usuario con los datos introducidos
    return await db.query(
      `UPDATE ${tabla} SET ? WHERE idUsuario = ?`,
      [userData, id],
      "update",
      conn
    );
  } catch (e) {
    throw new Error(e);
  } finally {
    conn && (await conn.end());
  }
};
//Borrar un usuario por su id
userQueries.deleteUser = async (tabla, data, id, columna) => {
  // Conectamos con la base de datos y eliminamos el usuario por su id.
  let conn = null;
  try {
    conn = await db.createConnection();
    return await db.query(
      `UPDATE ${tabla} SET ? WHERE ${columna} = ?`,
      data,
      id,
      "UPDATE",
      conn
    );
  } catch (e) {
    throw new Error(e);
  } finally {
    conn && (await conn.end());
  }
};

export default userQueries;
