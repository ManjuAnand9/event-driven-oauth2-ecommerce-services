package com.microservices.customer_service.repository;

import com.microservices.customer_service.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByCustomerEmail(String customerEmail);

    Optional<Customer> findByKeycloakUserId(String keycloakUserId);
}
