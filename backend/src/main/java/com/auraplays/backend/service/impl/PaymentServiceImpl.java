package com.auraplays.backend.service.impl;

import com.auraplays.backend.dto.request.PaymentVerificationRequest;
import com.auraplays.backend.dto.response.PaymentResponse;
import com.auraplays.backend.entity.Booking;
import com.auraplays.backend.entity.Payment;
import com.auraplays.backend.entity.enums.BookingStatus;
import com.auraplays.backend.entity.enums.PaymentStatus;
import com.auraplays.backend.exception.BadRequestException;
import com.auraplays.backend.exception.ResourceNotFoundException;
import com.auraplays.backend.exception.UnauthorizedException;
import com.auraplays.backend.repository.BookingRepository;
import com.auraplays.backend.repository.PaymentRepository;
import com.auraplays.backend.service.PaymentService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    @Value("${razorpay.key.id:mock}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:mock}")
    private String razorpayKeySecret;

    @Override
    @Transactional
    public PaymentResponse createPaymentOrder(Long bookingId, String customerEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (!booking.getCustomer().getEmail().equals(customerEmail)) {
            throw new UnauthorizedException("You are not authorized to pay for this booking");
        }

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new BadRequestException("Booking must be approved before payment can be made");
        }

        // Check if payment already exists
        Payment existingPayment = paymentRepository.findByBookingId(bookingId).orElse(null);
        if (existingPayment != null && existingPayment.getStatus() == PaymentStatus.SUCCESS) {
            throw new BadRequestException("Payment already completed for this booking");
        }

        String orderId;
        if ("mock".equals(razorpayKeyId)) {
            orderId = "order_mock_" + UUID.randomUUID().toString().substring(0, 8);
        } else {
            try {
                RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
                JSONObject orderRequest = new JSONObject();
                // amount in paise
                orderRequest.put("amount", booking.getTotalAmount().multiply(new BigDecimal("100")).intValue());
                orderRequest.put("currency", "INR");
                orderRequest.put("receipt", "receipt_booking_" + bookingId);
                Order order = razorpay.orders.create(orderRequest);
                orderId = order.get("id");
            } catch (RazorpayException e) {
                throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage());
            }
        }

        Payment payment = existingPayment != null ? existingPayment : new Payment();
        payment.setBooking(booking);
        payment.setAmount(booking.getTotalAmount());
        payment.setGatewayOrderId(orderId);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setPaymentReference(UUID.randomUUID().toString());
        paymentRepository.save(payment);

        return PaymentResponse.builder()
                .gatewayOrderId(orderId)
                .amount(booking.getTotalAmount())
                .currency("INR")
                .keyId(razorpayKeyId)
                .build();
    }

    @Override
    @Transactional
    public void verifyPayment(PaymentVerificationRequest request, String customerEmail) {
        Payment payment = paymentRepository.findByBookingId(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "bookingId", request.getBookingId()));

        Booking booking = payment.getBooking();
        if (!booking.getCustomer().getEmail().equals(customerEmail)) {
            throw new UnauthorizedException("Not authorized");
        }

        if (!"mock".equals(razorpayKeyId)) {
            try {
                JSONObject options = new JSONObject();
                options.put("razorpay_order_id", request.getRazorpayOrderId());
                options.put("razorpay_payment_id", request.getRazorpayPaymentId());
                options.put("razorpay_signature", request.getRazorpaySignature());

                boolean status = Utils.verifyPaymentSignature(options, razorpayKeySecret);
                if (!status) {
                    payment.setStatus(PaymentStatus.FAILED);
                    paymentRepository.save(payment);
                    throw new BadRequestException("Payment signature verification failed");
                }
            } catch (RazorpayException e) {
                throw new RuntimeException("Error verifying payment signature", e);
            }
        }

        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setGatewayPaymentId(request.getRazorpayPaymentId());
        paymentRepository.save(payment);

        booking.setStatus(BookingStatus.CONFIRMED);
        
        // Ensure slot is locked (if it wasn't already locked by auto-approve)
        booking.getSlot().setAvailable(false);
        
        bookingRepository.save(booking);
    }
}
