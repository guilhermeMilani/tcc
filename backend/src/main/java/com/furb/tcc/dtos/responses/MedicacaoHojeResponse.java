package com.furb.tcc.dtos.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalTime;

@Data
@AllArgsConstructor
@Builder
public class MedicacaoHojeResponse {
    private Long id;
    private String nome;
    private String dosagem;
    private LocalTime horario;
    private String status; // AGORA, PROXIMA, ANTERIOR
    private Boolean tomou;
    private Long registroId;
}
