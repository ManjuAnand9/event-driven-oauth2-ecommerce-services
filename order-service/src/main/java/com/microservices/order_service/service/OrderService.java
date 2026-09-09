package com.microservices.order_service.service;

import com.microservices.order_service.dao.OrderRepository;
import com.microservices.order_service.dto.OrderItemRequest;
import com.microservices.order_service.dto.OrderItemResponse;
import com.microservices.order_service.dto.OrderRequest;
import com.microservices.order_service.dto.OrderResponse;
import com.microservices.order_service.events.OrderEvent;
import com.microservices.order_service.events.OrderEventType;
import com.microservices.order_service.exception.ResourceNotFoundException;
import com.microservices.order_service.feign.CustomerInterface;
import com.microservices.order_service.feign.ProductInterface;
import com.microservices.order_service.model.CustomerWrapper;
import com.microservices.order_service.model.Order;
import com.microservices.order_service.model.OrderItem;
import com.microservices.order_service.model.ProductWrapper;
import com.microservices.order_service.producer.OrderEventProducer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service


public class OrderService {

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private CustomerInterface customerInterface;

    @Autowired
    private ProductInterface productInterface;

    //@Autowired
//    private CustomerRepository customerRepo;
//    @Autowired
//    private ProductRepo productRepo;

    @Autowired
    private OrderEventProducer orderEventProducer;


    private OrderResponse mapToOrderResponse(Order order) {

        List<OrderItemResponse> itemResponses =
                new ArrayList<>();


        for (OrderItem item : order.getOrderitems()) {

            OrderItemResponse itemResponse =
                    new OrderItemResponse();

            itemResponse.setProductId(
                    item.getProductId()
            );

            itemResponse.setProductName(
                    item.getName()
            );

            itemResponse.setQuantity(
                    item.getQuantity()
            );

            itemResponse.setPrice(
                    item.getPrice()
            );

            itemResponse.setItemtotal(
                    item.getPrice().multiply(
                            BigDecimal.valueOf(
                                    item.getQuantity()
                            )
                    )
            );


            /*
             * Get current product image URL
             * from Product Service.
             */
            if (item.getProductId() != null) {

                System.out.println(
                        "Calling Product Service for productId: "
                                + item.getProductId()
                );

                try {

                    ProductWrapper product =
                            productInterface
                                    .getProductById(
                                            item.getProductId()
                                    )
                                    .getBody();

                    System.out.println(
                            "Product Service response: " + product
                    );

                    if (product != null) {

                        itemResponse.setImageUrl(
                                product.getImageUrl()
                        );
                    }

                } catch (Exception e) {

                    System.out.println(
                            "ERROR calling Product Service for productId: "
                                    + item.getProductId()
                    );

                    itemResponse.setImageUrl(null);



                }
            }


            itemResponses.add(itemResponse);
        }


        OrderResponse response =
                new OrderResponse();

        response.setOrderid(
                order.getId()
        );

        response.setCustomerName(
                order.getCustomerName()
        );

        response.setOrderdate(
                order.getOrderDate()
        );

        response.setOrderItemResponses(
                itemResponses
        );

        response.setOrdertotal(
                order.getTotalPrice()
        );

        response.setPaymentMethod(
                order.getPaymentMethod()
        );

        response.setPaymentstatus(
                order.getPaymentStatus()
        );

        response.setOrderstatus("ordered");

        if (order.getOrderDate() != null) {
            response.setEta(
                    order.getOrderDate().plusDays(10)
            );
        }

        return response;
    }






    public Page<OrderResponse> getOrders(Pageable pageable) {

        return orderRepo.findAll(pageable)
                .map(this::mapToOrderResponse);
    }


    public OrderResponse getOrderById(String id) {

        Order order = orderRepo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found with id: " + id
                        )
                );

        return mapToOrderResponse(order);
    }

    public OrderResponse placeOrder(OrderRequest orderRequest) {

        BigDecimal orderTotal= BigDecimal.ZERO;


//        Customer customer= customerRepo.findById(orderRequest.getCustomerid())
//                .orElseThrow(()-> new RuntimeException("Customer not found"));

        CustomerWrapper customer =
                customerInterface
                        .getCustomer(orderRequest.getCustomerid())
                        .getBody();

        if (customer == null) {
            throw new ResourceNotFoundException(
                    "Customer not found with id: "
                            + orderRequest.getCustomerid()
            );
        }

        String customerName = customer.getCustomerName();
        String shippingAddress = customer.getShippingAddress();



//        String customerName= customer.getCustomerName();
//        String shippingAddress= customer.getShippingAddress();




        String orderId=  UUID.randomUUID().toString();


        LocalDateTime orderdate = LocalDateTime.now();


        Order order= new Order();
        order.setId(orderId);
        order.setOrderDate(orderdate);
        order.setCustomerName(customerName);
        order.setCustomerEmail(customer.getCustomerEmail());

        order.setPaymentMethod(orderRequest.getPaymentMethod());
        order.setPaymentStatus("payment successful");

        List<OrderItemResponse> orderItemResponses= new ArrayList<>();

        List<OrderItem> orderItems= new ArrayList<>();

        for(OrderItemRequest oir: orderRequest.getItems()){

            OrderItemResponse orderItemResponse = new OrderItemResponse();

            OrderItem orderItem= new OrderItem();

//            Product product = productRepo.findById(oir.getProductId())
//                    .orElseThrow(()->new RuntimeException("product not found"));


            ProductWrapper product =
                    productInterface
                            .getProductById(oir.getProductId())
                            .getBody();

            if (product == null) {
                throw new ResourceNotFoundException(
                        "Product not found with id: "
                                + oir.getProductId()
                );
            }


            orderItemResponse.setProductId(
                    product.getId()
            );

            orderItemResponse.setProductName(
                    product.getName()
            );

            orderItemResponse.setQuantity(
                    oir.getQuantity()
            );

            orderItemResponse.setPrice(
                    product.getPrice()
            );

            orderItemResponse.setImageUrl(
                    product.getImageUrl()
            );

            orderItemResponse.setItemtotal(
                    product.getPrice()
                            .multiply(
                                    BigDecimal.valueOf(
                                            oir.getQuantity()
                                    )
                            )
            );

            orderTotal = orderTotal.add(orderItemResponse.getItemtotal());

            orderItemResponses.add(orderItemResponse);

            orderItem.setName(product.getName());
            orderItem.setQuantity(oir.getQuantity());
            orderItem.setPrice(product.getPrice());
            orderItem.setOrder(order);
            orderItem.setProductId(
                    oir.getProductId()
            );
            orderItems.add(orderItem);



        }


        OrderResponse orderResponse = new OrderResponse();
        orderResponse.setOrderItemResponses(orderItemResponses);
        orderResponse.setOrderid(orderId);
        orderResponse.setOrderdate(orderdate);

        orderResponse.setOrdertotal(orderTotal);
        orderResponse.setCustomerName(customerName);
        orderResponse.setEta(orderdate.plusDays(10));
        orderResponse.setOrderstatus("ordered");
        orderResponse.setShippingAddress(shippingAddress);
        orderResponse.setPaymentMethod(orderRequest.getPaymentMethod());
        orderResponse.setPaymentstatus("payment successful");


        order.setOrderitems(orderItems);
        order.setTotalPrice(orderTotal);



        orderRepo.save(order);

        OrderEvent orderEvent= new OrderEvent(orderResponse.getOrderid(), OrderEventType.ORDER_CREATED, orderResponse);

        orderEventProducer.sendOrderEvent(orderEvent);



        return orderResponse;







    }

    public Page<OrderResponse> getOrdersByCustomerEmail(
            String customerEmail,
            Pageable pageable
    ) {

        System.out.println(
                "SEARCH EMAIL = [" + customerEmail + "]"
        );

        List<Order> allOrders =
                orderRepo.findAll();

        System.out.println(
                "TOTAL ORDERS = " + allOrders.size()
        );

        for (Order order : allOrders) {

            System.out.println(
                    "ORDER ID = [" + order.getId() + "]"
            );

            System.out.println(
                    "ORDER EMAIL = [" +
                            order.getCustomerEmail() +
                            "]"
            );
        }

        Page<Order> matches =
                orderRepo.findByCustomerEmail(
                        customerEmail,
                        pageable
                );

        System.out.println(
                "MATCHES = " +
                        matches.getTotalElements()
        );

        return matches.map(
                this::mapToOrderResponse
        );
    }



}

