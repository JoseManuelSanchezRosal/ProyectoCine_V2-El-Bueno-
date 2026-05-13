# Documentación del Proyecto: Cine V4

Este documento detalla la implementación de los requisitos exigidos en el enunciado del ejercicio, abarcando desde la configuración de seguridad en el backend con Spring Boot hasta la arquitectura de consumo de la API en el frontend con React y Axios.

---

## 1. Configuración Base de Seguridad y JWT
**Objetivo:** Preparar el proyecto para devolver un Token en el registro, configurar rutas públicas y establecer la sesión como STATELESS.

**¿Cómo se ha conseguido?**
- En el método de registro del `AuthService`, tras guardar el usuario en la base de datos, se invoca la misma lógica de generación de tokens utilizada en el login, devolviendo tanto el Access Token como el Refresh Token al registrarse.
- En `SecurityConfig.java`, se ha deshabilitado la protección CSRF (`csrf.disable()`) ya que al usar JWT no somos vulnerables a este tipo de ataques basados en cookies de sesión.
- Se ha configurado la gestión de sesiones como `SessionCreationPolicy.STATELESS`, asegurando que el servidor no guarde estado entre peticiones.
- Se han liberado las rutas públicas necesarias usando `.requestMatchers("/api/v1/auth/**", "/api/test/**", "/error").permitAll()`. Cualquier otra ruta (`anyRequest()`) requiere estar autenticado (`authenticated()`).

---

## 2. Configuración Ágil en Postman
**Objetivo:** Configurar Postman para usar el token automáticamente y organizar el workspace.

**¿Cómo se ha conseguido?**
- Se ha estructurado la colección `Cine_V4_Postman_Collection` mediante carpetas separadas por Entidades (Auth Públicas, Usuarios, Películas, Funciones, Salas, Entradas, Ventas).
- A nivel de Colección (raíz), en la pestaña **Authorization**, se configuró el tipo `Bearer Token` referenciando una variable de entorno `{{ACCESS_TOKEN}}`.
- En los endpoints de Login y Registro (`/auth/login` y `/auth/register`), se añadió un script en la pestaña **Tests** que captura automáticamente la respuesta JSON y guarda el token en la variable de entorno:
  ```javascript
  const response = pm.response.json();
  if (response.accessToken) {
      pm.environment.set("ACCESS_TOKEN", response.accessToken);
  }
  ```
- Gracias a esto, tras hacer login, todas las peticiones a endpoints protegidos inyectan automáticamente el token sin intervención manual.

---

## 3. Gestión de Roles y Permisos (RBAC)
**Objetivo:** Implementar un sistema de Control de Acceso Basado en Roles combinando `SecurityConfig` y la anotación `@PreAuthorize`.

**¿Cómo se ha conseguido?**
- **Acceso Público:** Se configuraron en `SecurityConfig` las peticiones `GET` a `/api/v1/peliculas` y `/api/v1/funciones` como `.permitAll()`, permitiendo a cualquier visitante consultar la cartelera.
- **Lógica Mixta con `@PreAuthorize`:** En los controladores (ej. `VentaController`), se protegieron los endpoints combinando validación de roles y de propiedad:
  - **Administrador (Gestión total):** Las operaciones CRUD (crear, modificar, borrar) sobre entidades core (Salas, Películas, Funciones) se limitaron con `@PreAuthorize("hasRole('ADMIN')")`. El admin también puede listar `GET /ventas`.
  - **Usuario (Operaciones propias):** Para ver o borrar ventas, se implementó `@PreAuthorize("hasRole('ADMIN') or @ventaService.esDelUsuario(#id, authentication.principal.username)")`. Esto garantiza que un usuario solo pueda consultar o anular su ticket, mientras que el admin mantiene control global.

---

## 4. Manejo de Errores (JSON en lugar de HTML)
**Objetivo:** Evitar las páginas de error HTML de Spring y devolver JSON limpio con códigos 401/403.

**¿Cómo se ha conseguido?**
- En la configuración de seguridad (`SecurityConfig.java`), se inyectó un `AuthenticationEntryPoint` personalizado (`JwtAuthenticationEntryPoint`).
- Este componente captura cualquier excepción de acceso denegado (como falta de token o permisos insuficientes) y formatea la respuesta directamente manipulando el `HttpServletResponse`, configurando el Content-Type como `application/json` y devolviendo el código de estado correspondiente (401 Unauthorized o 403 Forbidden) junto con un mensaje JSON entendible por el frontend.

---

## 5. Arquitectura de Tokens (Refresh Token) y Frontend SPA
**Objetivo:** Persistencia de sesión, Doble Token y arquitectura de interceptores en Axios.

**¿Cómo se ha conseguido en el Backend?**
- **Doble Token:** `AuthService` ahora emite dos JWTs: un Access Token (ej. 15 minutos de vida) y un Refresh Token (ej. 7 días).
- **Persistencia:** Se creó la entidad `RefreshToken` (con su repositorio) vinculada con relación OneToOne al `Usuario`. El Refresh Token generado se guarda en la base de datos de manera segura.
- **Endpoint de Renovación:** Se expuso `POST /api/v1/auth/refresh`. Al recibir un token, verifica en la BD que existe, no está expirado y pertenece al usuario. Si es válido, emite un nuevo Access Token.

**¿Cómo se ha conseguido en el Frontend (React)?**
- En el archivo `src/api/axiosConfig.js`, se configuró un **Request Interceptor** que inyecta automáticamente el Access Token del `localStorage` a las cabeceras `Authorization: Bearer <token>`.
- Se programó un avanzado **Response Interceptor**. Si la API devuelve un `401 Unauthorized` por expiración, el interceptor pausa la petición original, hace un fetch silencioso al endpoint de renovación, guarda el nuevo token, y reintenta la petición original. Todo este proceso ocurre sin interrumpir la experiencia del usuario ni forzar un re-login, recuperando el estado intacto.
NOTA: Se adjunta vídeoDemo corrompiendo el JWT y mediante Network apreciar como AxiosConfig hace su trabajo

---

## 6. Auditoría de Datos con JPA Auditing
**Objetivo:** Registro automático del usuario creador y de la marca de tiempo de creación en entidades de negocio.

**¿Cómo se ha conseguido?**
- Se activó la auditoría global añadiendo la anotación `@EnableJpaAuditing` en la clase principal o configuración de Spring.
- Se implementó un componente `AuditorAwareImpl` (implementando `AuditorAware<String>`) que accede al `SecurityContextHolder` para recuperar el nombre o ID del usuario autenticado actual.
- En las entidades clave (como `Venta` o `Entrada`), se utilizaron las anotaciones:
  - `@CreatedDate`: Para que Hibernate asigne automáticamente un `LocalDateTime.now()` en el instante exacto de la persistencia en base de datos.
  - `@CreatedBy`: Para inyectar el nombre del usuario recuperado del contexto de seguridad.
- Gracias a esto, no es necesario hacer un `.setFecha(...)` manual en los servicios; Spring Data lo inyecta a nivel de framework.

---

&copy; Todos los derechos reservados
**José Manuel Sánchez Rosal**
