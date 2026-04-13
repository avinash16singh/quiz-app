package com.quizapp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizapp.dto.QuizQuestion;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GeminiService {

  @Value("${gemini.api.key}")
  private String apiKey;

  @Value("${gemini.api.url}")
  private String apiUrl;

  @Value("${openrouter.api.key:${gemini.api.key:}}")
  private String openRouterApiKey;

  @Value("${openrouter.api.url:https://openrouter.ai/api/v1/chat/completions}")
  private String openRouterApiUrl;

  @Value("${openrouter.api.model:stepfun/step-3.5-flash:free}")
  private String openRouterModel;

  private final RestTemplate restTemplate = new RestTemplate();
  private final ObjectMapper objectMapper = new ObjectMapper();

  public List<QuizQuestion> generateQuestions(String topic, String difficulty) {
    try {
      // Add randomization to generate different questions each time
      String[] styles = { "factual", "analytical", "conceptual" };
      Random random = new Random();
      String difficultyLevel = mapDifficulty(difficulty);
      String style = styles[random.nextInt(styles.length)];

      String prompt = String.format(
        "Generate exactly 15 unique %s level %s multiple choice questions about %s. " +
          "Make questions diverse covering different aspects of %s. " +
          "Ensure each question has 4 distinct options with only one correct answer. " +
          "Return ONLY a valid JSON array in this exact format: " +
          "[{\"question\":\"What is...\",\"options\":[\"Option A\",\"Option B\",\"Option C\",\"Option D\"],\"correctAnswer\":0}] " +
          "No other text, explanations, or formatting - just the JSON array.",
        difficultyLevel,
        style,
        topic,
        topic
      );

      Map<String, Object> requestBody = Map.of(
        "model",
        openRouterModel,
        "messages",
        List.of(Map.of("role", "user", "content", prompt)),
        "reasoning",
        Map.of("enabled", true)
      );

      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      headers.setBearerAuth(openRouterApiKey);

      HttpEntity<Map<String, Object>> entity = new HttpEntity<>(
        requestBody,
        headers
      );

      String url = openRouterApiUrl;
      ResponseEntity<String> response = restTemplate.postForEntity(
        url,
        entity,
        String.class
      );
      System.out.println(
        "OpenRouter API Response Status: " + response.getStatusCode()
      );

      List<QuizQuestion> questions = parseOpenRouterResponse(
        response.getBody()
      );
      if (questions.isEmpty()) {
        System.out.println("Using fallback questions for topic: " + topic);
        return getFallbackQuestions(topic, difficulty);
      }
      System.out.println(
        "Successfully generated " +
          questions.size() +
          " questions for topic: " +
          topic
      );
      return questions;
    } catch (Exception e) {
      System.out.println("OpenRouter API error: " + e.getMessage());
      return getFallbackQuestions(topic, difficulty);
    }
  }

  private List<QuizQuestion> parseOpenRouterResponse(String response) {
    try {
      JsonNode root = objectMapper.readTree(response);
      JsonNode contentNode = root
        .path("choices")
        .path(0)
        .path("message")
        .path("content");
      if (contentNode.isMissingNode() || contentNode.isNull()) {
        System.out.println("No content found in OpenRouter response");
        return new ArrayList<>();
      }

      String content = contentNode.asText();

      System.out.println("OpenRouter response: " + content);

      // Find JSON array in response
      int start = content.indexOf('[');
      int end = content.lastIndexOf(']') + 1;

      if (start == -1 || end <= start) {
        System.out.println("No JSON array found in response");
        return new ArrayList<>();
      }

      String jsonArray = content.substring(start, end);
      System.out.println("Extracted JSON: " + jsonArray);

      JsonNode questions = objectMapper.readTree(jsonArray);
      List<QuizQuestion> result = new ArrayList<>();

      for (JsonNode q : questions) {
        if (q.has("question") && q.has("options") && q.has("correctAnswer")) {
          List<String> options = new ArrayList<>();
          q.path("options").forEach(opt -> options.add(opt.asText()));

          result.add(
            new QuizQuestion(
              q.path("question").asText(),
              options,
              q.path("correctAnswer").asInt()
            )
          );
        }
      }

      System.out.println("Parsed " + result.size() + " questions");
      return result;
    } catch (Exception e) {
      System.out.println("Parse error: " + e.getMessage());
      return new ArrayList<>();
    }
  }

  private String mapDifficulty(String difficulty) {
    switch (difficulty.toLowerCase()) {
      case "novice":
        return "basic";
      case "expert":
        return "advanced";
      default:
        return "intermediate";
    }
  }

  private List<QuizQuestion> getFallbackQuestions(
    String topic,
    String difficulty
  ) {
    Map<String, List<QuizQuestion>> fallbackQuestions = new HashMap<>();

    // Math questions
    fallbackQuestions.put(
      "Math",
      Arrays.asList(
        new QuizQuestion(
          "What is 15 + 27?",
          Arrays.asList("42", "41", "43", "40"),
          0
        ),
        new QuizQuestion(
          "What is the square root of 64?",
          Arrays.asList("8", "6", "7", "9"),
          0
        ),
        new QuizQuestion(
          "What is 12 × 8?",
          Arrays.asList("96", "84", "108", "72"),
          0
        ),
        new QuizQuestion(
          "What is 144 ÷ 12?",
          Arrays.asList("12", "14", "10", "16"),
          0
        ),
        new QuizQuestion("What is 2³?", Arrays.asList("8", "6", "9", "4"), 0)
      )
    );

    // Science questions
    fallbackQuestions.put(
      "Science",
      Arrays.asList(
        new QuizQuestion(
          "What is the chemical symbol for water?",
          Arrays.asList("H2O", "CO2", "O2", "H2"),
          0
        ),
        new QuizQuestion(
          "How many bones are in the human body?",
          Arrays.asList("206", "205", "207", "208"),
          0
        ),
        new QuizQuestion(
          "What planet is closest to the Sun?",
          Arrays.asList("Mercury", "Venus", "Earth", "Mars"),
          0
        ),
        new QuizQuestion(
          "What gas do plants absorb from the atmosphere?",
          Arrays.asList("Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"),
          0
        ),
        new QuizQuestion(
          "What is the speed of light?",
          Arrays.asList(
            "299,792,458 m/s",
            "300,000,000 m/s",
            "250,000,000 m/s",
            "350,000,000 m/s"
          ),
          0
        )
      )
    );

    // History questions
    fallbackQuestions.put(
      "History",
      Arrays.asList(
        new QuizQuestion(
          "In which year did World War II end?",
          Arrays.asList("1945", "1944", "1946", "1943"),
          0
        ),
        new QuizQuestion(
          "Who was the first President of the United States?",
          Arrays.asList(
            "George Washington",
            "Thomas Jefferson",
            "John Adams",
            "Benjamin Franklin"
          ),
          0
        ),
        new QuizQuestion(
          "Which empire was ruled by Julius Caesar?",
          Arrays.asList(
            "Roman Empire",
            "Greek Empire",
            "Egyptian Empire",
            "Persian Empire"
          ),
          0
        ),
        new QuizQuestion(
          "In which year did the Berlin Wall fall?",
          Arrays.asList("1989", "1987", "1991", "1985"),
          0
        ),
        new QuizQuestion(
          "Who wrote the Declaration of Independence?",
          Arrays.asList(
            "Thomas Jefferson",
            "George Washington",
            "John Adams",
            "Benjamin Franklin"
          ),
          0
        )
      )
    );

    // Geography questions
    fallbackQuestions.put(
      "Geography",
      Arrays.asList(
        new QuizQuestion(
          "What is the capital of France?",
          Arrays.asList("Paris", "London", "Berlin", "Madrid"),
          0
        ),
        new QuizQuestion(
          "Which is the largest ocean?",
          Arrays.asList(
            "Pacific Ocean",
            "Atlantic Ocean",
            "Indian Ocean",
            "Arctic Ocean"
          ),
          0
        ),
        new QuizQuestion(
          "What is the longest river in the world?",
          Arrays.asList(
            "Nile River",
            "Amazon River",
            "Mississippi River",
            "Yangtze River"
          ),
          0
        ),
        new QuizQuestion(
          "Which mountain range contains Mount Everest?",
          Arrays.asList("Himalayas", "Andes", "Rocky Mountains", "Alps"),
          0
        ),
        new QuizQuestion(
          "What is the smallest country in the world?",
          Arrays.asList(
            "Vatican City",
            "Monaco",
            "San Marino",
            "Liechtenstein"
          ),
          0
        )
      )
    );

    // Literature questions
    fallbackQuestions.put(
      "Literature",
      Arrays.asList(
        new QuizQuestion(
          "Who wrote 'Romeo and Juliet'?",
          Arrays.asList(
            "William Shakespeare",
            "Charles Dickens",
            "Jane Austen",
            "Mark Twain"
          ),
          0
        ),
        new QuizQuestion(
          "Which novel begins with 'It was the best of times, it was the worst of times'?",
          Arrays.asList(
            "A Tale of Two Cities",
            "Great Expectations",
            "Oliver Twist",
            "David Copperfield"
          ),
          0
        ),
        new QuizQuestion(
          "Who wrote '1984'?",
          Arrays.asList(
            "George Orwell",
            "Aldous Huxley",
            "Ray Bradbury",
            "H.G. Wells"
          ),
          0
        ),
        new QuizQuestion(
          "What is the first book in the Harry Potter series?",
          Arrays.asList(
            "Philosopher's Stone",
            "Chamber of Secrets",
            "Prisoner of Azkaban",
            "Goblet of Fire"
          ),
          0
        ),
        new QuizQuestion(
          "Who wrote 'Pride and Prejudice'?",
          Arrays.asList(
            "Jane Austen",
            "Charlotte Brontë",
            "Emily Brontë",
            "George Eliot"
          ),
          0
        )
      )
    );

    List<QuizQuestion> topicQuestions = fallbackQuestions.get(topic);
    if (topicQuestions == null) {
      // Generic fallback if topic not found
      List<QuizQuestion> questions = new ArrayList<>();
      for (int i = 1; i <= 15; i++) {
        questions.add(
          new QuizQuestion(
            String.format("Sample %s question %d?", topic, i),
            Arrays.asList("Option A", "Option B", "Option C", "Option D"),
            0
          )
        );
      }
      return questions;
    }

    // Duplicate questions to reach 15 total
    List<QuizQuestion> result = new ArrayList<>();
    for (int i = 0; i < 15; i++) {
      result.add(topicQuestions.get(i % topicQuestions.size()));
    }
    return result;
  }
}
