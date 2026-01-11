// se exportan moldes de todas las tablas de la base de datos para poder usarlas en el proyecto
export interface Usuario {
    idUser: number
    rolUser: string
    contraUser: string
    correoUser: string
    nomUser: string
    apeUser: string
    tlfUser?: number
    fec_reg_user: string
  }
  
  export interface Empleado {
    idEmpl: number
    nomEmpl: string
    apeEmpl: string
    contraEmpl: string
    deptEmpl: string
    cargEmpl: string
    tlfEmpl?: number
    correoEmpl: string
  }
  
  export interface Lugar {
    idLugar: number
    nomLugar: string
    pisoLugar: number
  }
  
  export interface Reporte {
    empleado: any
    usuario: any
    idReporte: number
    fecReporte: string
    descriReporte: string
    estReporte: string
    prioReporte: string
    comentReporte: string
    imgReporte: string
    idEmpl: number
    idUser: number
  }
  
  export interface Objeto {
    idObj: number
    nomObj: string
    ctgobj: string
    idReporte: number
    idLugar: number
  }
  
  export interface ReporteUsuario {
    idReporte: number
    idUser: number
  }

  // Tipo de sesión mejorado con union types
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

// Type guards para verificar el tipo de sesión
export function esUsuario(sesion: Sesion): sesion is { tipo: 'usuario'; id: number; rol: string; data: Usuario } {
return sesion.tipo === 'usuario'
}

export function esEmpleado(sesion: Sesion): sesion is { tipo: 'empleado'; id: number; data: Empleado } {
return sesion.tipo === 'empleado'
}

// Tipos de respuesta de Supabase
export interface SupabaseResponse<T> {
data: T | null
error: any
}