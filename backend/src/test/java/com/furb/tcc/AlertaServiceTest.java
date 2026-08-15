package com.furb.tcc;

import com.furb.tcc.entities.Cuidador;
import com.furb.tcc.entities.Idoso;
import com.furb.tcc.entities.SinalVital;
import com.furb.tcc.entities.TipoAlerta;
import com.furb.tcc.repositories.AlertaRepository;
import com.furb.tcc.repositories.CuidadorRepository;
import com.furb.tcc.services.AlertaService;
import com.furb.tcc.services.NotificacaoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.Mockito.*;


import java.util.List;

@ExtendWith(MockitoExtension.class)
class AlertaServiceTest {

    @InjectMocks
    private AlertaService alertaService;

    @Mock
    private AlertaRepository alertaRepository;

    @Mock
    private CuidadorRepository cuidadorRepository;

    @Mock
    private NotificacaoService notificacaoService;

    private Idoso idoso;

    @BeforeEach
    void setUp() {
        idoso = Idoso.builder()
                .id(1L)
                .nome("João")
                .email("joao@email.com")
                .limiteFreqMin(50)
                .limiteFreqMax(100)
                .limiteSpO2Min(94)
                .limiteTempMax(37.8)
                .build();
    }

    @Test
    void deveGerarAlertaFrequenciaAlta() {
        SinalVital sinal = SinalVital.builder()
                .idosoId("1")
                .frequenciaCardiaca(160)
                .spO2(97.0)
                .temperatura(36.5)
                .build();

        when(cuidadorRepository.findByIdososId(1L)).thenReturn(List.of());

        alertaService.verificarAnomalias(idoso, sinal);

        verify(alertaRepository, times(1)).save(argThat(alerta ->
                alerta.getTipo() == TipoAlerta.FREQUENCIA_ALTA &&
                        alerta.getIdoso().getId().equals(1L) &&
                        !alerta.getLido()
        ));
    }

    @Test
    void deveGerarAlertaFrequenciaBaixa() {
        SinalVital sinal = SinalVital.builder()
                .idosoId("1")
                .frequenciaCardiaca(40)
                .spO2(97.0)
                .temperatura(36.5)
                .build();

        when(cuidadorRepository.findByIdososId(1L)).thenReturn(List.of());

        alertaService.verificarAnomalias(idoso, sinal);

        verify(alertaRepository, times(1)).save(argThat(alerta ->
                alerta.getTipo() == TipoAlerta.FREQUENCIA_BAIXA
        ));
    }

    @Test
    void deveGerarAlertaSpO2Baixo() {
        SinalVital sinal = SinalVital.builder()
                .idosoId("1")
                .frequenciaCardiaca(75)
                .spO2(88.0)
                .temperatura(36.5)
                .build();

        when(cuidadorRepository.findByIdososId(1L)).thenReturn(List.of());

        alertaService.verificarAnomalias(idoso, sinal);

        verify(alertaRepository, times(1)).save(argThat(alerta ->
                alerta.getTipo() == TipoAlerta.SPO2_BAIXO
        ));
    }

    @Test
    void deveGerarAlertaTemperaturaAlta() {
        SinalVital sinal = SinalVital.builder()
                .idosoId("1")
                .frequenciaCardiaca(75)
                .spO2(97.0)
                .temperatura(38.5)
                .build();

        when(cuidadorRepository.findByIdososId(1L)).thenReturn(List.of());

        alertaService.verificarAnomalias(idoso, sinal);

        verify(alertaRepository, times(1)).save(argThat(alerta ->
                alerta.getTipo() == TipoAlerta.TEMPERATURA_ALTA
        ));
    }

    @Test
    void naoDeveGerarAlertaComValoresNormais() {
        SinalVital sinal = SinalVital.builder()
                .idosoId("1")
                .frequenciaCardiaca(75)
                .spO2(97.0)
                .temperatura(36.5)
                .build();

        alertaService.verificarAnomalias(idoso, sinal);

        verify(alertaRepository, never()).save(any());
        verify(notificacaoService, never()).enviar(any(), any(), any());
    }

    @Test
    void deveNotificarTodosCuidadoresVinculados() {
        SinalVital sinal = SinalVital.builder()
                .idosoId("1")
                .frequenciaCardiaca(160)
                .spO2(97.0)
                .temperatura(36.5)
                .build();

        Cuidador c1 = Cuidador.builder().id(1L).tokenNotificacao("token1").build();
        Cuidador c2 = Cuidador.builder().id(2L).tokenNotificacao("token2").build();

        when(cuidadorRepository.findByIdososId(1L)).thenReturn(List.of(c1, c2));

        alertaService.verificarAnomalias(idoso, sinal);

        verify(notificacaoService, times(1)).enviar(eq("token1"), eq(TipoAlerta.FREQUENCIA_ALTA), any());
        verify(notificacaoService, times(1)).enviar(eq("token2"), eq(TipoAlerta.FREQUENCIA_ALTA), any());
    }

    @Test
    void deveGerarAlertaPanico() {
        when(cuidadorRepository.findByIdososId(1L)).thenReturn(List.of());

        alertaService.acionarPanico(idoso);

        verify(alertaRepository, times(1)).save(argThat(alerta ->
                alerta.getTipo() == TipoAlerta.PANICO
        ));
    }
}
