package _DAM.Cine_V2.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Necesario para APIs REST (Stateless)
                .authorizeHttpRequests(auth -> auth
                        // 🔓 PERMITIR ACCESO PÚBLICO A /auth/** (Registro y Login)
                        .requestMatchers("/api/*/auth/**").permitAll()
                        // 🔒 TODO LO DEMÁS: Requiere autenticación
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}