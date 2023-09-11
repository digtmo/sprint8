import express  from "express";
import hbs from "hbs"
import { crearRegistro, editarRegistro, eliminarRegistro,obtenerRegistros, obtenerRegistrosId, aprobar, buscarRegistro} from "./Component/Registros.js";
import fileUpload from "express-fileupload";
import jwt from "jsonwebtoken"

//recuperar ruta raiz
import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
hbs.registerPartials(__dirname + "/views/partials");


const port = 3000
const app = express()
const secret = "hola"
app.set("view engine","hbs");
app.use(express.static("public"))
app.use(express.json())
app.use(fileUpload())

app.get("/", (req,res)=>{
    res.render("index")
})

app.get("/login", (req,res,)=>{
    res.render("Login")
})

app.get("/registro", (req,res)=>{
    res.render("Registro")
})

app.get("/datos", (req, res) => {
    const token = req.query.token; // Suponiendo que el token se envía en el cuerpo de la solicitud
    try {
        const decoded = jwt.verify(token, secret);
        if (decoded && decoded.rol === false) { // Verificar si el token es válido y el valor de "rol" es true
            // Enviar la constante "id" al renderizado de la página "/admin"
            let id = decoded.id
            res.render("Datos", { id });
        } else {
            console.log("Token inválido o no autorizado");
            res.sendStatus(401); // Enviar un código de estado 401 (No autorizado)
        }
    } catch (error) {
        console.log("Error al verificar el token:", error);
        res.sendStatus(500); // Enviar un código de estado 500 (Error interno del servidor) en caso de error
    }
});


app.get("/admin", (req, res) => {
    const token = req.query.token; // Suponiendo que el token se envía en el cuerpo de la solicitud
    try {
        const decoded = jwt.verify(token, secret);
        if (decoded && decoded.rol === true) { // Verificar si el token es válido y el valor de "rol" es true
            res.render("Admin");
        } else {
            console.log("Token inválido o no autorizado");
            res.sendStatus(401); // Enviar un código de estado 401 (No autorizado)
        }
    } catch (error) {
        console.log("Error al verificar el token:", error);
        res.sendStatus(500); // Enviar un código de estado 500 (Error interno del servidor) en caso de error
    }
});


app.get("/v1/registro/", async (req, res) => {
    try {
        res.status(200).send(await obtenerRegistros())
    } catch (error) {
        console.log(error)
        res.sendStatus(400)
    }
});

app.get("/v1/registro/:id", async (req, res) => {
    const id = req.params.id
    try {
        res.status(200).send(await obtenerRegistrosId(id))
    } catch (error) {
        console.log(error)
        res.sendStatus(400)
    }
});

app.post("/v1/registro/", async (req, res) => {
    try {
        const {email, nombre, password, anos_experiencia, especialidad} = req.body
        const {foto} = req.files
        // Verifica si se proporcionó una imagen
        if (!foto) {
            return res.status(400).send("Debes proporcionar una imagen.");
        }

        // Verifica el tipo de imagen (puedes agregar más tipos si es necesario)
        if (foto.mimetype !== "image/jpeg" && foto.mimetype !== "image/png") {
            return res.status(400).send("El formato de la imagen no es válido.");
        }

        // Genera una URL única para la imagen
        const imagenURL = `/images/${Date.now()}-${foto.name}`;

        // Mueve la imagen al directorio deseado
        await foto.mv(`./public${imagenURL}`);
        let rol = false
        let estado = false  
        res.status(201).send(await crearRegistro(email, nombre, password, anos_experiencia, especialidad, imagenURL, rol, estado)) 
    } catch (error) {
        console.log(error)
        res.sendStatus(400)
    }
  });

app.put("/v1/registro/:id", async (req, res) => {
    console.log(req.params.id)
    try {
        const {id} = req.params
        const {nombre, password, anos_experiencia, especialidad} = req.body
        console.log(req.body)
        console.log(id, nombre, password, anos_experiencia, especialidad)
        res.status(200).send(await editarRegistro(id, nombre, password, anos_experiencia, especialidad))
    } catch (error) {
        console.log(error)
        res.sendStatus(400)
    }
});

app.put("/v1/aprobar/:id", async (req, res) => {
    try {
        const {id} = req.params
        const estado = true
        res.status(200).send(await aprobar(id, estado))
    } catch (error) {
        console.log(error)
        res.sendStatus(400)
    }
});

app.post("/v1/buscarregistro/", async (req, res) => {
    const { email, password } = req.body;
    try {
        let resultado = await buscarRegistro(email, password);
        if (resultado) {
            const token = jwt.sign(resultado[0], secret);
            res.status(200).json({ token, resultado }); // Envía el token y el resultado exitoso
        } else {
            console.log("Usuario No encontrado");
            res.status(404).json({ message: "Usuario no encontrado" }); // Envia un mensaje de usuario no encontrado
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});



  app.delete("/v1/registro/:id", async (req, res) => {
    try {
        const {id} = req.params
        const resultado = await eliminarRegistro(id)
        const eliminacionExitosa = resultado >0
        if (resultado > 0){
            res.json({success:eliminacionExitosa})
        } else {
            res.sendStatus(400)
        }

    } catch (error) {
        console.log(error)
        res.sendStatus(400)
    }
  });



app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });