package com.hcmut.ordermenu.controller;

import com.hcmut.ordermenu.dto.CreatePromotionRequest;
import com.hcmut.ordermenu.dto.PromotionDto;
import com.hcmut.ordermenu.dto.UpdatePromotionRequest;
import com.hcmut.ordermenu.facade.PromotionFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/promotions")
@RequiredArgsConstructor
public class PromotionApi {
    private final PromotionFacade facade;

    @PostMapping
    public PromotionDto createPromotion(@RequestBody CreatePromotionRequest request) {
        return facade.createPromotion(request);
    }

    @PutMapping("/{promoId}")
    public PromotionDto updatePromotion(@PathVariable UUID promoId, @RequestBody UpdatePromotionRequest request) {
        return facade.updatePromotion(promoId, request);
    }

    @GetMapping("/active")
    public List<PromotionDto> getActivePromotions() {
        return facade.getActivePromotions();
    }

    @DeleteMapping("/{promoId}")
    public void deletePromotion(@PathVariable UUID promoId) {
        facade.deletePromotion(promoId);
    }
}
