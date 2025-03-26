package com.boardshoot.boardshoot.controller;

import com.boardshoot.boardshoot.model.Note;
import com.boardshoot.boardshoot.model.Folder;
import com.boardshoot.boardshoot.repository.NoteRepository;
import com.boardshoot.boardshoot.repository.FolderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/notes")
public class NoteController {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private FolderRepository folderRepository;

    @PostMapping("/{folderId}")
    public Note createNote(@PathVariable Long folderId, @RequestBody Note note) {
        Optional<Folder> folder = folderRepository.findById(folderId);
        if (folder.isPresent()) {
            note.setFolder(folder.get());
            return noteRepository.save(note);
        }
        throw new RuntimeException("Folder not found");
    }

    @GetMapping("/{folderId}")
    public List<Note> getNotesByFolder(@PathVariable Long folderId) {
        return noteRepository.findByFolderId(folderId);
    }
}
