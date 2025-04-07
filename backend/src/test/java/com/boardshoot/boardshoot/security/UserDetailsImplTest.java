package com.boardshoot.boardshoot.security;

import com.boardshoot.boardshoot.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

import static org.assertj.core.api.Assertions.assertThat;

class UserDetailsImplTest {

    @Test
    void build_shouldCreateCorrectUserDetailsImpl() {
 
        User user = new User("testuser", "password123", "test@example.com");
        user.setId(1L); 

  
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);

        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getId()).isEqualTo(1L);
        assertThat(userDetails.getUsername()).isEqualTo("testuser");
        assertThat(userDetails.getEmail()).isEqualTo("test@example.com");
        assertThat(userDetails.getPassword()).isEqualTo("password123"); 
        assertThat(userDetails.getAuthorities()).isNotNull().isEmpty(); 
        assertThat(userDetails.isAccountNonExpired()).isTrue();
        assertThat(userDetails.isAccountNonLocked()).isTrue();
        assertThat(userDetails.isCredentialsNonExpired()).isTrue();
        assertThat(userDetails.isEnabled()).isTrue();
    }

    @Test
    void constructor_shouldCreateCorrectUserDetailsImpl() {

        Long id = 2L;
        String username = "anotheruser";
        String email = "another@example.com";
        String password = "securepassword";

   
        UserDetailsImpl userDetails = new UserDetailsImpl(id, username, email, password);

      
        assertThat(userDetails.getId()).isEqualTo(id);
        assertThat(userDetails.getUsername()).isEqualTo(username);
        assertThat(userDetails.getEmail()).isEqualTo(email);
        assertThat(userDetails.getPassword()).isEqualTo(password);
        assertThat(userDetails.getAuthorities()).isEmpty();
        assertThat(userDetails.isAccountNonExpired()).isTrue();
        assertThat(userDetails.isAccountNonLocked()).isTrue();
        assertThat(userDetails.isCredentialsNonExpired()).isTrue();
        assertThat(userDetails.isEnabled()).isTrue();
    }
}