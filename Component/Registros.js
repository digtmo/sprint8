import { pool } from "../conexion.js";

async function obtenerRegistros(){
    try {
        const resultado = await pool.query("SELECT * from skaters")
        pool.release;
        return resultado.rows
    } catch (error) {
        console.log(error)
    }
}

async function obtenerRegistrosId(id) {
    try {
        const resultado = await pool.query("SELECT id, email, nombre, password, anos_experiencia, especialidad FROM skaters WHERE id = $1", [id]);
        return resultado.rows;
    } catch (error) {
        console.error("Error al obtener registros por ID:", error);
        throw error; // Lanzar la excepción para que el código que llama pueda manejar el error
    }
}

async function crearRegistro (email, nombre, password, anos_experiencia, especialidad, foto, rol, estado){
    try {
        const resultado = await pool.query("insert into skaters (email, nombre, password, anos_experiencia, especialidad, foto, rol, estado) values ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, nombre, password, anos_experiencia, especialidad, foto, rol, estado",[email, nombre, password, anos_experiencia, especialidad, foto, rol, estado]); 
        pool.release;
        console.log("Registro Creado")
        return resultado.rows; 
    } catch (error) {
        console.log(error)
    }
}

async function editarRegistro (id,nombre, password, anos_experiencia, especialidad){
    try {
        const resultado = await pool.query("update skaters SET nombre = $2, password = $3,  anos_experiencia = $4, especialidad = $5 WHERE id = $1   RETURNING id, nombre, password, anos_experiencia, especialidad",[id,nombre, password, anos_experiencia, especialidad]); 
        pool.release;
        console.log("Registro Modificado")
        return resultado.rows; 
    } catch (error) {
        console.log(error)
    }
}

async function aprobar (id,estado){
    try {
        const resultado = await pool.query("update skaters SET estado = $2 WHERE id = $1",[id,estado]); 
        pool.release;
        console.log("Registro Modificado")
        return resultado.rows; 
    } catch (error) {
        console.log(error)
    }
}

async function eliminarRegistro(id){
    try {
        const resultado = await pool.query("delete from skaters WHERE id = $1",[id]); 
        pool.release;
        console.log(resultado.rowCount)
        console.log(resultado)
        return resultado.rowCount
    } catch (error) {
        console.log(error)
    }
}

async function buscarRegistro(email, password){
    try {
        const resultado = await pool.query("SELECT rol, id from skaters WHERE email = $1 and password = $2",[email, password])
        pool.release;
        return resultado.rows
    } catch (error) {
        console.log(error)
    }
}



export {crearRegistro, editarRegistro, eliminarRegistro, obtenerRegistros, obtenerRegistrosId, aprobar, buscarRegistro}

