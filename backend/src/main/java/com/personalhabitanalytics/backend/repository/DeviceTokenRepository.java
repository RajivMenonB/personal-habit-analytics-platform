package com.personalhabitanalytics.backend.repository;

import com.personalhabitanalytics.backend.entity.DeviceToken;
import com.personalhabitanalytics.backend.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeviceTokenRepository
        extends JpaRepository<DeviceToken, Long> {

    Optional<DeviceToken> findByToken(String token);

    List<DeviceToken> findByUserAndActiveTrue(User user);

    List<DeviceToken> findByUser(User user);
}