package com.hcmut.kitchenoperation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FireCourseResponseDto {
    private String orderId;
    private String courseType;
    private List<String> ticketIds;
    private Instant timestamp;
}
