package com.microservices.order_service.events;

import com.microservices.order_service.dto.OrderResponse;

public record OrderEvent(
         String orderId,
         OrderEventType eventType,
         OrderResponse orderResponse ) {
}
