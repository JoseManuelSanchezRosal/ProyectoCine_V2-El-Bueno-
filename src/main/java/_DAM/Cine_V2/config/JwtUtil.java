package _DAM.Cine_V2.config;

// 1. IMPORTANTE: Usar el @Value de Spring, no el de Lombok
import _DAM.Cine_V2.modelo.Rol;
import _DAM.Cine_V2.modelo.Usuario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

// 2. Imports de JJWT y Criptografía
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;

// 3. Imports de Java
import jakarta.annotation.PostConstruct; // Usa javax.annotation.PostConstruct si estás en Spring Boot 2.x
import java.util.Date;

// 4. Tus modelos (Ajusta la ruta exacta según cómo tengas estructurado tu proyecto)
// import _DAM.Cine_V2.models.Usuario;
// import _DAM.Cine_V2.models.Rol;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expirationTime;

    private SecretKey key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(Usuario usuario) {
        return Jwts.builder()
                .setSubject(usuario.getEmail())
                .claim("roles",
                        usuario.getRoles()
                                .stream()
                                .map(Rol::getNombre) // Asegúrate de que tu clase Rol tiene el método getNombre()
                                .toList()
                )
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(key)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}