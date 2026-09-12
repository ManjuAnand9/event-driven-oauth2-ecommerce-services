FROM quay.io/keycloak/keycloak:latest AS builder

ENV KC_DB=postgres
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true

WORKDIR /opt/keycloak
RUN /opt/keycloak/bin/kc.sh build


FROM quay.io/keycloak/keycloak:latest

COPY --from=builder /opt/keycloak/ /opt/keycloak/
COPY --chown=keycloak:keycloak ecommerce-app-realm-sanitized.json /opt/keycloak/data/import/ecommerce-app-realm-sanitized.json

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]

CMD ["start", "--optimized", "--http-enabled=true", "--proxy-headers=xforwarded", "--hostname-strict=false", "--import-realm"]