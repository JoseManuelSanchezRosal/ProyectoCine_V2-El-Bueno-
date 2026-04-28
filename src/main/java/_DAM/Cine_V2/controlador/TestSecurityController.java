package _DAM.Cine_V2.controlador;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/test") //TENEMOS QUE CAMBIAR LAS RUTAS PARA QUE ACEPTE PETICIÓN
public class TestSecurityController {

    @GetMapping("/publico")
    public String publico() { 
        return "Pasar, pasar, está abierto."; 
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')") // <--- Solo VIPs
    public String soloAdmin() {
        return "Hola, jefe. Aquí tiene los datos.";
    }
}