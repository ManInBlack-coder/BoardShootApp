package com.boardshoot.boardshoot.controllers;

import com.boardshoot.boardshoot.model.Note;
import com.boardshoot.boardshoot.model.Folder;
import com.boardshoot.boardshoot.repository.NoteRepository;
import com.boardshoot.boardshoot.repository.FolderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/users/{userId}/folders/{folderId}/notes")
public class NoteController {
    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private FolderRepository folderRepository;

    @PostMapping
    public Note createNote(
        @PathVariable Long folderId, 
        @RequestBody Note note
    ) {
        Optional<Folder> folder = folderRepository.findById(folderId);
        if (folder.isPresent()) {
            note.setFolder(folder.get());
            return noteRepository.save(note);
        }
        throw new RuntimeException("Folder not found");
    }

    @GetMapping
    public List<Note> getNotesByFolder(@PathVariable Long folderId) {
        return noteRepository.findByFolderId(folderId);
    }

    @GetMapping("/{noteId}")
    public Note getNoteByFolderAndId(
        @PathVariable Long folderId, 
        @PathVariable Long noteId
    ) {
        Optional<Note> note = noteRepository.findByFolderIdAndId(folderId, noteId);
        if (note.isPresent()) {
            return note.get();
        }
        throw new RuntimeException("Note not found in the specified folder");
    }


    @PutMapping("/{noteId}")
    public Note updateNote(
        @PathVariable Long folderId, 
        @PathVariable Long noteId, 
        @RequestBody Note updatedNote
    ) {
        Optional<Note> existingNoteOptional = noteRepository.findByFolderIdAndId(folderId, noteId);
        if (existingNoteOptional.isPresent()) {
            Note existingNote = existingNoteOptional.get();
            existingNote.setTitle(updatedNote.getTitle());
            existingNote.setTexts(updatedNote.getTexts());
            existingNote.setImages(updatedNote.getImages());

            return noteRepository.save(existingNote);
        }
        throw new RuntimeException("Note not found in the specified folder");
    }

    @DeleteMapping("/{noteId}")
    public void deleteNote(
        @PathVariable Long folderId, 
        @PathVariable Long noteId
    ) {
        Optional<Note> note = noteRepository.findByFolderIdAndId(folderId, noteId);
        if (note.isPresent()) {
            noteRepository.delete(note.get());
        } else {
            throw new RuntimeException("Note not found in the specified folder");
        }
    }
}