package com.quizapp.controller;

import com.quizapp.dto.QuizQuestion;
import com.quizapp.dto.QuizSubmission;
import com.quizapp.model.Student;
import com.quizapp.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class QuizController {
    
    @Autowired
    private QuizService quizService;
    
    @GetMapping("/topics")
    public List<String> getTopics() {
        return quizService.getTopics();
    }
    
    @GetMapping("/quiz/{topic}")
    public List<QuizQuestion> getQuiz(@PathVariable String topic, @RequestParam String username, @RequestParam(defaultValue = "intermediate") String difficulty) {
        return quizService.getQuizQuestions(topic, username, difficulty);
    }
    
    @PostMapping("/quiz/submit")
    public ResponseEntity<Map<String, Object>> submitQuiz(@RequestBody QuizSubmission submission) {
        try {
            System.out.println("=== QUIZ SUBMISSION START ===");
            System.out.println("Username: " + submission.getUsername());
            System.out.println("Topic: " + submission.getTopic());
            System.out.println("Answers count: " + (submission.getAnswers() != null ? submission.getAnswers().size() : "null"));
            System.out.println("Time taken: " + submission.getTimeTaken());
            
            if (submission.getUsername() == null || submission.getTopic() == null || submission.getAnswers() == null) {
                System.out.println("ERROR: Missing required fields");
                return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields"));
            }
            
            Map<String, Object> result = quizService.submitQuiz(submission);
            System.out.println("=== QUIZ SUBMISSION SUCCESS ===");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.out.println("=== QUIZ SUBMISSION ERROR ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/leaderboard")
    public List<Map<String, Object>> getLeaderboard() {
        return quizService.getLeaderboard();
    }
    
    @GetMapping("/dashboard/{username}")
    public ResponseEntity<Map<String, Object>> getDashboard(@PathVariable String username) {
        try {
            Map<String, Object> dashboard = quizService.getStudentDashboard(username);
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            System.out.println("Dashboard error for user " + username + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    @PostMapping("/admin/clear-cache")
    public ResponseEntity<String> clearCache() {
        quizService.clearQuestionCache();
        return ResponseEntity.ok("Cache cleared successfully");
    }
    
    @PostMapping("/admin/clear-cache/{username}")
    public ResponseEntity<String> clearUserCache(@PathVariable String username) {
        quizService.clearUserQuestionCache(username);
        return ResponseEntity.ok("User cache cleared successfully");
    }
}