package _DAM.Cine_V2.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;



@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Se añade para poder comprobar en cada petición si está autorizado
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtFilter;


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(c -> c.disable()) // API Rest pura, no cookies
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // No guardar estado
                .authorizeHttpRequests(auth -> auth
                        // DEBEMOS DE AÑADIR LOS ASTERISCOS FINALES
                        .requestMatchers("/api/*/auth/**").permitAll() // Login público -
                        .anyRequest().authenticated()            // Todo lo demás cerrado
                )
                // 3. AQUÍ LO REGISTRAMOS ⬇️
                // Ponemos nuestro filtro ANTES del filtro de login clásico (el ancla)
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
        // Preguntas: que hace la clase jwtutil
        //
    }
}