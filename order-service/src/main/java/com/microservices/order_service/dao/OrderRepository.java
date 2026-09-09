package com.microservices.order_service.dao;

import com.microservices.order_service.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface OrderRepository
        extends JpaRepository<Order, String> {

    Page<Order> findByCustomerEmail(
            String customerEmail,
            Pageable pageable
    );
}
