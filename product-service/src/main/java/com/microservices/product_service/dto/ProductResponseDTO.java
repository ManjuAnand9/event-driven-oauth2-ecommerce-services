package com.microservices.product_service.dto;


import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductResponseDTO {

    private Long id;
    private String name;
    private BigDecimal price;
    private String description;
    private String category;
    private String imageUrl;
}
