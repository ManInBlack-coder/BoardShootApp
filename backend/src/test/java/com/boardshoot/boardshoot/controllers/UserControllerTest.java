package com.boardshoot.boardshoot.controllers;


import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;

import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.security.test.context.support.WithMockUser;


import com.fasterxml.jackson.databind.ObjectMapper;

import com.boardshoot.boardshoot.model.User;
import com.boardshoot.boardshoot.repository.UserRepository;
import com.boardshoot.boardshoot.security.CustomUserDetailsService;
import com.boardshoot.boardshoot.security.JwtUtils;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.hasSize;


@WebMvcTest(UserController.class)
@WithMockUser 
class UserControllerTest {


 
    @TestConfiguration
    static class TestConfig {
        @Bean
        @Primary
        public CustomUserDetailsService primaryMockUserDetailsService() {
            return Mockito.mock(CustomUserDetailsService.class);
        }
    }

    @Autowired
    private MockMvc mockMvc; 
    @Autowired
    private ObjectMapper objectMapper; 

    @MockBean
    private UserRepository userRepository; 

    @MockBean
    private JwtUtils jwtUtils;


    @MockBean
    private CustomUserDetailsService customUserDetailsService;


    @Test
    void createUser_shouldReturnCreatedUser() throws Exception {

        User userToCreate = new User("creator", "pass", "creator@example.com");
        User savedUser = new User("creator", "pass", "creator@example.com");
        savedUser.setId(1L);

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

 
        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userToCreate))
                        .with(csrf())) 
                .andExpect(status().isOk()) 
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.username", is("creator")))
                .andExpect(jsonPath("$.email", is("creator@example.com")));
    }

    @Test
    void getUsers_shouldReturnListOfUsers() throws Exception {
   
        User user1 = new User("user1", "p1", "e1@example.com"); user1.setId(1L);
        User user2 = new User("user2", "p2", "e2@example.com"); user2.setId(2L);
        when(userRepository.findAll()).thenReturn(Arrays.asList(user1, user2));

    
        mockMvc.perform(get("/users")
                         .with(csrf())) 
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].username", is("user1")))
                .andExpect(jsonPath("$[1].username", is("user2")));
    }

    @Test
    void getUserById_shouldReturnUser_whenFound() throws Exception {

        long userId = 1L;
        User user = new User("foundUser", "p", "found@example.com"); user.setId(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        mockMvc.perform(get("/users/{id}", userId)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is((int)userId)))
                .andExpect(jsonPath("$.username", is("foundUser")));
    }

  

    @Test
    void updateUser_shouldReturnUpdatedUser_whenFound() throws Exception {
  
        long userId = 1L;
        User existingUser = new User("oldName", "oldPass", "old@example.com"); existingUser.setId(userId);
        User userDetailsToUpdate = new User("newName", "newPass", "new@example.com");
        User updatedUser = new User("newName", "newPass", "new@example.com"); updatedUser.setId(userId); 

        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenReturn(updatedUser); 

        mockMvc.perform(put("/users/{id}", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDetailsToUpdate))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is((int)userId)))
                .andExpect(jsonPath("$.username", is("newName")))
                .andExpect(jsonPath("$.email", is("new@example.com")))
                .andExpect(jsonPath("$.password", is("newPass"))); 
    }

 

    @Test
    void updateUserProfile_shouldUpdateOnlyProvidedFields_whenFound() throws Exception {
        long userId = 1L;
        User existingUser = new User("oldName", "oldPass", "old@example.com"); existingUser.setId(userId);
        Map<String, String> profileDetails = new HashMap<>();
        profileDetails.put("username", "newName");
    
        User expectedToBeSaved = new User("newName", "oldPass", "old@example.com"); expectedToBeSaved.setId(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));

        when(userRepository.save(argThat(user -> 
                user.getId().equals(userId) &&
                user.getUsername().equals("newName") &&
                user.getPassword().equals("oldPass") && 
                user.getEmail().equals("old@example.com"))))
            .thenReturn(expectedToBeSaved); 

        mockMvc.perform(put("/users/{id}/profile", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profileDetails))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is((int)userId)))
                .andExpect(jsonPath("$.username", is("newName"))) 
                .andExpect(jsonPath("$.email", is("old@example.com"))) 
                .andExpect(jsonPath("$.password", is("oldPass"))); 
    }

   

    @Test
    void deleteUser_shouldReturnMessage_whenFound() throws Exception {
    
        long userId = 1L;
        User userToDelete = new User("deleteMe", "p", "del@example.com"); userToDelete.setId(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(userToDelete));
        doNothing().when(userRepository).deleteById(userId); 


        mockMvc.perform(delete("/users/{id}", userId)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().string("bye bye user")); 

        verify(userRepository).findById(userId);
        verify(userRepository).deleteById(userId);
    }

  
}