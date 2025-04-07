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
import com.boardshoot.boardshoot.model.Note;
import com.boardshoot.boardshoot.model.User;
import com.boardshoot.boardshoot.service.NoteService;
import com.boardshoot.boardshoot.security.CustomUserDetailsService; 
import com.boardshoot.boardshoot.security.JwtUtils; 

import java.util.Arrays;
import java.util.List;
import java.util.ArrayList;
import java.util.Base64;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;

@WebMvcTest(NoteController.class) 
@WithMockUser 
class NoteControllerTest {

  
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
    private NoteService noteService;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;


    private Note createTestNote(Long id, Long folderId, Long userId, String title, String text) {
        Note note = new Note();
        note.setId(id);
        note.setTitle(title);
        Folder folder = new Folder(); folder.setId(folderId);
        User user = new User(); user.setId(userId);
        note.setFolder(folder);
        note.setUser(user);
        if (text != null) {
            note.setTexts(new ArrayList<>(List.of(text)));
        }
        note.setImageUrls(new ArrayList<>());
        return note;
    }

    @Test
    void getNotes_shouldReturnListOfNotes() throws Exception {
        Long folderId = 1L;
        Note note1 = createTestNote(10L, folderId, 1L, "Note 1", "Text 1");
        Note note2 = createTestNote(11L, folderId, 1L, "Note 2", "Text 2");
        List<Note> notes = Arrays.asList(note1, note2);

        when(noteService.getNotesForFolder(folderId)).thenReturn(notes);

        mockMvc.perform(get("/api/folders/{folderId}/notes", folderId)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(10)))
                .andExpect(jsonPath("$[0].title", is("Note 1")))
                .andExpect(jsonPath("$[1].id", is(11)))
                .andExpect(jsonPath("$[1].title", is("Note 2")));

        verify(noteService).getNotesForFolder(folderId);
    }

    @Test
    void createNote_shouldReturnCreatedNote() throws Exception {
        Long folderId = 1L;
        Long expectedNoteId = 15L;
        Long userId = 1L; 
        NoteController.CreateNoteRequest request = new NoteController.CreateNoteRequest();
        request.setTitle("New Note");
        request.setText("Some content");

        Note createdNote = createTestNote(expectedNoteId, folderId, userId, "New Note", "Some content");

        when(noteService.createNote(eq(folderId), eq("New Note"), eq("Some content")))
                .thenReturn(createdNote);

        mockMvc.perform(post("/api/folders/{folderId}/notes", folderId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(csrf()))
                .andExpect(status().isOk()) 
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(expectedNoteId.intValue())))
                .andExpect(jsonPath("$.title", is("New Note")))
                .andExpect(jsonPath("$.texts[0]", is("Some content")))
                .andExpect(jsonPath("$.folder.id", is(folderId.intValue())))
                .andExpect(jsonPath("$.user.id", is(userId.intValue())));

        verify(noteService).createNote(eq(folderId), eq("New Note"), eq("Some content"));
    }


    @Test
    void getNote_shouldReturnNote_whenFound() throws Exception {
        Long folderId = 1L;
        Long noteId = 20L;
        Long userId = 1L;
        Note note = createTestNote(noteId, folderId, userId, "Specific Note", "Details");

        when(noteService.getNote(noteId)).thenReturn(note);

        mockMvc.perform(get("/api/folders/{folderId}/notes/{noteId}", folderId, noteId)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(noteId.intValue())))
                .andExpect(jsonPath("$.title", is("Specific Note")));

        verify(noteService).getNote(noteId);
    }


    @Test
    void updateNote_shouldReturnUpdatedNote() throws Exception {
        Long folderId = 1L;
        Long noteId = 30L;
        Long userId = 1L;
        NoteController.UpdateNoteRequest request = new NoteController.UpdateNoteRequest();
        request.setTitle("Updated Title");
        request.setText("Updated Text");

        Note updatedNote = createTestNote(noteId, folderId, userId, "Updated Title", "Updated Text");

        when(noteService.updateNote(eq(noteId), eq("Updated Title"), eq("Updated Text")))
            .thenReturn(updatedNote);

        mockMvc.perform(put("/api/folders/{folderId}/notes/{noteId}", folderId, noteId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(noteId.intValue())))
                .andExpect(jsonPath("$.title", is("Updated Title")))
                .andExpect(jsonPath("$.texts[0]", is("Updated Text")));

        verify(noteService).updateNote(eq(noteId), eq("Updated Title"), eq("Updated Text"));
    }

 


    @Test
    void deleteNote_shouldReturnSuccess() throws Exception {
        Long folderId = 1L;
        Long noteId = 40L;

        when(noteService.deleteNote(noteId)).thenReturn(true); 

        mockMvc.perform(delete("/api/folders/{folderId}/notes/{noteId}", folderId, noteId)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Note deleted successfully")));

        verify(noteService).deleteNote(noteId);
    }

    @Test
    void deleteNote_shouldHandleNotFound() throws Exception {
        Long folderId = 1L;
        Long noteId = 99L;

        when(noteService.deleteNote(noteId)).thenThrow(new RuntimeException("Note not found"));

        mockMvc.perform(delete("/api/folders/{folderId}/notes/{noteId}", folderId, noteId)
                        .with(csrf()))
                .andExpect(status().isInternalServerError()) 
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Note not found")));

        verify(noteService).deleteNote(noteId);
    }

    @Test
    void addImageToNote_shouldReturnSuccess_whenImageIsValid() throws Exception {

        Long folderId = 1L;
        Long noteId = 50L;
        String rawImageData = "dGVzdCBpbWFnZSBkYXRh"; 
        byte[] imageBytes = Base64.getDecoder().decode(rawImageData);
        NoteController.AddImageRequest request = new NoteController.AddImageRequest();
        request.setImage(rawImageData);

       
        Note updatedNote = createTestNote(noteId, folderId, 1L, "Note with image", null);
        updatedNote.addImageUrl("http://example.com/image.jpg");
        when(noteService.addImageToNote(eq(noteId), eq(imageBytes))).thenReturn(updatedNote);


  
        mockMvc.perform(post("/api/folders/{folderId}/notes/{noteId}/images", folderId, noteId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Image added successfully")));

        verify(noteService).addImageToNote(eq(noteId), eq(imageBytes));
    }

     @Test
    void addImageToNote_shouldReturnBadRequest_whenImageIsEmpty() throws Exception {

        Long folderId = 1L;
        Long noteId = 51L;
        NoteController.AddImageRequest request = new NoteController.AddImageRequest();
        request.setImage(""); 


        mockMvc.perform(post("/api/folders/{folderId}/notes/{noteId}/images", folderId, noteId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Image is required")));

        verify(noteService, never()).addImageToNote(anyLong(), any(byte[].class));
    }

 

     @Test
    void addImageToNote_shouldHandleServiceError() throws Exception {
      
        Long folderId = 1L;
        Long noteId = 53L;
        String rawImageData = "dGVzdCBpbWFnZSBkYXRh";
        byte[] imageBytes = Base64.getDecoder().decode(rawImageData);
        NoteController.AddImageRequest request = new NoteController.AddImageRequest();
        request.setImage(rawImageData);

        when(noteService.addImageToNote(eq(noteId), eq(imageBytes)))
            .thenThrow(new RuntimeException("Storage service unavailable"));


        mockMvc.perform(post("/api/folders/{folderId}/notes/{noteId}/images", folderId, noteId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(csrf()))
                .andExpect(status().isInternalServerError())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Server error: Storage service unavailable")));

        verify(noteService).addImageToNote(eq(noteId), eq(imageBytes));
    }
}