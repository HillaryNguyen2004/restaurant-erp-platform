package com.hcmut.ordermenu.controller;

import com.hcmut.ordermenu.facade.OrderFacade;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders")
@AllArgsConstructor
public class OrderController {
    @SuppressWarnings("unused")
    private final OrderFacade orderFacade;

    @GetMapping("/health")
    public String health() {
        return "ok";
    }
}
