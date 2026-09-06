package com.personalhabitanalytics.backend.controller;

import com.personalhabitanalytics.backend.dto.DeviceTokenRequest;
import com.personalhabitanalytics.backend.entity.DeviceToken;
import com.personalhabitanalytics.backend.service.DeviceTokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/devices")
public class DeviceTokenController {

    private final DeviceTokenService deviceTokenService;

    public DeviceTokenController(
            DeviceTokenService deviceTokenService
    ) {
        this.deviceTokenService = deviceTokenService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerDevice(
            @RequestBody DeviceTokenRequest request,
            Principal principal
    ) {

        DeviceToken deviceToken =
                deviceTokenService.registerDevice(
                        principal.getName(),
                        request
                );

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "message",
                "Device registered successfully"
        );

        response.put(
                "id",
                deviceToken.getId()
        );

        response.put(
                "token",
                deviceToken.getToken()
        );

        response.put(
                "deviceType",
                deviceToken.getDeviceType()
        );

        response.put(
                "active",
                deviceToken.getActive()
        );

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/unregister")
    public ResponseEntity<?> unregisterDevice(
            @RequestParam String token,
            Principal principal
    ) {

        deviceTokenService.deactivateDevice(
                principal.getName(),
                token
        );

        Map<String, String> response =
                new HashMap<>();

        response.put(
                "message",
                "Device unregistered successfully"
        );

        return ResponseEntity.ok(response);
    }
}