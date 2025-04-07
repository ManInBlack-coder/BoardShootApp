package com.boardshoot.boardshoot.security;
import com.boardshoot.boardshoot.model.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private UserDetailsService userDetailsService; 

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @BeforeEach
    void setUp() {

        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilterInternal_shouldSetAuthentication_whenTokenIsValid() throws ServletException, IOException {

        String jwt = "valid.jwt.token";
        String authHeader = "Bearer " + jwt;
        String username = "testuser";
        UserDetails mockUserDetails = UserDetailsImpl.build(new User(username, "pass", "email@test.com"));

        when(request.getHeader("Authorization")).thenReturn(authHeader);
        when(jwtUtils.validateJwtToken(jwt)).thenReturn(true);
        when(jwtUtils.getUserNameFromJwtToken(jwt)).thenReturn(username);
        when(userDetailsService.loadUserByUsername(username)).thenReturn(mockUserDetails);


        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);


        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getName()).isEqualTo(username);
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal()).isEqualTo(mockUserDetails);

        verify(filterChain).doFilter(request, response);
        verify(jwtUtils).validateJwtToken(jwt);
        verify(jwtUtils).getUserNameFromJwtToken(jwt);
        verify(userDetailsService).loadUserByUsername(username);
    }

    @Test
    void doFilterInternal_shouldNotSetAuthentication_whenTokenIsInvalid() throws ServletException, IOException {
        String jwt = "invalid.jwt.token";
        String authHeader = "Bearer " + jwt;

        when(request.getHeader("Authorization")).thenReturn(authHeader);
        when(jwtUtils.validateJwtToken(jwt)).thenReturn(false); 

      
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();

        verify(filterChain).doFilter(request, response);
        verify(jwtUtils).validateJwtToken(jwt);
        verify(jwtUtils, never()).getUserNameFromJwtToken(anyString());
        verify(userDetailsService, never()).loadUserByUsername(anyString());
    }

    @Test
    void doFilterInternal_shouldNotSetAuthentication_whenNoBearerToken() throws ServletException, IOException {

        when(request.getHeader("Authorization")).thenReturn(null);


        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);


        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(jwtUtils); 
        verifyNoInteractions(userDetailsService);


        when(request.getHeader("Authorization")).thenReturn("Basic dXNlcjpwYXNz"); 

        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

 
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain, times(2)).doFilter(request, response); 
        verifyNoInteractions(jwtUtils);
        verifyNoInteractions(userDetailsService);
    }

    @Test
    void doFilterInternal_shouldContinueFilterChain_whenExceptionOccurs() throws ServletException, IOException {
     
        String jwt = "valid.jwt.token";
        String authHeader = "Bearer " + jwt;

        when(request.getHeader("Authorization")).thenReturn(authHeader);
     
        when(jwtUtils.validateJwtToken(jwt)).thenThrow(new RuntimeException("JWT parsing error"));

     
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();

        verify(filterChain).doFilter(request, response);
        verify(jwtUtils).validateJwtToken(jwt);
        verifyNoInteractions(userDetailsService);
    }
}