package _DAM.Cine_V2.controlador;

import _DAM.Cine_V2.dto.venta.VentaInputDTO;
import _DAM.Cine_V2.dto.venta.VentaOutputDTO;
import _DAM.Cine_V2.servicio.VentaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final VentaService ventaService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<VentaOutputDTO>> findAll() {
        return ResponseEntity.ok(ventaService.findAll());
    }

    // ADMIN puede ver cualquier venta; el propietario solo la suya (comparando por ID numérico)
    @PreAuthorize("hasRole('ADMIN') or @ventaService.esDelUsuario(#id, authentication.principal.username)")
    @GetMapping("/{id}")
    public ResponseEntity<VentaOutputDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ventaService.findById(id));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public ResponseEntity<VentaOutputDTO> create(@Valid @RequestBody VentaInputDTO ventaDTO) {
        return new ResponseEntity<>(ventaService.save(ventaDTO), HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<VentaOutputDTO> update(@PathVariable Long id, @Valid @RequestBody VentaInputDTO ventaDTO) {
        return ResponseEntity.ok(ventaService.update(id, ventaDTO));
    }

    // ADMIN puede borrar cualquier venta; el propietario solo la suya
    @PreAuthorize("hasRole('ADMIN') or @ventaService.esDelUsuario(#id, authentication.principal.username)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ventaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
