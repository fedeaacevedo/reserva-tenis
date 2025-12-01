# ReservaTenis

Sistema completo (API FastAPI + Frontend React) para gestionar turnos de 4 canchas de tenis, incluyendo cierres/bloqueos de horarios completos cuando hay clases o mantenimiento.

## Backend (FastAPI)

1. **Crear entorno**  
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate    # En Windows usar .venv\Scripts\activate
   pip install -r requirements.txt
   ```
2. **Configurar variables**  
   ```bash
   cp .env.example .env
   # ajustar SQLALCHEMY_DATABASE_URI si no querés usar sqlite local
   ```
3. **Inicializar datos** (crea 4 canchas, horarios 8-23hs todos los días y un usuario admin)  
   ```bash
   python -m app.cli.bootstrap
   ```
4. **Levantar API**  
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   La documentación interactiva queda en http://localhost:8000/docs

Credenciales por defecto del administrador creado por el bootstrap:

| Email                    | Contraseña |
| ------------------------ | ---------- |
| `admin@reservatenis.com` | `admin123` |


## Frontend (React + Vite)

1. ```bash
   cd frontend
   cp .env.example .env   # apunta al backend local (http://localhost:8000/api/v1)
   npm install
   npm run dev -- --host
   ```
2. Accedé a http://localhost:5173 e iniciá sesión con las credenciales anteriores.

El frontend consume la API real usando el token devuelto por `/api/v1/auth/login`. Si querés seguir usando los mocks locales podés iniciar sesión con `admin@admin / administrador`, lo cual guarda el `DEV_TOKEN` y mantiene el comportamiento previo basado en `localStorage`.


## Bloquear turnos completos

1. Iniciá sesión como administrador.
2. Navegá a **Administración → Cierres**.
3. Creá un cierre definiendo cancha (o “Todas”), fecha/hora de inicio y fin, y un motivo.  
   Cada cierre bloquea automáticamente las reservas/consultas de disponibilidad dentro del rango seleccionado, ideal para clases o eventos.

Las reservas disponibles por cancha pueden consultarse desde **Canchas → Disponibilidad**, y se suplementan con la lógica de cierres para evitar que se muestren turnos bloqueados.


## Resumen rápido

- `requirements.txt`: dependencias necesarias para el backend.
- `app/cli/bootstrap.py`: script que garantiza las 4 canchas, horarios base y usuario admin.
- `frontend/.env.example`: URL del backend para el cliente web.
- Para correr todo: levantar API con Uvicorn y frontend con `npm run dev`; luego iniciar sesión y administrar reservas/cierres desde la interfaz.

# reserva-tenis
