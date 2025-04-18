package com.boardshoot.boardshoot.controllers;

import com.boardshoot.boardshoot.model.User;
import com.boardshoot.boardshoot.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userRepository.save(user);
    }

    @GetMapping
    public List<User> getUsers() {
        return userRepository.findAll();
    }


    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            return user.get();
        }
        throw new RuntimeException("User not found");
    }
    
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            User existingUser = user.get();
            existingUser.setUsername(userDetails.getUsername());
            existingUser.setPassword(userDetails.getPassword());
            existingUser.setEmail(userDetails.getEmail());
            return userRepository.save(existingUser);
        }
        throw new RuntimeException("User not found");
    }
    
    /**
     * Eraldi endpoint kasutaja profiili uuendamiseks, mis ei muuda parooli
     */
    @PutMapping("/{id}/profile")
    public User updateUserProfile(@PathVariable Long id, @RequestBody Map<String, String> profileDetails) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isPresent()) {
            User existingUser = userOptional.get();
            
            // Uuendame ainult kasutajanime ja e-posti, kui need on saadetud
            if (profileDetails.containsKey("username")) {
                existingUser.setUsername(profileDetails.get("username"));
            }
            
            if (profileDetails.containsKey("email")) {
                existingUser.setEmail(profileDetails.get("email"));
            }
            
            // Ei muuda parooli
            return userRepository.save(existingUser);
        }
        throw new RuntimeException("User not found");
    }
    
    @DeleteMapping("/{id}") 
    public String deleteUser(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()){
            userRepository.deleteById(id);
            return ("bye bye user");
        }
        throw new RuntimeException("User not found");
    }


}
