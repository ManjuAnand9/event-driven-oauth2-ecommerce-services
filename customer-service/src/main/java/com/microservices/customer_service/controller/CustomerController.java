package com.microservices.customer_service.controller;

import com.microservices.customer_service.model.Customer;
import com.microservices.customer_service.dto.CustomerDTO;
import com.microservices.customer_service.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

import org.springframework.web.bind.annotation.*;




@RestController




public class CustomerController {






    @Autowired
    private CustomerService customerService;


    @GetMapping("/getcustomerbyemail")
    public ResponseEntity<Customer> getCustomerByEmail(
            @RequestParam String email
    ) {
        return ResponseEntity.ok(
                customerService.getCustomerByEmail(email)
        );
    }





    @GetMapping("/getcustomer/{id}")
    public ResponseEntity<Customer> getCustomer(@PathVariable Long id){
//                                                Authentication authentication){
        System.out.println("Controller hit with id = " + id);

//        System.out.println(authentication.getAuthorities());

        return new ResponseEntity<>(customerService.getCustomer(id ), HttpStatus.OK);

    }




    @GetMapping("/getcustomers")
    public Page<Customer> getCustomers(Pageable pageable) {
        return customerService.getCustomers(pageable);
    }


    @PostMapping("/createcustomer")
    public ResponseEntity<Customer> createCustomer(
            @Valid @RequestBody CustomerDTO customerdto) {

        return new ResponseEntity<>(
                customerService.createCustomer(customerdto),
                HttpStatus.OK
        );
    }


    @PostMapping("/customers/me/sync")
    public ResponseEntity<Customer> syncCustomer(
            @AuthenticationPrincipal Jwt jwt
    ) {

        String keycloakUserId = jwt.getSubject();
        String email = jwt.getClaimAsString("email");
        String name = jwt.getClaimAsString("name");

        Customer customer =
                customerService.syncCustomer(
                        keycloakUserId,
                        email,
                        name
                );

        return ResponseEntity.ok(customer);
    }












}

