package com.furb.tcc.services;

import com.furb.tcc.entities.Idoso;
import com.furb.tcc.entities.Medicacao;
import com.furb.tcc.repositories.IdosoRepository;
import com.furb.tcc.repositories.MedicacaoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LembreteMedicacaoService {

    private final MedicacaoRepository medicacaoRepository;
    private final IdosoRepository idosoRepository;
    private final NotificacaoService notificacaoService;

    @Scheduled(fixedRate = 60000) // a cada 1 minuto
    public void verificarLembretes() {
        List<Idoso> idosos = idosoRepository.findAll();

        for (Idoso idoso : idosos) {
            if (idoso.getTokenNotificacao() == null || idoso.getTokenNotificacao().isBlank()) continue;

            List<Medicacao> medicacoes = medicacaoRepository.findByIdosoId(idoso.getId());
            LocalTime agora = LocalTime.now();

            for (Medicacao med : medicacoes) {
                if (med.getHorarios() == null) continue;

                for (LocalTime horario : med.getHorarios()) {
                    long minutosAte = agora.until(horario, java.time.temporal.ChronoUnit.MINUTES);

                    if (minutosAte >= 4 && minutosAte <= 5) {
                        log.info("Enviando lembrete para idoso {} - medicação {} às {}",
                                idoso.getId(), med.getNome(), horario);

                        notificacaoService.enviarLembrete(
                                idoso.getTokenNotificacao(),
                                med.getNome(),
                                med.getDosagem(),
                                horario.toString().substring(0, 5)
                        );
                    }
                }
            }
        }
    }
}