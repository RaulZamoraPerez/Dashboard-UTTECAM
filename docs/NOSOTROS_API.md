# API de "Nosotros" - Universidad Tecnológica de Tecamachalco

> 📋 **Nota:** Para instalación y configuración del proyecto, consulta **[INSTALLATION.md](../02-instalacion-configuracion/INSTALLATION.md)** y **[DEVELOPMENT.md](../03-desarrollo/DEVELOPMENT.md)**

## 📋 Descripción

La API de "Nosotros" proporciona un sistema completo de gestión de contenido dinámico para la sección institucional de la Universidad Tecnológica de Tecamachalco. Permite a los administradores del CMS crear, leer, actualizar y eliminar (CRUD) el contenido de las secciones: Visión, Misión, Valores, Política Integral, Objetivo Integral y Política de No Discriminación. Incluye además funcionalidad dedicada para la subida y gestión segura de imágenes asociadas a cada sección.

## 🚀 Características

- ✅ **CRUD Completo**: Operaciones completas de Create, Read, Update, Delete
- 🔐 **Autenticación JWT**: Seguridad para operaciones de escritura
- 📊 **Gestión Granular**: Control individual de cada sección
- �️ **Subida de Imágenes**: Endpoint dedicado para gestión de imágenes de secciones
- �🗄️ **Base de Datos JSON**: Almacenamiento flexible en MySQL con campos JSON
- 🔄 **API RESTful**: Endpoints bien estructurados y documentados
- 📱 **CMS Ready**: Preparado para integración con sistemas de gestión de contenido

## 📚 Estructura de Datos

### Modelo de Contenido

```json
{
  "vision": {
    "imageSrc": "string (URL relativa)",
    "title": "string",
    "description": "string"
  },
  "mision": {
    "imageSrc": "string (URL relativa)",
    "title": "string",
    "description": "string"
  },
  "valores": {
    "imageSrc": "string (URL relativa)",
    "title": "string",
    "description": "string[] (array de valores)"
  },
  "politicaIntegral": "string (texto largo)",
  "objetivoIntegral": "string (texto largo)",
  "noDiscriminacion": "string[][] (matriz de categorías)"
}
```

## 🔗 Endpoints de la API

### Base URL
```
https://api.utt.edu.mx/api/nosotros
```

### 📖 Operaciones de Lectura (Públicas)

#### Obtener Todo el Contenido
```http
GET /content
```

**Respuesta (200):**
```json
{
  "vision": { "imageSrc": "...", "title": "Visión", "description": "..." },
  "mision": { "imageSrc": "...", "title": "Misión", "description": "..." },
  "valores": { "imageSrc": "...", "title": "Valores", "description": ["...", "..."] },
  "politicaIntegral": "...",
  "objetivoIntegral": "...",
  "noDiscriminacion": [["...", "..."], ["...", "..."]]
}
```

**Error (404) si no existe contenido:**
```json
{
  "error": "Contenido no encontrado",
  "message": "El contenido de 'Nosotros' no ha sido creado aún. Use POST /api/nosotros/content para crear el contenido inicial."
}
```

#### Obtener Sección Específica
```http
GET /content/{section}
```

**Parámetros:**
- `section`: `vision` | `mision` | `valores` | `politicaIntegral` | `objetivoIntegral` | `noDiscriminacion`

**Respuesta (200):**
```json
{
  "vision": { "imageSrc": "...", "title": "Visión", "description": "..." }
}
```

**Error (404) si no existe contenido:**
```json
{
  "error": "Contenido no encontrado",
  "message": "El contenido de 'Nosotros' no ha sido creado aún. Use POST /api/nosotros/content para crear el contenido inicial."
}
```

### ✏️ Operaciones de Escritura (Requieren Autenticación)

#### Crear Nuevo Contenido
```http
POST /content
Authorization: Bearer <token>
Content-Type: application/json
```

**Cuerpo:** Estructura completa del contenido

**Respuesta (201):**
```json
{
  "message": "Contenido creado exitosamente",
  "content": { ... }
}
```

#### Actualizar Todo el Contenido
```http
PUT /content
Authorization: Bearer <token>
Content-Type: application/json
```

**Cuerpo:** Estructura completa del contenido

**Respuesta (200):**
```json
{
  "message": "Contenido actualizado exitosamente",
  "content": { ... }
}
```

#### Actualizar Sección Específica
```http
PATCH /content/{section}
Authorization: Bearer <token>
Content-Type: application/json
```

**Cuerpo:** Solo la sección a actualizar

**Respuesta (200):**
```json
{
  "message": "Sección vision actualizada exitosamente",
  "vision": { ... }
}
```

**Error (404) si no existe contenido:**
```json
{
  "error": "Contenido no encontrado",
  "message": "El contenido de 'Nosotros' no ha sido creado aún. Use POST /api/nosotros/content para crear el contenido inicial."
}
```

#### Eliminar Todo el Contenido
```http
DELETE /content
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "message": "Contenido eliminado exitosamente",
  "deletedCount": 1
}
```

#### Restaurar Sección a Valores por Defecto
```http
DELETE /content/{section}
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "message": "Sección vision restaurada a valores por defecto",
  "vision": { ... }
}
```

### 🖼️ Operaciones de Imágenes (Requieren Autenticación)

#### Subir Imagen para Sección Específica
```http
POST /upload-image
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Campos del Formulario:**
- `image`: Archivo de imagen (requerido)
- `section`: Sección a actualizar - `vision` | `mision` | `valores` (requerido)

**Tipos de imagen soportados:**
- JPEG/JPG
- PNG
- GIF
- WebP
- AVIF
- SVG

**Límites:**
- Tamaño máximo: 5MB
- Un solo archivo por solicitud

**Respuesta (200):**
```json
{
  "message": "Imagen subida exitosamente para la sección vision",
  "section": "vision",
  "imageSrc": "/uploads/nosotros/vision_1699123456_abc123def456.jpg",
  "filename": "vision_1699123456_abc123def456.jpg"
}
```

**Errores comunes:**
```json
{
  "error": "Sección requerida",
  "message": "Debe especificar la sección (vision, mision, valores)"
}
```

```json
{
  "error": "Contenido no encontrado",
  "message": "Debe crear el contenido de 'Nosotros' antes de subir imágenes"
}
```

```json
{
  "error": "Tipo MIME no permitido: image/tiff",
  "message": "Solo se permiten imágenes JPEG, PNG, GIF, WebP, AVIF y SVG"
}
```

## 🔐 Autenticación

Todos los endpoints de escritura requieren autenticación JWT:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Los endpoints de lectura son públicos y no requieren autenticación.

## 📊 Códigos de Estado HTTP

- **200**: Operación exitosa
- **201**: Recurso creado exitosamente
- **400**: Datos inválidos, sección no válida, archivo no válido o faltante
- **401**: Token de autenticación faltante o inválido
- **403**: Usuario sin permisos de administrador
- **404**: Contenido no encontrado
- **413**: Archivo demasiado grande (Payload Too Large)
- **415**: Tipo de archivo no soportado (Unsupported Media Type)
- **500**: Error interno del servidor

## 🧪 Testing

### Usando cURL

**Obtener contenido:**
```bash
curl -X GET http://localhost:3002/api/nosotros/content
```

**Actualizar sección (requiere token):**
```bash
curl -X PATCH http://localhost:3002/api/nosotros/content/vision \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageSrc": "nosotros/vision-nueva.jpg",
    "title": "Nueva Visión",
    "description": "Descripción actualizada..."
  }'
```

**Subir imagen para sección (requiere token):**
```bash
curl -X POST http://localhost:3002/api/nosotros/upload-image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/your/image.jpg" \
  -F "section=vision"
```

### Usando Postman

1. Importar colección: `docs/postman/BKUTTECAM.postman_collection.json`
2. Configurar variable `base_url`: `http://localhost:3002`
3. Configurar variable `jwt_token` con token válido

## 📁 Estructura del Proyecto

```
src/
├── controllers/
│   └── nosotrosController.ts    # Lógica de negocio
├── models/
│   └── Nosotros.ts             # Modelo de datos
├── routes/
│   └── nosotros.ts             # Definición de rutas
├── config/
│   ├── database.ts             # Configuración BD
│   └── syncDatabase.ts         # Sincronización modelos
└── middleware/
    ├── auth.ts                 # Autenticación JWT
    ├── uploadMiddleware.ts     # Gestión de subida de archivos
    └── validation.ts           # Validación de datos

uploads/
└── nosotros/                  # Directorio de imágenes subidas

scripts/
└── node scripts/auth/create-admin.js --seed-all    # Script principal que crea admin y poblaciones de 'nosotros' y 'carreras'

docs/
└── NOSOTROS_API.md            # Especificación completa
```

## 🔍 Validación de Datos

### Secciones Válidas
- `vision`
- `mision`
- `valores`
- `politicaIntegral`
- `objetivoIntegral`
- `noDiscriminacion`

### Reglas de Validación

- **Todos los campos requeridos**: `vision`, `mision`, `valores`, `politicaIntegral`, `objetivoIntegral`, `noDiscriminacion`
- **URLs de imágenes**: Deben ser rutas relativas válidas
- **Textos**: Longitud máxima de 65,535 caracteres (TEXT en MySQL)
- **Arrays**: Estructura correcta según especificación
- **Imágenes**: Solo tipos MIME permitidos, tamaño máximo 5MB, verificación de contenido real

## 🚨 Manejo de Errores

### Errores Comunes

```json
{
  "error": "Sección inválida",
  "details": "Las secciones válidas son: vision, mision, valores, politicaIntegral, objetivoIntegral, noDiscriminacion"
}
```

```json
{
  "error": "Datos inválidos",
  "details": "Todas las secciones son requeridas"
}
```

## 📈 Rendimiento

- **Cache**: Implementar cache en el frontend para contenido estático
- **Compresión**: Gzip habilitado para respuestas JSON
- **Rate Limiting**: Protección contra abuso de API
- **Índices**: Optimización de consultas de base de datos

## 🔄 Versionado

- **Versión actual**: v1.0.0
- **Endpoint base**: `/api/nosotros`
- **Futuras versiones**: `/api/v2/nosotros`

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 📞 Soporte

- **Email**: soporte@uttecam.edu.mx
- **Issues**: [GitHub Issues](https://github.com/lisandro-flores/BKUTTECAM/issues)
- **Documentación**: `docs/NOSOTROS_API.md`

---

**Universidad Tecnológica de Tecamachalco** © 2025