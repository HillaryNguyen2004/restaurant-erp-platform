package com.hcmut.kitchenoperation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketListResponseDto {
    private List<TicketDetailResponseDto> tickets;
    private long totalCount;
}
