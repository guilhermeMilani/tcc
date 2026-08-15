package com.furb.tcc.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "idosos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class Idoso extends Usuario {

    private LocalDate dataNascimento;
    private String condicoesSaude;

    @Column(nullable = false)
    @Builder.Default
    private Integer limiteFreqMin = 50;

    @Column(nullable = false)
    @Builder.Default
    private Integer limiteFreqMax = 100;

    @Column(nullable = false)
    @Builder.Default
    private Integer limiteSpO2Min = 94;

    @Column(nullable = false)
    @Builder.Default
    private Double limiteTempMax = 37.8;

    @ManyToMany(mappedBy = "idosos")
    @JsonIgnore
    private List<Cuidador> cuidadores = new ArrayList<>();
}
