package com.boardshoot.boardshoot.controllers;

import com.boardshoot.boardshoot.model.User;
import com.boardshoot.boardshoot.service.UserCacheService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/redis-test")
public class RedisTestController {
    
    private static final Logger logger = LoggerFactory.getLogger(RedisTestController.class);
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private UserCacheService userCacheService;
    
    @GetMapping("/ping")
    public ResponseEntity<?> testRedisConnection() {
        try {
            logger.info("Redis test alustatud...");
            
            // Proovime Redis'iga ühendust luua
            Boolean pingResult = redisTemplate.getConnectionFactory().getConnection().ping() != null;
            
            logger.info("Redis ping tulemus: {}", pingResult);
            
            Map<String, Object> response = new HashMap<>();
            response.put("ping", pingResult ? "OK" : "FAILED");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Redis ping test ebaõnnestus: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Redis test ebaõnnestus: " + e.getMessage());
        }
    }
    
    @GetMapping("/write")
    public ResponseEntity<?> testRedisWrite() {
        try {
            logger.info("Redis kirjutamise test alustatud...");
            
            String testKey = "test-key";
            String testValue = "test-value-" + System.currentTimeMillis();
            
            // Kirjutame Redis'esse
            redisTemplate.opsForValue().set(testKey, testValue, 60, TimeUnit.SECONDS);
            logger.info("Redis'esse kirjutatud: {} = {}", testKey, testValue);
            
            // Loeme Redis'est
            Object valueFromRedis = redisTemplate.opsForValue().get(testKey);
            logger.info("Redis'est loetud: {} = {}", testKey, valueFromRedis);
            
            Map<String, Object> response = new HashMap<>();
            response.put("original", testValue);
            response.put("fromRedis", valueFromRedis);
            response.put("success", testValue.equals(valueFromRedis));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Redis kirjutamise test ebaõnnestus: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Redis test ebaõnnestus: " + e.getMessage());
        }
    }
    
    @GetMapping("/hash")
    public ResponseEntity<?> testRedisHash() {
        try {
            logger.info("Redis hash test alustatud...");
            
            String testKey = "test-hash";
            Map<String, Object> testData = new HashMap<>();
            testData.put("id", 123);
            testData.put("username", "testuser");
            testData.put("email", "test@example.com");
            
            // Kirjutame Redis hash
            redisTemplate.opsForHash().putAll(testKey, testData);
            redisTemplate.expire(testKey, 60, TimeUnit.SECONDS);
            logger.info("Redis'esse kirjutatud hash: {}", testKey);
            
            // Loeme Redis'est
            Map<Object, Object> dataFromRedis = redisTemplate.opsForHash().entries(testKey);
            logger.info("Redis'est loetud hash: {} = {}", testKey, dataFromRedis);
            
            Map<String, Object> response = new HashMap<>();
            response.put("original", testData);
            response.put("fromRedis", dataFromRedis);
            response.put("success", dataFromRedis.size() == testData.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Redis hash test ebaõnnestus: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Redis hash test ebaõnnestus: " + e.getMessage());
        }
    }
    
    @GetMapping("/user-cache/{username}")
    public ResponseEntity<?> testUserCache(@PathVariable String username) {
        try {
            logger.info("UserCacheService test alustatud käsitsi kasutajaga: {}", username);
            
            // Loome test kasutaja
            User testUser = new User();
            testUser.setId(999L);
            testUser.setUsername(username);
            testUser.setEmail(username + "@example.com");
            testUser.setPassword("password-hash"); // Tegelikult peaks see olema hashitud
            
            // Salvestame kasutaja vahemällu
            userCacheService.cacheUser(testUser);
            logger.info("Kasutaja salvestatud vahemällu: {}", username);
            
            // Loeme kasutaja vahemälust
            Map<String, Object> cachedUser = userCacheService.getCachedUser(username);
            logger.info("Kasutaja loetud vahemälust: {}", cachedUser);
            
            Map<String, Object> response = new HashMap<>();
            response.put("username", username);
            response.put("cachedUser", cachedUser);
            response.put("success", cachedUser != null && cachedUser.containsKey("username"));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("UserCacheService test ebaõnnestus: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("UserCacheService test ebaõnnestus: " + e.getMessage());
        }
    }
    
    @GetMapping("/keys")
    public ResponseEntity<?> getAllKeys() {
        try {
            logger.info("Redis kõikide võtmete vaatamine...");
            
            // Võtame kõik võtmed
            java.util.Set<String> keys = redisTemplate.keys("*");
            logger.info("Redis'es on {} võtit: {}", keys.size(), keys);
            
            return ResponseEntity.ok(keys);
        } catch (Exception e) {
            logger.error("Redis võtmete vaatamine ebaõnnestus: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Redis võtmete vaatamine ebaõnnestus: " + e.getMessage());
        }
    }
} 