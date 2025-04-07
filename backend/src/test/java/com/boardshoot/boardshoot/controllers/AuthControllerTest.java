package com.boardshoot.boardshoot.controllers;

import com.boardshoot.boardshoot.config.SecurityConfig; 
import com.boardshoot.boardshoot.model.User;
import com.boardshoot.boardshoot.repository.UserRepository;
import com.boardshoot.boardshoot.security.JwtUtils;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import com.boardshoot.boardshoot.security.UserDetailsImpl; 
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import; 
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.is;


@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private JwtUtils jwtUtils;


    @MockBean
    private UserDetailsService userDetailsService;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;
    private User signUpRequest;
    private UserDetails testUserDetails;


    @BeforeEach
    void setUp() {
        signUpRequest = new User("testuser", "password123", "test@example.com");
        testUser = new User("testuser", "encodedPassword", "test@example.com");
        testUser.setId(1L);

        testUserDetails = UserDetailsImpl.build(testUser);
    }

    @Test
    void registerUser_whenSuccess_shouldReturnOkAndToken() throws Exception {
        when(userRepository.existsByUsername(signUpRequest.getUsername())).thenReturn(false);
        when(userRepository.existsByEmail(signUpRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(signUpRequest.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User userToSave = invocation.getArgument(0);
            userToSave.setId(1L);
            return userToSave;
        });
        when(jwtUtils.generateJwtToken(signUpRequest.getUsername())).thenReturn("dummy.jwt.token");


        ResultActions result = mockMvc.perform(post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signUpRequest))
                .with(csrf())); 


        result.andExpect(status().isOk())
         
              .andExpect(jsonPath("$.token", is("dummy.jwt.token")))
              .andExpect(jsonPath("$.user.id", is(1)))
              .andExpect(jsonPath("$.user.username", is(signUpRequest.getUsername())))
              .andExpect(jsonPath("$.user.email", is(signUpRequest.getEmail())))
              .andExpect(jsonPath("$.user.password").doesNotExist());

 
        verify(userRepository).existsByUsername(signUpRequest.getUsername());
        verify(userRepository).existsByEmail(signUpRequest.getEmail());
        verify(passwordEncoder).encode(signUpRequest.getPassword());
        verify(userRepository).save(any(User.class));
        verify(jwtUtils).generateJwtToken(signUpRequest.getUsername());

        verify(jwtUtils, never()).validateJwtToken(anyString());
        verify(userDetailsService, never()).loadUserByUsername(anyString());
    }

    @Test
    void registerUser_whenUsernameTaken_shouldReturnBadRequest() throws Exception {

        when(userRepository.existsByUsername(signUpRequest.getUsername())).thenReturn(true);

        ResultActions result = mockMvc.perform(post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signUpRequest))
                .with(csrf()));

   
        result.andExpect(status().isBadRequest()) 
              .andExpect(jsonPath("$.error", is("Username is already taken")));

        verify(userRepository).existsByUsername(signUpRequest.getUsername());
        verify(userRepository, never()).existsByEmail(anyString());
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
        verify(jwtUtils, never()).generateJwtToken(anyString());
        verify(jwtUtils, never()).validateJwtToken(anyString());
        verify(userDetailsService, never()).loadUserByUsername(anyString());
    }

    @Test
    void registerUser_whenEmailTaken_shouldReturnBadRequest() throws Exception {
        when(userRepository.existsByUsername(signUpRequest.getUsername())).thenReturn(false);
        when(userRepository.existsByEmail(signUpRequest.getEmail())).thenReturn(true);

        ResultActions result = mockMvc.perform(post("/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signUpRequest))
                .with(csrf()));

        result.andExpect(status().isBadRequest())
        
             .andExpect(jsonPath("$.error", is("Email already in use")));


        verify(userRepository).existsByUsername(signUpRequest.getUsername());
        verify(userRepository).existsByEmail(signUpRequest.getEmail());
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
        verify(jwtUtils, never()).generateJwtToken(anyString());
        verify(jwtUtils, never()).validateJwtToken(anyString());
        verify(userDetailsService, never()).loadUserByUsername(anyString());
    }


    @Test
    void authenticateUser_whenSuccess_shouldReturnOkAndToken() throws Exception {

        User loginRequest = new User("testuser", "password123", null);
        when(userRepository.findByUsername(loginRequest.getUsername())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), testUser.getPassword())).thenReturn(true);
        when(jwtUtils.generateJwtToken(testUser.getUsername())).thenReturn("dummy.jwt.token");

        ResultActions result = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest))
                .with(csrf()));


        result.andExpect(status().isOk()) 
           
              .andExpect(jsonPath("$.token", is("dummy.jwt.token")))
              .andExpect(jsonPath("$.user.id", is(testUser.getId().intValue())))
              .andExpect(jsonPath("$.user.username", is(testUser.getUsername())))
              .andExpect(jsonPath("$.user.email", is(testUser.getEmail())))
              .andExpect(jsonPath("$.user.password").doesNotExist());



        verify(userRepository).findByUsername(loginRequest.getUsername());
        verify(passwordEncoder).matches(loginRequest.getPassword(), testUser.getPassword());
        verify(jwtUtils).generateJwtToken(testUser.getUsername());
        verify(jwtUtils, never()).validateJwtToken(anyString());
        verify(userDetailsService, never()).loadUserByUsername(anyString());
    }

    @Test
    void authenticateUser_whenUserNotFound_shouldReturnBadRequest() throws Exception {
        User loginRequest = new User("unknownuser", "password123", null);
        when(userRepository.findByUsername(loginRequest.getUsername())).thenReturn(Optional.empty());

        ResultActions result = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest))
                .with(csrf()));

        result.andExpect(status().isBadRequest()) 
              .andExpect(content().contentType(MediaType.APPLICATION_JSON))
              .andExpect(jsonPath("$.error", is("User not found")));

        verify(userRepository).findByUsername(loginRequest.getUsername());
        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(jwtUtils, never()).generateJwtToken(anyString());
  
        verify(jwtUtils, never()).validateJwtToken(anyString());
        verify(userDetailsService, never()).loadUserByUsername(anyString());
    }

    @Test
    void authenticateUser_whenInvalidPassword_shouldReturnBadRequest() throws Exception {
        User loginRequest = new User("testuser", "wrongpassword", null);
        when(userRepository.findByUsername(loginRequest.getUsername())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), testUser.getPassword())).thenReturn(false);

        ResultActions result = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest))
                .with(csrf()));

        result.andExpect(status().isBadRequest())
              .andExpect(content().contentType(MediaType.APPLICATION_JSON))
              .andExpect(jsonPath("$.error", is("Invalid credentials")));

        verify(userRepository).findByUsername(loginRequest.getUsername());
        verify(passwordEncoder).matches(loginRequest.getPassword(), testUser.getPassword());
        verify(jwtUtils, never()).generateJwtToken(anyString());
        verify(jwtUtils, never()).validateJwtToken(anyString());
        verify(userDetailsService, never()).loadUserByUsername(anyString());
    }

    @Test
    @WithMockUser 
    void getUserProfile_whenTokenInvalid_shouldReturnBadRequest() throws Exception {
     
        String token = "invalid.jwt.token";
        String fullToken = "Bearer " + token;

      
        when(jwtUtils.validateJwtToken(token)).thenReturn(false);
    
        ResultActions result = mockMvc.perform(get("/auth/profile")
                .header("Authorization", fullToken));

        result.andExpect(status().isBadRequest())
              .andExpect(content().contentType(MediaType.APPLICATION_JSON))
              .andExpect(jsonPath("$.error", is("Invalid token")));

        verify(jwtUtils, times(2)).validateJwtToken(token);
        verify(jwtUtils, never()).getUserNameFromJwtToken(token);
        verify(userDetailsService, never()).loadUserByUsername(anyString());
        verify(userRepository, never()).findByUsername(anyString());
    }
}