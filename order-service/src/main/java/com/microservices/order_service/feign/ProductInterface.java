package com.microservices.order_service.feign;

import com.microservices.order_service.model.ProductWrapper;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "PRODUCT-SERVICE")
public interface ProductInterface {

    @GetMapping("/getproduct/{id}")
    ResponseEntity<ProductWrapper> getProductById(
            @PathVariable("id") Long id
    );

    @PostMapping("/addproduct")
    ProductWrapper addProducts(
            @RequestBody ProductWrapper product
    );
}