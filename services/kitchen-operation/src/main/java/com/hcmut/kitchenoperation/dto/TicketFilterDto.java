package com.hcmut.kitchenoperation.dto;

import lombok.Data;

import java.util.List;

@Data
public class TicketFilterDto {
    private List<String> statuses;
    private String courseType;
    private String sortBy = "priority";
}
