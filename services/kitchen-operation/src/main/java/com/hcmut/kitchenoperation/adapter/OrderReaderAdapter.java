package com.hcmut.kitchenoperation.adapter;

import com.hcmut.kitchenoperation.domain.model.Order;
import com.hcmut.kitchenoperation.domain.model.OrderItem;
import com.hcmut.kitchenoperation.port.IOrderReader;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;

@Component
@RequiredArgsConstructor
public class OrderReaderAdapter implements IOrderReader {
    private final OrderServiceClient orderServiceClient;

    @Override
    public Order getOrder(String orderId) {
        return mapToOrder(orderServiceClient.getOrder(orderId));
    }

    @Override
    public List<OrderItem> getOrderItems(String orderId) {
        return mapToOrderItems(orderServiceClient.getOrderItems(orderId));
    }

    @Override
    public List<OrderItem> getItemsByCourse(String orderId, String courseType) {
        return getOrderItems(orderId).stream()
                .filter(item -> item.getCourseType().toUpperCase(Locale.ROOT).equals(courseType.toUpperCase(Locale.ROOT)))
                .toList();
    }

    private Order mapToOrder(OrderServiceClient.OrderSnapshot snapshot) {
        return new Order(
                snapshot.orderId(),
                snapshot.tableNumber(),
                snapshot.orderStatus(),
                snapshot.specialInstructions(),
                snapshot.createdAt()
        );
    }

    private List<OrderItem> mapToOrderItems(List<OrderServiceClient.OrderItemSnapshot> items) {
        return items.stream().map(item -> new OrderItem(
                item.orderItemId(),
                item.menuItemId(),
                item.menuItemName(),
                item.dishType(),
                item.courseType(),
                item.quantity(),
                item.specialInstructions(),
                item.allergyTags(),
                item.prepTimeMinutes()
        )).toList();
    }
}
