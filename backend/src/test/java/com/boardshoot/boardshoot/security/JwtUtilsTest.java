package com.boardshoot.boardshoot.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils; 

import static org.assertj.core.api.Assertions.assertThat;



class JwtUtilsTest {

    private JwtUtils jwtUtils;


    private final String testSecret = "gorghrd-98gye409g4[0g4hg[o3h4g[043hg430g40]]]";
    private final int testExpirationMs = 60000; 

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", testSecret);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", testExpirationMs);
    }

    @Test
    void generateJwtToken_shouldCreateValidToken() {
        String username = "testuser";

        String token = jwtUtils.generateJwtToken(username);

        assertThat(token).isNotNull().isNotEmpty();
        String extractedUsername = jwtUtils.getUserNameFromJwtToken(token);
        assertThat(extractedUsername).isEqualTo(username);
    }

    @Test
    void getUserNameFromJwtToken_shouldReturnCorrectUsername() {
  
        String username = "testuser";
        String token = jwtUtils.generateJwtToken(username);


        String extractedUsername = jwtUtils.getUserNameFromJwtToken(token);
        assertThat(extractedUsername).isEqualTo(username);
    }

    @Test
    void validateJwtToken_shouldReturnTrueForValidToken() {
    
        String username = "testuser";
        String token = jwtUtils.generateJwtToken(username);
        boolean isValid = jwtUtils.validateJwtToken(token);

        assertThat(isValid).isTrue();
    }




    @Test
    void validateJwtToken_shouldReturnFalseForExpiredToken() throws InterruptedException {

        String username = "testuser";

        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 1); 
        String token = jwtUtils.generateJwtToken(username);

      
        Thread.sleep(50); 

   
        boolean isValid = jwtUtils.validateJwtToken(token);

        assertThat(isValid).isFalse(); 


         ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", testExpirationMs);
    }

   

     @Test
    void validateJwtToken_shouldReturnFalseForMalformedToken() {
     
        String malformedToken = "this.is.not.a.jwt";

     
        boolean isValid = jwtUtils.validateJwtToken(malformedToken);

        
         assertThat(isValid).isFalse(); 
    }

    @Test
    void validateJwtToken_shouldReturnFalseForUnsupportedToken() {
       
        String unsupportedToken = "";

    
        boolean isValid = jwtUtils.validateJwtToken(unsupportedToken);

       
         assertThat(isValid).isFalse(); 
    }

     @Test
    void validateJwtToken_shouldReturnFalseForNullOrEmptyToken() {
 
         boolean isValidNull = jwtUtils.validateJwtToken(null);
         assertThat(isValidNull).isFalse(); 

         boolean isValidEmpty = jwtUtils.validateJwtToken("");
         assertThat(isValidEmpty).isFalse(); 
    }
}