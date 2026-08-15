package com.furb.tcc.services;

import com.furb.tcc.dtos.requests.MedicacaoRequest;
import com.furb.tcc.entities.Idoso;
import com.furb.tcc.entities.Medicacao;
import com.furb.tcc.entities.RegistroMedicacao;
import com.furb.tcc.entities.Usuario;
import com.furb.tcc.repositories.IdosoRepository;
import com.furb.tcc.repositories.MedicacaoRepository;
import com.furb.tcc.repositories.RegistroMedicacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicacaoService {

    private final MedicacaoRepository medicacaoRepository;
    private final RegistroMedicacaoRepository registroRepository;
    private final IdosoRepository idosoRepository;

    public void cadastrar(MedicacaoRequest request, Usuario cadastradoPor) {
        Idoso idoso = idosoRepository.findById(request.getIdosoId())
                .orElseThrow(() -> new RuntimeException("Idoso não encontrado"));

        Medicacao medicacao = Medicacao.builder()
                .idoso(idoso)
                .nome(request.getNome())
                .dosagem(request.getDosagem())
                .horarios(request.getHorarios())
                .cadastradoPor(cadastradoPor)
                .build();

        medicacaoRepository.save(medicacao);
    }

    public List<Medicacao> listarPorIdoso(Long idosoId) {
        return medicacaoRepository.findByIdosoId(idosoId);
    }

    public void registrarAdesao(Long medicacaoId, Boolean tomou) {
        Medicacao medicacao = medicacaoRepository.findById(medicacaoId)
                .orElseThrow(() -> new RuntimeException("Medicação não encontrada"));

        RegistroMedicacao registro = RegistroMedicacao.builder()
                .medicacao(medicacao)
                .dataHora(LocalDateTime.now())
                .tomou(tomou)
                .build();

        registroRepository.save(registro);
    }

    public List<RegistroMedicacao> buscarHistoricoAdesao(Long idosoId, LocalDateTime inicio, LocalDateTime fim) {
        return registroRepository.findByMedicacaoIdosoIdAndDataHoraBetween(idosoId, inicio, fim);
    }
}