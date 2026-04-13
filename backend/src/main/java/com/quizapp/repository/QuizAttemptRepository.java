package com.quizapp.repository;

import com.quizapp.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByStudentIdOrderByCompletedAtDesc(Long studentId);
    List<QuizAttempt> findByStudentIdAndTopic(Long studentId, String topic);
}