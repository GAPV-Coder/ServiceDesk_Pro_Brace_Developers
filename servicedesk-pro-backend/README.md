<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Descripción

# ServiceDesk Pro Backend

Una plataforma interna para gestión de tickets de soporte técnico construida con NestJS, TypeScript y PostgreSQL.

## 🚀 Características

- **Autenticación JWT** sin Passport
- **Autorización basada en roles** (Requester, Agent, Manager)
- **Gestión completa de tickets** con SLA
- **Categorías personalizables** con campos dinámicos
- **Auditoría completa** de acciones
- **Dashboard con métricas** en tiempo real
- **API REST** bien documentada
- **Validaciones con Zod**
- **Arquitectura limpia** siguiendo principios SOLID

## 🛠️ Stack Tecnológico

- **Backend**: NestJS + TypeScript
- **Base de datos**: PostgreSQL + TypeORM
- **Autenticación**: JWT (sin Passport)
- **Validación**: Zod
- **Arquitectura**: Clean Architecture + SRP

## 📦 Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd servicedesk-pro-backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Configurar PostgreSQL**
```bash
# Crear base de datos
createdb servicedesk_pro
```

5. **Ejecutar migraciones** (si existen)
```bash
npm run migration:run
```

6. **Poblar base de datos**
```bash
npm run seed
```

7. **Iniciar aplicación**
```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 🗃️ Estructura del Proyecto

```
src/
├── common/           # Guards, filters, interceptors globales
├── config/           # Configuraciones (DB, JWT, App)
├── modules/          # Módulos de la aplicación
│   ├── auth/         # Autenticación y autorización
│   ├── users/        # Gestión de usuarios
│   ├── categories/   # Categorías de tickets
│   ├── tickets/      # Gestión de tickets
│   ├── audit/        # Auditoría del sistema
│   └── dashboard/    # Métricas y dashboard
├── shared/           # Servicios y utilidades compartidas
└── database/         # Seeds y migraciones
```

## 🔐 Autenticación

La API utiliza JWT para autenticación. Incluye el token en el header:

```
Authorization: Bearer <token>
```

## 👥 Roles del Sistema

- **Requester**: Crear y ver sus propios tickets
- **Agent**: Gestionar tickets asignados
- **Manager**: Acceso completo + dashboard y configuración

## 🎯 Endpoints Principales

### Autenticación
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/register` - Registrarse
- `GET /api/v1/auth/me` - Perfil actual

### Usuarios
- `GET /api/v1/users` - Listar usuarios (Manager)
- `POST /api/v1/users` - Crear usuario (Manager)
- `PUT /api/v1/users/:id` - Actualizar usuario

### Categorías
- `GET /api/v1/categories` - Listar categorías
- `POST /api/v1/categories` - Crear categoría (Manager)
- `PUT /api/v1/categories/:id` - Actualizar categoría

### Tickets
- `GET /api/v1/tickets` - Listar tickets
- `POST /api/v1/tickets` - Crear ticket
- `PUT /api/v1/tickets/:id` - Actualizar ticket
- `POST /api/v1/tickets/:id/comments` - Agregar comentario

## 🏗️ Arquitectura

El proyecto sigue **Clean Architecture** y el principio de **Responsabilidad Única (SRP)**:

- **Controladores**: Manejan HTTP requests/responses
- **Servicios**: Lógica de negocio
- **Repositorios**: Acceso a datos (TypeORM)
- **Entidades**: Modelos de dominio
- **DTOs**: Validación y transferencia de datos
- **Guards**: Autenticación y autorización
- **Interceptores**: Cross-cutting concerns (auditoría)

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests con coverage
npm run test:cov

# Tests e2e
npm run test:e2e
```

## 🚀 Despliegue

1. **Variables de entorno de producción**
2. **Build del proyecto**: `npm run build`
3. **Ejecutar migraciones**: `npm run migration:run`
4. **Iniciar**: `npm run start:prod`

## 📝 Licencia

MIT License