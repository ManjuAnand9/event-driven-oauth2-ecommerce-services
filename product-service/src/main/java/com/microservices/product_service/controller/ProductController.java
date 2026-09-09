package com.microservices.product_service.controller;

import com.microservices.product_service.dto.ProductDTO;
import com.microservices.product_service.dto.ProductResponseDTO;
import com.microservices.product_service.model.Product;
import com.microservices.product_service.service.ProductService;
import com.microservices.product_service.service.S3Service;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private S3Service s3Service;


    @PostMapping("/product-image/upload-url")
    public ResponseEntity<S3Service.PresignedUpload> generateUploadUrl(
            @RequestBody UploadUrlRequest request) {

        S3Service.PresignedUpload upload =
                s3Service.generateUploadUrl(
                        request.fileName(),
                        request.contentType()
                );

        return ResponseEntity.ok(upload);
    }


    @PostMapping("/addproduct")
    public ResponseEntity<Product> addProduct(
            @Valid @RequestBody ProductDTO productDTO) {

        Product newProduct =
                productService.addProduct(productDTO);

        return new ResponseEntity<>(
                newProduct,
                HttpStatus.CREATED
        );
    }


    @PutMapping("/updateproduct/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductDTO productDTO) {

        Product updatedProduct =
                productService.updateProduct(
                        id,
                        productDTO
                );

        return ResponseEntity.ok(updatedProduct);
    }


    @GetMapping("/getproduct/{id}")
    public ResponseEntity<ProductResponseDTO> getProductById(
            @PathVariable Long id) {

        ProductResponseDTO product =
                productService.getProductById(id);

        return ResponseEntity.ok(product);
    }


    @GetMapping("/products")
    public Page<ProductResponseDTO> getProducts(
            Pageable pageable) {

        return productService.getProducts(pageable);
    }


    public record UploadUrlRequest(
            String fileName,
            String contentType
    ) {
    }
}