CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20)
);

CREATE TABLE idosos (
    id BIGINT PRIMARY KEY REFERENCES usuarios(id),
    data_nascimento DATE,
    condicoes_saude VARCHAR(500),
    limite_freq_min INT NOT NULL DEFAULT 50,
    limite_freq_max INT NOT NULL DEFAULT 100,
    limite_sp_o2_min INT NOT NULL DEFAULT 94,
    limite_temp_max DOUBLE PRECISION NOT NULL DEFAULT 37.8
);

CREATE TABLE cuidadores (
    id BIGINT PRIMARY KEY REFERENCES usuarios(id),
    relacao_com_idoso VARCHAR(255),
    token_notificacao VARCHAR(500)
);

CREATE TABLE vinculo_cuidador_idoso (
    cuidador_id BIGINT NOT NULL REFERENCES cuidadores(id),
    idoso_id BIGINT NOT NULL REFERENCES idosos(id),
    PRIMARY KEY (cuidador_id, idoso_id)
);

CREATE TABLE medicacoes (
    id BIGSERIAL PRIMARY KEY,
    idoso_id BIGINT NOT NULL REFERENCES idosos(id),
    cadastrado_por_id BIGINT REFERENCES usuarios(id),
    nome VARCHAR(255) NOT NULL,
    dosagem VARCHAR(255)
);

CREATE TABLE medicacao_horarios (
    medicacao_id BIGINT NOT NULL REFERENCES medicacoes(id),
    horario TIME NOT NULL
);

CREATE TABLE registros_medicacao (
    id BIGSERIAL PRIMARY KEY,
    medicacao_id BIGINT NOT NULL REFERENCES medicacoes(id),
    data_hora TIMESTAMP NOT NULL,
    tomou BOOLEAN NOT NULL
);

CREATE TABLE alertas (
    id BIGSERIAL PRIMARY KEY,
    idoso_id BIGINT NOT NULL REFERENCES idosos(id),
    tipo VARCHAR(50) NOT NULL,
    descricao VARCHAR(500),
    data_hora TIMESTAMP NOT NULL,
    lido BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE localizacoes (
    id BIGSERIAL PRIMARY KEY,
    idoso_id BIGINT NOT NULL REFERENCES idosos(id),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    data_hora TIMESTAMP NOT NULL
);