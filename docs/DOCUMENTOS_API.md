# API de Gestión de Documentos

## Descripción General

Sistema jerárquico de gestión de documentos con tres niveles:
- **Áreas**: Categorización principal (ej: "Académico", "Administrativo")
- **Categorías**: Subcategorización dentro de áreas (ej: "Finanzas", "Recursos Humanos")
- **Archivos**: Documentos específicos con metadatos

## Estructura de Archivos

```
uploads/
├── documentos/               # Todos los documentos se guardan aquí
│   ├── archivo1.pdf
│   ├── archivo2.docx
│   ├── presupuesto.xlsx
│   └── documento.pdf
└── nosotros/                 # Imágenes de la sección "Nosotros"
    ├── imagen1.jpg
    └── imagen2.png
```

### Migración de Archivos Existentes

**Nota**: A partir de la versión actual, todos los documentos se guardan directamente en la carpeta `uploads/documentos/` sin subcarpetas por categoría. Los archivos existentes mantendrán sus rutas actuales en la base de datos para compatibilidad.

---

## Endpoints de Áreas

### GET `/api/documentos/areas`
Obtener todas las áreas con sus categorías y archivos.

**Respuesta exitosa (200)**
```json
[
  {
    "ID_Area": 1,
    "Nombre": "Académico",
    "categorias": [
      {
        "ID_Categorias": 1,
        "Nombre": "Planes de Estudio",
        "ID_Area": 1,
        "archivos": [...]
      }
    ]
  }
]
```

### GET `/api/documentos/areas/:id`
Obtener un área específica con todo su contenido.

**Parámetros**
- `id`: ID del área

**Respuesta exitosa (200)**
```json
{
  "ID_Area": 1,
  "Nombre": "Académico",
  "categorias": [...]
}
```

**Errores**
- `404`: Área no encontrada

### POST `/api/documentos/areas`
Crear una nueva área.

**Body requerido**
```json
{
  "Nombre": "Administrativo"
}
```

**Respuesta exitosa (201)**
```json
{
  "ID_Area": 2,
  "Nombre": "Administrativo"
}
```

**Errores**
- `400`: Nombre requerido o inválido
- `500`: Error de validación (nombre duplicado)

### PUT `/api/documentos/areas/:id`
Actualizar un área existente.

**Parámetros**
- `id`: ID del área

**Body**
```json
{
  "Nombre": "Administrativo Actualizado"
}
```

**Respuesta exitosa (200)**
```json
{
  "ID_Area": 2,
  "Nombre": "Administrativo Actualizado"
}
```

**Errores**
- `404`: Área no encontrada
- `500`: Error de validación

### DELETE `/api/documentos/areas/:id`
Eliminar un área.

**Parámetros**
- `id`: ID del área

**Respuesta exitosa (200)**
```json
{
  "message": "Área eliminada correctamente"
}
```

**Errores**
- `404`: Área no encontrada
- `500`: No se puede eliminar si tiene categorías asociadas

---

## Endpoints de Categorías

### GET `/api/documentos/categorias`
Obtener todas las categorías con su área y archivos.

**Respuesta exitosa (200)**
```json
[
  {
    "ID_Categorias": 1,
    "Nombre": "Finanzas",
    "ID_Area": 1,
    "area": {
      "ID_Area": 1,
      "Nombre": "Administrativo"
    },
    "archivos": [...]
  }
]
```

### GET `/api/documentos/categorias/:id`
Obtener una categoría específica con sus archivos.

**Parámetros**
- `id`: ID de la categoría

**Respuesta exitosa (200)**
```json
{
  "ID_Categorias": 1,
  "Nombre": "Finanzas",
  "ID_Area": 1,
  "area": {...},
  "archivos": [...]
}
```

**Errores**
- `404`: Categoría no encontrada

### POST `/api/documentos/categorias`
Crear una nueva categoría.

**Body requerido**
```json
{
  "Nombre": "Recursos Humanos",
  "ID_Area": 1
}
```

**Respuesta exitosa (201)**
```json
{
  "ID_Categorias": 2,
  "Nombre": "Recursos Humanos",
  "ID_Area": 1
}
```

**Errores**
- `400`: Nombre o ID_Area requerido
- `500`: Error de validación (área no existe, nombre duplicado)

### PUT `/api/documentos/categorias/:id`
Actualizar una categoría existente.

**Parámetros**
- `id`: ID de la categoría

**Body**
```json
{
  "Nombre": "RRHH Actualizado",
  "ID_Area": 1
}
```

**Respuesta exitosa (200)**
```json
{
  "ID_Categorias": 2,
  "Nombre": "RRHH Actualizado",
  "ID_Area": 1
}
```

**Errores**
- `404`: Categoría no encontrada
- `500`: Error de validación

### DELETE `/api/documentos/categorias/:id`
Eliminar una categoría.

**Parámetros**
- `id`: ID de la categoría

**Respuesta exitosa (200)**
```json
{
  "message": "Categoría eliminada correctamente"
}
```

**Errores**
- `404`: Categoría no encontrada
- `500`: No se puede eliminar si tiene archivos asociados

---

## Endpoints de Archivos

### GET `/api/documentos/archivos`
Obtener todos los archivos con su jerarquía completa.

**Respuesta exitosa (200)**
```json
[
  {
    "ID": 1,
    "Nombre": "Plan_Estudios_2024.pdf",
    "Descripcion": "Plan de estudios actualizado",
    "Ruta_Documento": "/uploads/documentos/plan_2024.pdf",
    "Fecha_Subida": "2025-10-23T10:00:00.000Z",
    "ID_Categorias": 1,
    "categoria": {
      "ID_Categorias": 1,
      "Nombre": "Planes de Estudio",
      "area": {
        "ID_Area": 1,
        "Nombre": "Académico"
      }
    }
  }
]
```

### GET `/api/documentos/archivos/:id`
Obtener un archivo específico con su jerarquía completa.

**Parámetros**
- `id`: ID del archivo

**Respuesta exitosa (200)**
```json
{
  "ID": 1,
  "Nombre": "Plan_Estudios_2024.pdf",
  "Descripcion": "Plan de estudios actualizado",
  "Ruta_Documento": "/uploads/documentos/plan_2024.pdf",
  "Fecha_Subida": "2025-10-23T10:00:00.000Z",
  "ID_Categorias": 1,
  "categoria": {...}
}
```

**Errores**
- `404`: Archivo no encontrado

### GET `/api/documentos/archivos/area/:areaId`
Obtener todos los archivos de un área específica.

**Parámetros**
- `areaId`: ID del área

**Respuesta exitosa (200)**
```json
[
  {
    "ID": 1,
    "Nombre": "archivo1.pdf",
    "categoria": {...}
  }
]
```

**Errores**
- `404`: No se encontraron archivos para esta área

### POST `/api/documentos/archivos`
Crear un nuevo archivo (sin subir archivo físico - solo registro en BD).

**Body requerido**
```json
{
  "Nombre": "Reglamento_Interno.pdf",
  "Descripcion": "Reglamento interno de la institución",
  "Ruta_Documento": "/uploads/documentos/reglamento.pdf",
  "ID_Categorias": 1
}
```

**Respuesta exitosa (201)**
```json
{
  "ID": 2,
  "Nombre": "Reglamento_Interno.pdf",
  "Descripcion": "Reglamento interno de la institución",
  "Ruta_Documento": "/uploads/documentos/reglamento.pdf",
  "Fecha_Subida": "2025-10-23T10:30:00.000Z",
  "ID_Categorias": 1
}
```

**Errores**
- `400`: Nombre, Ruta_Documento o ID_Categorias requerido
- `500`: Error de validación (categoría no existe)

### POST `/api/documentos/archivos/upload`
**⭐ RECOMENDADO: Subir archivo físico y crear registro automáticamente**

**Tipo**: `multipart/form-data`

**Campos del formulario**
- `archivo` (file): **Requerido** - El archivo a subir
- `Nombre` (string): Opcional - Nombre del documento (si no se provee, usa el nombre original)
- `Descripcion` (string): Opcional - Descripción del documento
- `ID_Categorias` (number): **Requerido** - ID de la categoría

**Tipos de archivo permitidos**
- PDF (`.pdf`)
- Word (`.doc`, `.docx`)
- Excel (`.xls`, `.xlsx`)
- PowerPoint (`.ppt`, `.pptx`)
- Texto (`.txt`)
- Comprimidos (`.zip`, `.rar`)

**Tamaño máximo**: 100MB

**Ejemplo con cURL**
```bash
curl -X POST http://localhost:3000/api/documentos/archivos/upload \
  -F "archivo=@/ruta/al/documento.pdf" \
  -F "Nombre=Plan de Estudios 2024" \
  -F "Descripcion=Plan de estudios actualizado" \
  -F "ID_Categorias=1"
```

**Ejemplo con JavaScript (FormData)**
```javascript
const formData = new FormData();
formData.append('archivo', fileInput.files[0]);
formData.append('Nombre', 'Plan de Estudios 2024');
formData.append('Descripcion', 'Plan actualizado');
formData.append('ID_Categorias', '1');

fetch('http://localhost:3000/api/documentos/archivos/upload', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => console.log(data));
```

**Respuesta exitosa (201)**
```json
{
  "message": "Archivo subido exitosamente",
  "archivo": {
    "ID": 3,
    "Nombre": "Plan de Estudios 2024",
    "Descripcion": "Plan actualizado",
    "Ruta_Documento": "/uploads/documentos/1729701234567_a1b2c3d4e5f6_documento.pdf",
    "Fecha_Subida": "2025-10-23T15:20:34.567Z",
    "ID_Categorias": 1
  },
  "file": {
    "originalname": "Plan_Estudios.pdf",
    "filename": "1729701234567_a1b2c3d4e5f6_Plan_Estudios.pdf",
    "mimetype": "application/pdf",
    "size": 524288,
    "path": "/uploads/documentos/1729701234567_a1b2c3d4e5f6_Plan_Estudios.pdf"
  }
}
```

**Errores**
- `400`: Archivo requerido, ID_Categorias requerido, tipo de archivo no permitido
- `404`: Categoría no encontrada
- `413`: Archivo demasiado grande (> 100MB)
- `500`: Error al procesar el archivo

**Nota de Seguridad**
- El nombre del archivo se sanitiza automáticamente
- Se genera un nombre único con timestamp y hash aleatorio
- Se valida la firma del archivo (magic numbers)
- Se rechazann archivos ejecutables o peligrosos

### PUT `/api/documentos/archivos/:id`
Actualizar un archivo existente.

**Parámetros**
- `id`: ID del archivo

**Body**
```json
{
  "Nombre": "Reglamento_2024.pdf",
  "Descripcion": "Reglamento actualizado",
  "Ruta_Documento": "/uploads/documentos/reglamento_2024.pdf",
  "ID_Categorias": 1
}
```

**Respuesta exitosa (200)**
```json
{
  "ID": 2,
  "Nombre": "Reglamento_2024.pdf",
  "Descripcion": "Reglamento actualizado",
  "Ruta_Documento": "/uploads/documentos/reglamento_2024.pdf",
  "Fecha_Subida": "2025-10-23T10:30:00.000Z",
  "ID_Categorias": 1
}
```

**Errores**
- `404`: Archivo no encontrado
- `500`: Error de validación

### DELETE `/api/documentos/archivos/:id`
Eliminar un archivo.

**Parámetros**
- `id`: ID del archivo

**Respuesta exitosa (200)**
```json
{
  "message": "Archivo eliminado correctamente"
}
```

**Errores**
- `404`: Archivo no encontrado

---

## Endpoint de Estadísticas

### GET `/api/documentos/estadisticas`
Obtener estadísticas de archivos por área.

**Respuesta exitosa (200)**
```json
[
  {
    "ID_Area": 1,
    "Nombre": "Académico",
    "categorias": [...]
  }
]
```

---

## Validaciones Implementadas

### Modelo Area
- `Nombre`: Requerido, único, 1-100 caracteres

### Modelo Categorias
- `Nombre`: Requerido, único, 1-100 caracteres
- `ID_Area`: Requerido, debe existir

### Modelo Archivos
- `Nombre`: Requerido, 1-255 caracteres
- `Descripcion`: Opcional, máximo 1000 caracteres
- `Ruta_Documento`: Requerido, 1-500 caracteres
- `ID_Categorias`: Requerido, debe existir
- `Fecha_Subida`: Automático (NOW)

---

## Restricciones de Integridad

- **CASCADE**: Las actualizaciones en llaves foráneas se propagan
- **RESTRICT**: No se puede eliminar un área si tiene categorías
- **RESTRICT**: No se puede eliminar una categoría si tiene archivos

---

## Ejemplos de Uso

### 1. Crear estructura completa

```javascript
// Paso 1: Crear área
POST /api/documentos/areas
{ "Nombre": "Académico" }
// Respuesta: { "ID_Area": 1, ... }

// Paso 2: Crear categoría
POST /api/documentos/categorias
{ "Nombre": "Planes de Estudio", "ID_Area": 1 }
// Respuesta: { "ID_Categorias": 1, ... }

// Paso 3: Crear archivo
POST /api/documentos/archivos
{
  "Nombre": "Plan_2024.pdf",
  "Descripcion": "Plan de estudios",
  "Ruta_Documento": "/uploads/plan_2024.pdf",
  "ID_Categorias": 1
}
```

### 2. Obtener estructura completa

```javascript
// Opción 1: Obtener todas las áreas con toda la jerarquía
GET /api/documentos/areas

// Opción 2: Obtener área específica
GET /api/documentos/areas/1

// Opción 3: Obtener archivos de un área
GET /api/documentos/archivos/area/1
```

### 3. Buscar archivo específico

```javascript
// Con jerarquía completa
GET /api/documentos/archivos/1
```

---

## Notas de Implementación

- Todos los endpoints usan el servicio `DocumentosService` para operaciones complejas
- Las asociaciones se cargan automáticamente en las consultas
- Los timestamps se gestionan automáticamente
- Las validaciones están en los modelos y controladores
- Manejo de errores centralizado con middleware `errorHandler`
- **Subida de archivos**: Se recomienda usar el endpoint `/upload` que maneja todo automáticamente
- **Eliminación**: Al eliminar un archivo, también se elimina el archivo físico del servidor

---

## Flujo de Trabajo Recomendado

### Para Subir Documentos

1. **Crear Área** (si no existe)
   ```
   POST /api/documentos/areas
   { "Nombre": "Académico" }
   ```

2. **Crear Categoría** (si no existe)
   ```
   POST /api/documentos/categorias
   { "Nombre": "Planes de Estudio", "ID_Area": 1 }
   ```

3. **Subir Archivo** ⭐ (RECOMENDADO)
   ```
   POST /api/documentos/archivos/upload
   Form Data:
   - archivo: [seleccionar archivo]
   - Nombre: "Plan 2024"
   - Descripcion: "Plan de estudios"
   - ID_Categorias: 1
   ```

### Para Consultar Documentos

- **Todo**: `GET /api/documentos/areas` - Obtiene estructura completa
- **Por Área**: `GET /api/documentos/areas/:id` - Área con categorías y archivos
- **Por Categoría**: `GET /api/documentos/categorias/:id` - Categoría con archivos
- **Archivos de Área**: `GET /api/documentos/archivos/area/:areaId`
- **Archivo Específico**: `GET /api/documentos/archivos/:id`

---

## Seguridad en Subida de Archivos

### Validaciones Aplicadas

1. **Tipo de Archivo**
   - Solo se permiten tipos específicos (PDF, Word, Excel, etc.)
   - Se valida el MIME type
   - Se verifica la firma del archivo (magic numbers)

2. **Tamaño**
   - Límite: 100MB por archivo
   - Error HTTP 413 si se excede

3. **Nombre de Archivo**
   - Se sanitiza automáticamente (remueve caracteres peligrosos)
   - Se genera nombre único: `{timestamp}_{hash}_{nombre}`
   - Se previenen ataques de path traversal

4. **Almacenamiento**
   - **Carpeta base**: `uploads/documentos/`
   - Todos los documentos se guardan directamente en esta carpeta
   - Solo accesible mediante rutas del backend
   - Protección contra acceso directo no autorizado

5. **Validación de Integridad**
   - Verifica que el archivo no esté corrupto
   - Mínimo 50 bytes de tamaño
   - Coincidencia de firma con tipo declarado

### Acceso Directo a Archivos

Los archivos subidos se pueden acceder directamente mediante sus URLs:

```
GET https://api.uttecam.edu.mx/uploads/documentos/archivo.pdf
```

**Ejemplos de URLs válidas:**
- `https://api.uttecam.edu.mx/uploads/documentos/plan_estudios.pdf`
- `https://api.uttecam.edu.mx/uploads/documentos/presupuesto.xlsx`
- `https://api.uttecam.edu.mx/uploads/documentos/documento.pdf`

**Extensiones permitidas:** `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`, `.txt`

**Caracteres especiales:** ✅ Soportados (guiones bajos, puntos, espacios, etc.)

**Seguridad:** Rate limiting aplicado (200 descargas por IP cada 15 minutos)
- Path traversal: `..`, caracteres especiales

### Diagnóstico de Archivos

Para verificar si un archivo existe y está accesible:

```
GET /api/documentos/check-file/{categoryId}/{filename}
```

**Ejemplo:**
```
GET /api/documentos/check-file/5/10._Analítico_de_la_Deuda.pdf
```

**Respuesta:**
```json
{
  "filename": "10._Analítico_de_la_Deuda.pdf",
  "categoryId": "5",
  "filePath": "/app/uploads/documentos/10._Analítico_de_la_Deuda.pdf",
  "urlPath": "/uploads/documentos/10._Analítico_de_la_Deuda.pdf",
  "fullUrl": "https://api.uttecam.edu.mx/uploads/documentos/10._Analítico_de_la_Deuda.pdf",
  "exists": true,
  "size": 245760,
  "modified": "2025-10-28T14:30:00.000Z",
  "error": null
}
```

---

## Ejemplos de Integración

### React / Frontend

```javascript
// Componente de subida de archivo
const SubirDocumento = () => {
  const [file, setFile] = useState(null);
  const [categoria, setCategoria] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('Nombre', nombre);
    formData.append('Descripcion', descripcion);
    formData.append('ID_Categorias', categoria);

    try {
      const response = await fetch('/api/documentos/archivos/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      console.log('Archivo subido:', data);
      alert('Archivo subido exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al subir archivo');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files[0])}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
        required 
      />
      <input 
        type="text" 
        placeholder="Nombre" 
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <textarea 
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />
      <select 
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        required
      >
        <option value="">Seleccionar categoría</option>
        {/* Llenar con categorías desde API */}
      </select>
      <button type="submit">Subir Documento</button>
    </form>
  );
};
```

### Node.js / Backend

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function subirDocumento(rutaArchivo, idCategoria) {
  const formData = new FormData();
  formData.append('archivo', fs.createReadStream(rutaArchivo));
  formData.append('Nombre', 'Mi Documento');
  formData.append('Descripcion', 'Descripción del documento');
  formData.append('ID_Categorias', idCategoria);

  try {
    const response = await axios.post(
      'http://localhost:3000/api/documentos/archivos/upload',
      formData,
      { headers: formData.getHeaders() }
    );
    
    console.log('Archivo subido:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Uso
subirDocumento('./documento.pdf', 1);
```

### Python

```python
import requests

def subir_documento(ruta_archivo, id_categoria, nombre=None, descripcion=None):
    url = 'http://localhost:3000/api/documentos/archivos/upload'
    
    files = {'archivo': open(ruta_archivo, 'rb')}
    data = {
        'ID_Categorias': id_categoria,
        'Nombre': nombre or 'Documento',
        'Descripcion': descripcion or ''
    }
    
    try:
        response = requests.post(url, files=files, data=data)
        response.raise_for_status()
        print('Archivo subido:', response.json())
        return response.json()
    except requests.exceptions.RequestException as e:
        print('Error:', e)
        raise

# Uso
subir_documento('./documento.pdf', 1, 'Mi Documento', 'Descripción')
```

---

## Testing

### Postman

1. **Importar Colección**
   - Ubicación: `docs/04-api-referencia/Postman_Documentos.json`
   - File → Import → Seleccionar archivo
   - La colección incluye todos los endpoints con ejemplos

2. **Configurar Variable**
   - En la colección, verificar que `base_url` = `http://localhost:3000`

3. **Probar Upload**
   - Usar el request "Subir archivo (RECOMENDADO)"
   - En Body → form-data → campo "archivo" → Select Files
   - Completar otros campos y enviar

### cURL

```bash
# Crear área
curl -X POST http://localhost:3000/api/documentos/areas \
  -H "Content-Type: application/json" \
  -d '{"Nombre":"Académico"}'

# Crear categoría
curl -X POST http://localhost:3000/api/documentos/categorias \
  -H "Content-Type: application/json" \
  -d '{"Nombre":"Planes de Estudio","ID_Area":1}'

# Subir archivo
curl -X POST http://localhost:3000/api/documentos/archivos/upload \
  -F "archivo=@/ruta/al/documento.pdf" \
  -F "Nombre=Plan 2024" \
  -F "Descripcion=Plan de estudios" \
  -F "ID_Categorias=1"

# Listar todos los archivos
curl http://localhost:3000/api/documentos/archivos

# Obtener archivo específico
curl http://localhost:3000/api/documentos/archivos/1

# Eliminar archivo
curl -X DELETE http://localhost:3000/api/documentos/archivos/1
```

### Thunder Client (VS Code)

1. Instalar extensión Thunder Client
2. Importar colección desde `Postman_Documentos.json`
3. Configurar base URL en variables
4. Ejecutar requests

---

## Troubleshooting

### Error: "Tipo de documento no permitido"
- **Causa**: El archivo no está en la lista de tipos permitidos
- **Solución**: Verificar que sea PDF, Word, Excel, PowerPoint, TXT, ZIP o RAR

### Error: "Archivo demasiado grande"
- **Causa**: El archivo excede 100MB
- **Solución**: Comprimir el archivo o dividirlo en partes más pequeñas (si es mayor a 100MB)

### Error: "Categoría no encontrada"
- **Causa**: El ID_Categorias no existe en la base de datos
- **Solución**: Verificar que la categoría exista con `GET /api/documentos/categorias`

### Error: "Archivo inválido"
- **Causa**: El archivo está corrupto o la firma no coincide con el tipo
- **Solución**: Verificar que el archivo no esté dañado

### Archivo no se sube
- Verificar que el campo del formulario se llame exactamente `archivo`
- Verificar que sea `multipart/form-data`
- Verificar permisos de escritura en carpeta `uploads/documentos/`

### No se puede eliminar área o categoría
- **Causa**: Tiene elementos dependientes (categorías o archivos)
- **Solución**: Eliminar primero los elementos dependientes, o usar cascada si está configurada

---

## Estructura de Base de Datos

### Tabla: `area`
```sql
CREATE TABLE area (
  ID_Area INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(100) NOT NULL UNIQUE,
  INDEX UC_Nombre (Nombre)
);
```

### Tabla: `categorias`
```sql
CREATE TABLE categorias (
  ID_Categorias INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(100) NOT NULL UNIQUE,
  ID_Area INT NOT NULL,
  FOREIGN KEY (ID_Area) REFERENCES area(ID_Area) ON UPDATE CASCADE,
  INDEX UC_Nombre_Categoria (Nombre),
  INDEX FK_Area (ID_Area)
);
```

### Tabla: `archivos`
```sql
CREATE TABLE archivos (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(255) NOT NULL,
  Fecha_Subida DATETIME DEFAULT CURRENT_TIMESTAMP,
  Descripcion TEXT,
  Ruta_Documento VARCHAR(500) NOT NULL,
  ID_Categorias INT NOT NULL,
  FOREIGN KEY (ID_Categorias) REFERENCES categorias(ID_Categorias) ON UPDATE CASCADE,
  INDEX FK_Categoria (ID_Categorias)
);
```

---

## Changelog

### Version 2.0 (Actual)
- ✅ Subida de archivos físicos con validación completa
- ✅ Generación automática de rutas
- ✅ Eliminación de archivos físicos al borrar registro
- ✅ Validación de firmas de archivo
- ✅ Sanitización de nombres
- ✅ Soporte para múltiples tipos de documento
- ✅ Colección de Postman incluida

### Version 1.0
- ✅ CRUD completo para Áreas, Categorías y Archivos
- ✅ Relaciones jerárquicas
- ✅ Validaciones de integridad
- ✅ Documentación completa

---

## Ver También

- [Arquitectura del Sistema](../08-arquitectura/ARCHITECTURE.md)
- [Implementación](../03-desarrollo/IMPLEMENTATION.md)
- [Despliegue](../05-despliegue/DEPLOYMENT.md)
- [Colección de Postman](./Postman_Documentos.json)

---

## Soporte y Contacto

Para reportar problemas o sugerencias sobre la API de documentos:
- Crear issue en el repositorio
- Consultar documentación adicional en `/docs`
- Revisar logs del servidor para depuración
