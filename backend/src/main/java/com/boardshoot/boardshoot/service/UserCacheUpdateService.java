package com.boardshoot.boardshoot.service;

import com.boardshoot.boardshoot.model.User;
import com.boardshoot.boardshoot.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserCacheUpdateService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserCacheUpdateService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserCacheService userCacheService;
    
    /**
     * Uuendab kasutaja andmeid nii andmebaasis kui ka vahemälus
     */
    @Transactional
    public User updateUser(User updatedUser) {
        Optional<User> userOptional = userRepository.findById(updatedUser.getId());
        
        if (userOptional.isPresent()) {
            User existingUser = userOptional.get();
            
            // Uuendame ainult neid välju, mis pole null
            if (updatedUser.getUsername() != null) {
                existingUser.setUsername(updatedUser.getUsername());
            }
            
            if (updatedUser.getEmail() != null) {
                existingUser.setEmail(updatedUser.getEmail());
            }
            
            // Parool tuleb krüptida, kui see on olemas
            if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                // Siin peaks olema paroolikrüpteerimine, aga see sõltub teie süsteemist
                // existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
                existingUser.setPassword(updatedUser.getPassword());
            }
            
            // Salvestame andmebaasi
            User savedUser = userRepository.save(existingUser);
            
            // Uuendame vahemälu
            userCacheService.invalidateUserCache(savedUser.getUsername());
            userCacheService.cacheUser(savedUser);
            
            logger.info("User updated successfully in database and cache: {}", savedUser.getUsername());
            return savedUser;
        } else {
            logger.error("User not found with ID: {}", updatedUser.getId());
            throw new RuntimeException("User not found with ID: " + updatedUser.getId());
        }
    }
    
    /**
     * Kustutab kasutaja nii andmebaasist kui ka vahemälust
     */
    @Transactional
    public void deleteUser(Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            
            // Kustutame andmebaasist
            userRepository.delete(user);
            
            // Kustutame vahemälust
            userCacheService.invalidateUserCache(user.getUsername());
            
            logger.info("User deleted successfully from database and cache: {}", user.getUsername());
        } else {
            logger.error("User not found with ID: {}", userId);
            throw new RuntimeException("User not found with ID: " + userId);
        }
    }
} 