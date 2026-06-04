package com.ecommerce.service;

import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.model.*;
import com.ecommerce.repository.*;
import lombok.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public CartDTO getCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "userId", userId));
        return toDTO(cart);
    }

    public CartDTO addToCart(Long userId, Long productId, int quantity) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "userId", userId));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (product.getStockQuantity() < quantity) {
            throw new BadRequestException("Insufficient stock");
        }

        Optional<CartItem> existing = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst();

        if (existing.isPresent()) {
            existing.get().setQuantity(existing.get().getQuantity() + quantity);
        } else {
            CartItem item = CartItem.builder().cart(cart).product(product).quantity(quantity).build();
            cart.getItems().add(item);
        }

        return toDTO(cartRepository.save(cart));
    }

    public CartDTO removeFromCart(Long userId, Long productId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "userId", userId));
        cart.getItems().removeIf(i -> i.getProduct().getId().equals(productId));
        return toDTO(cartRepository.save(cart));
    }

    public CartDTO clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "userId", userId));
        cart.getItems().clear();
        return toDTO(cartRepository.save(cart));
    }

    private CartDTO toDTO(Cart cart) {
        List<CartDTO.CartItemDTO> items = cart.getItems().stream()
                .map(i -> new CartDTO.CartItemDTO(
                        i.getProduct().getId(),
                        i.getProduct().getName(),
                        i.getProduct().getPrice(),
                        i.getQuantity(),
                        i.getProduct().getPrice().multiply(BigDecimal.valueOf(i.getQuantity()))
                )).collect(Collectors.toList());

        return new CartDTO(cart.getId(), items, cart.getTotalAmount());
    }

    @Data
    @AllArgsConstructor
    public static class CartDTO {
        private Long cartId;
        private List<CartItemDTO> items;
        private BigDecimal totalAmount;

        @Data
        @AllArgsConstructor
        public static class CartItemDTO {
            private Long productId;
            private String productName;
            private BigDecimal price;
            private Integer quantity;
            private BigDecimal subtotal;
        }
    }
}
