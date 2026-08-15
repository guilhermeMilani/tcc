package com.furb.tcc;

import com.furb.tcc.entities.Cuidador;
import com.furb.tcc.entities.Idoso;
import com.furb.tcc.repositories.CuidadorRepository;
import com.furb.tcc.repositories.IdosoRepository;
import com.furb.tcc.services.VinculoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class VinculoServiceTest {

    @InjectMocks
    private VinculoService vinculoService;

    @Mock
    private IdosoRepository idosoRepository;

    @Mock
    private CuidadorRepository cuidadorRepository;

    private Idoso idoso;
    private Cuidador cuidador;

    @BeforeEach
    void setUp() {
        idoso = Idoso.builder().id(1L).cuidadores(new ArrayList<>()).build();
        cuidador = Cuidador.builder().id(1L).idosos(new ArrayList<>()).build();
    }

    @Test
    void deveVincularCuidadorAoIdoso() {
        when(cuidadorRepository.findById(1L)).thenReturn(Optional.of(cuidador));
        when(idosoRepository.findById(1L)).thenReturn(Optional.of(idoso));

        vinculoService.vincular(1L, 1L);

        assertTrue(cuidador.getIdosos().contains(idoso));
        verify(cuidadorRepository, times(1)).save(cuidador);
    }

    @Test
    void deveLancarExcecaoSeVinculoJaExiste() {
        cuidador.getIdosos().add(idoso);

        when(cuidadorRepository.findById(1L)).thenReturn(Optional.of(cuidador));
        when(idosoRepository.findById(1L)).thenReturn(Optional.of(idoso));

        assertThrows(RuntimeException.class, () -> vinculoService.vincular(1L, 1L));
        verify(cuidadorRepository, never()).save(any());
    }

    @Test
    void deveDesvinularCuidadorDoIdoso() {
        cuidador.getIdosos().add(idoso);

        when(cuidadorRepository.findById(1L)).thenReturn(Optional.of(cuidador));
        when(idosoRepository.findById(1L)).thenReturn(Optional.of(idoso));

        vinculoService.desvincular(1L, 1L);

        assertFalse(cuidador.getIdosos().contains(idoso));
        verify(cuidadorRepository, times(1)).save(cuidador);
    }
}