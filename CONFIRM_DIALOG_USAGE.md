# ConfirmDialog - Componente Reutilizable

## Descripción
Componente de diálogo de confirmación personalizado que reemplaza el `window.confirm` nativo con un diseño atractivo y consistente con los colores de la aplicación.

## Uso Básico

```tsx
import { useState } from 'react';
import ConfirmDialog from './components/ConfirmDialog';

function MiComponente() {
  const [showDialog, setShowDialog] = useState(false);

  const handleDelete = () => {
    // Tu lógica aquí
    console.log('Elemento eliminado');
  };

  return (
    <>
      <button onClick={() => setShowDialog(true)}>
        Eliminar
      </button>

      <ConfirmDialog
        isOpen={showDialog}
        message="¿Estás seguro de que deseas eliminar este elemento?"
        onConfirm={handleDelete}
        onCancel={() => setShowDialog(false)}
      />
    </>
  );
}
```

## Props

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `isOpen` | `boolean` | ✅ | - | Controla si el diálogo está visible |
| `message` | `string` | ✅ | - | Mensaje principal a mostrar al usuario |
| `onConfirm` | `() => void` | ✅ | - | Función a ejecutar cuando se confirma |
| `onCancel` | `() => void` | ✅ | - | Función a ejecutar cuando se cancela |
| `title` | `string` | ❌ | '¿Confirmar acción?' | Título del diálogo |
| `confirmText` | `string` | ❌ | 'Aceptar' | Texto del botón de confirmar |
| `cancelText` | `string` | ❌ | 'Cancelar' | Texto del botón de cancelar |
| `type` | `'danger' \| 'warning' \| 'info'` | ❌ | 'warning' | Tipo de diálogo (afecta colores e ícono) |

## Tipos de Diálogo

### Danger (Peligro)
Para acciones destructivas como eliminar, cancelar permanentemente, etc.
```tsx
<ConfirmDialog
  type="danger"
  title="Eliminar Usuario"
  message="Esta acción eliminará permanentemente el usuario. ¿Deseas continuar?"
  confirmText="Sí, eliminar"
  cancelText="No, conservar"
  onConfirm={handleDelete}
  onCancel={() => setShowDialog(false)}
/>
```

### Warning (Advertencia)
Para acciones que requieren atención pero no son destructivas.
```tsx
<ConfirmDialog
  type="warning"
  title="Cambios sin guardar"
  message="Tienes cambios sin guardar. ¿Deseas salir de todas formas?"
  confirmText="Sí, salir"
  cancelText="Continuar editando"
  onConfirm={handleExit}
  onCancel={() => setShowDialog(false)}
/>
```

### Info (Información)
Para confirmaciones generales o informativas.
```tsx
<ConfirmDialog
  type="info"
  title="Confirmar envío"
  message="¿Estás listo para enviar el formulario?"
  confirmText="Enviar"
  cancelText="Revisar"
  onConfirm={handleSubmit}
  onCancel={() => setShowDialog(false)}
/>
```

## Ejemplo Completo

```tsx
import { useState } from 'react';
import ConfirmDialog from './components/ConfirmDialog';

function ListaJugadores() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [jugadorAEliminar, setJugadorAEliminar] = useState<number | null>(null);

  const handleDeleteClick = (jugadorId: number) => {
    setJugadorAEliminar(jugadorId);
    setShowConfirm(true);
  };

  const confirmarEliminacion = async () => {
    if (jugadorAEliminar) {
      await fetch(`/api/players/${jugadorAEliminar}`, { method: 'DELETE' });
      // Actualizar lista...
    }
  };

  return (
    <div>
      {/* Tu lista de jugadores */}
      <button onClick={() => handleDeleteClick(1)}>
        Eliminar Jugador
      </button>

      <ConfirmDialog
        isOpen={showConfirm}
        type="danger"
        title="Eliminar Jugador"
        message="¿Estás seguro de que deseas eliminar este jugador? Todos sus datos se perderán permanentemente."
        confirmText="Sí, eliminar"
        cancelText="No, conservar"
        onConfirm={confirmarEliminacion}
        onCancel={() => {
          setShowConfirm(false);
          setJugadorAEliminar(null);
        }}
      />
    </div>
  );
}
```

## Características

- ✨ Diseño moderno y atractivo
- 🎨 Colores consistentes con la aplicación
- 📱 Totalmente responsive
- ♿ Accesible
- 🎭 Animaciones suaves
- 🎯 Tres tipos visuales (danger, warning, info)
- 🔒 Previene clics accidentales con overlay
- ⚡ Fácil de usar y personalizar

## Notas

- El diálogo se cierra automáticamente después de confirmar
- El overlay oscuro permite cerrar el diálogo haciendo clic fuera de él
- Los íconos cambian según el tipo de diálogo
- El z-index está configurado en 10000 para aparecer sobre otros modales
