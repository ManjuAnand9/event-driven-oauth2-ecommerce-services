package com.authservice.controller;

import org.springframework.beans.factory.annotation.Value;
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

    private final String keycloakRealmUrl;
    private final String clientId;
    private final String redirectUri;

    public AuthController(
            @Value("${app.keycloak-realm-url}")
            String keycloakRealmUrl,

            @Value("${app.keycloak-client-id}")
            String clientId,

            @Value("${app.frontend-callback-url}")
            String redirectUri
    ) {
        this.keycloakRealmUrl = keycloakRealmUrl;
        this.clientId = clientId;
        this.redirectUri = redirectUri;
    }

    @PostMapping("/social-callback")
    public Mono<ResponseEntity<Map>> socialCallback(
            @RequestParam String code,
            @RequestParam String codeVerifier
    ) {
        String tokenUrl =
                keycloakRealmUrl
                        + "/protocol/openid-connect/token";

        return WebClient.create()
                .post()
                .uri(tokenUrl)
                .contentType(
                        MediaType.APPLICATION_FORM_URLENCODED
                )
                .body(
                        BodyInserters
                                .fromFormData(
                                        "grant_type",
                                        "authorization_code"
                                )
                                .with(
                                        "client_id",
                                        clientId
                                )
                                .with(
                                        "code",
                                        code
                                )
                                .with(
                                        "redirect_uri",
                                        redirectUri
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
        String authorizationUrl =
                keycloakRealmUrl
                        + "/protocol/openid-connect/auth";

        String loginUrl =
                authorizationUrl
                        + "?client_id="
                        + URLEncoder.encode(
                        clientId,
                        StandardCharsets.UTF_8
                )
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
                        StandardCharsets.UTF_8
                )
                        + "&prompt=select_account";

        return ResponseEntity
                .status(HttpStatus.FOUND)
                .location(URI.create(loginUrl))
                .build();
    }
}