package com.quizapp.repository;

import com.quizapp.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BadgeRepository extends JpaRepository<Badge, Long> {
    List<Badge> findByStudentIdOrderByEarnedAtDesc(Long studentId);
    boolean existsByStudentIdAndName(Long studentId, String name);
}