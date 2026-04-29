package com.hcmut.kitchenoperation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KitchenStationResponseDto {
    private String stationId;
    private String name;
    private String stationType;
    private List<String> supportedDishTypes;
    private boolean active;
}
