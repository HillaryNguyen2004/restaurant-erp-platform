package com.hcmut.kitchenoperation.dto;

import lombok.Data;

import java.util.List;

@Data
public class KitchenStationRequestDto {
    private String stationId;
    private String name;
    private String stationType;
    private List<String> supportedDishTypes;
    private Boolean active;
}
