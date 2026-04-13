package com.quizapp.dto;

import java.util.List;

public class QuizSubmission {
    private String username;
    private String topic;
    private List<Integer> answers;
    private long timeTaken; // in seconds
    
    public QuizSubmission() {}
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    
    public List<Integer> getAnswers() { return answers; }
    public void setAnswers(List<Integer> answers) { this.answers = answers; }
    
    public long getTimeTaken() { return timeTaken; }
    public void setTimeTaken(long timeTaken) { this.timeTaken = timeTaken; }
}