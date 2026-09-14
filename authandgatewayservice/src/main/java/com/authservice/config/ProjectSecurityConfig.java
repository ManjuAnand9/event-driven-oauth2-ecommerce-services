package com.authservice.config;

import com.authservice.exceptionhandling.CustomAccessDeniedHandler;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;

import org.springframework.security.web.server.SecurityWebFilterChain;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;

import org.springframework.web.server.ServerWebExchange;

import java.util.Arrays;
import java.util.Collections;


@Configuration
@EnableWebFluxSecurity
public class ProjectSecurityConfig {


    @Bean
    SecurityWebFilterChain defaultSecurityFilterChain(
            ServerHttpSecurity http,
            @Value("${app.frontend-url}") String frontendUrl
    ) {


        JwtAuthenticationConverter jwtAuthenticationConverter =
                new JwtAuthenticationConverter();

        jwtAuthenticationConverter
                .setJwtGrantedAuthoritiesConverter(
                        new KeycloakRoleConverter()
                );


        http

                // =====================================================
                // CORS
                // =====================================================

                .cors(corsSpec ->
                        corsSpec.configurationSource(
                                new CorsConfigurationSource() {

                                    @Override
                                    public CorsConfiguration getCorsConfiguration(
                                            ServerWebExchange exchange) {

                                        CorsConfiguration config =
                                                new CorsConfiguration();


                                        // React frontend
                                        config.setAllowedOrigins(
                                                Collections.singletonList(
                                                        frontendUrl
                                                )
                                        );


                                        // Browser/API methods
                                        config.setAllowedMethods(
                                                Arrays.asList(
                                                        "GET",
                                                        "POST",
                                                        "PUT",
                                                        "DELETE",
                                                        "PATCH",
                                                        "OPTIONS"
                                                )
                                        );


                                        // Authorization,
                                        // Content-Type, etc.
                                        config.setAllowedHeaders(
                                                Collections.singletonList("*")
                                        );


                                        config.setAllowCredentials(true);


                                        config.setExposedHeaders(
                                                Arrays.asList(
                                                        "Authorization"
                                                )
                                        );


                                        // Cache preflight response
                                        config.setMaxAge(3600L);


                                        return config;
                                    }
                                }
                        )
                )


                // =====================================================
                // CSRF
                // =====================================================

                .csrf(
                        ServerHttpSecurity.CsrfSpec::disable
                )


                // =====================================================
                // AUTHORIZATION
                // =====================================================

                .authorizeExchange(exchanges -> exchanges


                        // =================================================
                        // CORS PREFLIGHT
                        // =================================================

                        .pathMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        )
                        .permitAll()


                        // =================================================
                        // PUBLIC AUTH ENDPOINTS
                        // =================================================

                        .pathMatchers(
                                "/auth/**",
                                "/register",
                                "/error"
                        )
                        .permitAll()


                        // =================================================
                        // CUSTOMER SERVICE
                        // =================================================

                        // Anyone can create/register customer
                        .pathMatchers(
                                HttpMethod.POST,
                                "/CUSTOMER-SERVICE/createcustomer"
                        )
                        .permitAll()

                        .pathMatchers(
                                HttpMethod.GET,
                                "/CUSTOMER-SERVICE/getcustomerbyemail"
                        )
                        .permitAll()


                        // USER or ADMIN can get one customer
                        .pathMatchers(
                                HttpMethod.GET,
                                "/CUSTOMER-SERVICE/getcustomer/**"
                        )
                        .hasAnyRole(
                                "USER",
                                "ADMIN"
                        )


                        // ADMIN only
                        .pathMatchers(
                                HttpMethod.GET,
                                "/CUSTOMER-SERVICE/getcustomers"
                        )
                        .hasRole("ADMIN")


                        // =================================================
                        // PRODUCT SERVICE
                        // =================================================

                        /*
                         * Public storefront browsing.
                         *
                         * Users should be able to view products
                         * before they log in.
                         */

                        .pathMatchers(
                                HttpMethod.GET,
                                "/PRODUCT-SERVICE/products"
                        )
                        .permitAll()


                        .pathMatchers(
                                HttpMethod.GET,
                                "/PRODUCT-SERVICE/getproduct/**"
                        )
                        .permitAll()


                        // ADMIN requests presigned upload URL
                        .pathMatchers(
                                HttpMethod.POST,
                                "/PRODUCT-SERVICE/product-image/upload-url"
                        )
                        .hasRole("ADMIN")


                        // ADMIN adds product metadata
                        .pathMatchers(
                                HttpMethod.POST,
                                "/PRODUCT-SERVICE/addproduct"
                        )
                        .hasRole("ADMIN")


                        // Your controller uses:
                        //
                        // @PutMapping("/updateproduct/{id}")
                        //
                        .pathMatchers(
                                HttpMethod.PUT,
                                "/PRODUCT-SERVICE/updateproduct/**"
                        )
                        .hasRole("ADMIN")


                        // =================================================
                        // ORDER SERVICE
                        // =================================================
                        .pathMatchers(HttpMethod.GET,"/ORDER-SERVICE/customer-orders").permitAll()
                        // ADMIN only — retrieve all orders
                        .pathMatchers(
                                HttpMethod.GET,
                                "/ORDER-SERVICE/getallorders"
                        )
                        .hasAnyRole(
                                "USER",
                                "ADMIN"
                        )


                        // USER or ADMIN — retrieve one order
                        .pathMatchers(
                                HttpMethod.GET,
                                "/ORDER-SERVICE/order/**"
                        )
                        .hasAnyRole(
                                "USER",
                                "ADMIN"
                        )


                        // USER or ADMIN — place order
                        .pathMatchers(
                                HttpMethod.POST,
                                "/ORDER-SERVICE/placeorder"
                        )
                        .hasAnyRole(
                                "USER",
                                "ADMIN"
                        )


                        // =================================================
                        // FALLBACK
                        // =================================================

                        .anyExchange()
                        .authenticated()

                )


                // =====================================================
                // JWT RESOURCE SERVER
                // =====================================================

                .oauth2ResourceServer(
                        oauth2 ->
                                oauth2.jwt(
                                        jwt ->
                                                jwt.jwtAuthenticationConverter(
                                                        new ReactiveJwtAuthenticationConverterAdapter(
                                                                jwtAuthenticationConverter
                                                        )
                                                )
                                )
                )


                // =====================================================
                // ERROR HANDLING
                // =====================================================

                .exceptionHandling(
                        exceptions ->
                                exceptions.accessDeniedHandler(
                                        new CustomAccessDeniedHandler()
                                )
                );


        return http.build();
    }
}