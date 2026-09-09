package com.microservices.order_service.producer;

import com.microservices.order_service.events.OrderEvent;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.header.Header;
import org.apache.kafka.common.header.internals.RecordHeader;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

@Component

@Slf4j

public class OrderEventProducer {




    private KafkaTemplate<String, String> kafkaTemplate;

    @Value("${spring.kafka.topic}")
    private String topic;

    private ObjectMapper objectmapper;

    public OrderEventProducer(KafkaTemplate<String, String> kafkaTemplate, ObjectMapper objectmapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectmapper= objectmapper;


    }

    private void handleFailure (String key, String value, Throwable throwable){

        log.info("error sending meessage to kafka", throwable.getMessage(), throwable);
    }

    private void handlesuccess (SendResult<String, String> sendResult, String key, String  value){

        log.info("message sent to kafka ", key, value, sendResult.getRecordMetadata().partition());
    }



    private ProducerRecord<String, String> buildProducerRecord(String key, String value, String topic) {


        List<Header> recordHeaders = List.of(new RecordHeader("event-source", "scanner".getBytes()));

        return new ProducerRecord<>(topic, null, key, value, recordHeaders);
    }


    public void sendOrderEvent(OrderEvent orderevent) {

        var key = orderevent.orderId();
        var value = objectmapper.writeValueAsString(orderevent);


        var completableFuture = kafkaTemplate.send(topic, key, value);

        completableFuture.whenComplete((sendResult, throwable) -> {
            if (throwable != null) {

                handleFailure(key, value, throwable);
            } else {
                handlesuccess(sendResult, key, value);
            }


        });






    }}


