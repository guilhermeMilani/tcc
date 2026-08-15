package com.furb.tcc.entities;

import com.influxdb.annotations.Column;
import com.influxdb.annotations.Measurement;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Measurement(name = "sinais_vitais")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SinalVital {

    @Column(tag = true)
    private String idosoId;

    @Column
    private Integer frequenciaCardiaca;

    @Column
    private Double spO2;

    @Column
    private Double temperatura;

    @Column(timestamp = true)
    private Instant dataHora;
}