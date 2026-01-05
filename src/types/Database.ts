// se exportan moldes de todas las tablas de la base de datos para poder usarlas en el proyecto
export interface Usuario {
    idUser: number
    rolUser: string
    contraUser: string
    correoUser: string
    nomUser: string
    apeUser: string
    tlfUser: number
    fec_reg_user: string
  }
  
  export interface Empleado {
    idEmpl: number
    nomEmpl: string
    apeEmpl: string
    contraEmpl: string
    deptEmpl: string
    cargEmpl: string
    tlfEmpl: number
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
  
  export type Sesion =
    | { tipo: 'usuario'; id: number; rol: string; data: Usuario }
    | { tipo: 'empleado'; id: number; data: Empleado }
  //se exporta el objeto de sesión que se guardará en el dispositivo cuando alguien inicia sesión y se divide en dos tipos usuario y empleado esto permitiendo tener sus datos listos sin tener que volver a pedirlos a la base de dadtos