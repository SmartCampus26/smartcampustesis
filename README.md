# 🏫 SmartCampus 
> **Plataforma integral para la gestión y optimización de servicios académicos, diseñada para modernizar la experiencia estudiantil mediante tecnología móvil y web.**

---

### 🌟 ¿En qué consiste en si SmartCampus?

**SmartCampus** Es un sistema integral que permite registrar, gestionar y reportar daños en la infraestructura y equipamiento escolar mediante una aplicación móvil, incorporando una base de datos, notificaciones y la generación automática de informes y gráficos

#### 🐣 ¿Cómo lo logramos?:
* Desarrollar una aplicación móvil que permita a los usuarios reportar incidencias con descripción, categoría, evidencia y ubicación.
* Diseñar una base de datos relacional que organice la información de usuarios, áreas del colegio e incidencias registradas
* Implementar una herramienta que permita generar informes y gráficos estadísticos automáticos en formato con los datos de los reportes filtrados por fecha, departamento y tipo. 
* Crear un sistema de seguimiento y notificaciones que informe a los usuarios sobre el estado y la resolución de cada incidente. 

#### ⚙️ Herramientas Utilizadas: 

* **Supabase:**  Utilizamos Supabase para gestionar todos los datos de nuestra aplicación de forma segura, escalable y eficiente. Su interfaz intuitiva nos permite administrar tablas, relaciones y consultas de manera sencilla.  

* **Firebase:**  Firebase de Google es nuestra plataforma de desarrollo de aplicaciones que nos permite compilar, desplegar y monitorear nuestra aplicación en tiempo real. 

* **Expo Go + React Native:**  React Native es el framework principal que utilizamos para desarrollar nuestra aplicación móvil multiplataforma, permitiéndonos escribir código una sola vez y ejecutarlo en iOS y Android. Expo Go complementa este desarrollo al proporcionar un conjunto de herramientas y servicios que aceleran el proceso de desarrollo, facilitando el testing en dispositivos reales sin necesidad de compilar código nativo. 

#### 📱 Funcionalidades de la App: 

* **Sistema de Autenticación**  El sistema cuenta con un inicio de sesión seguro que identifica el rol del usuario mediante su correo electrónico registrado. Dependiendo del rol asignado (Coordinador, Docente o Colaborador), el usuario es redirigido automáticamente a su interfaz correspondiente con los permisos y funcionalidades específicas de su rol   

* **Funcionalidades Compartidas:**  Todos los usuarios, independientemente de su rol, tienen acceso a la pantalla principal (Home) donde pueden visualizar información general y estadísticas relevantes, así como a su perfil personal donde pueden visualizar su información. 

* **Gestión de Usuarios:**  Solo los Coordinadores y los Colaboradores tienen acceso a la gestión completa de usuarios. Pueden visualizar un listado de todos los usuarios registrados en el sistema,aunque solo los de Sistemas con los Coordinadores puedes crear nuevos usuarios y colaboradores con sus respectivos roles y permisos. Esta funcionalidad permite mantener un control centralizado del personal del sistema.  

#### Logros del proyecto: 

A lo largo del desarrollo de este proyecto, logramos crear una aplicación completamente funcional que cumple con todos los objetivos establecidos. El mayor logro fue implementar un sistema robusto de gestión de reportes con un sistema de notificaciones por correo electrónico que mantiene a todos los usuarios informados en tiempo real sobre el estado y las actualizaciones de sus reportes. 

