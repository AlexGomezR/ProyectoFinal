import dao from "../services/dao.js";
import md5 from "md5";
import jwt_decode from "jwt-decode";
import { SignJWT, jwtVerify } from "jose";
import { role, data, tables } from "../const/const.js";
import { transporter } from "../config/mailer.js";

const controller = {};
// Controlador para añadir alumno
controller.addAlumno = async (req, res) => {
  const { nombre, apellidos, email, password, telefono, ciudad } = req.body;
  // Si no alguno de estos campos recibidos por el body devolvemos un 400 (bad request)
  if (!nombre || !email || !password || !apellidos || !telefono)
    return res.status(400).send("Error al recibir el body");
  try {
    // Buscamos el usuario en la base de datos
    const alumnoEmail = await dao.getUserByData(tables[2], email, data.email);
    // Buscamos el telefono ya está registrado
    const alumnoTelefono = await dao.getUserByData(
      tables[2],
      telefono,
      data.telefono
    );
    // Comprobamos que no los usuarios matcheados no están eliminados
    if (
      alumnoEmail.eliminado == data.eliminadoNo &&
      alumnoTelefono.eliminado == data.eliminadoNo
    ) {
      // Si el alumno
      if (alumnoTelefono.length > 0)
        return res.status(409).send("Telefono ya registrado");
      if (alumnoEmail.length > 0)
        return res.status(409).send("Email ya registrado");
    }
    // Si no existe lo registramos
    let usuarioObj = {
      role: role.alumno,
    };
    const idUser = await dao.addUser(usuarioObj, data.usuario);

    let alumnoObj = {
      nombre: nombre,
      apellidos: apellidos,
      telefono: telefono,
      ciudad: ciudad,
      email: email,
      password: md5(password),
      idUsuario: idUser,
    };
    const addAlumno = await dao.addUser(alumnoObj, tables[2]);
    if (addAlumno) {
      await transporter.sendMail({
        from: '"Bienvenido a proyeto" <picassomorales@gmail.com>', // sender address
        to: email, // list of receivers
        subject: "Hello ✔", // Subject line
        // text: "Hello world?", // plain text body
        html: "<b>Bienvenido a Canteen design,espero disfrutes de nuestros productos para cualquier consulta contactanos, gracias por registrarte!! Enlace de la web: http://127.0.0.1:5173/login</b>", // html body
      });

      return res.send(`Usuario ${nombre} con id: ${addAlumno} registrado`);
    }
  } catch (e) {
    console.log(e.message);
  }
};
// Controlador para añadir una empresa
controller.addEmpresa = async (req, res) => {
  const {
    nombre,
    email,
    password,
    CIF,
    telefono,
    ciudad,
    direccion,
    descripcion,
  } = req.body;
  // Si no alguno de estos campos recibidos por el body devolvemos un 400 (bad request)
  if (
    !nombre ||
    !email ||
    !password ||
    !CIF ||
    !telefono ||
    !ciudad ||
    !direccion ||
    !descripcion
  )
    return res.status(400).send("Error al recibir el body");

  // Buscamos el usuario en la base de datos
  try {
    const empresaEmail = await dao.getUserByData(
      data.empresa,
      data.email,
      email
    );
    // Si existe el usuario respondemos con un 409 (conflict)
    if (empresaEmail.length > 0)
      return res.status(409).send("Correo ya registrado");
    const empresaCIF = await dao.getUserByData(data.empresa, data.CIF, CIF);
    // Si existe el usuario respondemos con un 409 (conflict)
    if (empresaCIF.length > 0) return res.status(409).send("CIF ya registrado");
    const empresaTelefono = await dao.getUserByData(
      data.empresa,
      data.telefono,
      telefono
    );
    // Si existe el usuario respondemos con un 409 (conflict)
    if (empresaTelefono.length > 0)
      return res.status(409).send("Telefono ya registrado");
    // Si no existe lo registramos
    let usuarioObj = {
      role: role.empresa,
    };
    const idUser = await dao.addUser(usuarioObj, data.usuario);
    let empresaObj = {
      nombre: nombre,
      idUsuario: idUser,
      CIF: CIF,
      telefono: telefono,
      ciudad: ciudad,
      direccion: direccion,
      email: email,
      password: md5(password),
      descripcion: descripcion,
    };
    const addEmpresa = await dao.addUser(empresaObj, data.empresa);
    if (addEmpresa) {
      await transporter.sendMail({
        from: '"Bienvenido a proyeto" <picassomorales@gmail.com>', // sender address
        to: email, // list of receivers
        subject: "Hello ✔", // Subject line
        // text: "Hello world?", // plain text body
        html: "<b>Bienvenido a Canteen design,espero disfrutes de nuestros productos para cualquier consulta contactanos, gracias por registrarte!! Enlace de la web: http://127.0.0.1:5173/login</b>", // html body
      });
    }
    return res.send(`Empresa: ${nombre} con id: ${addEmpresa} registrado`);
  } catch (e) {
    console.log(e.message);
  }
};
// Controlador para añadir un admin
controller.addAdmin = async (req, res) => {
  const { nombre, email, password } = req.body;
  // Si no alguno de estos campos recibidos por el body devolvemos un 400 (bad request)
  if (!nombre || !email || !password)
    return res.status(400).send("Error al recibir el body");

  // Buscamos el usuario en la base de datos
  try {
    const adminEmail = await dao.getUserByData(data.admin, data.email, email);
    // Si existe el usuario respondemos con un 409 (conflict)
    if (adminEmail.length > 0)
      return res.status(409).send("Correo ya registrado");
    // Si no existe lo registramos
    let usuarioObj = {
      role: role.admin,
    };
    const idUser = await dao.addUser(usuarioObj, data.usuario);
    let adminObj = {
      nombre: nombre,
      idUsuario: idUser,
      email: email,
      password: md5(password),
    };
    const addAdmin = await dao.addUser(adminObj, data.admin);
    if (addAdmin)
      return res.send(`Admin: ${nombre} con id: ${addAdmin} registrado`);
  } catch (e) {
    console.log(e.message);
  }
};
//Controlador para modificar datos de un alumno por el id
controller.updateUser = async (req, res) => {
  // Token hardcodeado para comprobar que funciona
  const authorization =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEwIiwicm9sZSI6IjIifQ.bZ8Xdo1Lk-awrIOKUItS9_Krd95Mx2pzJ5UAlSM00vI";
  // Recibimos el token desde el header
  // const { authorization } = req.headers;
  // Decodificamos el token para saber el id y el role
  const tokenDecode = jwt_decode(authorization);
  // Si no existe el token enviamos un 401 (unauthorized)
  if (!authorization) return res.sendStatus(401);

  try {
    // Si no nos llega ningún campo por el body devolvemos un 400 (bad request)
    if (Object.entries(req.body).length === 0)
      return res.status(400).send("Error al recibir el body");

    // Usuario que quiere modificar los datos
    const tabla = tables[tokenDecode.role];

    // Actualizamos el usuario
    await dao.updateUser(tabla, tokenDecode.id, req.body, data.idUsuario);

    // Devolvemos la respuesta
    return res.send(`Usuario con id ${tokenDecode.id} modificado`);
  } catch (e) {
    console.log(e.message);
  }
};
// Controlador para eliminar un usuario por su id
controller.deleteUser = async (req, res) => {
  const { id } = req.body;
  // // OBTENER CABECERA Y COMPROBAR SU AUTENTICIDAD Y CADUCIDAD
  // const { authorization } = req.headers;
  const authorization =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZFVzdWFyaW8iOiIxNSIsInJvbGUiOiIwIn0.Ce7ocu1L06S_E_SoSEynorEpcuEBQwqbbFskTYFPhRA";
  const tokenDecode = jwt_decode(authorization);
  // Si no existe el token enviamos un 401 (unauthorized)
  if (!authorization) return res.sendStatus(401);
  // const token = authorization.split(" ")[1];

  try {
    // codificamos la clave secreta
    const encoder = new TextEncoder();
    // verificamos el token con la función jwtVerify. Le pasamos el token y la clave secreta codificada
    const { payload } = await jwtVerify(
      authorization,
      encoder.encode(process.env.JWT_SECRET)
    );
    // Verificamos que seamos usuario administrador
    if (tokenDecode.role != role.admin)
      return res.status(409).send("No tiene permiso de administrador");
    // Buscamos si el id del usuario existe en la base de datos
    // Usuario que quiere modificar los datos
    const tabla = tables[id];
    const user = await dao.getUserByData(tabla, id, data.idUsuario);
    // Si no existe devolvemos un 404 (not found)
    if (user.length <= 0) return res.status(404).send("El usuario no existe");
    //Creamos el objeto para cambiar el valor de los campos

    let dataObj = {
      eliminado: 1,
    };
    // Eliminamos los campos por el id
    await dao.deleteUser(tabla, dataObj, id, data.idUsuario);
    // Creamos el objeto para eliminar el rol
    dataObj = {
      role: 3,
    };
    // Eliminamos el rol del usuario por el id
    await dao.deleteUser(data.usuario, dataObj, id, data.id);
    // Devolvemos la respuesta
    return res.send(`Usuario con id ${tokenDecode.id} eliminado`);
  } catch (e) {
    console.log(e.message);
  }
};
// Controlador para el login de un usuario
controller.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const usuario = req.params.role;
  const tabla = tables[usuario];
  // Si no alguno de estos campos recibidos por el body devolvemos un 400 (bad request)
  if (!email || !password)
    return res.status(400).send("Error al recibir el body");
  try {
    let userData = await dao.getUserByData(tabla, email, data.email);
    // Si no existe el usuario respondemos con un 404 (not found)
    if (userData.length <= 0)
      return res.status(404).send("usuario no registrado");
    // Pasamos md5 a la paswword recibida del cliente
    const clienPassword = md5(password);
    // Como la consulta a la base de datos nos devuelve un array con el objeto del usuario usamos la desestructuración.
    [userData] = userData;
    // Si existe el usuario, comprobamos que la password es correcta(No es la contraseña real, es la cifrada). Si no lo es devolvemos un 401 (unathorized)
    if (userData.password != clienPassword)
      return res.status(401).send("Email o contraseña incorrectos");
    // Si es correcta generamos el token y lo devolvemos al cliente
    // Buscamos el rol en la tabla usuario
    let user = await dao.getUserByData(
      data.usuario,
      userData.idUsuario,
      data.id
    );
    // Como la consulta a la base de datos nos devuelve un array con el objeto del usuario usamos la desestructuración.
    [user] = user;
    // Construimos el JWT con el id, email y rol del usuario
    const jwtConstructor = new SignJWT({
      id: userData.idUsuario,
      role: user.role,
      email,
    });
    // Codificamos el la clave secreta definida en la variable de entorno por requisito de la librería jose
    // y poder pasarla en el formato correcto (uint8Array) en el método .sign
    const encoder = new TextEncoder();
    // Generamos el JWT. Lo hacemos asíncrono, ya que nos devuelve una promesa.
    // Le indicamos la cabecera, la creación, la expiración y la firma (clave secreta).
    const jwt = await jwtConstructor
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(encoder.encode(process.env.JWT_SECRET));
    //Si todo es correcto enviamos la respuesta. 200 OK
    return res.send({ jwt });
  } catch (e) {
    console.log(e.message);
  }
};

export default controller;
