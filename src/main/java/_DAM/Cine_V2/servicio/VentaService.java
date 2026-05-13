package _DAM.Cine_V2.servicio;

import _DAM.Cine_V2.dto.entrada.EntradaInputDTO;
import _DAM.Cine_V2.dto.venta.VentaInputDTO;
import _DAM.Cine_V2.dto.venta.VentaOutputDTO;
import _DAM.Cine_V2.mapper.EntradaMapper;
import _DAM.Cine_V2.mapper.VentaMapper;
import _DAM.Cine_V2.modelo.*;
import _DAM.Cine_V2.repositorio.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VentaService {

    private final VentaRepository ventaRepository;
    private final UsuarioRepository usuarioRepository;
    private final FuncionRepository funcionRepository;
    // We don't necessarily need EntradaService if we implement logic here, but
    // using repository approach
    private final EntradaRepository entradaRepository;
    private final VentaMapper ventaMapper;
    private final EntradaMapper entradaMapper;

    public List<VentaOutputDTO> findAll() {
        return ventaRepository.findAll().stream()
                .map(ventaMapper::toDTO)
                .collect(Collectors.toList());
    }

    public VentaOutputDTO findById(Long id) {
        return ventaRepository.findById(id)
                .map(ventaMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada con ID: " + id));
    }

    public boolean esDelUsuario(Long ventaId, String email) {
        Venta venta = ventaRepository.findById(ventaId).orElse(null);
        return venta != null && venta.getUsuario() != null && venta.getUsuario().getEmail().equals(email);
    }

    @Transactional
    public VentaOutputDTO save(VentaInputDTO ventaDTO) {
        Venta venta = ventaMapper.toEntity(ventaDTO);

        // 1. Asignar el usuario autenticado como propietario de la venta
        String currentUserEmail = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado"));
        venta.setUsuario(usuario);

        // 2. Autogenerar fecha y estado inicial
        venta.setFecha(LocalDateTime.now());
        venta.setEstado("COMPLETADO");

        // 3. Procesar entradas y calcular importe total
        double total = 0.0;

        if (ventaDTO.entradas() != null) {
            Set<Entrada> entradasEntities = new HashSet<>();
            for (EntradaInputDTO eDTO : ventaDTO.entradas()) {
                // Validar que la entrada tiene función
                if (eDTO.funcionId() == null)
                    throw new RuntimeException("Entrada sin funcion ID");
                Funcion funcion = funcionRepository.findById(eDTO.funcionId())
                        .orElseThrow(() -> new RuntimeException("Funcion no encontrada " + eDTO.funcionId()));

                // Comprobar disponibilidad del asiento
                boolean occupied = entradaRepository.findByFuncionId(funcion.getId()).stream()
                        .anyMatch(e -> e.getFila() == eDTO.fila() && e.getAsiento() == eDTO.asiento()
                                && e.getEstado() != EstadoEntrada.CANCELADA);

                if (occupied) {
                    throw new RuntimeException("Asiento ocupado: " + eDTO.fila() + "-" + eDTO.asiento());
                }

                // 4. Acumular el precio de la función al total
                total += funcion.getPrecio();

                Entrada entrada = entradaMapper.toEntity(eDTO);
                entrada.setFuncion(funcion);
                entrada.setVenta(venta);
                if (entrada.getEstado() == null)
                    entrada.setEstado(EstadoEntrada.VENDIDA);

                // 5. Generar código único para la entrada
                entrada.setCodigo("TKT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

                entradasEntities.add(entrada);
            }
            venta.setEntradas(entradasEntities);
        }

        // 6. Asignar el importe total calculado
        venta.setImporteTotal(total);

        Venta saved = ventaRepository.save(venta);
        return ventaMapper.toDTO(saved);
    }

    @Transactional
    public VentaOutputDTO update(Long id, VentaInputDTO ventaDTO) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada con ID: " + id));

        ventaMapper.update(ventaDTO, venta);

        if (ventaDTO.usuarioId() != null) {
            Usuario usuario = usuarioRepository.findById(ventaDTO.usuarioId())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + ventaDTO.usuarioId()));
            venta.setUsuario(usuario);
        }

        // Note: We are NOT updating tickets (entradas) here to simplify.
        // Typical update for Venta might be status or user change.

        return ventaMapper.toDTO(ventaRepository.save(venta));
    }

    public void deleteById(Long id) {
        if (!ventaRepository.existsById(id)) {
            throw new RuntimeException("Venta no encontrada con ID: " + id);
        }
        ventaRepository.deleteById(id);
    }
}
