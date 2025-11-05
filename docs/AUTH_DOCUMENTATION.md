# Sistema de Autenticación JWT

Este sistema implementa autenticación JWT para el dashboard usando el backend en `http://localhost:3002`.

## 🔐 Configuración

### Variables de Entorno

Asegúrate de tener configurada la variable en tu archivo `.env`:

```env
VITE_BACKENDURL=http://localhost:3002
```

## 📝 Uso del Login

### Credenciales de Prueba

```
Usuario: admin
Contraseña: Admin123!@#
```

### Componente de Login

El componente `SignInForm` ya está conectado al endpoint de autenticación. Los usuarios pueden:

1. Ingresar su usuario y contraseña
2. Hacer clic en "iniciar sesión"
3. El sistema guardará automáticamente el token JWT en localStorage
4. Redirigirá al usuario al dashboard

## 🛠️ Archivos Principales

### 1. AuthService (`src/services/authService.ts`)

Contiene todas las funciones relacionadas con la autenticación:

```typescript
import { login, saveToken, getToken, removeToken, isAuthenticated, getAuthHeaders } from '../services/authService';

// Login
const response = await login({ username: 'admin', password: 'Admin123!@#' });
// response.token contiene el JWT

// Guardar token
saveToken(token);

// Obtener token
const token = getToken();

// Verificar autenticación
const authenticated = isAuthenticated();

// Obtener headers con autorización
const headers = getAuthHeaders();
// Incluye: Authorization: Bearer <token>
```

### 2. AuthContext (`src/context/AuthContext.tsx`)

Proveedor de contexto para gestionar el estado de autenticación:

```typescript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { isAuthenticated, token, login, logout, isLoading } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login({ username: 'admin', password: 'Admin123!@#' });
      // Login exitoso
    } catch (error) {
      // Manejar error
    }
  };
  
  const handleLogout = () => {
    logout();
  };
}
```

### 3. API Service (`src/services/apiService.ts`)

Utilidad para hacer peticiones autenticadas:

```typescript
import { fetchWithAuth } from '../services/apiService';

// GET con autenticación
const data = await fetchWithAuth('/api/usuarios', {
  method: 'GET'
});

// POST con autenticación
const result = await fetchWithAuth('/api/usuarios', {
  method: 'POST',
  body: JSON.stringify({ nombre: 'Juan' })
});

// PUT con autenticación
const updated = await fetchWithAuth('/api/usuarios/1', {
  method: 'PUT',
  body: JSON.stringify({ nombre: 'Pedro' })
});

// DELETE con autenticación
await fetchWithAuth('/api/usuarios/1', {
  method: 'DELETE'
});
```

### 4. ProtectedRoute (`src/components/auth/ProtectedRoute.tsx`)

Componente para proteger rutas:

```typescript
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// En tu configuración de rutas
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

## 🔄 Flujo de Autenticación

1. **Login:**
   - Usuario ingresa credenciales en `/signin`
   - Se envía POST a `/api/auth/login`
   - Backend responde con token JWT
   - Token se guarda en localStorage
   - Usuario es redirigido al dashboard

2. **Peticiones Autenticadas:**
   - Todas las peticiones usan `fetchWithAuth`
   - El token se incluye automáticamente en el header: `Authorization: Bearer <token>`
   - Si el token es inválido, el servidor responderá con error 401

3. **Logout:**
   - Se llama a `logout()` desde useAuth
   - Se elimina el token de localStorage
   - Usuario es redirigido al login

## 📋 Ejemplo Completo

```typescript
// src/pages/Users/UsersList.tsx
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

interface User {
  id: number;
  nombre: string;
  email: string;
}

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await fetchWithAuth<User[]>('/api/usuarios', {
        method: 'GET'
      });
      setUsers(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      // Si el token expiró, hacer logout
      if (error.message.includes('401')) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetchWithAuth(`/api/usuarios/${id}`, {
        method: 'DELETE'
      });
      // Recargar lista
      loadUsers();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h1>Usuarios</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.nombre} - {user.email}
            <button onClick={() => handleDelete(user.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 🚀 Endpoints del Backend

### Login
```
POST /api/auth/login
Body: { "username": "admin", "password": "Admin123!@#" }
Response: { "message": "Login exitoso", "token": "eyJhbG..." }
```

### Endpoints Protegidos
Todos los endpoints protegidos requieren el header:
```
Authorization: Bearer <token>
```

## ⚠️ Notas Importantes

1. **Seguridad del Token:**
   - El token se guarda en localStorage
   - No exponer el token en console.log en producción
   - Implementar refresh token si es necesario

2. **Manejo de Errores:**
   - Error 401: Token inválido o expirado → hacer logout
   - Error 403: Sin permisos → mostrar mensaje
   - Error 500: Error del servidor → reintentar o notificar

3. **Desarrollo vs Producción:**
   - En desarrollo: `VITE_BACKENDURL=http://localhost:3002`
   - En producción: actualizar a la URL real del backend

## 🧪 Pruebas

Para probar el sistema:

1. Inicia el backend en el puerto 3002
2. Inicia el frontend: `npm run dev`
3. Navega a `/signin`
4. Ingresa las credenciales de prueba
5. Verifica que se guarde el token en localStorage (DevTools → Application → Local Storage)
6. Realiza peticiones a endpoints protegidos

## 📦 Dependencias

El sistema usa las dependencias ya incluidas en el proyecto:
- React Router para navegación
- Fetch API nativa para peticiones HTTP
- Context API de React para estado global

No se requieren instalaciones adicionales.
