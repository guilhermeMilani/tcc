package com.furb.tcc.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cuidadores")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class Cuidador extends Usuario {

    private String relacaoComIdoso;
    private String tokenNotificacao;

    @ManyToMany
    @JoinTable(
            name = "vinculo_cuidador_idoso",
            joinColumns = @JoinColumn(name = "cuidador_id"),
            inverseJoinColumns = @JoinColumn(name = "idoso_id")
    )
    private List<Idoso> idosos = new ArrayList<>();
}