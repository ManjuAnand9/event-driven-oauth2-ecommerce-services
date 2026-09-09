package com.microservices.order_service.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductWrapper {

    private Long id;
    private String name;
    private BigDecimal price;
    private String description;
    private String category;
    private String imageUrl;
}