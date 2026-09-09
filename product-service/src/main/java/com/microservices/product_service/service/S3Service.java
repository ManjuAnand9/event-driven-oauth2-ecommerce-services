package com.microservices.product_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.time.Duration;
import java.util.UUID;

@Service
public class S3Service {

    private final S3Presigner s3Presigner;
    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    public S3Service(S3Presigner s3Presigner, S3Client s3Client ) {
        this.s3Presigner = s3Presigner;
        this.s3Client = s3Client;


    }


    public PresignedUpload generateUploadUrl(
            String fileName,
            String contentType
    ) {

        String imageKey =
                "products/"
                        + UUID.randomUUID()
                        + "-"
                        + fileName;


        PutObjectRequest putObjectRequest =
                PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(imageKey)
                        .contentType(contentType)
                        .build();


        PutObjectPresignRequest presignRequest =
                PutObjectPresignRequest.builder()
                        .signatureDuration(
                                Duration.ofMinutes(10)
                        )
                        .putObjectRequest(
                                putObjectRequest
                        )
                        .build();


        PresignedPutObjectRequest presignedRequest =
                s3Presigner.presignPutObject(
                        presignRequest
                );


        return new PresignedUpload(
                imageKey,
                presignedRequest.url().toString()
        );
    }


    public record PresignedUpload(
            String imageKey,
            String uploadUrl
    ) {}

    public String generateViewUrl(String imageKey) {

        GetObjectRequest getObjectRequest =
                GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(imageKey)
                        .build();

        GetObjectPresignRequest presignRequest =
                GetObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofMinutes(15))
                        .getObjectRequest(getObjectRequest)
                        .build();

        PresignedGetObjectRequest presignedRequest =
                s3Presigner.presignGetObject(presignRequest);

        return presignedRequest.url().toString();
    }


    public void deleteImage(String imageKey) {

        if (imageKey == null || imageKey.isBlank()) {
            return;
        }

        DeleteObjectRequest request =
                DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(imageKey)
                        .build();

        s3Client.deleteObject(request);
    }
}