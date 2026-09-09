package com.microservices.customer_service.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;




@Data
@AllArgsConstructor
@NoArgsConstructor

public class CredentialDTO {



    @NotBlank(message = "Credential type is required")
    private String type;
    @Size(min = 8, message = "Password must be at least 8 characters")

    private String value;
    private Boolean temporary;


}
