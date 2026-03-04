package _DAM.Cine_V2.controlador;

import _DAM.Cine_V2.dto.login.LoginRequestDTO;
import _DAM.Cine_V2.dto.login.LoginResponseDTO;
import _DAM.Cine_V2.dto.login.RegisterRequestDTO;
import _DAM.Cine_V2.dto.login.RegisterResponseDTO;
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

    /*
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO loginRequest) {
        return ResponseEntity.ok(usuarioService.login(loginRequest));
    }*/
    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDTO> register(
            @RequestBody RegisterRequestDTO req
    ) {
        usuarioService.register(req);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new RegisterResponseDTO(req.email(), "Creado"));
    }
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @RequestBody LoginRequestDTO req
    ) {
        return ResponseEntity.ok(usuarioService.login(req));
    }
}