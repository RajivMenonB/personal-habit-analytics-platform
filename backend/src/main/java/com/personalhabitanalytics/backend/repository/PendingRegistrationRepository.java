package com.personalhabitanalytics.backend.repository;

import com.personalhabitanalytics.backend.entity.PendingRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PendingRegistrationRepository
        extends JpaRepository<PendingRegistration, Long> {

    Optional<PendingRegistration> findByEmail(
            String email
    );

    @Modifying
    @Query(
        "DELETE FROM PendingRegistration p " +
        "WHERE p.email = :email"
    )
    int deleteByEmail(
            @Param("email") String email
    );
}