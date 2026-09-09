package com.microservices.customer_service.service;


import com.microservices.customer_service.dto.CustomerDTO;
import com.microservices.customer_service.exception.ResourceNotFoundException;
import com.microservices.customer_service.model.Customer;
import com.microservices.customer_service.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;


    @Value("${keycloak.client-id}")
    private String keycloakClientId;

    @Value("${keycloak.client-secret}")
    private String keycloakClientSecret;

    @Value("${keycloak.realm}")
    private String keycloakRealm;


    @Autowired
    private RestTemplate restTemplate;

    private String getAdminToken() {


        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(
                MediaType.APPLICATION_FORM_URLENCODED
        );

        MultiValueMap<String, String> body =
                new LinkedMultiValueMap<>();

        body.add("grant_type", "client_credentials");
        body.add("client_id", keycloakClientId);
        body.add("client_secret", keycloakClientSecret);

        HttpEntity<MultiValueMap<String, String>> request =
                new HttpEntity<>(body, headers);

        URI tokenUri = UriComponentsBuilder
                .fromUriString("http://127.0.0.1:8180")
                .pathSegment(
                        "realms",
                        keycloakRealm,
                        "protocol",
                        "openid-connect",
                        "token"
                )
                .build()
                .encode()
                .toUri();

        ResponseEntity<Map> response =
                restTemplate.postForEntity(
                        tokenUri,
                        request,
                        Map.class
                );

        Map<?, ?> responseBody = response.getBody();

        if (responseBody == null ||
                responseBody.get("access_token") == null) {
            throw new IllegalStateException(
                    "Keycloak did not return an access token"
            );
        }

        return responseBody
                .get("access_token")
                .toString();
    }

    private void assignRealmRole(
            String token,
            String keycloakUserId,
            String roleName) {

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        URI getRoleUri = UriComponentsBuilder
                .fromUriString("http://127.0.0.1:8180")
                .pathSegment(
                        "admin",
                        "realms",
                        keycloakRealm,
                        "roles",
                        roleName
                )
                .build()
                .encode()
                .toUri();

        HttpEntity<Void> getRoleRequest =
                new HttpEntity<>(headers);

        ResponseEntity<Map> roleResponse =
                restTemplate.exchange(
                        getRoleUri,
                        HttpMethod.GET,
                        getRoleRequest,
                        Map.class
                );

        Map<?, ?> role = roleResponse.getBody();

        if (role == null) {
            throw new IllegalStateException(
                    roleName + " role was not found in Keycloak"
            );
        }

        URI assignRoleUri = UriComponentsBuilder
                .fromUriString("http://127.0.0.1:8180")
                .pathSegment(
                        "admin",
                        "realms",
                        keycloakRealm,
                        "users",
                        keycloakUserId,
                        "role-mappings",
                        "realm"
                )
                .build()
                .encode()
                .toUri();

        HttpEntity<List<Map<?, ?>>> assignRoleRequest =
                new HttpEntity<>(
                        List.of(role),
                        headers
                );

        restTemplate.postForEntity(
                assignRoleUri,
                assignRoleRequest,
                Void.class
        );
    }


    public Customer getCustomerByEmail(String email) {
        return customerRepository
                .findByCustomerEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Customer not found with email: " + email
                        )
                );
    }


    public Customer createCustomer(CustomerDTO customerdto) {
        System.out.println("STEP 1: Getting admin token");
        String token = getAdminToken();
        System.out.println("STEP 1 SUCCESS: Admin token received");

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);


//        String username = customerdto.getCustomerEmail();
//        CredentialDTO credentialdto = new CredentialDTO();
//        credentialdto.setType("password");
//        credentialdto.setValue(customerdto.getPassword());
//        credentialdto.setTemporary(false);
//
//

        Map<String, Object> keycloakUser =
                Map.of(
                        "username",
                        customerdto.getUsername(),

                        "email",
                        customerdto.getEmail(),

                        "enabled",
                        customerdto.getEnabled(),

                        "credentials",
                        customerdto.getCredentials()
                );


        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(
                        keycloakUser,
                        headers
                );
        URI createUserUri = UriComponentsBuilder
                .fromUriString("http://127.0.0.1:8180")
                .pathSegment(
                        "admin",
                        "realms",
                        keycloakRealm,
                        "users"
                )
                .build()
                .encode()
                .toUri();

        System.out.println("STEP 2: Creating Keycloak user");
        System.out.println("USERNAME: " + customerdto.getUsername());
        System.out.println("REALM: " + keycloakRealm);
        System.out.println("URI: " + createUserUri);

        ResponseEntity<Void> response;

        try {

            response =
                    restTemplate.postForEntity(
                            createUserUri,
                            request,
                            Void.class
                    );

        } catch (org.springframework.web.client.HttpStatusCodeException e) {

            System.out.println(
                    "KEYCLOAK STATUS: "
                            + e.getStatusCode()
            );

            System.out.println(
                    "KEYCLOAK RESPONSE: "
                            + e.getResponseBodyAsString()
            );

            throw e;
        }

        System.out.println(
                "STEP 2 SUCCESS: " +
                        response.getStatusCode()
        );

        Customer customer = new Customer();
        String location = response.getHeaders().getFirst(HttpHeaders.LOCATION);


        if (location == null) {
            throw new IllegalStateException(
                    "Keycloak created the user but did not return its location"
            );
        }


        String keycloakId = location.substring(location.lastIndexOf("/") + 1);

        assignRealmRole(token, keycloakId, "USER");


        customer.setCustomerEmail(customerdto.getEmail());
        customer.setKeycloakUserId(keycloakId);
        customer.setCustomerName(customerdto.getCustomerName());
        customer.setShippingAddress(customerdto.getShippingAddress());


        return customerRepository.save(customer);
    }


    public Customer getCustomer(Long id) {

        return customerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(
                "Customer not found with id: " + id
        ));
    }

    public Page<Customer> getCustomers(Pageable pageable) {
        return customerRepository.findAll(pageable);
    }

    public Customer syncCustomer(
            String keycloakUserId,
            String email,
            String name
    ) {

        Optional<Customer> existing =
                customerRepository.findByKeycloakUserId(
                        keycloakUserId
                );

        // Existing social-login customer
        if (existing.isPresent()) {

            Customer customer = existing.get();

            customer.setCustomerEmail(email);
            customer.setCustomerName(name);

            return customerRepository.save(customer);
        }

        // New social-login customer
        // Assign USER realm role in Keycloak
        String adminToken = getAdminToken();

        assignRealmRole(
                adminToken,
                keycloakUserId,
                "USER"
        );

        // Create local customer record
        Customer customer = new Customer();

        customer.setKeycloakUserId(keycloakUserId);
        customer.setCustomerEmail(email);
        customer.setCustomerName(name);

        return customerRepository.save(customer);
    }
}
