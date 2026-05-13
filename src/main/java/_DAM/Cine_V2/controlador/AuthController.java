package _DAM.Cine_V2.controlador;

import _DAM.Cine_V2.dto.login.LoginRequestDTO;
import _DAM.Cine_V2.dto.login.LoginResponseDTO;
import _DAM.Cine_V2.dto.login.RegisterRequestDTO;
import _DAM.Cine_V2.dto.login.RegisterResponseDTO;
import _DAM.Cine_V2.dto.login.RefreshRequestDTO;
import _DAM.Cine_V2.modelo.RefreshToken;
import _DAM.Cine_V2.servicio.RefreshTokenService;
import _DAM.Cine_V2.config.JwtUtil;
import _DAM.Cine_V2.servicio.UsuarioService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@AllArgsConstructor
public class AuthController {

    private final UsuarioService usuarioService;
    private final RefreshTokenService refreshTokenService;
    private final JwtUtil jwtUtil;

    /*
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO loginRequest) {
        return ResponseEntity.ok(usuarioService.login(loginRequest));
    }*/
    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDTO> register(
            @RequestBody RegisterRequestDTO req
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(usuarioService.register(req));
    }
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @RequestBody LoginRequestDTO req
    ) {
        return ResponseEntity.ok(usuarioService.login(req));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponseDTO> refreshtoken(@RequestBody RefreshRequestDTO request) {
        String requestRefreshToken = request.refreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUsuario)
                .map(usuario -> {
                    String token = jwtUtil.generateToken(usuario);
                    return ResponseEntity.ok(new LoginResponseDTO(usuario.getEmail(), "Token refrescado con éxito", token, requestRefreshToken));
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }
}