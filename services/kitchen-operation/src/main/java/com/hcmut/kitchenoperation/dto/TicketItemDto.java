package com.hcmut.kitchenoperation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketItemDto {
    private String menuItemName;
    private int quantity;
    private String specialInstructions;
    private List<String> allergyTags;
}
