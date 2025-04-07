package com.boardshoot.boardshoot.controllers;

import com.boardshoot.boardshoot.model.User;
import com.boardshoot.boardshoot.repository.UserRepository;
import com.boardshoot.boardshoot.security.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping(value = "/signup", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> registerUser(@RequestBody User signUpRequest) {
        logger.info("Registration request received for user: {}", signUpRequest.getUsername());
        
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            logger.warn("Username already taken: {}", signUpRequest.getUsername());
            return ResponseEntity
                    .badRequest()
                    .body("{\"error\": \"Username is already taken\"}");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            logger.warn("Email already in use: {}", signUpRequest.getEmail());
            return ResponseEntity
                    .badRequest()
                    .body("{\"error\": \"Email already in use\"}");
        }

        User user = new User(
            signUpRequest.getUsername(), 
            passwordEncoder.encode(signUpRequest.getPassword()),
            signUpRequest.getEmail()
        );

        userRepository.save(user);
        logger.info("User registered successfully: {}", user.getUsername());

        // Generate JWT token for immediate login after signup
        String jwt = jwtUtils.generateJwtToken(user.getUsername());
        
        // Return token and user info
        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("user", mapUserToResponse(user));
        
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/login", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> authenticateUser(@RequestBody User loginRequest) {
        logger.info("Login attempt for user: {}", loginRequest.getUsername());
        
        try {
            User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                logger.warn("Invalid password for user: {}", loginRequest.getUsername());
                return ResponseEntity
                    .badRequest()
                    .body("{\"error\": \"Invalid credentials\"}");
            }
            
            String jwt = jwtUtils.generateJwtToken(user.getUsername());
            logger.info("User logged in successfully: {}", user.getUsername());

            // Return token and user info
            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("user", mapUserToResponse(user));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Login error: {}", e.getMessage(), e);
            return ResponseEntity
                .badRequest()
                .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
    
    @GetMapping(value = "/profile", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getUserProfile(@RequestHeader("Authorization") String token) {
        try {
            logger.info("Profile request received with token");
            
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                
                if (jwtUtils.validateJwtToken(token)) {
                    String username = jwtUtils.getUserNameFromJwtToken(token);
                    User user = userRepository.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("User not found"));
                    
                    logger.info("Profile fetched for user: {}", username);
                    return ResponseEntity.ok(mapUserToResponse(user));
                }
            }
            
            logger.warn("Invalid token for profile request");
            return ResponseEntity.badRequest().body("{\"error\": \"Invalid token\"}");
        } catch (Exception e) {
            logger.error("Profile error: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok("Server is running");
    }
    
    private Map<String, Object> mapUserToResponse(User user) {
        Map<String, Object> userResponse = new HashMap<>();
        userResponse.put("id", user.getId());
        userResponse.put("username", user.getUsername());
        userResponse.put("email", user.getEmail());
        // Don't include password
        return userResponse;
    }
}