package com.furb.tcc.repositories;

import com.furb.tcc.entities.SinalVital;
import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.QueryApi;
import com.influxdb.client.WriteApiBlocking;
import com.influxdb.client.domain.WritePrecision;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class SinalVitalRepository {

    private final InfluxDBClient influxDBClient;

    @Value("${influx.bucket}")
    private String bucket;

    @Value("${influx.org}")
    private String org;

    public SinalVitalRepository(InfluxDBClient influxDBClient) {
        this.influxDBClient = influxDBClient;
    }

    public void salvar(SinalVital sinalVital) {
        WriteApiBlocking writeApi = influxDBClient.getWriteApiBlocking();
        writeApi.writeMeasurement(bucket, org, WritePrecision.MS, sinalVital);
    }

    public List<SinalVital> buscarPorIdoso(String idosoId, String range) {
        String query = String.format("""
        from(bucket: "%s")
          |> range(start: -%s)
          |> filter(fn: (r) => r._measurement == "sinais_vitais")
          |> filter(fn: (r) => r.idosoId == "%s")
          |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
        """, bucket, range, idosoId);

        QueryApi queryApi = influxDBClient.getQueryApi();

        return queryApi.query(query).stream()
                .flatMap(table -> table.getRecords().stream())
                .map(record -> SinalVital.builder()
                        .idosoId(idosoId)
                        .frequenciaCardiaca(record.getValueByKey("frequenciaCardiaca") != null
                                ? ((Number) record.getValueByKey("frequenciaCardiaca")).intValue() : null)
                        .spO2(record.getValueByKey("spO2") != null
                                ? ((Number) record.getValueByKey("spO2")).doubleValue() : null)
                        .temperatura(record.getValueByKey("temperatura") != null
                                ? ((Number) record.getValueByKey("temperatura")).doubleValue() : null)
                        .dataHora(record.getTime())
                        .build()
                )
                .collect(java.util.stream.Collectors.toList());
    }
}
