package com.quizapp.repository;

import com.quizapp.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUsername(String username);
    
    @Query("SELECT s FROM Student s ORDER BY s.totalPoints DESC")
    List<Student> findAllOrderByTotalPointsDesc();
}