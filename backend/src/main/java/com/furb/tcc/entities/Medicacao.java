package com.furb.tcc.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "medicacoes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medicacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "idoso_id")
    private Idoso idoso;

    @ManyToOne
    @JoinColumn(name = "cadastrado_por_id")
    private Usuario cadastradoPor;

    @Column(nullable = false)
    private String nome;

    private String dosagem;

    @ElementCollection
    @CollectionTable(name = "medicacao_horarios", joinColumns = @JoinColumn(name = "medicacao_id"))
    @Column(name = "horario")
    private List<LocalTime> horarios = new ArrayList<>();
}