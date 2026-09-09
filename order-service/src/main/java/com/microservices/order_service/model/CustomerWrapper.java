package com.microservices.order_service.model;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Data

public class CustomerWrapper {


    private Long customerid;
    private String customerEmail;
    private String customerName;
    private String shippingAddress;

}

