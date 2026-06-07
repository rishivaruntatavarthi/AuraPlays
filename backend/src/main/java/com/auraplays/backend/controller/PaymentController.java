package com.auraplays.backend.controller;

import com.auraplays.backend.dto.request.PaymentVerificationRequest;
import com.auraplays.backend.dto.response.PaymentResponse;
import com.auraplays.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order/{bookingId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentResponse> createOrder(
            @PathVariable Long bookingId,
            Principal principal) {
        return ResponseEntity.ok(paymentService.createPaymentOrder(bookingId, principal.getName()));
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<String> verifyPayment(
            @RequestBody PaymentVerificationRequest request,
            Principal principal) {
        paymentService.verifyPayment(request, principal.getName());
        return ResponseEntity.ok("Payment verified and booking confirmed successfully");
    }
}
