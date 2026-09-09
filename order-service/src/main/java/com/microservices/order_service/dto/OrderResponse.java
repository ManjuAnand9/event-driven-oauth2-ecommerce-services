package com.microservices.order_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class OrderResponse {




    private String customerName;
    private String orderid;
    private List<OrderItemResponse> orderItemResponses;
    private LocalDateTime orderdate;
    private String orderstatus;
    private LocalDateTime eta;
    private BigDecimal ordertotal;
    private String shippingAddress;
    private String paymentMethod;
    private String paymentstatus;




}
