package com.authservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;

@SpringBootApplication
@EnableWebFluxSecurity
@EnableMethodSecurity(jsr250Enabled = true,securedEnabled = true)
public class AuthAndGatewayServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthAndGatewayServiceApplication.class, args);
    }

}
