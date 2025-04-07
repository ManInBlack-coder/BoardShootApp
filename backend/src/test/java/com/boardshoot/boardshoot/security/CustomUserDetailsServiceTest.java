package com.boardshoot.boardshoot.security;

import com.boardshoot.boardshoot.model.User;
import com.boardshoot.boardshoot.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class) 
class CustomUserDetailsServiceTest {

    @Mock 
    private UserRepository userRepository;

    @InjectMocks 
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void loadUserByUsername_shouldReturnUserDetails_whenUserFound() {

        String username = "testuser";
        User mockUser = new User(username, "password", "test@example.com");
        mockUser.setId(1L);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(mockUser));

 
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

  
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo(username);
        assertThat(userDetails).isInstanceOf(UserDetailsImpl.class);
        UserDetailsImpl userDetailsImpl = (UserDetailsImpl) userDetails;
        assertThat(userDetailsImpl.getId()).isEqualTo(1L);
        assertThat(userDetailsImpl.getEmail()).isEqualTo("test@example.com");
        verify(userRepository).findByUsername(username);
    }

    @Test
    void loadUserByUsername_shouldThrowUsernameNotFoundException_whenUserNotFound() {
   
        String username = "unknownuser";
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());


        assertThatThrownBy(() -> customUserDetailsService.loadUserByUsername(username))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("User not found with username: " + username);


        verify(userRepository).findByUsername(username);
    }
}