package com.example.englishlearning.dto.payment;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddCartItemRequest {

    @NotNull
    private Long courseId;
}
