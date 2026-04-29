package com.hcmut.ordermenu.service.menu;

import com.hcmut.ordermenu.domain.repository.IMenuItemRepository;
import com.hcmut.ordermenu.publisher.MenuEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MenuItemDeleter {
    private final IMenuItemRepository menuItemRepository;
    private final MenuEventPublisher eventPublisher;

    public void delete(UUID itemId) {
        menuItemRepository.delete(itemId);
        eventPublisher.publishMenuItemDeleted(itemId);
    }
}
