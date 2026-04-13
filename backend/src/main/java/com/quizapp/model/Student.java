package com.quizapp.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    private int totalPoints = 0;
    @Column(columnDefinition = "integer default 0")
    private int quizCount = 0;
    
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<QuizAttempt> quizAttempts;
    
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<Badge> badges;
    
    public Student() {}
    
    public Student(String username) {
        this.username = username;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public int getTotalPoints() { return totalPoints; }
    public void setTotalPoints(int totalPoints) { this.totalPoints = totalPoints; }
    
    public int getQuizCount() { return quizCount; }
    public void setQuizCount(int quizCount) { this.quizCount = quizCount; }
    
    public List<QuizAttempt> getQuizAttempts() { return quizAttempts; }
    public void setQuizAttempts(List<QuizAttempt> quizAttempts) { this.quizAttempts = quizAttempts; }
    
    public List<Badge> getBadges() { return badges; }
    public void setBadges(List<Badge> badges) { this.badges = badges; }
}