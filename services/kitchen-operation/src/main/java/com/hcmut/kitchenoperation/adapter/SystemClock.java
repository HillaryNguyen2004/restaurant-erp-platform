package com.hcmut.kitchenoperation.adapter;

import com.hcmut.kitchenoperation.port.IClock;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class SystemClock implements IClock {
    @Override
    public Instant now() {
        return Instant.now();
    }
}
