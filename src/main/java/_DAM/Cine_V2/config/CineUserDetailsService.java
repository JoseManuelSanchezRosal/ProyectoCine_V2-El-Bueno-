package _DAM.Cine_V2.config;

import _DAM.Cine_V2.modelo.Rol;
import _DAM.Cine_V2.modelo.Usuario;
import _DAM.Cine_V2.repositorio.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CineUserDetailsService implements UserDetailsService {

    private final UsuarioRepository repo;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        
        // 1. Buscamos el usuario en NUESTRA base de datos
        Usuario u = repo.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));

        // 2. LO TRADUCIMOS al formato que Spring Security entiende
        // User es una implementación de UserDetails que nos regala Spring
        return User.builder()
                .username(u.getEmail())
                .password(u.getPassword())
                // Stream directo en una línea:
                // AL TENER UN ARRAY DE ROLES, TENEMOS QUE RECORRERLO PARA OBTENER EL ROL
                .roles(u.getRoles().stream().map(Rol::getNombre).toArray(String[]::new))
                .build();
    }
}