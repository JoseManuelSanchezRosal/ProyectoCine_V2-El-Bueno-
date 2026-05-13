package _DAM.Cine_V2.dto.venta;

import _DAM.Cine_V2.dto.entrada.EntradaInputDTO;
import jakarta.validation.constraints.NotBlank;
import java.util.Set;

public record VentaInputDTO(
        Long usuarioId,         // Ignorado: el backend lo extrae del JWT
        @NotBlank(message = "El método de pago es obligatorio") String metodoPago,
        Set<EntradaInputDTO> entradas) {
}
