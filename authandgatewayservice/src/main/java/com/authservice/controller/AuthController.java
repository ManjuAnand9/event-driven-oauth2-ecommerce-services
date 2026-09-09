package com.authservice.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final String KEYCLOAK_AUTH_URL =
            "http://127.0.0.1:8180/realms/ecommerce-app"
                    + "/protocol/openid-connect/auth";

    private static final String CLIENT_ID = "AuthFlowClient";

    private static final String REDIRECT_URI =
            "http://localhost:5173/auth/callback";



    @PostMapping("/social-callback")
    public Mono<ResponseEntity<Map>> socialCallback(
            @RequestParam String code,
            @RequestParam String codeVerifier
    ) {

        String tokenUrl =
                "http://127.0.0.1:8180/realms/ecommerce-app"
                        + "/protocol/openid-connect/token";

        return WebClient.create()
                .post()
                .uri(tokenUrl)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(
                        BodyInserters
                                .fromFormData(
                                        "grant_type",
                                        "authorization_code"
                                )
                                .with(
                                        "client_id",
                                        "AuthFlowClient"
                                )
                                .with(
                                        "code",
                                        code
                                )
                                .with(
                                        "redirect_uri",
                                        "http://localhost:5173/auth/callback"
                                )
                                .with(
                                        "code_verifier",
                                        codeVerifier
                                )
                )
                .retrieve()
                .bodyToMono(Map.class)
                .map(ResponseEntity::ok);
    }


    @GetMapping("/social-login/{provider}")
    public ResponseEntity<Void> socialLogin(
            @PathVariable String provider,
            @RequestParam String codeChallenge
    ) {

        String keycloakUrl =
                "http://127.0.0.1:8180/realms/ecommerce-app"
                        + "/protocol/openid-connect/auth";

        String redirectUri =
                "http://localhost:5173/auth/callback";

        String loginUrl =
                keycloakUrl
                        + "?client_id=AuthFlowClient"
                        + "&response_type=code"
                        + "&scope=openid%20email%20profile"
                        + "&redirect_uri="
                        + URLEncoder.encode(
                        redirectUri,
                        StandardCharsets.UTF_8
                )
                        + "&code_challenge="
                        + URLEncoder.encode(
                        codeChallenge,
                        StandardCharsets.UTF_8
                )
                        + "&code_challenge_method=S256"
                        + "&kc_idp_hint="
                        + URLEncoder.encode(
                        provider,
                        StandardCharsets.UTF_8)
                                + "&prompt=select_account"
                ;

        return ResponseEntity
                .status(HttpStatus.FOUND)
                .location(URI.create(loginUrl))
                .build();
    }
}