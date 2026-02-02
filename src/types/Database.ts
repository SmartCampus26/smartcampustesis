// DEFINICIÓN DE MODELOS DE LA BASE DE DATOS
// Estos interfaces permiten tipar correctamente los datos obtenidos desde Supabase en todo el proyecto

  /**
   * Representa la tabla USUARIO
   * Contiene la información de los usuarios del sistema
   */
  export interface Usuario {
    idUser: number
    rolUser: string
    contraUser?: string
    correoUser: string
    nomUser: string
    apeUser: string
    tlfUser?: number
    fec_reg_user: string
  }

  /**
   * Representa la tabla EMPLEADO
   * Contiene la información del personal encargado
   */
  export interface Empleado {
    idEmpl: number
    nomEmpl: string
    apeEmpl: string
    contraEmpl?: string
    deptEmpl: string
    cargEmpl: string
    tlfEmpl?: number
    correoEmpl: string
  }

  /**
   * Representa la tabla LUGAR
   * Define los lugares físicos donde se generan reportes
   */
  export interface Lugar {
    idLugar: number
    nomLugar: string
    pisoLugar: number
  }
  
  /**
   * Representa la tabla REPORTE
   * Almacena la información principal de los reportes
   */
  export interface Reporte {
    empleado: any
    usuario: any
    idReporte: number
    fecReporte: string
    descriReporte: string
    estReporte: string
    prioReporte: string
    comentReporte: string
    imgReporte: string []
    idEmpl: number
    idUser: number
  }
  
  /**
   * Representa la tabla OBJETO
   * Objetos involucrados dentro de un reporte
   */
  export interface Objeto {
    idObj: number
    nomObj: string
    ctgobj: string
    idReporte: number
    idLugar: number
  }
  
  /**
   * Representa la tabla intermedia REPORTE_USUARIO
   * Maneja la relación varios a varios entre reporte y usuario
   */
  export interface ReporteUsuario {
    idReporte: number
    idUser: number
  }

// DEFINICIÓN DEL TIPO SESIÓN
// Utiliza Union Types para diferenciar entre sesión de usuario y empleado

/**
 * Tipo Sesion
 * Puede ser una sesión de usuario o de empleado
 */
export type Sesion = 
| {
    tipo: 'usuario'
    id: number
    rol: string
    data: Usuario
  }
| {
    tipo: 'empleado'
    id: number
    data: Empleado
  }

// TYPE GUARDS
// Permiten validar el tipo de sesión en tiempo de ejecución

/**
 * Verifica si la sesión corresponde a un usuario
 *
 * @param sesion - Sesión actual
 * @returns true si es usuario
 */
export function esUsuario(sesion: Sesion): sesion is { tipo: 'usuario'; id: number; rol: string; data: Usuario } {
return sesion.tipo === 'usuario'
}

/**
 * Verifica si la sesión corresponde a un empleado
 *
 * @param sesion - Sesión actual
 * @returns true si es empleado
 */
export function esEmpleado(sesion: Sesion): sesion is { tipo: 'empleado'; id: number; data: Empleado } {
return sesion.tipo === 'empleado'
}

// TIPO DE RESPUESTA GENERAL DE SUPABASE
// Permite manejar de forma tipada las respuestas

//Tipo genérico para respuestas de Supabase
export interface SupabaseResponse<T> {
data: T | null // Datos devueltos por la consulta
error: any // Error en caso de existir
}