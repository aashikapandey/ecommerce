package com.ecommerce.controller;

import com.ecommerce.repository.UserRepository;
import com.ecommerce.service.CartService;
import com.ecommerce.service.CartService.CartDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "Shopping cart APIs")
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get current user's cart")
    public ResponseEntity<CartDTO> getCart(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(cartService.getCart(getUserId(userDetails)));
    }

    @PostMapping("/add")
    @Operation(summary = "Add product to cart")
    public ResponseEntity<CartDTO> addToCart(@AuthenticationPrincipal UserDetails userDetails,
                                              @RequestParam Long productId,
                                              @RequestParam(defaultValue = "1") int quantity) {
        return ResponseEntity.ok(cartService.addToCart(getUserId(userDetails), productId, quantity));
    }

    @DeleteMapping("/remove/{productId}")
    @Operation(summary = "Remove product from cart")
    public ResponseEntity<CartDTO> removeFromCart(@AuthenticationPrincipal UserDetails userDetails,
                                                   @PathVariable Long productId) {
        return ResponseEntity.ok(cartService.removeFromCart(getUserId(userDetails), productId));
    }

    @DeleteMapping("/clear")
    @Operation(summary = "Clear the cart")
    public ResponseEntity<CartDTO> clearCart(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(cartService.clearCart(getUserId(userDetails)));
    }

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
    }
}
