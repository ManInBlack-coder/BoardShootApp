package com.boardshoot.boardshoot.service;

import com.boardshoot.boardshoot.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class UserCacheService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserCacheService.class);
    private static final String USER_CACHE_KEY_PREFIX = "user:";
    private static final long USER_CACHE_TTL = 60 * 60; // 1 tund
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    /**
     * Salvestab kasutaja andmed vahemällu
     */
    public void cacheUser(User user) {
        try {
            String cacheKey = USER_CACHE_KEY_PREFIX + user.getUsername();
            Map<String, Object> userDetails = mapUserToCache(user);
            
            // Salvestame kasutaja andmed Redis'esse
            redisTemplate.opsForHash().putAll(cacheKey, userDetails);
            redisTemplate.expire(cacheKey, USER_CACHE_TTL, TimeUnit.SECONDS);
            
            logger.info("User cached successfully: {}", user.getUsername());
        } catch (Exception e) {
            logger.error("Error caching user: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Toob kasutaja andmed vahemälust
     */
    public Map<String, Object> getCachedUser(String username) {
        try {
            String cacheKey = USER_CACHE_KEY_PREFIX + username;
            Map<Object, Object> entries = redisTemplate.opsForHash().entries(cacheKey);
            
            if (entries != null && !entries.isEmpty()) {
                logger.info("User found in cache: {}", username);
                
                // Konverteerime Redis vastuse sobivasse formaati
                Map<String, Object> result = new HashMap<>();
                entries.forEach((key, value) -> result.put(key.toString(), value));
                return result;
            }
            
            logger.info("User not found in cache: {}", username);
            return null;
        } catch (Exception e) {
            logger.error("Error getting user from cache: {}", e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Kustutab kasutaja andmed vahemälust
     */
    public void invalidateUserCache(String username) {
        try {
            String cacheKey = USER_CACHE_KEY_PREFIX + username;
            redisTemplate.delete(cacheKey);
            logger.info("User cache invalidated: {}", username);
        } catch (Exception e) {
            logger.error("Error invalidating user cache: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Teisendab User objekti Map'iks, et salvestada Redis'esse
     */
    private Map<String, Object> mapUserToCache(User user) {
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("username", user.getUsername());
        userMap.put("email", user.getEmail());
        // Me ei salvestata parooli vahemällu turvalisuse põhjustel
        return userMap;
    }
} 