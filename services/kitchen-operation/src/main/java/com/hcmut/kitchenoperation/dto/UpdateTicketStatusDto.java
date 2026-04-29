package com.hcmut.kitchenoperation.dto;

import lombok.Data;

@Data
public class UpdateTicketStatusDto {
    private String newStatus;
    private String changedByUserId;
}
