package _DAM.Cine_V2.controlador;

import _DAM.Cine_V2.dto.director.DirectorInputDTO;
import _DAM.Cine_V2.dto.director.DirectorOutputDTO;
import _DAM.Cine_V2.servicio.DirectorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/directores")
@RequiredArgsConstructor
public class DirectorController {

    private final DirectorService directorService;

    @GetMapping
    public ResponseEntity<List<DirectorOutputDTO>> findAll() {
        return ResponseEntity.ok(directorService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DirectorOutputDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(directorService.findById(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<DirectorOutputDTO> create(@Valid @RequestBody DirectorInputDTO directorDTO) {
        return new ResponseEntity<>(directorService.save(directorDTO), HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<DirectorOutputDTO> update(@PathVariable Long id,
            @Valid @RequestBody DirectorInputDTO directorDTO) {
        return ResponseEntity.ok(directorService.update(id, directorDTO));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        directorService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
