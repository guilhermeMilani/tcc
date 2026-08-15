-- Senha de todos os usuários: "senha123" (BCrypt)
INSERT INTO usuarios (nome, email, senha, telefone) VALUES
('Maria Aparecida Silva', 'maria@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh.i', '47999990001'),
('José Carlos Oliveira', 'jose@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh.i', '47999990002'),
('Ana Paula Santos', 'ana@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh.i', '47999990003'),
('Carlos Eduardo Lima', 'carlos@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh.i', '47999990004');

INSERT INTO idosos (id, data_nascimento, condicoes_saude, limite_freq_min, limite_freq_max, limite_sp_o2_min, limite_temp_max) VALUES
(1, '1945-03-15', 'Hipertensão, Diabetes tipo 2', 50, 100, 94, 37.8),
(2, '1950-07-22', 'Insuficiência cardíaca leve', 45, 95, 92, 37.5);

INSERT INTO cuidadores (id, relacao_com_idoso, token_notificacao) VALUES
(3, 'Filha', NULL),
(4, 'Enfermeiro', NULL);

INSERT INTO vinculo_cuidador_idoso (cuidador_id, idoso_id) VALUES
(3, 1),
(3, 2),
(4, 1);

INSERT INTO medicacoes (idoso_id, cadastrado_por_id, nome, dosagem) VALUES
(1, 3, 'Losartana', '50mg'),
(1, 3, 'Metformina', '850mg'),
(1, 4, 'Atenolol', '25mg'),
(2, 3, 'Furosemida', '40mg'),
(2, 3, 'Digoxina', '0.25mg');

INSERT INTO medicacao_horarios (medicacao_id, horario) VALUES
(1, '08:00'),
(2, '08:00'),
(2, '20:00'),
(3, '12:00'),
(4, '07:00'),
(4, '19:00'),
(5, '08:00');

INSERT INTO registros_medicacao (medicacao_id, data_hora, tomou) VALUES
(1, NOW() - INTERVAL '1 day', TRUE),
(1, NOW() - INTERVAL '2 days', TRUE),
(1, NOW() - INTERVAL '3 days', FALSE),
(2, NOW() - INTERVAL '1 day', TRUE),
(2, NOW() - INTERVAL '2 days', FALSE),
(3, NOW() - INTERVAL '1 day', TRUE),
(4, NOW() - INTERVAL '1 day', TRUE),
(5, NOW() - INTERVAL '1 day', FALSE);

INSERT INTO alertas (idoso_id, tipo, descricao, data_hora, lido) VALUES
(1, 'FREQUENCIA_ALTA', 'Frequência cardíaca elevada: 158 bpm', NOW() - INTERVAL '2 hours', FALSE),
(1, 'TEMPERATURA_ALTA', 'Temperatura elevada: 38.2°C', NOW() - INTERVAL '5 hours', TRUE),
(2, 'SPO2_BAIXO', 'SpO2 abaixo do limite: 90.5%', NOW() - INTERVAL '1 day', FALSE),
(1, 'PANICO', 'Botão de pânico acionado pelo idoso', NOW() - INTERVAL '3 days', TRUE);

INSERT INTO localizacoes (idoso_id, latitude, longitude, data_hora) VALUES
(1, -26.9055, -49.0830, NOW() - INTERVAL '5 minutes'),
(1, -26.9056, -49.0831, NOW() - INTERVAL '10 minutes'),
(2, -26.9100, -49.0900, NOW() - INTERVAL '5 minutes'),
(2, -26.9101, -49.0901, NOW() - INTERVAL '10 minutes');