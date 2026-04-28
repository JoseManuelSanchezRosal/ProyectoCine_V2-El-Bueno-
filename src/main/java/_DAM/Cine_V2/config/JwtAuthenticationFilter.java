package _DAM.Cine_V2.config;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;          // 1. Fábrica de Tokens
    private final UserDetailsService userDetailsService; // 2. Traductor de Usuarios

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, 
                                    @NonNull HttpServletResponse response, 
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        
        // A. OBTENER EL HEADER
        String authHeader = request.getHeader("Authorization");

        // B. COMPROBAR SI VIENE EL TOKEN (¿Trae zapatillas?)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response); // Pasa, pero sin autenticar (invitado)
            return;
        }

        // C. EXTRAER EL TOKEN (Quitar la palabra "Bearer ")
        String token = authHeader.substring(7);

        // D. VALIDAR TOKEN Y USUARIO
        // 1. Validamos firma y expiración
        // 2. Comprobamos que no esté ya autenticado en el contexto actual
        if (jwtUtil.validateToken(token) && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            String username = jwtUtil.extractUsername(token);

            // E. CARGAR USUARIO DE LA BASE DE DATOS
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // F. CREAR OBJETO DE AUTENTICACIÓN (El DNI Oficial de Spring)
            // Este objeto es el que Spring "entiende" y guarda en la caja fuerte.
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
            );

            // G. GUARDAR EN EL CONTEXTO DE SEGURIDAD (Spring ya sabe quién eres)
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        // H. PASAR AL SIGUIENTE FILTRO (O al Controller)
        filterChain.doFilter(request, response);
    }
}