package com.microservices.order_service.controller;

import com.microservices.order_service.dto.OrderRequest;
import com.microservices.order_service.dto.OrderResponse;
import com.microservices.order_service.service.OrderService;

import jakarta.validation.Valid;
import lombok.Builder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@Builder
public class OrderController {

    @Autowired
    private OrderService orderService;


    @PostMapping("/placeorder")
    public ResponseEntity<OrderResponse> placeOrder(
            @Valid @RequestBody OrderRequest orderRequest) {

        return ResponseEntity.ok(
                orderService.placeOrder(orderRequest)
        );
    }


    @GetMapping("/order/{id}")
    public ResponseEntity<OrderResponse> getOrder(
            @PathVariable String id) {

        return ResponseEntity.ok(
                orderService.getOrderById(id)
        );
    }


    @GetMapping("/getallorders")
    public Page<OrderResponse> getOrders(
            Pageable pageable) {

        return orderService.getOrders(pageable);
    }


    @GetMapping("/customer-orders")
    public Page<OrderResponse> getCustomerOrders(@RequestParam String email,
            Pageable pageable) {

        return orderService
                .getOrdersByCustomerEmail(
                        email,
                        pageable
                );
    }






}