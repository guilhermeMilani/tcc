package com.furb.tcc.services;

import com.furb.tcc.dtos.requests.MedicacaoRequest;
import com.furb.tcc.dtos.responses.MedicacaoHojeResponse;
import com.furb.tcc.entities.Idoso;
import com.furb.tcc.entities.Medicacao;
import com.furb.tcc.entities.RegistroMedicacao;
import com.furb.tcc.entities.Usuario;
import com.furb.tcc.repositories.IdosoRepository;
import com.furb.tcc.repositories.MedicacaoRepository;
import com.furb.tcc.repositories.RegistroMedicacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
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

    public List<MedicacaoHojeResponse> buscarMedicacoesHoje(Long idosoId) {
        List<Medicacao> medicacoes = medicacaoRepository.findByIdosoId(idosoId);
        LocalTime agora = LocalTime.now();
        LocalDateTime inicioDia = LocalDate.now().atStartOfDay();
        LocalDateTime fimDia = LocalDate.now().atTime(23, 59, 59);

        List<MedicacaoHojeResponse> resultado = new ArrayList<>();

        for (Medicacao med : medicacoes) {
            if (med.getHorarios() == null) continue;

            for (LocalTime horario : med.getHorarios()) {
                // Busca registro de adesão para esse horário hoje
                List<RegistroMedicacao> registros = registroRepository
                        .findByMedicacaoIdosoIdAndDataHoraBetween(idosoId, inicioDia, fimDia)
                        .stream()
                        .filter(r -> r.getMedicacao().getId().equals(med.getId()))
                        .filter(r -> {
                            LocalTime horaRegistro = r.getDataHora().toLocalTime();
                            return horaRegistro.isAfter(horario.minusHours(1)) &&
                                    horaRegistro.isBefore(horario.plusHours(1));
                        })
                        .toList();

                Boolean tomou = registros.isEmpty() ? null : registros.get(0).getTomou();
                Long registroId = registros.isEmpty() ? null : registros.get(0).getId();

                // Define o status baseado no horário atual
                String status;
                if (agora.isAfter(horario.minusHours(1)) && agora.isBefore(horario.plusHours(1))) {
                    status = "AGORA";
                } else if (horario.isAfter(agora)) {
                    status = "PROXIMA";
                } else {
                    status = "ANTERIOR";
                }

                resultado.add(MedicacaoHojeResponse.builder()
                        .id(med.getId())
                        .nome(med.getNome())
                        .dosagem(med.getDosagem())
                        .horario(horario)
                        .status(status)
                        .tomou(tomou)
                        .registroId(registroId)
                        .build());
            }
        }

        // Ordena por horário
        resultado.sort(Comparator.comparing(MedicacaoHojeResponse::getHorario));
        return resultado;
    }

    public void deletar(Long medicacaoId) {
        Medicacao medicacao = medicacaoRepository.findById(medicacaoId)
                .orElseThrow(() -> new RuntimeException("Medicação não encontrada"));
        registroRepository.deleteByMedicacaoId(medicacao.getId());
        medicacaoRepository.delete(medicacao);
    }

    public void atualizar(Long medicacaoId, MedicacaoRequest request, Usuario usuario) {
        Medicacao medicacao = medicacaoRepository.findById(medicacaoId)
                .orElseThrow(() -> new RuntimeException("Medicação não encontrada"));

        medicacao.setNome(request.getNome());
        medicacao.setDosagem(request.getDosagem());
        medicacao.setHorarios(request.getHorarios());
        medicacao.setCadastradoPor(usuario);
        medicacaoRepository.save(medicacao);
    }
}