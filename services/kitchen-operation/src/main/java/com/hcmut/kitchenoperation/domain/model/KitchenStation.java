package com.hcmut.kitchenoperation.domain.model;

import lombok.Getter;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Getter
public class KitchenStation {
    private final String id;
    private final String name;
    private final String stationType;
    private final List<String> supportedDishTypes;
    private boolean isActive;

    public KitchenStation(String id, String name, String stationType, List<String> supportedDishTypes, boolean isActive) {
        this.id = id;
        this.name = name;
        this.stationType = stationType;
        this.supportedDishTypes = new ArrayList<>(supportedDishTypes == null ? List.of() : supportedDishTypes);
        this.isActive = isActive;
    }

    public boolean canHandle(String dishType) {
        if (!isActive || dishType == null || dishType.isBlank()) {
            return false;
        }

        String normalized = dishType.toLowerCase(Locale.ROOT);
        return supportedDishTypes.stream()
                .map(value -> value.toLowerCase(Locale.ROOT))
                .anyMatch(value -> value.equals(normalized));
    }

    public void activate() {
        this.isActive = true;
    }

    public void deactivate() {
        this.isActive = false;
    }
}
