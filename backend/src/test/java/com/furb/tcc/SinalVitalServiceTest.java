package com.furb.tcc;

import com.furb.tcc.dtos.requests.SinalVitalRequest;
import com.furb.tcc.entities.Idoso;
import com.furb.tcc.entities.SinalVital;
import com.furb.tcc.repositories.IdosoRepository;
import com.furb.tcc.repositories.SinalVitalRepository;
import com.furb.tcc.services.AlertaService;
import com.furb.tcc.services.SinalVitalService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class SinalVitalServiceTest {

    @InjectMocks
    private SinalVitalService sinalVitalService;

    @Mock
    private SinalVitalRepository sinalVitalRepository;

    @Mock
    private IdosoRepository idosoRepository;

    @Mock
    private AlertaService alertaService;

    @Test
    void deveRegistrarSinalVitalEVerificarAnomalias() {
        Idoso idoso = Idoso.builder().id(1L).build();
        SinalVitalRequest request = new SinalVitalRequest(1L, 75, 97.0, 36.5);

        when(idosoRepository.findById(1L)).thenReturn(Optional.of(idoso));

        sinalVitalService.registrar(request);

        verify(sinalVitalRepository, times(1)).salvar(any(SinalVital.class));
        verify(alertaService, times(1)).verificarAnomalias(eq(idoso), any(SinalVital.class));
    }

    @Test
    void deveLancarExcecaoQuandoIdosoNaoEncontrado() {
        SinalVitalRequest request = new SinalVitalRequest(99L, 75, 97.0, 36.5);

        when(idosoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> sinalVitalService.registrar(request));
        verify(sinalVitalRepository, never()).salvar(any());
    }

    @Test
    void deveBuscarHistoricoComRangePadrao() {
        when(sinalVitalRepository.buscarPorIdoso("1", "24h")).thenReturn(List.of());

        List<SinalVital> resultado = sinalVitalService.buscarHistorico(1L, "24h");

        verify(sinalVitalRepository, times(1)).buscarPorIdoso("1", "24h");
        assertNotNull(resultado);
    }
}