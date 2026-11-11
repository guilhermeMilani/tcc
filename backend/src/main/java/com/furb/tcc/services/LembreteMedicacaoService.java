package com.furb.tcc.services;

import com.furb.tcc.entities.Idoso;
import com.furb.tcc.entities.Medicacao;
import com.furb.tcc.repositories.IdosoRepository;
import com.furb.tcc.repositories.MedicacaoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LembreteMedicacaoService {

    private final MedicacaoRepository medicacaoRepository;
    private final IdosoRepository idosoRepository;
    private final NotificacaoService notificacaoService;

    @Transactional(readOnly = true)
    @Scheduled(fixedRate = 60000)
    public void verificarLembretes() {
        LocalTime agora = LocalTime.now();
        List<Idoso> idosos = idosoRepository.findAll();
        log.info("Lembretes: verificando {} idosos às {}", idosos.size(), agora);

        for (Idoso idoso : idosos) {
            String token = idoso.getTokenNotificacao();
            if (token == null || token.isBlank()) {
                log.info("Lembretes: idoso {} sem token de notificação", idoso.getId());
                continue;
            }

            List<Medicacao> medicacoes = medicacaoRepository.findByIdosoId(idoso.getId());

            for (Medicacao med : medicacoes) {
                if (med.getHorarios() == null) continue;

                for (LocalTime horario : med.getHorarios()) {
                    long minutosAte = agora.until(horario, ChronoUnit.MINUTES);
                    log.info("Lembretes: idoso {} - {} às {} (faltam {} min)",
                            idoso.getId(), med.getNome(), horario, minutosAte);

                    if (minutosAte >= 4 && minutosAte <= 5) {
                        log.info("Enviando lembrete para idoso {} - medicação {} às {}",
                                idoso.getId(), med.getNome(), horario);

                        notificacaoService.enviarLembrete(
                                token,
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