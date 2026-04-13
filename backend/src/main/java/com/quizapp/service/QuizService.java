package com.quizapp.service;

import com.quizapp.dto.QuizQuestion;
import com.quizapp.dto.QuizSubmission;
import com.quizapp.model.*;
import com.quizapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class QuizService {
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private QuizAttemptRepository quizAttemptRepository;
    
    @Autowired
    private BadgeRepository badgeRepository;
    
    @Autowired
    private GeminiService geminiService;
    
    private final List<String> TOPICS = Arrays.asList("Math", "Science", "History", "Geography", "Literature", "C++", "Java", "Python");
    
    public List<String> getTopics() {
        return TOPICS;
    }
    
    public List<QuizQuestion> getQuizQuestions(String topic, String username, String difficulty) {
        if (!TOPICS.contains(topic)) {
            throw new IllegalArgumentException("Invalid topic: " + topic);
        }
        
        String cacheKey = username + "_" + topic + "_" + difficulty;
        
        // Check if questions already exist for this user, topic and difficulty
        if (questionCache.containsKey(cacheKey)) {
            return questionCache.get(cacheKey);
        }
        
        // Generate new questions and cache them
        List<QuizQuestion> questions = geminiService.generateQuestions(topic, difficulty);
        questionCache.put(cacheKey, questions);
        return questions;
    }
    
    private Map<String, List<QuizQuestion>> questionCache = new HashMap<>();
    
    public Map<String, Object> submitQuiz(QuizSubmission submission) {
        Student student = studentRepository.findByUsername(submission.getUsername())
            .orElseGet(() -> studentRepository.save(new Student(submission.getUsername())));
        
        // Try to find questions in cache with any difficulty level
        List<QuizQuestion> questions = null;
        String baseKey = submission.getUsername() + "_" + submission.getTopic();
        
        // Look for cache keys that start with username_topic
        for (String key : questionCache.keySet()) {
            if (key.startsWith(baseKey)) {
                questions = questionCache.get(key);
                System.out.println("Found questions in cache with key: " + key);
                break;
            }
        }
        
        if (questions == null) {
            System.out.println("No questions found in cache, generating new ones");
            questions = geminiService.generateQuestions(submission.getTopic(), "intermediate");
        }
        
        int correctAnswers = 0;
        for (int i = 0; i < Math.min(questions.size(), submission.getAnswers().size()); i++) {
            if (questions.get(i).getCorrectAnswer() == submission.getAnswers().get(i)) {
                correctAnswers++;
            }
        }
        
        // Keep questions in cache until explicitly cleared
        // questionCache.remove(cacheKey);
        
        int basePoints = correctAnswers * 10;
        int timeBonus = Math.max(0, 300 - (int)submission.getTimeTaken()) / 10;
        int totalPoints = basePoints + timeBonus;
        
        student.setTotalPoints(student.getTotalPoints() + totalPoints);
        student.setQuizCount(student.getQuizCount() + 1);
        studentRepository.save(student);
        
        QuizAttempt attempt = new QuizAttempt(student, submission.getTopic(), correctAnswers, questions.size(), totalPoints);
        quizAttemptRepository.save(attempt);
        
        checkAndAwardBadges(student, submission.getTopic(), correctAnswers, questions.size());
        
        Map<String, Object> result = new HashMap<>();
        result.put("score", correctAnswers);
        result.put("totalQuestions", questions.size());
        result.put("pointsEarned", totalPoints);
        result.put("percentage", (correctAnswers * 100.0) / questions.size());
        
        return result;
    }
    
    private void checkAndAwardBadges(Student student, String topic, int score, int total) {
        // First Quiz Badge
        if (!badgeRepository.existsByStudentIdAndName(student.getId(), "First Quiz")) {
            badgeRepository.save(new Badge(student, "First Quiz", "Completed your first quiz"));
        }
        
        // Perfect Score Badge
        if (score == total && !badgeRepository.existsByStudentIdAndName(student.getId(), "Perfect Score")) {
            badgeRepository.save(new Badge(student, "Perfect Score", "Achieved 100% on a quiz"));
        }
        
        // Topic Master Badge
        List<QuizAttempt> topicAttempts = quizAttemptRepository.findByStudentIdAndTopic(student.getId(), topic);
        if (topicAttempts.size() >= 3 && !badgeRepository.existsByStudentIdAndName(student.getId(), topic + " Master")) {
            badgeRepository.save(new Badge(student, topic + " Master", "Completed 3 quizzes in " + topic));
        }
        
        // High Scorer Badge
        if (student.getTotalPoints() >= 1000 && !badgeRepository.existsByStudentIdAndName(student.getId(), "High Scorer")) {
            badgeRepository.save(new Badge(student, "High Scorer", "Earned 1000+ total points"));
        }
    }
    
    public List<Map<String, Object>> getLeaderboard() {
        List<Student> students = studentRepository.findAllOrderByTotalPointsDesc();
        List<Map<String, Object>> leaderboard = new ArrayList<>();
        
        for (Student student : students) {
            Map<String, Object> studentData = new HashMap<>();
            studentData.put("id", student.getId());
            studentData.put("username", student.getUsername());
            studentData.put("totalPoints", student.getTotalPoints());
            studentData.put("quizCount", student.getQuizCount());
            leaderboard.add(studentData);
        }
        
        return leaderboard;
    }
    
    public Map<String, Object> getStudentDashboard(String username) {
        Optional<Student> studentOpt = studentRepository.findByUsername(username);
        
        if (studentOpt.isEmpty()) {
            // Return empty dashboard for new user
            Map<String, Object> studentData = new HashMap<>();
            studentData.put("id", null);
            studentData.put("username", username);
            studentData.put("totalPoints", 0);
            studentData.put("quizCount", 0);
            
            Map<String, Object> dashboard = new HashMap<>();
            dashboard.put("student", studentData);
            dashboard.put("attempts", new ArrayList<>());
            dashboard.put("badges", new ArrayList<>());
            dashboard.put("leaderboardPosition", 0);
            return dashboard;
        }
        
        Student student = studentOpt.get();
        
        // Create simple student data
        Map<String, Object> studentData = new HashMap<>();
        studentData.put("id", student.getId());
        studentData.put("username", student.getUsername());
        studentData.put("totalPoints", student.getTotalPoints());
        studentData.put("quizCount", student.getQuizCount());
        
        // Get simple attempt data without relationships
        List<Map<String, Object>> simpleAttempts = new ArrayList<>();
        List<QuizAttempt> attempts = quizAttemptRepository.findByStudentIdOrderByCompletedAtDesc(student.getId());
        for (QuizAttempt attempt : attempts) {
            Map<String, Object> attemptData = new HashMap<>();
            attemptData.put("topic", attempt.getTopic());
            attemptData.put("score", attempt.getScore());
            attemptData.put("totalQuestions", attempt.getTotalQuestions());
            attemptData.put("pointsEarned", attempt.getPointsEarned());
            attemptData.put("completedAt", attempt.getCompletedAt());
            simpleAttempts.add(attemptData);
        }
        
        // Get simple badge data without relationships
        List<Map<String, Object>> simpleBadges = new ArrayList<>();
        List<Badge> badges = badgeRepository.findByStudentIdOrderByEarnedAtDesc(student.getId());
        for (Badge badge : badges) {
            Map<String, Object> badgeData = new HashMap<>();
            badgeData.put("name", badge.getName());
            badgeData.put("description", badge.getDescription());
            badgeData.put("earnedAt", badge.getEarnedAt());
            simpleBadges.add(badgeData);
        }
        
        // Calculate leaderboard position
        List<Map<String, Object>> leaderboard = getLeaderboard();
        int position = 0;
        for (int i = 0; i < leaderboard.size(); i++) {
            if (leaderboard.get(i).get("id").equals(student.getId())) {
                position = i + 1;
                break;
            }
        }
        
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("student", studentData);
        dashboard.put("attempts", simpleAttempts);
        dashboard.put("badges", simpleBadges);
        dashboard.put("leaderboardPosition", position);
        
        return dashboard;
    }
    
    public void clearQuestionCache() {
        questionCache.clear();
    }
    
    public void clearUserQuestionCache(String username) {
        questionCache.entrySet().removeIf(entry -> entry.getKey().startsWith(username + "_"));
    }
}