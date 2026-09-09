package com.microservices.product_service.repository;

import com.microservices.product_service.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository

public interface ProductRepo extends JpaRepository<Product, Long> {
}
