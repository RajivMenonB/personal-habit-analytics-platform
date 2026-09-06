package com.personalhabitanalytics.backend.service;

import com.personalhabitanalytics.backend.dto.DeviceTokenRequest;
import com.personalhabitanalytics.backend.entity.DeviceToken;
import com.personalhabitanalytics.backend.entity.User;
import com.personalhabitanalytics.backend.repository.DeviceTokenRepository;
import com.personalhabitanalytics.backend.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DeviceTokenService {

    private final DeviceTokenRepository deviceTokenRepository;
    private final UserRepository userRepository;

    public DeviceTokenService(
            DeviceTokenRepository deviceTokenRepository,
            UserRepository userRepository
    ) {
        this.deviceTokenRepository = deviceTokenRepository;
        this.userRepository = userRepository;
    }


    // ============================================================
    // REGISTER / UPDATE DEVICE
    // ============================================================

    @Transactional
    public synchronized DeviceToken registerDevice(
            String email,
            DeviceTokenRequest request
    ) {

        // --------------------------------------------------------
        // Validate request
        // --------------------------------------------------------

        if (request == null ||
                request.getToken() == null ||
                request.getToken().isBlank()) {

            throw new IllegalArgumentException(
                    "Firebase FCM token is required"
            );
        }


        // --------------------------------------------------------
        // Find logged-in user
        // --------------------------------------------------------

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );


        // --------------------------------------------------------
        // Clean token
        // --------------------------------------------------------

        String token =
                request.getToken().trim();


        // ========================================================
        // CHECK WHETHER TOKEN ALREADY EXISTS
        // ========================================================

        DeviceToken deviceToken =
                deviceTokenRepository
                        .findByToken(token)
                        .orElse(null);


        // ========================================================
        // EXISTING DEVICE
        // ========================================================

        if (deviceToken != null) {

            System.out.println(
                    "Existing device token found. Updating device..."
            );

            // -----------------------------------------------
            // Update owner
            // -----------------------------------------------

            deviceToken.setUser(user);


            // -----------------------------------------------
            // Update device type
            // -----------------------------------------------

            if (request.getDeviceType() != null &&
                    !request.getDeviceType().isBlank()) {

                deviceToken.setDeviceType(
                        request.getDeviceType().trim()
                );

            } else {

                deviceToken.setDeviceType("WEB");
            }


            // -----------------------------------------------
            // Reactivate device
            // -----------------------------------------------

            deviceToken.setActive(true);


            // -----------------------------------------------
            // Save existing device
            // -----------------------------------------------

            DeviceToken savedDevice =
                    deviceTokenRepository.save(deviceToken);


            System.out.println(
                    "Existing device updated successfully. ID: "
                            + savedDevice.getId()
            );

            return savedDevice;
        }


        // ========================================================
        // NEW DEVICE
        // ========================================================

        System.out.println(
                "New device token detected. Creating device..."
        );


        deviceToken =
                new DeviceToken();


        // --------------------------------------------------------
        // Set user
        // --------------------------------------------------------

        deviceToken.setUser(user);


        // --------------------------------------------------------
        // Set token
        // --------------------------------------------------------

        deviceToken.setToken(token);


        // --------------------------------------------------------
        // Set device type
        // --------------------------------------------------------

        if (request.getDeviceType() != null &&
                !request.getDeviceType().isBlank()) {

            deviceToken.setDeviceType(
                    request.getDeviceType().trim()
            );

        } else {

            deviceToken.setDeviceType("WEB");
        }


        // --------------------------------------------------------
        // Activate device
        // --------------------------------------------------------

        deviceToken.setActive(true);


        // --------------------------------------------------------
        // Save new device
        // --------------------------------------------------------

        DeviceToken savedDevice =
                deviceTokenRepository.save(deviceToken);


        System.out.println(
                "New device registered successfully. ID: "
                        + savedDevice.getId()
        );


        return savedDevice;
    }


    // ============================================================
    // DEACTIVATE DEVICE
    // ============================================================

    @Transactional
    public void deactivateDevice(
            String email,
            String token
    ) {

        // --------------------------------------------------------
        // Validate token
        // --------------------------------------------------------

        if (token == null || token.isBlank()) {

            throw new IllegalArgumentException(
                    "Device token is required"
            );
        }


        // --------------------------------------------------------
        // Find user
        // --------------------------------------------------------

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );


        // --------------------------------------------------------
        // Find device
        // --------------------------------------------------------

        DeviceToken deviceToken =
                deviceTokenRepository
                        .findByToken(token.trim())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Device token not found"
                                )
                        );


        // --------------------------------------------------------
        // Ownership check
        // --------------------------------------------------------

        if (!deviceToken.getUser().getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You do not own this device"
            );
        }


        // --------------------------------------------------------
        // Deactivate
        // --------------------------------------------------------

        deviceToken.setActive(false);


        deviceTokenRepository.save(
                deviceToken
        );


        System.out.println(
                "Device deactivated successfully. ID: "
                        + deviceToken.getId()
        );
    }


    // ============================================================
    // GET MY DEVICES
    // ============================================================

    @Transactional(readOnly = true)
    public List<DeviceToken> getMyDevices(
            String email
    ) {

        // --------------------------------------------------------
        // Find user
        // --------------------------------------------------------

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );


        // --------------------------------------------------------
        // Return devices
        // --------------------------------------------------------

        return deviceTokenRepository
                .findByUser(user);
    }
}