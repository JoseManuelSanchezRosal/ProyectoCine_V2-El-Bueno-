package _DAM.Cine_V2.util;

import _DAM.Cine_V2.modelo.*;
import _DAM.Cine_V2.repositorio.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

        private final RolRepository rolRepository;
        private final UsuarioRepository usuarioRepository;
        private final DirectorRepository directorRepository;
        private final ActorRepository actorRepository;
        private final PeliculaRepository peliculaRepository;
        private final SalaRepository salaRepository;
        private final FuncionRepository funcionRepository;
        private final PasswordEncoder passwordEncoder;

        @Override
        public void run(String... args) throws Exception {
                // Si ya hay roles, asumimos que la BBDD está inicializada y no hacemos nada
                if (rolRepository.count() > 0) {
                        System.out.println("⏩ Base de datos ya inicializada. Omitiendo DataLoader...");
                        return;
                }

                System.out.println("⚙️ Generando ecosistema del cine para pruebas...");

                // 1. Cargar Roles y Usuarios
                cargarUsuarios();

                // 2. Cargar Catálogo (Directores, Actores, Películas)
                cargarCatalogo();

                System.out.println("✅ ¡DataLoader finalizado con éxito! Cartelera lista.");
        }

        private void cargarUsuarios() {
                Rol roleAdmin = rolRepository.save(Rol.builder().nombre("ROLE_ADMIN").build());
                Rol roleUser = rolRepository.save(Rol.builder().nombre("ROLE_USER").build());

                Usuario admin = Usuario.builder()
                        .email("admin@cine.com")
                        .password(passwordEncoder.encode("admin"))
                        .enabled(true)
                        .roles(Set.of(roleAdmin))
                        .build();
                usuarioRepository.save(admin);

                // Usuario para tus pruebas (coincide con el PDF)
                Usuario user = Usuario.builder()
                        .email("jose@cine.com")
                        .password(passwordEncoder.encode("1234"))
                        .enabled(true)
                        .roles(Set.of(roleUser))
                        .build();
                usuarioRepository.save(user);
        }

        private void cargarCatalogo() {
                // --- DIRECTORES ---
                Director nolan = directorRepository.save(Director.builder().nombre("Christopher Nolan").build());
                Director tarantino = directorRepository.save(Director.builder().nombre("Quentin Tarantino").build());
                Director villeneuve = directorRepository.save(Director.builder().nombre("Denis Villeneuve").build());

                // --- ACTORES ---
                Actor leo = actorRepository.save(Actor.builder().nombre("Leonardo DiCaprio").build());
                Actor brad = actorRepository.save(Actor.builder().nombre("Brad Pitt").build());
                Actor zendaya = actorRepository.save(Actor.builder().nombre("Zendaya").build());
                Actor timothee = actorRepository.save(Actor.builder().nombre("Timothée Chalamet").build());

                // --- PELÍCULAS ---
                Pelicula inception = peliculaRepository.save(Pelicula.builder()
                        .titulo("Inception")
                        .duracion(148)
                        .edadMinima(13)
                        .director(nolan)
                        .actores(Set.of(leo))
                        .build());

                Pelicula dune = peliculaRepository.save(Pelicula.builder()
                        .titulo("Dune: Parte Dos")
                        .duracion(166)
                        .edadMinima(12)
                        .director(villeneuve)
                        .actores(Set.of(zendaya, timothee))
                        .build());

                Pelicula hollywood = peliculaRepository.save(Pelicula.builder()
                        .titulo("Érase una vez en Hollywood")
                        .duracion(161)
                        .edadMinima(16)
                        .director(tarantino)
                        .actores(Set.of(leo, brad))
                        .build());

                // --- SALAS ---
                Sala sala1 = salaRepository.save(Sala.builder().nombre("Sala 1 - Estándar").capacidad(100).build());
                Sala sala2 = salaRepository.save(Sala.builder().nombre("Sala 2 - Macro").capacidad(200).build());
                Sala salaVIP = salaRepository.save(Sala.builder().nombre("Sala VIP - Atmos").capacidad(40).build());

                // --- FUNCIONES (Sesiones) ---
                // Funciones para Inception
                funcionRepository.save(Funcion.builder().pelicula(inception).sala(sala1)
                        .fechaHora(LocalDateTime.now().plusDays(1).withHour(18).withMinute(0)).precio(8.50).build());
                funcionRepository.save(Funcion.builder().pelicula(inception).sala(salaVIP)
                        .fechaHora(LocalDateTime.now().plusDays(1).withHour(21).withMinute(30)).precio(12.00).build());

                // Funciones para Dune
                funcionRepository.save(Funcion.builder().pelicula(dune).sala(sala2)
                        .fechaHora(LocalDateTime.now().plusDays(1).withHour(19).withMinute(0)).precio(9.00).build());
                funcionRepository.save(Funcion.builder().pelicula(dune).sala(sala2)
                        .fechaHora(LocalDateTime.now().plusDays(2).withHour(22).withMinute(0)).precio(9.00).build());

                // Funciones para Hollywood
                funcionRepository.save(Funcion.builder().pelicula(hollywood).sala(sala1)
                        .fechaHora(LocalDateTime.now().plusDays(2).withHour(20).withMinute(0)).precio(8.50).build());
        }
}