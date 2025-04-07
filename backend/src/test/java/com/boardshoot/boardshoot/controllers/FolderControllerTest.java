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
import com.boardshoot.boardshoot.model.Folder;
import com.boardshoot.boardshoot.model.User;
import com.boardshoot.boardshoot.repository.UserRepository;
import com.boardshoot.boardshoot.service.FolderService;
import com.boardshoot.boardshoot.security.CustomUserDetailsService; 
import com.boardshoot.boardshoot.security.JwtUtils; 

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.hasSize;

@WebMvcTest(FolderController.class) 
@WithMockUser 
class FolderControllerTest {

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
    private FolderService folderService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

 
    private Folder createTestFolder(Long id, String name, Long userId) {
        Folder folder = new Folder();
        folder.setId(id);
        folder.setName(name);
        User user = new User(); user.setId(userId);
        folder.setUser(user);
        return folder;
    }

    @Test
    void getAllFolders_shouldReturnListOfFoldersForCurrentUser() throws Exception {
        Folder folder1 = createTestFolder(1L, "Folder A", 1L); 
        Folder folder2 = createTestFolder(2L, "Folder B", 1L);
        List<Folder> folders = Arrays.asList(folder1, folder2);

        when(folderService.getCurrentUserFolders()).thenReturn(folders);

        mockMvc.perform(get("/api/folders")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].name", is("Folder A")))
                .andExpect(jsonPath("$[1].id", is(2)))
                .andExpect(jsonPath("$[1].name", is("Folder B")));

        verify(folderService).getCurrentUserFolders();
    }

    @Test
    void testEndpoint_shouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/folders/test"))
               .andExpect(status().isOk())
               .andExpect(content().string("Folders API is working"));
    }

    @Test
    void createFolder_shouldReturnCreatedFolder() throws Exception {
     
        Long expectedFolderId = 5L;
        Long currentUserId = 1L;
        String folderName = "New Folder";
        Map<String, String> payload = new HashMap<>();
        payload.put("name", folderName);

        Folder createdFolder = createTestFolder(expectedFolderId, folderName, currentUserId);

        when(folderService.createFolder(folderName)).thenReturn(createdFolder);


        mockMvc.perform(post("/api/folders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload))
                        .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(expectedFolderId.intValue())))
                .andExpect(jsonPath("$.name", is(folderName)))
                .andExpect(jsonPath("$.user.id", is(currentUserId.intValue())));

        verify(folderService).createFolder(folderName);
    }

     @Test
    void createFolder_shouldHandleServiceError() throws Exception {
        String folderName = "Fail Folder";
        Map<String, String> payload = new HashMap<>();
        payload.put("name", folderName);

        when(folderService.createFolder(folderName)).thenThrow(new RuntimeException("DB error"));

        mockMvc.perform(post("/api/folders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload))
                        .with(csrf()))
                .andExpect(status().isInternalServerError()); 

        verify(folderService).createFolder(folderName);
    }

    @Test
    void createFolderWithUserId_shouldReturnCreatedFolder() throws Exception {
        Long userId = 2L;
        Long expectedFolderId = 6L;
        String folderName = "User 2 Folder";
        Map<String, String> payload = new HashMap<>();
        payload.put("name", folderName);

        Folder createdFolder = createTestFolder(expectedFolderId, folderName, userId);

        when(folderService.createFolderWithUserId(folderName, userId)).thenReturn(createdFolder);

        mockMvc.perform(post("/api/folders/user/{userId}", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload))
                        .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(expectedFolderId.intValue())))
                .andExpect(jsonPath("$.name", is(folderName)))
                .andExpect(jsonPath("$.user.id", is(userId.intValue())));

        verify(folderService).createFolderWithUserId(folderName, userId);
    }

    @Test
    void getFoldersByUserId_shouldReturnListOfFolders() throws Exception {
        Long userId = 3L;
        Folder folder1 = createTestFolder(7L, "Folder C", userId);
        Folder folder2 = createTestFolder(8L, "Folder D", userId);
        List<Folder> folders = Arrays.asList(folder1, folder2);

        when(folderService.getUserFolders(userId)).thenReturn(folders);

        mockMvc.perform(get("/api/folders/user/{userId}", userId)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(7)))
                .andExpect(jsonPath("$[1].id", is(8)));

        verify(folderService).getUserFolders(userId);
    }

    @Test
    void deleteFolder_shouldReturnSuccess() throws Exception {

        Long folderId = 10L;
        when(folderService.deleteFolder(folderId)).thenReturn(true); 

        mockMvc.perform(delete("/api/folders/{folderId}", folderId)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Folder deleted successfully")));

        verify(folderService).deleteFolder(folderId);
    }

    @Test
    void deleteFolder_shouldHandleError() throws Exception {
        Long folderId = 99L;
        String errorMessage = "Folder not found or does not belong to you";
        when(folderService.deleteFolder(folderId)).thenThrow(new RuntimeException(errorMessage));

        mockMvc.perform(delete("/api/folders/{folderId}", folderId)
                        .with(csrf()))
                .andExpect(status().isInternalServerError())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is(errorMessage)));

        verify(folderService).deleteFolder(folderId);
    }
}