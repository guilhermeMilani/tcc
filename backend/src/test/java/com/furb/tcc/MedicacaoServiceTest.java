package com.furb.tcc;

import com.furb.tcc.dtos.requests.MedicacaoRequest;
import com.furb.tcc.entities.Cuidador;
import com.furb.tcc.entities.Idoso;
import com.furb.tcc.entities.Medicacao;
import com.furb.tcc.entities.Usuario;
import com.furb.tcc.repositories.IdosoRepository;
import com.furb.tcc.repositories.MedicacaoRepository;
import com.furb.tcc.repositories.RegistroMedicacaoRepository;
import com.furb.tcc.services.MedicacaoService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.Mockito.*;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class MedicacaoServiceTest {

    @InjectMocks
    private MedicacaoService medicacaoService;

    @Mock
    private MedicacaoRepository medicacaoRepository;

    @Mock
    private RegistroMedicacaoRepository registroRepository;

    @Mock
    private IdosoRepository idosoRepository;

    @Test
    void deveCadastrarMedicacao() {
        Idoso idoso = Idoso.builder().id(1L).build();
        Usuario cuidador = Cuidador.builder().id(1L).build();
        MedicacaoRequest request = new MedicacaoRequest(1L, "Losartana", "50mg", List.of(LocalTime.of(8, 0)));

        when(idosoRepository.findById(1L)).thenReturn(Optional.of(idoso));

        medicacaoService.cadastrar(request, cuidador);

        verify(medicacaoRepository, times(1)).save(argThat(m ->
                m.getNome().equals("Losartana") &&
                        m.getIdoso().getId().equals(1L) &&
                        m.getCadastradoPor().getId().equals(1L)
        ));
    }

    @Test
    void deveRegistrarAdesao() {
        Medicacao medicacao = Medicacao.builder().id(1L).build();

        when(medicacaoRepository.findById(1L)).thenReturn(Optional.of(medicacao));

        medicacaoService.registrarAdesao(1L, true);

        verify(registroRepository, times(1)).save(argThat(r ->
                r.getMedicacao().getId().equals(1L) &&
                        r.getTomou().equals(true)
        ));
    }
}
