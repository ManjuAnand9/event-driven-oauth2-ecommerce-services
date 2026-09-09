package com.microservices.product_service.service;

import com.microservices.product_service.dto.ProductDTO;
import com.microservices.product_service.dto.ProductResponseDTO;
import com.microservices.product_service.exception.ResourceNotFoundException;
import com.microservices.product_service.model.Product;
import com.microservices.product_service.repository.ProductRepo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private S3Service s3Service;


    public Product addProduct(ProductDTO productDTO) {

        Product product = Product.builder()
                .name(productDTO.getName())
                .price(productDTO.getPrice())
                .description(productDTO.getDescription())
                .category(productDTO.getCategory())
                .imageKey(productDTO.getImageKey())
                .build();

        return productRepo.save(product);
    }


    public Product updateProduct(
            Long id,
            ProductDTO productDTO) {

        Product existingProduct =
                productRepo.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product not found with id: " + id
                                )
                        );

        existingProduct.setName(productDTO.getName());
        existingProduct.setPrice(productDTO.getPrice());
        existingProduct.setDescription(productDTO.getDescription());
        existingProduct.setCategory(productDTO.getCategory());

        if (productDTO.getImageKey() != null
                && !productDTO.getImageKey().isBlank()) {

            String oldImageKey =
                    existingProduct.getImageKey();

            existingProduct.setImageKey(
                    productDTO.getImageKey()
            );

            Product updatedProduct =
                    productRepo.save(existingProduct);

            if (oldImageKey != null
                    && !oldImageKey.equals(productDTO.getImageKey())) {

                s3Service.deleteImage(oldImageKey);
            }

            return updatedProduct;
        }

        return productRepo.save(existingProduct);
    }


    public ProductResponseDTO getProductById(Long id) {

        Product product =
                productRepo.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product not found with id: " + id
                                )
                        );

        return mapToResponseDTO(product);
    }


    public Page<ProductResponseDTO> getProducts(
            Pageable pageable) {

        return productRepo.findAll(pageable)
                .map(this::mapToResponseDTO);
    }


    private ProductResponseDTO mapToResponseDTO(
            Product product) {

        ProductResponseDTO dto =
                new ProductResponseDTO();

        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setPrice(product.getPrice());
        dto.setDescription(product.getDescription());
        dto.setCategory(product.getCategory());

        if (product.getImageKey() != null) {

            dto.setImageUrl(
                    s3Service.generateViewUrl(
                            product.getImageKey()
                    )
            );
        }

        return dto;
    }
}