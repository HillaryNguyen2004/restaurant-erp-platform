package com.hcmut.kitchenoperation.port;

import java.time.Instant;

public interface IClock {
    Instant now();
}
