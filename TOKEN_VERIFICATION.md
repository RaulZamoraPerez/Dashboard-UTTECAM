# Sistema de Verificación y Renovación de Token JWT

## 📋 Descripción

El sistema implementa verificación automática del token JWT que expira en **24 horas**, con alertas al usuario y renovación automática de sesión.

## 🔐 Características Implementadas

### 1. Verificación Local del Token
- **Decodificación del JWT**: El token se decodifica en el cliente para extraer la fecha de expiración
- **Validación sin servidor**: Se verifica localmente si el token ha expirado antes de hacer peticiones
- **Optimización**: Evita peticiones innecesarias al servidor con tokens expirados

### 2. Verificación con el Servidor
**Endpoint**: `GET /api/auth/profile`

✅ Verifica que el token sea válido  
✅ Retorna información del usuario si el token es válido  
❌ Retorna error 401 si el token es inválido o expirado  

### 3. Monitor de Expiración en Tiempo Real
- **Alerta visual**: Aparece 5 minutos antes de que expire el token
- **Cuenta regresiva**: Muestra el tiempo restante en formato MM:SS
- **Acción rápida**: Botón para renovar la sesión sin perder el trabajo

### 4. Verificación Periódica Automática
- **Intervalo**: Cada 5 minutos verifica el token con el servidor
- **Auto-logout**: Si el token es inválido, cierra sesión automáticamente
- **Sin interrupciones**: Trabaja en segundo plano

### 5. Interceptor de API
- **Verificación previa**: Antes de cada petición, verifica si el token está expirado
- **Manejo de errores 401**: Si el servidor retorna 401, limpia el token y redirige al login
- **Experiencia fluida**: El usuario es redirigido automáticamente al login si su sesión expiró

## 🚀 Funciones Implementadas

### `verifyToken()`
Verifica el token con el servidor usando el endpoint `/api/auth/profile`

```typescript
const userData = await verifyToken();
if (userData) {
  // Token válido, usuario autenticado
  console.log('Usuario:', userData);
} else {
  // Token inválido o expirado
  logout();
}
```

**Retorna:**
- `UserProfile` si el token es válido
- `null` si el token es inválido o expirado

### `isTokenExpired()`
Verifica localmente si el token está expirado sin hacer petición al servidor

```typescript
if (isTokenExpired()) {
  // Token expirado
  logout();
} else {
  // Token válido
  continueWork();
}
```

**Retorna:**
- `true` si el token está expirado
- `false` si el token aún es válido

### `checkTokenValidity()`
Verifica el token (local y servidor) y actualiza el contexto

```typescript
const isValid = await checkTokenValidity();
if (isValid) {
  // Sesión renovada
} else {
  // Sesión expirada, usuario fue deslogueado
}
```

## 🎯 Flujo de Funcionamiento

### Al Iniciar la Aplicación
```
1. Verificar si hay token en localStorage
   ↓
2. Decodificar token y verificar expiración local
   ↓
3. Si está expirado → Eliminar y mostrar login
   ↓
4. Si es válido → Verificar con servidor
   ↓
5. Si servidor confirma → Cargar datos de usuario
   ↓
6. Si servidor rechaza → Eliminar y mostrar login
```

### Durante el Uso
```
1. Verificación periódica cada 5 minutos
   ↓
2. Antes de cada petición API → Verificar expiración
   ↓
3. Si quedan < 5 minutos → Mostrar alerta
   ↓
4. Usuario puede renovar o continuar
   ↓
5. Si expira → Auto-logout y redirigir a login
```

### En Cada Petición API
```
1. Verificar si token está expirado (local)
   ↓
2. Si expirado → Redirigir a login
   ↓
3. Si válido → Hacer petición con token
   ↓
4. Si respuesta es 401 → Redirigir a login
   ↓
5. Si respuesta es OK → Retornar datos
```

## 📱 Componente: TokenExpirationMonitor

Componente visual que alerta al usuario cuando su sesión está por expirar.

### Características
- ✅ Se muestra 5 minutos antes de la expiración
- ✅ Cuenta regresiva en tiempo real
- ✅ Botón para renovar sesión
- ✅ Se oculta automáticamente si se renueva
- ✅ Diseño responsive y accesible

### Ubicación
Integrado en `AppLayout.tsx` para estar disponible en toda la aplicación

## 🔄 Integración en el Código

### AuthContext
El contexto de autenticación ahora incluye:

```typescript
interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: UserProfile | null;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => void;
  isLoading: boolean;
  checkTokenValidity: () => Promise<boolean>; // ← NUEVO
}
```

### API Service
El servicio de API ahora verifica automáticamente:

```typescript
export const fetchWithAuth = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  // Verificar expiración antes de hacer petición
  if (isTokenExpired()) {
    removeToken();
    window.location.href = '/signin';
    throw new Error('Sesión expirada');
  }
  
  // Hacer petición...
  
  // Si recibe 401, también redirigir
  if (response.status === 401) {
    removeToken();
    window.location.href = '/signin';
    throw new Error('Sesión expirada');
  }
}
```

## 📊 Timeline de Expiración

```
Token creado
│
│   [23 horas, 55 minutos] ← Uso normal
│
├─ 5 minutos antes ──────────┐
│                             │
│  ⚠️ Alerta de expiración   │
│  Cuenta regresiva activa   │
│  Usuario puede renovar     │
│                             │
├─ Expiración (24h) ─────────┘
│
│  ❌ Token expirado
│  Auto-logout
│  Redirigir a login
│
└─ Usuario debe iniciar sesión nuevamente
```

## 🛠️ Personalización

### Cambiar el Tiempo de Alerta

En `TokenExpirationMonitor.tsx`:

```typescript
// Cambiar de 5 minutos (300 segundos) a otro valor
if (timeLeft > 0 && timeLeft < 300) { // ← Cambiar 300 por el valor deseado
  setShowWarning(true);
}
```

### Cambiar la Frecuencia de Verificación

En `AuthContext.tsx`:

```typescript
// Cambiar de 5 minutos a otro intervalo
const interval = setInterval(async () => {
  // ...
}, 5 * 60 * 1000); // ← Cambiar (minutos * 60 * 1000)
```

## 🧪 Pruebas

### Probar la Expiración

1. **Método 1: Esperar 24 horas** (no recomendado 😅)

2. **Método 2: Modificar el token manualmente**
   ```javascript
   // En la consola del navegador
   const token = localStorage.getItem('authToken');
   // Modificar el payload para que expire pronto
   ```

3. **Método 3: Configurar el backend con expiración corta**
   ```javascript
   // En el backend, cambiar temporalmente
   jwt.sign(payload, secret, { expiresIn: '2m' }); // 2 minutos
   ```

### Verificar la Alerta

1. Inicia sesión
2. Espera hasta 5 minutos antes de la expiración
3. Debería aparecer la alerta amarilla en la esquina superior derecha
4. Verifica que la cuenta regresiva funcione
5. Haz clic en "Continuar sesión" para renovar

### Verificar el Auto-Logout

1. Deja que el token expire completamente
2. Intenta hacer cualquier acción (subir documento, navegar, etc.)
3. Deberías ser redirigido automáticamente a `/signin`

## 📝 Endpoint del Backend

### GET /api/auth/profile

**Headers requeridos:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@uttecam.edu.mx",
  "role": "admin"
}
```

**Respuesta error (401):**
```json
{
  "message": "Token inválido o expirado"
}
```

## 🔒 Seguridad

### Medidas Implementadas

1. **Verificación doble**: Local + Servidor
2. **Limpieza automática**: Tokens expirados se eliminan
3. **Redireccionamiento seguro**: Sin acceso a rutas protegidas
4. **No almacenamiento inseguro**: Solo en localStorage (considerar httpOnly cookies en producción)
5. **Decodificación segura**: Validación de estructura del JWT

### Recomendaciones para Producción

- [ ] Implementar refresh tokens para renovación automática
- [ ] Usar httpOnly cookies en lugar de localStorage
- [ ] Implementar CSRF tokens
- [ ] Configurar Content Security Policy (CSP)
- [ ] Implementar rate limiting en el backend
- [ ] Logs de intentos de acceso con tokens expirados

## 🐛 Troubleshooting

### El usuario es deslogueado constantemente
- Verificar que el servidor esté retornando tokens con 24h de expiración
- Revisar la sincronización de relojes entre cliente y servidor
- Verificar que el endpoint `/api/auth/profile` esté funcionando correctamente

### La alerta no aparece
- Verificar que el token tenga el campo `exp` en el payload
- Comprobar que el componente `TokenExpirationMonitor` esté montado
- Revisar la consola del navegador por errores

### Errores 401 inesperados
- Verificar que el token se esté enviando correctamente en los headers
- Comprobar que el formato del token sea válido
- Revisar los logs del servidor para más detalles

## 📚 Recursos Adicionales

- [JWT.io](https://jwt.io/) - Decodificar y validar JWTs
- [RFC 7519](https://tools.ietf.org/html/rfc7519) - Especificación JWT
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)

---

**Última actualización**: Octubre 23, 2025
