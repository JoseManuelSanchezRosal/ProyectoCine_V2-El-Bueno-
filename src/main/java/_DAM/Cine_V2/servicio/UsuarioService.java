package _DAM.Cine_V2.servicio;

import _DAM.Cine_V2.dto.login.LoginRequestDTO;
import _DAM.Cine_V2.dto.login.LoginResponseDTO;
import _DAM.Cine_V2.dto.login.RegisterRequestDTO;
import _DAM.Cine_V2.dto.usuario.UsuarioInputDTO;
import _DAM.Cine_V2.dto.usuario.UsuarioOutputDTO;
import _DAM.Cine_V2.mapper.UsuarioMapper;
import _DAM.Cine_V2.modelo.Rol;
import _DAM.Cine_V2.modelo.Usuario;
import _DAM.Cine_V2.repositorio.RolRepository;
import _DAM.Cine_V2.repositorio.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final UsuarioMapper usuarioMapper;
    private final PasswordEncoder encoder; // Inyectado

    public List<UsuarioOutputDTO> findAll() {
        return usuarioRepository.findAll().stream()
                .map(usuarioMapper::toDTO)
                .collect(Collectors.toList());
    }

    public UsuarioOutputDTO findById(Long id) {
        return usuarioRepository.findById(id)
                .map(usuarioMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrada con ID: " + id));
    }

    @Transactional
    public UsuarioOutputDTO save(UsuarioInputDTO usuarioDTO) {
        Usuario usuario = usuarioMapper.toEntity(usuarioDTO);

        // Handle Roles
        if (usuarioDTO.roles() != null && !usuarioDTO.roles().isEmpty()) {
            Set<Rol> roles = new HashSet<>();
            for (String rolNombre : usuarioDTO.roles()) {
                Rol rol = rolRepository.findByNombre(rolNombre)
                        .orElseThrow(() -> new RuntimeException("Rol no encontrado: " + rolNombre));
                roles.add(rol);
            }
            usuario.setRoles(roles);
        }

        // Handle password (basic for now)
        if (usuarioDTO.password() != null && !usuarioDTO.password().isBlank()) {
            usuario.setPassword(usuarioDTO.password()); // In real app, B.crypt here
        }

        Usuario saved = usuarioRepository.save(usuario);
        return usuarioMapper.toDTO(saved);
    }

    @Transactional
    public UsuarioOutputDTO update(Long id, UsuarioInputDTO usuarioDTO) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrada con ID: " + id));

        usuarioMapper.update(usuarioDTO, usuario);

        // Handle Roles
        if (usuarioDTO.roles() != null) {
            Set<Rol> roles = new HashSet<>();
            for (String rolNombre : usuarioDTO.roles()) {
                Rol rol = rolRepository.findByNombre(rolNombre)
                        .orElseThrow(() -> new RuntimeException("Rol no encontrado: " + rolNombre));
                roles.add(rol);
            }
            usuario.setRoles(roles);
        }

        if (usuarioDTO.password() != null && !usuarioDTO.password().isBlank()) {
            usuario.setPassword(usuarioDTO.password());
        }

        return usuarioMapper.toDTO(usuarioRepository.save(usuario));
    }

    public void deleteById(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RuntimeException("Usuario no encontrado con ID: " + id);
        }
        usuarioRepository.deleteById(id);
    }

    //LOGIN SIN BCRYPT
    /*public LoginResponseDTO login(LoginRequestDTO request) {
        // 1. Buscar por email
        Usuario usuario = usuarioRepository.findByEmail(request.email())
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        // 2. Comparar contraseña (ERROR GRAVE DE SEGURIDAD AQUÍ)
        if (!usuario.getPassword().equals(request.password())) {
            // throw new BadCredentialsException("Contraseña incorrecta");
            throw new RuntimeException("Contraseña incorrecta"); // Cambiaremos a BadCredentialsException con Spring Security
        }

        // 3. Devolver DTO (NO entidad)
        return new LoginResponseDTO(
                usuario.getEmail(),
                "Login exitoso (Inseguro)",
                null
        );
    }*/
    // 🔹 REGISTRO
    public void register(RegisterRequestDTO req) {
        Usuario u = new Usuario();
        u.setEmail(req.email());
        // 🔐 CIFRAR ANTES DE GUARDAR
        u.setPassword(encoder.encode(req.password()));
        Rol rolUser = rolRepository.findByNombre("USER")
                        .orElseThrow(( )-> new RuntimeException("Usuario no encontrado"));
        Set<Rol> roles = new HashSet<>();
        roles.add(rolUser);
        u.setRoles(roles);
        usuarioRepository.save(u);

    }
    // 🔹 LOGIN
    public LoginResponseDTO login(LoginRequestDTO req) {
        Usuario u = usuarioRepository.findByEmail(req.email())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado")); // OJO: Usar BadCredentialsException después

        // 🔐 COMPARAR (Raw vs Hash)
        if (!encoder.matches(req.password(), u.getPassword())) {
            throw new RuntimeException("Credenciales incorrectas");
        }

        return new LoginResponseDTO(u.getEmail(), "Login OK","");
    }
}
