# ServiceDesk Pro Frontend

Interfaz web moderna para gestión de tickets de soporte técnico, construida con **Next.js 14**, **React 18**, **Redux Toolkit**, y **TailwindCSS 4**.
Inspirada en plataformas como **Linear** y **Zendesk**, ofrece una experiencia rápida, minimalista y centrada en la productividad.

## 🚀 Características

* **Autenticación JWT** integrada con el backend
* **Gestión de tickets**: creación, visualización, actualización y comentarios
* **Filtros y Tabs dinámicos** (open/closed/all)
* **Dashboard** con métricas básicas de usuario
* **Interfaz inspirada en Linear/Zendesk**: limpia, rápida y accesible
* **Validaciones con Zod** en formularios
* **Arquitectura modular** con hooks y slices de Redux
* **Diseño responsive** y accesible

## 🛠️ Stack Tecnológico

* **Framework**: Next.js 14 + React 18
* **Estado global**: Redux Toolkit
* **Estilos**: TailwindCSS 4 + shadcn/ui
* **Validación**: Zod + React Hook Form
* **Icons**: Lucide React
* **Notificaciones**: Sonner
* **Charts**: Chart.js (para dashboard)

## 📦 Instalación

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd servicedesk-pro-frontend
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env
# Editar con la URL de tu backend y configuraciones
```

Ejemplo:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

4. **Iniciar aplicación**

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm run start
```

## 🗃️ Estructura del Proyecto

```
src/
├── app/                 # Rutas y páginas Next.js
│   ├── login/           # Página de login
│   ├── register/        # Registro de usuarios
│   ├── my-tickets/      # Tickets del usuario
│   └── dashboard/       # Dashboard de métricas
├── components/          # Componentes UI reutilizables
│   ├── layout/          # PageContainer, PageHeader
│   ├── tickets/         # TicketList, TicketCard
│   └── ui/              # Botones, Tabs, Inputs, etc.
├── lib/
│   ├── api/             # Servicios y tipos de la API
│   ├── hooks/           # Custom hooks (useAuth, useTickets)
│   ├── store/           # Redux Toolkit slices
│   └── validations/     # Schemas con Zod
```

## 👥 Roles del Sistema

* **Requester**: Crea y visualiza sus tickets
* **Agent**: Gestiona tickets asignados
* **Manager**: Acceso completo + dashboard

## 🎯 Páginas Principales

* `/login` - Inicio de sesión
* `/register` - Registro de nuevos usuarios
* `/my-tickets` - Listado de tickets propios
* `/tickets/new` - Crear ticket
* `/dashboard` - Métricas del sistema (Manager)

## 🖼️ Screenshots

### Login

![Login](docs/screenshots/login.png)

### Tickets

![My Tickets](docs/screenshots/my-tickets.png)

### Crear Ticket

![New Ticket](docs/screenshots/new-ticket.png)

### Dashboard

![Dashboard](docs/screenshots/dashboard.png)

## 🧪 Testing

```bash
npm run test
npm run lint
```

## 🚀 Despliegue

1. Configurar variables de entorno en el servidor
2. Ejecutar build: `npm run build`
3. Iniciar: `npm run start`

## 📄 Documentación Adicional

* [UI-STYLE.md](./UI-STYLE.md) – Justificación de diseño
* [AI-USAGE.md](./AI-USAGE.md) – Uso de IA en el desarrollo

## 📝 Licencia

MIT License
