# Truco App Frontend

## 🎨 Diseño y Características

Esta aplicación cuenta con:

- **Login moderno y animado** con validación de backend
- **Dashboard interactivo** con sidebar desplegable
- **Diseño responsive** que funciona en desktop y móviles
- **Paleta de colores**: Azul (#3b82f6), Verde (#34d399) y Blanco
- **Animaciones fluidas** y efectos visuales modernos
- **Protección de rutas** para usuarios autenticados

## 🚀 Cómo ejecutar

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

## 📁 Estructura del Proyecto

```
src/
├── components/
│   └── ProtectedRoute.tsx    # Componente para proteger rutas
├── pages/
│   ├── Login.tsx              # Página de inicio de sesión
│   ├── Login.css
│   ├── Dashboard.tsx          # Dashboard principal
│   └── Dashboard.css
├── App.tsx                    # Router principal
├── main.tsx                   # Punto de entrada
└── index.css                  # Estilos globales
```

## 🔐 Autenticación

El login se conecta al backend en `http://localhost:8000/api/login` 

**Formato esperado de la respuesta:**
```json
{
  "token": "...",
  "user": {
    "id": "...",
    "username": "...",
    "email": "..."
  }
}
```

**Manejo de errores:**
- Si el login es exitoso (status 200), redirige a `/dashboard`
- Si las credenciales son incorrectas, muestra: "Usuario o contraseña incorrectos"
- Si hay error de conexión, muestra: "Error de conexión. Por favor intenta nuevamente."

## 🎯 Características del Dashboard

- **Estadísticas en tiempo real**: Partidas jugadas, victorias, ranking, puntos
- **Historial de partidas**: Últimas partidas con detalles
- **Menú lateral**: Con 6 secciones principales
- **Diseño modular**: Fácil de expandir con nuevas funcionalidades

## 🎨 Paleta de Colores

- **Azul Principal**: `#3b82f6` (rgb(59, 130, 246))
- **Verde Acento**: `#34d399` (rgb(52, 211, 153))
- **Blanco/Fondo**: `#ffffff`
- **Grises**: `#f8fafc`, `#64748b`, `#0f172a`

## 📱 Responsive

La aplicación es completamente responsive:
- **Desktop**: Sidebar fijo expandido
- **Tablet**: Sidebar colapsable
- **Mobile**: Sidebar overlay con toggle
