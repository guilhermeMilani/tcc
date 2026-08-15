package com.furb.tcc.smartwatchsimulator;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EstadoSimulacao {
    private EstadoAtividade estado;
    private double frequenciaAtual;
    private double spO2Atual;
    private double temperaturaAtual;
}
