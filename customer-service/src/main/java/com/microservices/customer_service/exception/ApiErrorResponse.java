
package com.microservices.customer_service.exception;

import java.time.LocalDateTime;

    public record ApiErrorResponse(
            LocalDateTime timestamp,
            int status,
            String error,
            String message,
            String path
    ) {}

