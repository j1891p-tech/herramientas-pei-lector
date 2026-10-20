# Lector PEI — la lógica de ZipGrade, sin límite de 100 preguntas

Cursos con alumnos → quiz con clave → escanear con el celular (o el escáner del PC) →
descargar en el PC el CSV que ya lee el Calificador, Excel y PDF.

## Qué hay en la carpeta
| Archivo | Para qué |
|---|---|
| `index.html` + `vendor/` | La app (las librerías de Excel y PDF van incluidas: no depende de internet para exportar) |
| `sw.js`, `manifest.webmanifest`, `icon-*.png` | Instalarla en el celular y usarla sin conexión |
| `Code.gs` | El servidor de la nube, que se pega en una hoja de Google Sheets suya |
| `hoja_respuestas_PEI_saber11.pdf` | Hoja para imprimir: 140 preguntas A–D, documento de 10 dígitos, sesión 1/2 |

## Montaje (una sola vez, unos 10 minutos)
**1. Publicar la app (https, necesario para la cámara).** GitHub Pages: suba todo el contenido de
esta carpeta (incluida `vendor/`) a un repositorio → Settings → Pages → rama `main`, raíz.
Abra la dirección en Chrome del celular → ⋮ → «Agregar a pantalla principal». En el PC, la misma dirección.

**2. La nube (para pasar del celular al PC).**
1. En Google Drive cree una hoja de cálculo nueva: «Lector PEI datos».
2. Extensiones → Apps Script → borre lo que haya → pegue `Code.gs`
   (o en la app: Más → «Copiar código del servidor»).
3. Cambie `CAMBIE-ESTA-CLAVE` por una clave suya.
4. Implementar → Nueva implementación → Aplicación web → Ejecutar como: **Yo** →
   Acceso: **Cualquier persona** → autorice → copie la URL que termina en `/exec`.
5. En la app, en el celular **y** en el PC: Más → Nube → URL + clave → «Guardar y probar».

Los datos quedan en esa hoja (una pestaña por cursos, estudiantes, quizzes y resultados) y las
imágenes de las hojas en la carpeta de Drive «Lector PEI · hojas escaneadas». La clave impide que
otros escriban aunque conozcan la URL.

## Uso diario
1. **Cursos** → «Elegir archivo»: la matrícula en formato PEI
   `CURSO, DOCUMENTO, PRIMER APELLIDO, SEGUNDO APELLIDO, PRIMER NOMBRE, SEGUNDO NOMBRE`
   (un archivo por curso o todos juntos; CSV en UTF-8 o guardado desde Excel, o .xlsx).
   También reconoce «Nombre completo» o «Grupo». Los cursos que no existan se crean.
2. **Quizzes** → «Nuevo quiz» → plantilla Espejo ICFES Sesión 1 (120) o Sesión 2 (134) → mismo
   nombre de Simulacro en las dos → **«Cargar clave desde Excel o CSV»** con el XLS del banco tal cual
   (lee las hojas por área, columna Respuesta; vacía = anulada; ordena las áreas como el ICFES) →
   marque los cursos → Guardar. También acepta un CSV/Excel simple con una columna de claves.
   También lee el CSV de claves de ZipGrade (`Key Letter, Question Number, Response/Mapping, Point Value, Tags`;
   valor 0 = anulada) y puede descargar la clave en ese mismo formato para subirla a ZipGrade.
3. **Escanear** con la cámara (guarda sola cada hoja) o **Cargar escaneos**: PDF del escáner con una
   hoja por página, o fotos JPG/PNG. Una hoja marcada «Sesión 2» se guarda sola en la sesión 2.
4. **Resultados** (en el PC, filtrando por curso si quiere):
   - **CSV para el Calificador**: formato «Student Responses» de ZipGrade
     (`Quiz Name, Class, ZipGrade ID, External Id, First Name, Last Name, …, Q1…Qn`).
   - **CSV full**: formato «full» de ZipGrade (`QuizClass, StudentID, Stu/PriKey/Points/Mark`).
   - **Excel**: resultados, respuestas y análisis de ítems.
   - **PDF resultados** (una página por curso) y **PDF hojas corregidas** (una por estudiante,
     con la imagen marcada y la lista de incorrectas).

## Reglas que aplica (las del Calificador)
- Doble marca = anulada: vale 0 y en los CSV sale vacía, igual que una omisión.
- Pregunta sin clave = anulada: no cuenta en el total, pero conserva su posición (Q1…Qn).
- Documento completo de 10 dígitos; se comparan sin ceros a la izquierda (Excel los borra).
- Marcas tenues, borrones y dobles quedan resaltadas en naranja para revisarlas.

## Respaldo
Con la nube activa, la hoja de Google es el respaldo. Sin nube: Más → «Descargar respaldo».
