package com.hcmut.kitchenoperation.port;

import com.hcmut.kitchenoperation.domain.model.Order;
import com.hcmut.kitchenoperation.domain.model.OrderItem;

import java.util.List;

public interface IOrderReader {
    Order getOrder(String orderId);

    List<OrderItem> getOrderItems(String orderId);

    List<OrderItem> getItemsByCourse(String orderId, String courseType);
}
