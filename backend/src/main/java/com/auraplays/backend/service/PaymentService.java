package com.auraplays.backend.service;

import com.auraplays.backend.dto.request.PaymentVerificationRequest;
import com.auraplays.backend.dto.response.PaymentResponse;

public interface PaymentService {
    PaymentResponse createPaymentOrder(Long bookingId, String customerEmail);
    void verifyPayment(PaymentVerificationRequest request, String customerEmail);
}
