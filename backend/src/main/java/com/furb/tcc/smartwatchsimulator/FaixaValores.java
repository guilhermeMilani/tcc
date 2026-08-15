package com.furb.tcc.smartwatchsimulator;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FaixaValores {
    private double freqMin;
    private double freqMax;
    private double spO2Min;
    private double spO2Max;
    private double tempMin;
    private double tempMax;
}
