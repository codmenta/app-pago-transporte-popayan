PROYECTO: App Pago Transporte Popayan
Desarrollo de una Alternativa Tecnologica para el Pago del Transporte Publico Urbano de la Ciudad de Popayan

AUTORAS:
- Luisa Fernanda Herrera Hernandez
- Karen Tatiana Martinez Valencia

DIRECTORA DEL PROYECTO:
- Claudia Patricia Muñoz Guerrero

INSTITUCION:
Facultad de Ingenieria - Programa de Ingenieria en Sistemas
Universidad Colegio Mayor del Cauca
Seminario de Grado - 2026

================================================================
1. DESCRIPCION DEL PROYECTO
================================================================

Sistema de pago digital para el transporte publico urbano de Popayan.
La aplicacion permite a los pasajeros pagar su pasaje mediante codigos
QR estaticos integrados con billeteras digitales como Nequi y DaviPlata.

El proyecto busca modernizar el sistema de recaudo, eliminar el manejo
de efectivo en los buses, reducir riesgos de seguridad y generar datos
de movilidad para la planificacion del servicio.

================================================================
2. TECNOLOGIAS UTILIZADAS
================================================================

- React Native (framework movil)
- Expo (plataforma de desarrollo)
- React Navigation (navegacion entre pantallas)
- Formik (manejo de formularios)
- Yup (validacion de datos)
- Expo Vector Icons (iconos)
- AsyncStorage (almacenamiento local: sesion, usuarios y billetera)
- JavaScript / Node.js

================================================================
3. REQUISITOS PREVIOS
================================================================

Antes de comenzar, cada miembro del equipo debe tener instalado:

- Node.js version 16 o superior
  Descargar desde: https://nodejs.org/

- npm o yarn (viene incluido con Node.js)

- Git (para control de versiones)
  Descargar desde: https://git-scm.com/

- Editor de codigo: Visual Studio Code (recomendado)
  Descargar desde: https://code.visualstudio.com/

- Expo Go (aplicacion movil para probar la app)
  Android: https://play.google.com/store/apps/details?id=host.exp.exponent
  iOS: https://apps.apple.com/app/expo-go/id982107779

================================================================
4. INSTALACION DEL PROYECTO
================================================================

PASO 1: Clonar el repositorio

  git clone [URL_DEL_REPOSITORIO]
  cd app-pago-transporte-popayan

PASO 2: Instalar dependencias principales

  npm install

PASO 3: Instalar dependencias de Expo

  npx expo install @react-native-async-storage/async-storage
  npx expo install @react-navigation/native @react-navigation/native-stack
  npx expo install react-native-screens react-native-safe-area-context
  npx expo install @expo/vector-icons

PASO 4: Instalar librerias de formularios

  npm install formik yup

PASO 5: Verificar la instalacion

  npx expo start

Si todo esta correcto, se mostrara un codigo QR en la terminal.

================================================================
5. COMO EJECUTAR LA APLICACION
================================================================

Modo desarrollo (recomendado para el equipo):

  npx expo start

Opciones disponibles al ejecutar el comando anterior:

- Presionar "a" para abrir en emulador Android
- Presionar "i" para abrir en simulador iOS
- Escanear el codigo QR con la app Expo Go en tu celular

Limpiar cache si hay errores:

  npx expo start -c

================================================================
6. ESTRUCTURA DEL PROYECTO
================================================================

app-pago-transporte-popayan/
|
|-- src/
|   |-- screens/              Pantallas de la aplicacion
|   |   |-- LoginScreen.js    Inicio de sesion
|   |   |-- RegisterScreen.js Registro de pasajero
|   |   |-- WalletScreen.js   Billetera (saldo e historial)
|   |   |-- RechargeScreen.js Recarga de saldo
|   |
|   |-- navigation/           Configuracion de rutas
|   |   |-- AppNavigator.js   Navegador principal
|   |
|   |-- context/              Estado global de la app (React Context)
|   |   |-- AuthContext.js    Sesion del pasajero: login, registro, logout
|   |
|   |-- services/             Acceso a datos (hace de backend por ahora)
|   |   |-- storage.js        Usuarios, sesion y billetera en AsyncStorage
|   |
|   |-- utils/                Funciones y validaciones reutilizables
|   |   |-- validationSchemas.js  Esquemas Yup de los formularios
|   |   |-- formatCurrency.js     Formato de moneda (COP) y fechas
|   |
|   |-- constants/            Valores compartidos por las pantallas
|       |-- theme.js          Colores, espaciados y tamaños de fuente
|
|-- assets/                   Imagenes, iconos, fuentes
|-- App.js                    Punto de entrada principal
|-- app.json                  Configuracion de Expo
|-- package.json              Dependencias del proyecto
|-- .gitignore                Archivos ignorados por Git
|-- README.txt                Este archivo

Nota: context/, services/, utils/ y constants/ no son obligatorias para
que la app funcione (React Navigation solo necesita screens/ y
navigation/). Se usan para no repetir la misma logica en varias
pantallas: la sesion del usuario (context), el acceso a AsyncStorage
(services), las validaciones de Formik/Yup (utils) y los colores del
tema (constants).

================================================================
7. SPRINT ACTUAL Y TAREAS ASIGNADAS
================================================================

METODOLOGIA: Scrum
DURACION DEL SPRINT: 2 semanas

SPRINT 1 - Funcionalidades Core de Pago:

  SCRUM-11  Registro de pasajero
  SCRUM-15  Inicio de sesion de pasajero
  SCRUM-17  Recargar saldo simulada
  SCRUM-18  Consultar saldo actual
  SCRUM-19  Ver historial de movimientos

Cada tarea debe marcarse como completada en el tablero de gestion
cuando este funcional y probada en dispositivo real.

================================================================
8. CONVENCIONES DE CODIGO
================================================================

Nombres de archivos:
  Usar PascalCase. Ejemplo: LoginScreen.js, WalletScreen.js

Nombres de componentes:
  Funciones con export default. Ejemplo:
  export default function LoginScreen() { ... }

Estilos:
  Usar StyleSheet.create() al final del archivo.

Variables y funciones:
  Usar camelCase. Ejemplo: handleLogin, userName

Constantes:
  Usar UPPER_SNAKE_CASE. Ejemplo: API_URL, MAX_RECHARGE

Comentarios:
  Explicar el "por que", no el "que". El codigo debe ser legible.

Validaciones:
  Usar Formik + Yup para todos los formularios.

================================================================
9. FLUJO DE TRABAJO CON GIT
================================================================

Crear una rama para cada nueva funcionalidad:

  git checkout -b feature/nombre-de-la-funcionalidad

Hacer commits descriptivos:

  git add .
  git commit -m "feat: agregar validacion de formulario login"

Subir cambios a la rama:

  git push origin feature/nombre-de-la-funcionalidad

Crear Pull Request en GitHub/GitLab para revision.

Reglas importantes:
  - No hacer commit directamente a la rama main
  - Revisar el codigo de los compañeros antes de hacer merge
  - Mantener actualizado el tablero de tareas
  - Documentar cambios importantes en este archivo

================================================================
10. SOLUCION DE PROBLEMAS COMUNES
================================================================

PROBLEMA: "Project root directory not found"

  Solucion: Asegurarse de estar en la carpeta correcta.
  Verificar que exista el archivo package.json con el comando:
    dir (Windows) o ls (Mac/Linux)

PROBLEMA: Error de dependencias

  Solucion: Borrar node_modules y reinstalar.
    rm -rf node_modules (Mac/Linux)
    rmdir /s /q node_modules (Windows)
    npm install

PROBLEMA: Expo no reconoce los cambios

  Solucion: Reiniciar con cache limpia.
    npx expo start -c

PROBLEMA: La app no se conecta al celular

  Solucion: Verificar que el celular y la computadora esten en
  la misma red WiFi. Reiniciar el servidor de Expo.

================================================================
11. RECURSOS DE APRENDIZAJE
================================================================

Documentacion oficial:
  - Expo: https://docs.expo.dev/
  - React Native: https://reactnative.dev/docs/tutorial
  - React Navigation: https://reactnavigation.org/docs/getting-started
  - Formik: https://formik.org/docs/overview
  - Yup: https://github.com/jquense/yup

Tutoriales recomendados:
  - Busqueda en YouTube: "React Native Expo tutorial español 2024"
  - Canales: Fernando Herrera, CodigoFacilito

================================================================
12. NOTAS IMPORTANTES PARA EL EQUIPO
================================================================

1. No commitear la carpeta node_modules (ya esta en .gitignore)

2. Siempre probar en dispositivo real antes de marcar tarea como
   completada

3. Mantener actualizado el backlog en la herramienta de gestion
   (Jira, Trello, Notion o la que usen)

4. Revisar codigo de los compañeros antes de hacer merge

5. Documentar cambios importantes que afecten la estructura del
   proyecto

6. Las integraciones con Nequi y DaviPlata se haran en entorno
   sandbox (pruebas), no con dinero real

7. El proyecto es un prototipo funcional, no un producto en
   produccion

================================================================
13. CONTACTO Y SOPORTE
================================================================

Ante dudas sobre el proyecto, revisar:
  - El anteproyecto final (documento Word del proyecto)
  - La documentacion tecnica en el repositorio
  - Las reuniones diarias de sincronizacion (Daily Scrum)

================================================================
FIN DEL DOCUMENTO
================================================================